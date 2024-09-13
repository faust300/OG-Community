import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import base58 from 'bs58';
import { UserMembershipGroup } from 'src/membership/entities/membership-group.entity';
import { UpdatePasswordDto } from 'src/user/dto/update-user.dto';
import { UserReferralHistory } from 'src/user/entities/referral-code/user-referral-code.entity';
import { DataSource, EntityManager, In, Raw, Repository } from 'typeorm';
import { User, UserSignType } from '../user/entities/user.entity';
import { getMnemonicUsername } from '../utils/User';
import { SendEmailVerificataionCodeDto } from './dto/email.dto';
import { SignInEmailDto, SignupEmailDto } from './dto/signin-email.dto';
import { PreRegistered } from './entities/preregistered.entity';
import { UserEmailVerificationCode, UserEmailVerificationCodeType } from './entities/user-email-verification-code.entity';
import { UserSigninFailHistory } from './entities/user-signin-fail-history.entity';
import { UserSigninHistory } from './entities/user-signin-history.entity';
import { UserNotification } from 'src/user/entities/notification/user-notification.entity';

@Injectable()
export class SignService {
  constructor(

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UserEmailVerificationCode)
    private userEmailVerificationCodeRepository: Repository<UserEmailVerificationCode>,

    @InjectRepository(UserSigninHistory)
    private userSigninHistoryRepository: Repository<UserSigninHistory>,

    @InjectRepository(UserSigninFailHistory)
    private userSigninFailHistoryRepository: Repository<UserSigninFailHistory>,

    @InjectRepository(PreRegistered)
    private preRegisteredRepository: Repository<PreRegistered>,

    @InjectEntityManager()
    private em: EntityManager,

    private dataSource: DataSource,
  ) {}

  async getUserFromReferral(referralCode: string): Promise<User> {
    const user: User = await this.userRepository
      .findOne({
        where: {
          referralCode
        },
      });

      return user;;
  }

  async isExistEmail(email: string): Promise<User> {
    const user: User = await this.userRepository
      .findOne({
        where: {
          email
        },
        withDeleted: true
      });

    return user;
  }

  async getUserFromEmail(email: string): Promise<User>{
    const user: User = await this.userRepository
      .findOne({
        where: {
          email
        },
      });

    return user;
  }

  async getUserFromUserId(userId: number): Promise<User>{
    const user: User = await this.userRepository
      .findOne({
        where: {
          id: userId
        },
      });

    return user;
  }

  async getNumberOfTodaySentEmail(sendEmailVerificataionCodeDto: SendEmailVerificataionCodeDto): Promise<number>{
    const todaySendCount = await this.userEmailVerificationCodeRepository
      .countBy({
        email: sendEmailVerificataionCodeDto.email,
        type: sendEmailVerificataionCodeDto.type,
        createdAt: Raw((createdAt) => `DATE_FORMAT(${createdAt}, '%Y-%m-%d') = CURRENT_DATE`)
      });

    return todaySendCount;
  }

  async createEmailVerificationCode(sendEmailVerificataionCodeDto: SendEmailVerificataionCodeDto, randomCode: string): Promise<void> {
    const sendRepo = this.userEmailVerificationCodeRepository;
    const history = new UserEmailVerificationCode();
    history.email = sendEmailVerificataionCodeDto.email;
    history.code = randomCode;
    history.type = sendEmailVerificataionCodeDto.type;
    await sendRepo.save(history);
  }

  async getEmailVerificationCodeByEmailWithType(email: string, type: UserEmailVerificationCodeType): Promise<UserEmailVerificationCode> {
    const codeInfo = await this.userEmailVerificationCodeRepository
      .findOne({
        where: {
          email: email,
          type: type
        },
        order: {
          createdAt: 'DESC'
        },
      });

    return codeInfo;
  }

  async generateUsername(limit: number = 100): Promise<string>{

    const generateRandomNames = (limit: number) => {
      let items = [];
      while(items.length < limit){
        const randomMnemonics = getMnemonicUsername();
        if( !items.includes(randomMnemonics) ){
          items.push(randomMnemonics);
        }
      }
      return items;
    }

    let realrealrealName: string | null = null;
    while(realrealrealName === null){
      const names = generateRandomNames(limit);

      const selectResult = await this.userRepository.find({
        where: {
          name: In(names)
        },
        withDeleted: true,
      })

      const duplicateNames = (selectResult as any[]).reduce((prev, cur) => {
        prev.push(cur.name);
        return prev;
      }, []);

      const realName = [];
      for (let i = 0; i < names.length; i++) {
        if (!duplicateNames.includes(names[i])) {
          realName.push(names[i]);
        }
      }

      realrealrealName = realName[0];
    }

    return realrealrealName;
  }

  async createUserByEmail(signupEmailDto: SignupEmailDto): Promise<number | undefined> {
    const qr = this.dataSource.createQueryRunner();

    try {
      await qr.connect();
      await qr.startTransaction();

      // Todo: Set Username
      const newUsername = await this.generateUsername();

      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hashSync(signupEmailDto.password, salt);

      const user = new User();
      user.email = signupEmailDto.email;
      user.password = hash;
      user.name = newUsername;
      user.localizeCode = 'EN';

      const savedUser = await qr.manager.save(user);

      user.referralCode = `${base58.encode(Buffer.from('OGuser' + savedUser.id))}`
      await qr.manager.save(user);

      if(signupEmailDto.referralCode){
        const history = new UserReferralHistory();
        history.userId = savedUser.id;
        history.referralCode = signupEmailDto.referralCode;
        await qr.manager.save(history);
      }

      const notification = new UserNotification();
      notification.userId = savedUser.id;
      await qr.manager.save(notification);

      const membershipGroup = new UserMembershipGroup();
      membershipGroup.userId = savedUser.id;
      await qr.manager.save(membershipGroup);

      await qr.commitTransaction();
      return savedUser.id;

    } catch (error) {

      await qr.rollbackTransaction();
      if(error?.sqlMessage?.indexOf('Duplicate') !== -1){
        return -1;
      }
      console.log(error);
      return undefined;

    } finally{
      await qr.release();
    }
  }

  async getUserFromEmailWithPassword(signInEmailDto: SignInEmailDto | UpdatePasswordDto): Promise<User | number> {
    const userOnlyPassword = await this.userRepository.findOne({
      select: {
        id: true,
        password: true
      },
      where: {
        email: signInEmailDto.email,
        signType: UserSignType.EMAIL
      }
    });

    if (userOnlyPassword && userOnlyPassword.password) {
      const isMatch = await bcrypt.compare(signInEmailDto.password, userOnlyPassword.password);
      if (isMatch) {
        const user = await this.userRepository.findOne({
          where: {
            email: signInEmailDto.email,
            signType: UserSignType.EMAIL
          }
        });

        return new User(user.id);
      } else {
        return userOnlyPassword.id;
      }
    } else {
      return -1;
    }
  }

  async getUserBySocial(type: UserSignType, id: string, email: string, inputReferralCode: string | undefined): Promise<any | undefined> {
    const qr = this.dataSource.createQueryRunner();

    try {

      await qr.connect();
      await qr.startTransaction();

      const typeClause = (id: string, type: UserSignType) => {
        if(type === UserSignType.GOOGLE){
          return {
            where: {
              signType: UserSignType.GOOGLE,
              googleId: id
            }
          }
        }
        else if(type === UserSignType.APPLE){
          return {
            where: {
              signType: UserSignType.APPLE,
              appleId: id
            }
          }
        }
      }

      const user = await this.userRepository.findOne(typeClause(id, type))

      if (user) {
        return {
          id: user.id,
          isSignup: false
        };
      }

      // Create new user
      const newUsername = await this.generateUsername();

      const newUser = new User();
      newUser.email = email;
      newUser.name = newUsername;
      newUser.localizeCode = 'EN';
      switch (type) {
        case 'google':
          newUser.googleId = id;
          newUser.signType = UserSignType.GOOGLE;
          break;

        case 'apple':
          newUser.appleId = id;
          newUser.signType = UserSignType.APPLE;
          break;
      }
      const savedUser = await qr.manager.save(newUser);

      newUser.referralCode = `${base58.encode(Buffer.from('OGuser' + savedUser.id))}`
      await qr.manager.save(newUser);

      if(inputReferralCode){
        const history = new UserReferralHistory();
        history.userId = savedUser.id;
        history.referralCode = inputReferralCode;
        await qr.manager.save(history);
      }

      const notification = new UserNotification();
      notification.userId = savedUser.id;
      await qr.manager.save(notification);

      const membershipGroup = new UserMembershipGroup();
      membershipGroup.userId = savedUser.id;
      await qr.manager.save(membershipGroup);

      await qr.commitTransaction();

      return {
        id: savedUser.id,
        isSignup: true
      };

    } catch (error) {

      await qr.rollbackTransaction();
      console.log(error);
      if(error?.sqlMessage?.indexOf('Duplicate') !== -1){
        return -1;
      }
      return undefined;

    } finally{
      await qr.release();
    }
  }

  async createUserSigninHistoryByUserId(userId: number, type: UserSignType, ip: string | undefined): Promise<void> {
    const historyRepo = this.userSigninHistoryRepository;
    const history = new UserSigninHistory();
    history.userId = userId;
    history.type = type;
    history.date = new Date();
    if(ip){
      history.ipA = ip.split('.')[0] ?? null;
      history.ipB = ip.split('.')[1] ?? null;
      history.ipC = ip.split('.')[2] ?? null;
      history.ipD = ip.split('.')[3] ?? null;
    }

    await historyRepo.save(history);
  }

  async createSigninFailHistory(userId: number, ip: string | undefined): Promise<number | undefined>{
    const qr = this.dataSource.createQueryRunner();

    try {
      await qr.connect();
      await qr.startTransaction();

      const history = new UserSigninFailHistory();
      history.userId = userId;
      history.date = new Date();
      if(ip){
        history.ipA = ip.split('.')[0] ?? null;
        history.ipB = ip.split('.')[1] ?? null;
        history.ipC = ip.split('.')[2] ?? null;
        history.ipD = ip.split('.')[3] ?? null;
      }

      await qr.manager.save(history);

      const count = qr.manager.createQueryBuilder()
        .from(UserSigninFailHistory, 'UserSigninFailHistory')
        .where('userId = :userId', {userId})
        .andWhere('createdAt > DATE_SUB(NOW(), INTERVAL 2 HOUR)')
        .getCount();

      await qr.commitTransaction();
      return count;

    } catch (error) {
      await qr.rollbackTransaction();
      console.log(error);
      return undefined;
    } finally {
      await qr.release();
    }
  }

  async removeSigninFailHistory(userId: number): Promise<void>{
    const failCount = await this.getSigninFailCountByUserId(userId);

    if(failCount > 0){
      await this.userSigninFailHistoryRepository.softDelete({
        userId,
        createdAt: Raw((createdAt) => `${createdAt} > DATE_SUB(NOW(), INTERVAL 2 HOUR)`)
      });

    }
  }

  async activateDeactiveUserByUserId(userId: number): Promise<void>{
    const user = await this.getUserFromUserId(userId);
    if(user && user.expiredAt){

      const userRepo = this.userRepository;
      user.expiredAt = null;
      await userRepo.save(user);
    }
  }

  async getSigninFailCountByUserId(userId: number): Promise<number>{
    const count = await this.userSigninFailHistoryRepository.count({
      where: {
        userId,
        createdAt: Raw((createdAt) => `${createdAt} > DATE_SUB(NOW(), INTERVAL 2 HOUR)`)
      }
    });

    return count;
  }

  async isExistPreRegisteredEmail(email: string): Promise<boolean>{
    const count = await this.preRegisteredRepository.count({
      where:{
        email
      }
    });

    return count > 0 ? true: false;
  }

}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { UserSigninFailHistoryDto } from 'src/sign/dto/sign-fail-history.dto';
import { UserSigninFailHistory } from 'src/sign/entities/user-signin-fail-history.entity';
import { UserPasswordFailHistory } from 'src/user/entities/password-fail-history/user-password-fail-history.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, EntityManager, Raw, Repository } from 'typeorm';
import { IUser } from './auth.request';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UserSigninFailHistory)
    private userSigninFailHistoryRepository: Repository<UserSigninFailHistory>,

    @InjectRepository(UserPasswordFailHistory)
    private userPasswordFailHistoryRepository: Repository<UserPasswordFailHistory>,

    @InjectEntityManager()
    private em: EntityManager,

    private dataSource: DataSource,
  ) {}

  async login(payload: IUser) {
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async decode(access_token: string) {
    const userInfo = this.jwtService.decode(access_token);
    return userInfo;
  }

  async findUser(userId: number): Promise<User>{
    const user = await this.userRepository.findOne({
      where:{
        id: userId
      }
    });

    return user;
  }

  async userBanCheck(userId: number): Promise<boolean>{
    const user = await this.userRepository.createQueryBuilder('User')
      .leftJoinAndSelect('User.ban', 'UserBanList')
      .where('User.id = :userId', {userId})
      .getOne();

    if(user.ban){
      if(user.ban.status){
        return true;
      }
    }
    return false
  }

  async validateAccessToken(accessToken: string): Promise<{ [key: string]: any } | string> {
    const nowUnixTime = Math.floor(new Date().getTime() / 1000);

    let user: null | { [key: string]: any } | string = null;
    try {
      user = await this.decode(accessToken);

      if (user === null) {
        throw new UnauthorizedException();
      } else if (!user['exp'] || !user['iat'] || !user['userId']) {
        throw new UnauthorizedException();
      }
    } catch (error) {
      throw new UnauthorizedException();
    }

    if (nowUnixTime - user['exp'] >= 86400) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async getUserSigninFailHistoriesByEmail(email: string): Promise<UserSigninFailHistoryDto[]> {
    const date = new Date();
    const now = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${date.getDate()}`;

    const histories = await this.userSigninFailHistoryRepository.createQueryBuilder('UserSigninFailHistory')
      .leftJoin('UserSigninFailHistory.user', 'User')
      .where(`User.email = TO_BASE64(AES_ENCRYPT('${email}', SHA2(CONCAT('${process.env.AES_KEY1}', '${process.env.AES_KEY2}'), 256)))`)
      // .andWhere('UserSigninFailHistory.date = :date', {date: now})
      .andWhere('UserSigninFailHistory.date = CURDATE()')
      .orderBy('UserSigninFailHistory.createdAt', 'DESC')
      .getMany();

    return histories.map((history) => new UserSigninFailHistoryDto(history));
  }

  async getUserPasswordFailHistoriesByEmail(email: string): Promise<UserSigninFailHistoryDto[]> {

    const histories = await this.userPasswordFailHistoryRepository.createQueryBuilder('UserPasswordFailHistory')
      .leftJoin('UserPasswordFailHistory.user', 'User')
      .where(`User.email = TO_BASE64(AES_ENCRYPT('${email}', SHA2(CONCAT('${process.env.AES_KEY1}', '${process.env.AES_KEY2}'), 256)))`)
      .andWhere('UserPasswordFailHistory.date = CURDATE()')
      .orderBy('UserPasswordFailHistory.createdAt', 'DESC')
      .getMany();

    return histories.map((history) => new UserSigninFailHistoryDto(history));
  }

  async getUserPasswordFailHistoriesByuserId(userId: number): Promise<UserSigninFailHistoryDto[]> {
    const histories = await this.userPasswordFailHistoryRepository.find({
      where: {
        userId,
        date: Raw((date) => `${date} = CURDATE()`)
      },
      order: {
        createdAt: 'DESC'
      }
    });

    return histories.map((history) => new UserSigninFailHistoryDto(history));
  }
}

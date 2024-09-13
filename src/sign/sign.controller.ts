import { Body, Controller, Get, Post, Query, Redirect, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuth2Client } from 'google-auth-library';
import { UserBlockSigninGuard } from 'src/extensions/auth/user-block/user-block-signin.guard';
import MailService from 'src/extensions/services/mail.service';
import { sendCodeMessage } from 'src/utils/EmailMessage';
import { OGRequest } from '../extensions/auth/auth.request';
import { AuthService } from '../extensions/auth/auth.service';
import { OGException } from '../extensions/exception/exception.filter';
import { ActKey, RMQService } from '../extensions/services/rmq.service';
import { User, UserSignType } from '../user/entities/user.entity';
import { validatePassword } from '../utils/User';
import { UserEmailVerificationCodeDto } from './dto/code.dto';
import { EmailDto, SendEmailVerificataionCodeDto } from './dto/email.dto';
import { SignInEmailDto, SignupEmailDto } from './dto/signin-email.dto';
import { SigninGoogleDto } from './dto/signin-social.dto';
import { UserEmailVerificationCodeType } from './entities/user-email-verification-code.entity';
import { SignReferralInterceptor } from './sign-referral.interceptor';
import { SignService } from './sign.service';

@Controller('sign')
export class SignController {
  constructor(
    private readonly signService: SignService,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly rmqService:RMQService
  ) { }

  
  // Email Sign
  @Post('email/check')
  async checkEmail(@Body() checkEmailDto: EmailDto) {
    const isExistEmail = await this.signService.isExistEmail(checkEmailDto.email);

    // Todo: create history (ip, limit - 24hours 12times)
    const isExist = await this.signService.isExistPreRegisteredEmail(checkEmailDto.email);

    return {
      success: true,
      result: isExistEmail ? {
        status: -1,
        type: isExistEmail.signType,
        hasPromotion: null,
      } : {
        status: 1,
        type: null,
        hasPromotion: isExist,
      }
    };
  }

  @Post('email/code')
  async sendEmailVerificationCode(@Body() sendEmailVerificataionCodeDto: SendEmailVerificataionCodeDto){

    if(!(sendEmailVerificataionCodeDto.type === UserEmailVerificationCodeType.SIGNUP || sendEmailVerificataionCodeDto.type === UserEmailVerificationCodeType.PASSWORD)){
      throw new OGException({
        errorCode: -118,
        errorMessage: "Invalid Access to Email verify."
      }, 400);
    }

    const user = await this.signService.getUserFromEmail(sendEmailVerificataionCodeDto.email);

    if(user && sendEmailVerificataionCodeDto.type === UserEmailVerificationCodeType.SIGNUP){
      throw new OGException({
        errorCode: -123,
        errorMessage: "Already joined."
      }, 400);
    }

    else if(!user && sendEmailVerificataionCodeDto.type === UserEmailVerificationCodeType.PASSWORD){
      throw new OGException({
        errorCode: -103,
        errorMessage: "This Email address is not registered."
      }, 400);
    }

    else if(user && user.signType !== 'email'){
      throw new OGException({
        errorCode: -124,
        errorMessage: "You have no permission."
      }, 400);
    }

    // validation -> 5 limit in 24hours
    const numberOfTodaySent = await this.signService.getNumberOfTodaySentEmail(sendEmailVerificataionCodeDto);
    if(numberOfTodaySent > 5){
      throw new OGException({
        errorCode: -117,
        errorMessage: "You have no permission. 5 limit in 24 hours."
      }, 400);
    }

    const randomCode = String(Math.floor(Math.random()*1000000)).padStart(6,"0");

    await this.signService.createEmailVerificationCode(sendEmailVerificataionCodeDto, randomCode);

    if( sendEmailVerificataionCodeDto.type == "signup" ){
      this.mailService.sendEmail(sendEmailVerificataionCodeDto.email, '[OG] Email authentication for “sign up', sendCodeMessage(sendEmailVerificataionCodeDto.email, randomCode))

    }else if(sendEmailVerificataionCodeDto.type == "password"){
      this.mailService.sendEmail(sendEmailVerificataionCodeDto.email, '[OG] Email authentication for Reset password', sendCodeMessage(sendEmailVerificataionCodeDto.email, randomCode))
    }

    return {
      success: true,
      result: `Success send email ${sendEmailVerificataionCodeDto.type} to ${sendEmailVerificataionCodeDto.email}`,
    }

  }

  @Post('email/up')
  @UseInterceptors(SignReferralInterceptor)
  async signupUserByEmail(@Req() req: OGRequest, @Body() signupEmailDto: SignupEmailDto) {
    // add dto refferalCode validation

    const user = await this.signService.getEmailVerificationCodeByEmailWithType(signupEmailDto.email, UserEmailVerificationCodeType.SIGNUP);
    if(!user){
      throw new OGException({
        errorCode: -131,
        errorMessage: "You have no code."
      }, 400);
    }

    const requestUser = new UserEmailVerificationCodeDto(user);

    if(requestUser.isExpired){
      throw new OGException({
        errorCode: -133,
        errorMessage: "Code is expired."
      }, 403);
    }

    if(requestUser.emailCode !== signupEmailDto.emailCode){
        throw new OGException({
        errorCode: -113,
        errorMessage: "Email Verification code is not correct."
      }, 400);
    }

    const isExistEmail = await this.signService.isExistEmail(signupEmailDto.email);
    if(isExistEmail){
      throw new OGException({
        errorCode: -109,
        errorMessage: "This Email address is already registered."
      }, 400);
    }

    // password validation
    const isMatch = validatePassword(signupEmailDto.password);
    if(!isMatch){
      throw new OGException({
        errorCode: -105,
        errorMessage: 'Invalid password',
      }, 400);
    }

    const isExistPromotion = await this.signService.isExistPreRegisteredEmail(signupEmailDto.email);

    const createdUserId = await this.signService.createUserByEmail(signupEmailDto);

    if(createdUserId && createdUserId > 0){

      const ip = req.realIP;
      await this.signService.createUserSigninHistoryByUserId(createdUserId, UserSignType.EMAIL, ip);

      const jwt = await this.authService.login({ userId: Number(createdUserId) });

      await this.rmqService.publish(ActKey.USER_SIGNUP, createdUserId);
      await this.rmqService.publish(ActKey.USER_SIGNIN, createdUserId);

      if(signupEmailDto.referralCode){
        const refferalOwner = await this.signService.getUserFromReferral(signupEmailDto.referralCode);
        await this.rmqService.publish(ActKey.USER_REFERRAL, refferalOwner.id, {referralCode:signupEmailDto.referralCode, createdUserId: createdUserId});
        await this.rmqService.publish(ActKey.USER_INVITE_SIGNUP, createdUserId, {referralCode:signupEmailDto.referralCode});
      }

      return {
        success: true,
        result: {
          accessToken: jwt.access_token,
          isSignup: true,
          promotionUser: isExistPromotion
        }
      }
    }

    else if(createdUserId && createdUserId === -1){
      throw new OGException({
        errorCode: -125,
        errorMessage: "Internal Server Error."
      }, 500);
    }

    throw new OGException({
      errorCode: -102,
      errorMessage: "Fail to Create User."
    }, 500);
  }

  @Post('email/in')
  @UseGuards(UserBlockSigninGuard)
  async signinUserByEmail(@Req() req: OGRequest, @Body() signInEmailDto: SignInEmailDto) {
    const ip = req.realIP;
    const user: User | number = await this.signService.getUserFromEmailWithPassword(signInEmailDto);

    // not exist user
    if(user === -1){
      throw new OGException({
        errorCode:-104,
        errorMessage:"Signin fail."
      }, 200)
    }

    // accept user
    else if( user instanceof User){
      await this.signService.createUserSigninHistoryByUserId(user.id, UserSignType.EMAIL, ip);
      await this.signService.removeSigninFailHistory(user.id);
      await this.signService.activateDeactiveUserByUserId(user.id);

      const jwt = await this.authService.login({ userId: Number(user.id) });
      await this.rmqService.publish(ActKey.USER_SIGNIN, user.id);
      return {
        success: true,
        result: {
          accessToken: jwt.access_token,
        }
      }
    }

    // invalid user access OR wrong password
    else{
      const signinFailCount = await this.signService.createSigninFailHistory(user, ip);
      await this.rmqService.publish(ActKey.USER_SIGNIN_FAIL, user);
      throw new OGException({
        errorCode: -136,
        errorMessage: String(signinFailCount)
      }, 500);
    }

  }

  // Social Sign
  @Post('google')
  @UseInterceptors(SignReferralInterceptor)
  async signUserFromGoogle(@Req() req: OGRequest, @Body() signinGoogleDto: SigninGoogleDto) {
    let id: string, email: string = undefined;

    try {
      const client = new OAuth2Client();

      const verifyToken = async (token: string): Promise<any> => {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        return payload;
      }

      const result = await verifyToken(signinGoogleDto.token);

      id = result.sub;
      email = result.email;

    } catch (error) {
      console.log(error);
      throw new OGException({
        errorCode: -106,
        errorMessage: error.response.data.error_description,
      }, 400);
    }

    if(!id || !email){
      throw new OGException({
        errorCode: -122,
        errorMessage: 'Fail to Get google user.',
      }, 500);
    }

    const isExistPromotion = await this.signService.isExistPreRegisteredEmail(email);

    const isExistEmailUser = await this.signService.isExistEmail(email);
    if(isExistEmailUser && isExistEmailUser.deletedAt){
      throw new OGException({
        errorCode: -104,
        errorMessage: 'Signin fail.',
      }, 500);
    }

    if(isExistEmailUser && isExistEmailUser.signType !== UserSignType.GOOGLE){
      throw new OGException({
        errorCode: -138,
        errorMessage: 'This Email address is already registered with email sign.',
      }, 500);
    }

    const getUserBySocial = await this.signService.getUserBySocial(UserSignType.GOOGLE, id, email, signinGoogleDto.referralCode);
    if(!getUserBySocial){
      throw new OGException({
        errorCode: -107,
        errorMessage: 'Fail to Sign google.',
      }, 500);
    }

    if(getUserBySocial < 0){
      throw new OGException({
        errorCode: -119,
        errorMessage: 'This Email address already signup email type.',
      }, 500);
    }

    if(getUserBySocial.isSignup){
      await this.rmqService.publish(ActKey.USER_SIGNUP, getUserBySocial.id);
      if(signinGoogleDto.referralCode){
        const refferalOwner = await this.signService.getUserFromReferral(signinGoogleDto.referralCode);
        await this.rmqService.publish(ActKey.USER_REFERRAL, refferalOwner.id, {referralCode:signinGoogleDto.referralCode, createdUserId: getUserBySocial.id});
        await this.rmqService.publish(ActKey.USER_INVITE_SIGNUP, getUserBySocial.id, {referralCode:signinGoogleDto.referralCode});
      }
    }

    const ip = req.realIP;
    await this.signService.createUserSigninHistoryByUserId(getUserBySocial.id, UserSignType.GOOGLE, ip);
    await this.rmqService.publish(ActKey.USER_SIGNIN, getUserBySocial.id);

    const jwt = await this.authService.login({ userId: Number(getUserBySocial.id) });
    return {
      success: true,
      result: {
        accessToken: jwt.access_token,
        isSignup: getUserBySocial.isSignup,
        promotionUser: isExistPromotion,
        email,
      }
    }
  }

  @Get('apple')
  @Redirect()
  async signUserFromApple(@Query('path') path: string, @Query('referralCode') referralCode: string) {
    const ownerOfReferralCode = await this.signService.getUserFromReferral(referralCode);
    if(!ownerOfReferralCode){
      referralCode = undefined;
    }
    try {
      const state = {
        path,
        referralCode
      };

      const hashState = Buffer.from(JSON.stringify(state), 'utf-8').toString('base64');

      const param = {
        clientID: process.env.APPLE_CLIENT_ID,
        callbackURL: process.env.APPLE_CALLBACK_URL,
        scope: 'name%20email',
        state: hashState
      };
      const url = `https://appleid.apple.com/auth/authorize?session=false&property=user&state=${param.state}&response_type=code%20id_token&scope=name%20email&response_mode=form_post&redirect_uri=${param.callbackURL}&client_id=${param.clientID}`;

      return {
        url
      };
    } catch (error) {
      console.log(error);
      return {
        url: `${process.env.BASE_URL}/sign/apple?error=-120`
      };
    }
  }

  @Post('apple')
  @Redirect()
  @UseGuards(AuthGuard('apple'))
  async signUserFromAppleOauth(@Req() req) {
    try {
      const appleUser = req.user.user;

      const id = appleUser.appleId;
      const email = appleUser.email;

      let path: string, referralCode: string;

      if(appleUser.state){
        path = JSON.parse(Buffer.from(appleUser.state, 'base64').toString('utf-8'))?.path;
        referralCode = JSON.parse(Buffer.from(appleUser.state, 'base64').toString('utf-8'))?.referralCode;
      }

      const isExistEmailUser = await this.signService.isExistEmail(email);
      if(isExistEmailUser && isExistEmailUser.deletedAt){
        return {
          url: `${process.env.BASE_URL}/sign/apple?error=-104`
        };
      }

      if(isExistEmailUser && isExistEmailUser.signType !== UserSignType.APPLE){
        return {
          url: `${process.env.BASE_URL}/sign/apple?error=-138`
        };
      }

      const getUserBySocial = await this.signService.getUserBySocial(UserSignType.APPLE, id, email, referralCode);
      if(!getUserBySocial){
        return {
          url: `${process.env.BASE_URL}/sign/apple?error=-108`
        };
      }

      if(getUserBySocial < 0){
        return {
          url: `${process.env.BASE_URL}/sign/apple?error=-119`
        };
      }

      const jwt = await this.authService.login({ userId: Number(getUserBySocial.id) });

      if (jwt) {
        if(getUserBySocial.isSignup){
          await this.rmqService.publish(ActKey.USER_SIGNUP, getUserBySocial.id);
          if(referralCode){
            const refferalOwner = await this.signService.getUserFromReferral(referralCode);
            await this.rmqService.publish(ActKey.USER_REFERRAL, refferalOwner.id, {referralCode:referralCode, createdUserId: getUserBySocial.id});
            await this.rmqService.publish(ActKey.USER_INVITE_SIGNUP, getUserBySocial.id, {referralCode:referralCode});
          }
        }

        const ip = req.realIP;
        await this.signService.createUserSigninHistoryByUserId(getUserBySocial.id, UserSignType.APPLE, ip);
        await this.rmqService.publish(ActKey.USER_SIGNIN, getUserBySocial.id);

        return {
          url: `${process.env.BASE_URL}/sign/apple?access_token=${jwt.access_token}&path=${path}&referralCode=${referralCode}&isSignup=${getUserBySocial.isSignup}&email=${email}`
        };
      } else {
        return {
          url: `${process.env.BASE_URL}/sign/apple?error=-121`
        };
      }

    } catch (error) {
      console.log(error);
      return {
        url: `${process.env.BASE_URL}/sign/apple?error=-120`
      };
    }
  }

}

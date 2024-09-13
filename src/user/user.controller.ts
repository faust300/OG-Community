import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { JWTAuthInterceptor } from 'src/extensions/auth/jwt-auth.interceptor';
import { UserBlockPasswordGuard } from 'src/extensions/auth/user-block/user-block-password.guard';
import MailService from 'src/extensions/services/mail.service';
import { UserEmailVerificationCodeDto } from 'src/sign/dto/code.dto';
import { UserEmailVerificationCodeType } from 'src/sign/entities/user-email-verification-code.entity';
import { sendCodeMessage } from 'src/utils/EmailMessage';
import { OGRequest } from '../extensions/auth/auth.request';
import { JWTAuthGuard } from '../extensions/auth/jwt-auth.guard';
import { OGException } from '../extensions/exception/exception.filter';
import { ActKey, RMQService } from '../extensions/services/rmq.service';
import { EmailDto } from '../sign/dto/email.dto';
import { SignService } from '../sign/sign.service';
import { convertDateWithoutTime, validatePassword, validateUsername } from '../utils/User';
import { Me } from './dto/me.dto';
import { MyFollower } from './dto/my-follower.dto';
import { MyFollowing } from './dto/my-following.dto';
import { UserProfileDto } from './dto/profile.dto';
import { PeriodFilter } from './dto/stat.dto';
import { MyTitles } from './dto/titles.dto';
import { ResetPasswordDto, UpdateEmailDto, UpdatePasswordDto, UpdateReferralCodeDto, UpdateUserData, UpdateUserDataKey, UpdateUserDto } from './dto/update-user.dto';
import { UserTitle } from './entities/title/user-title.entity';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { ReportUserDto } from './dto/report-user.dto';
import { BanListDto } from './dto/ban-list.dto';
import { NotificationSettingDto, NotificationType } from './dto/notificationSetting.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly signService: SignService,
    private readonly rmqService: RMQService,
    private readonly mailService: MailService,
  ) { }

  @Get('/convert/userId/:username')
  async returnUserIdByUsername(@Req() req: OGRequest, @Param('username') username: string){
    const user = await this.userService.checkSignUserByUsername(username);

    return {
      success: true,
      result: user ? user.id : null,
    };
  }

  @Get('/me')
  @UseGuards(JWTAuthGuard)
  async getMe(@Req() req: OGRequest) {
    const {userId} = req.user;

    const user = await this.userService.getUserByUserId(userId);
    const me = new Me(user);

    // Withdraw user who expired
    if(me.isExpired){
      await this.removeUser(req);
    }

    return {
      success: true,
      result:
        me,
        // iat: req.user.iat,
        // exp: req.user.exp
    }
  }

  @Get('titles')
  @UseGuards(JWTAuthGuard)
  async getUserTitlesByUserId(@Req() req: OGRequest) {
    const {userId} = req.user;

    const titles = await this.userService.getUserTitlesByUserId(userId)
    const result = titles.map((title: UserTitle) => {
      return new MyTitles(title);
    })

    return {
      success: true,
      result,
    }
  }

  // My Activity History
  @Get('/activity-history/summary')
  @UseGuards(JWTAuthGuard)
  async getActivityHistorySummaryByUserId(@Req() req: OGRequest) {
    const {userId} = req.user;

    const result = await this.userService.getActivityHistorySummaryByUserId(userId);

    return {
      success: true,
      result
    }
  }

  @Get('/activity-history/list')
  @UseGuards(JWTAuthGuard)
  async getActivityHistoryListByUserId(@Req() req: OGRequest, @Query('page') page: number | string = 1, @Query('sort') sort: string = 'recent', @Query('filter') filter: string = 'all') {
    const {userId} = req.user;

    const listCount = await this.userService.getActivityHistoryListCountByUserId(userId, filter);
    const list = await this.userService.getActivityHistoryListByUserId(userId, page, sort, filter);

    return {
      success: true,
      result: {
        count: listCount,
        list,
      },
    }
  }

  // Update Info
  @Patch('me')
  @UseGuards(JWTAuthGuard)
  async updateMe(@Req() req: OGRequest, @Body() updateUserDto: UpdateUserDto) {
    const {userId} = req.user;
    let isUpdated = undefined;

    // user verification validation
    const user = await this.userService.getUserByUserId(userId);

    let rmqKey: Array<ActKey> = [];

    const tempArr: Array<UpdateUserData> = updateUserDto.data;

    // validation
    for(let i=0; i<tempArr.length; i++){

      // profile image
      if(tempArr[i].key === UpdateUserDataKey.IMAGE){
        rmqKey.push(ActKey.USER_SET_IMAGE);
      }

      // username
      else if(tempArr[i].key === UpdateUserDataKey.USERNAME){
        // name regex validation
        if(!validateUsername(tempArr[i].value)){
          throw new OGException({
            errorCode: -205,
            errorMessage: 'This username is not allowed.',
          }, 400);
        }

        // name duplicate validation
        const existUser = await this.userService.getUserByName(tempArr[i].value);
        if(existUser){
          throw new OGException({
            errorCode: -207,
            errorMessage: 'This username is already exist.',
          }, 400);
        }

        if(user.isChangedName){
          throw new OGException({
            errorCode: -203,
            errorMessage: 'Name is already changed.',
          }, 400);
        }

        rmqKey.push(ActKey.USER_SET_NICKNAME);
      }

      // bio
      else if(tempArr[i].key === UpdateUserDataKey.BIO){
        if(tempArr[i].value.length > 300){
          throw new OGException({
            errorCode: -206,
            errorMessage: 'This bio is not allowed.',
          }, 400);
        }

        rmqKey.push(ActKey.USER_SET_BIO);
      }

      // title
      else if(tempArr[i].key === UpdateUserDataKey.TITLE && tempArr[i].value !== "0"){
        const titles = await this.userService.getUserTitlesByUserId(userId);
        if(!titles.map(title => title.titleId).includes(Number(tempArr[i].value))){
          throw new OGException({
            errorCode: -204,
            errorMessage: 'You don`t have this title.',
          }, 400);
        }
      }
    }

    await this.userService.updateMe(userId, updateUserDto);

    if(rmqKey.length > 0){
      rmqKey.forEach(async (key: ActKey) => {
        await this.rmqService.publish(key, userId);
      });
    }

    // Todo: fix return value
    return {
      success: true,
      result: updateUserDto.data.length === 1 ? `${updateUserDto.data[0].key} is changed.` : `${Object.keys(updateUserDto.data).toString()} is changed.`
    }
  }

  @Patch('/password')
  @UseGuards(UserBlockPasswordGuard)
  async updatePassword(@Req() req: OGRequest, @Body() updatePasswordDto: UpdatePasswordDto) {
    const requestUser = await this.signService.getUserFromEmail(updatePasswordDto.email);

    let rmqKey: ActKey = ActKey.USER_PASSWORD_CHANGE_SUCCESS;
    const ip = req.realIP;

    const user = await this.signService.getUserFromEmailWithPassword(updatePasswordDto);
    if( !(user instanceof User && user.id === requestUser.id) ){
      const passwordFailCount = await this.userService.createPasswordFailHistory(requestUser.id, ip);
      await this.rmqService.publish(ActKey.USER_PASSWORD_CHANGE_FAIL, requestUser.id);

      throw new OGException({
        errorCode: -226,
        errorMessage: String(passwordFailCount),
      }, 400);
    }

    if(updatePasswordDto.newPassword === updatePasswordDto.password){
      throw new OGException({
        errorCode: -220,
        errorMessage: 'Can`t change same password.',
      }, 400);
    }

    // password validation
    const isMatch = validatePassword(updatePasswordDto.newPassword);
    if(!isMatch){
      await this.userService.createPasswordFailHistory(requestUser.id, ip);
      throw new OGException({
        errorCode: -210,
        errorMessage: 'Invalid password',
      }, 400);
    }

    await this.userService.updatePassword(updatePasswordDto.email, updatePasswordDto.newPassword);
    await this.userService.removePasswordFailHistory(requestUser.id);
    // Success queue
    await this.rmqService.publish(rmqKey, requestUser.id);

    return {
      success: true,
      result: `password is changed.`
    }
  }

  @Patch('/password/reset')
  async resetPassword(@Req() req: OGRequest, @Body() resetPasswordDto: ResetPasswordDto) {
    const requestUser = await this.signService.getUserFromEmail(resetPasswordDto.email);
    if(!requestUser){
      throw new OGException({
        errorCode: -208,
        errorMessage: "Invalid User."
      }, 400);
    }
    let rmqKey: ActKey = ActKey.USER_PASSWORD_RESET_SUCCESS;
    const ip = req.realIP;

    const getSavedEmailCodeInfo = await this.signService.getEmailVerificationCodeByEmailWithType(resetPasswordDto.email, UserEmailVerificationCodeType.PASSWORD);
    if(!getSavedEmailCodeInfo){
      await this.userService.createPasswordFailHistory(requestUser.id, ip);
      await this.rmqService.publish(ActKey.USER_PASSWORD_RESET_FAIL, requestUser.id);
      throw new OGException({
        errorCode: -225,
        errorMessage: "You have no code."
      }, 400);
    }

    const codeInfo = new UserEmailVerificationCodeDto(getSavedEmailCodeInfo);

    if(codeInfo.isExpired){
      throw new OGException({
        errorCode: -224,
        errorMessage: "Code is expired."
      }, 403);
    }

    if(codeInfo.emailCode !== resetPasswordDto.emailCode){
      await this.userService.createPasswordFailHistory(requestUser.id, ip);
      await this.rmqService.publish(ActKey.USER_PASSWORD_RESET_FAIL, requestUser.id);
      throw new OGException({
        errorCode: -219,
        errorMessage: "Invalid Email Code."
      }, 400);
    }

    // password validation
    const isMatch = validatePassword(resetPasswordDto.newPassword);
    if(!isMatch){
      await this.userService.createPasswordFailHistory(requestUser.id, ip);
      throw new OGException({
        errorCode: -210,
        errorMessage: 'Invalid password',
      }, 400);
    }

    await this.userService.updatePassword(resetPasswordDto.email, resetPasswordDto.newPassword);
    await this.userService.removePasswordFailHistory(requestUser.id);
    // Success queue
    await this.rmqService.publish(rmqKey, requestUser.id);

    return {
      success: true,
      result: `password is changed.`
    }
  }

  // Todo: remove me one or several
  // @Delete('me')
  // @UseGuards(JWTAuthGuard)
  // async removeUserInfo(@Req() req: OGRequest, @Query() key: any){
  //   console.log("Query: ", key)
  //   return ;
  // }

  @Patch('deactive')
  @UseGuards(JWTAuthGuard)
  async deactiveUser(@Req() req: OGRequest) {
    const {userId} = req.user;

    await this.userService.deactivateUserFromUserId(userId);

    return {
      success: true,
      result: 'Success Deactivate User.',
    }
  }

  @Delete()
  @UseGuards(JWTAuthGuard)
  async removeUser(@Req() req: OGRequest) {
    const {userId} = req.user;

    await this.userService.removeUserByUserId(userId);
    return {
      success: true,
      result: 'Success Remove User.',
    }
  }

  @Get('/referralCode')
  @UseGuards(JWTAuthGuard)
  async getMyReferralCode(@Req() req: OGRequest){
    const {userId} = req.user;

    const myReferralCode = await this.userService.getUserReferralCodeFromUserId(userId);
    if(!myReferralCode){
      throw new OGException({
        errorCode: -229,
        errorMessage: 'Invalid Access.',
      }, 400);
    }

    const referralCodeUsedCount = await this.userService.getUserReferralCodeUsedCountFromReferralCode(myReferralCode.referralCode);
    // const referralCodeUsedUsers = await this.userService.getUserReferralCodeUsedUsersFromReferralCode(myReferralCode.referralCode);

    return {
      success: true,
      result: {
        referralCode: myReferralCode.referralCode,
        usedCount: referralCodeUsedCount,
        // users: referralCodeUsedUsers,
      },
    }
  }

  @Post('/referralCode')
  @UseGuards(JWTAuthGuard)
  async insertReferralCode(@Req() req: OGRequest, @Body() updateReferralCodeDto: UpdateReferralCodeDto){
    const {userId} = req.user;

    const ownerOfReferralCode = await this.userService.getUserByReferralCode(updateReferralCodeDto.referralCode);
    if(!ownerOfReferralCode){
      throw new OGException({
        errorCode: -214,
        errorMessage: 'Invalid Referral Code.',
      }, 400);
    }

    const user = await this.userService.getUserByUserId(userId);

    if(user.referralCode === updateReferralCodeDto.referralCode){
      throw new OGException({
        errorCode: -230,
        errorMessage: 'My Referral Code is not available.',
      }, 400);
    }

    const me = new Me(user);

    if(!me.isAvailableReferral){
      throw new OGException({
        errorCode: -213,
        errorMessage: 'Not available.',
      }, 400);
    }

    await this.userService.insertReferralCode(userId, updateReferralCodeDto.referralCode);
    const refferalOwner = await this.signService.getUserFromReferral(updateReferralCodeDto.referralCode);
    if(refferalOwner){
      await this.rmqService.publish(ActKey.USER_REFERRAL, refferalOwner.id, {referralCode: updateReferralCodeDto.referralCode, createdUserId: userId});
      await this.rmqService.publish(ActKey.USER_INVITE_SIGNUP, userId, {referralCode:updateReferralCodeDto.referralCode});
    }

    return {
      success: true,
      result: 'success',
    }
  }

  @Get('/unsubscribe')
  async unsubscribeByEmail(@Res() res: Response, @Query('email') email: string = undefined){

    return res.redirect('https://og.xyz/notifications')

    // if(!email){
    //   return res.redirect('/');
    // }

    // const user = await this.signService.getUserFromEmail(email);
    // if(!user){
    //   return res.redirect('/');
    // }

    // if(user.unsubscribedAt){
    //   return res.send('Already unsubscribed!. <br/><br/> <a href="https://og.xyz">Go main.</a>');
    // }

    // await this.userService.unsubscribeByEmail(email);

    // return res.send('Successfully unsubscribed!. <br/><br/> <a href="https://og.xyz">Go main.</a>');
  }

  @Patch('/resubscribe')
  @UseGuards(JWTAuthGuard)
  async resubscribeByEmail(@Req() req: OGRequest){
    const {userId} = req.user;

    const user = await this.userService.getUserByUserId(userId);

    if(!user.unsubscribedAt){
      throw new OGException({
        errorCode: -231,
        errorMessage: 'Not available.',
      }, 400);
    }

    await this.userService.resubscribeByUserId(userId);

    return {
      success: true,
      result: true
    }
  }

  @Post('/apple/email')
  @UseGuards(JWTAuthGuard)
  async sendAppleUserEmailCode(@Req() req: OGRequest, @Body() sendAppleUserEmailCodeDto: EmailDto){
    const {userId} = req.user;
    const user = await this.userService.getUserByUserId(userId);

    const me = new Me(user);
    if(!me || !me.needChangeEmail){
      throw new OGException({
        errorCode: -232,
        errorMessage: 'Invalid Access By apple user.',
      }, 400);
    }

    // check email
    const newEmail = await this.signService.isExistEmail(sendAppleUserEmailCodeDto.email);
    if(newEmail){
      throw new OGException({
        errorCode: -239,
        errorMessage: "Invalid Email."
      }, 400);
    }

    // send Email Code
    const randomCode = String(Math.floor(Math.random()*1000000)).padStart(6,"0");

    const createCodeBody = {
      email: sendAppleUserEmailCodeDto.email,
      type: UserEmailVerificationCodeType.EMAIL
    }
    await this.signService.createEmailVerificationCode(createCodeBody, randomCode);
    await this.mailService.sendEmail(sendAppleUserEmailCodeDto.email, '[OG] Email authentication for Enter Email Address', sendCodeMessage(sendAppleUserEmailCodeDto.email, randomCode));

    return {
      success: true,
      result: `Success send email ${createCodeBody.type} to ${sendAppleUserEmailCodeDto.email}`,
    }
  }

  @Patch('/apple/email')
  @UseGuards(JWTAuthGuard)
  async updateAppleUserEmail(@Req() req: OGRequest, @Body() updateEmailDto: UpdateEmailDto){
    const {userId} = req.user;
    const user = await this.userService.getUserByUserId(userId);

    const me = new Me(user);
    if(!me || !me.needChangeEmail){
      throw new OGException({
        errorCode: -232,
        errorMessage: 'Invalid Access By apple user.',
      }, 400);
    }

    // check Email Code
    const userDb = await this.signService.getEmailVerificationCodeByEmailWithType(updateEmailDto.email, UserEmailVerificationCodeType.EMAIL);
    const requestUser = new UserEmailVerificationCodeDto(userDb);
    if(!requestUser){
      throw new OGException({
        errorCode: -233,
        errorMessage: "You have no code."
      }, 400);
    }

    if(requestUser.type !== UserEmailVerificationCodeType.EMAIL){
      throw new OGException({
        errorCode: -234,
        errorMessage: "Invalid Access to change email."
      }, 403);
    }

    if(requestUser.isExpired){
      throw new OGException({
        errorCode: -235,
        errorMessage: "Code is expired."
      }, 403);
    }

    if(requestUser.emailCode !== updateEmailDto.emailCode){
      throw new OGException({
        errorCode: -236,
        errorMessage: "Email Verification code is not correct."
      }, 400);
    }

    // update email
    await this.userService.updateMe(
      userId,
      {data: [{
        key: UpdateUserDataKey.EMAIL,
        value: updateEmailDto.email
      }]}
    );

    return {
      success: true,
      result: user.userId
    }
  }
  // User Profile
  @Get('/profile/:toUserId([0-9]{1,11})')
  @UseInterceptors(JWTAuthInterceptor)
  async getUserByUserId(@Req() req: OGRequest, @Param('toUserId') toUserId: number = undefined) {
    const fromUserId = req.user ? req.user.userId : undefined;
    if(fromUserId){
      const fromUser = await this.userService.getUserByUserId(fromUserId);
      if(!fromUser){
        throw new OGException({
          errorCode: -208,
          errorMessage: 'Invalid User.',
        }, 400);

      }
    }

    // toUser validation
    if(!toUserId || isNaN(toUserId)){
      throw new OGException({
        errorCode: -240,
        errorMessage: 'Invalid UserId.',
      }, 400);
    }

    const toUser = await this.userService.checkSignUserByUserId(toUserId);
    if(!toUser){
      throw new OGException({
        errorCode: -208,
        errorMessage: 'Invalid User.',
      }, 400);
    }

    const userProfile = await this.userService.getUserByUserId(toUserId);
    if(!userProfile){
      throw new OGException({
        errorCode: -246,
        errorMessage: 'Internal Server Error.',
      }, 500);
    }

    return {
      success: true,
      result: new UserProfileDto(userProfile, fromUserId)
    }
  }

  @Get("/profile/:toUserName(@+[0-9a-zA-Z_]{1,30})")
  @UseInterceptors(JWTAuthInterceptor)
  async getUserByUserName(@Req() req: OGRequest, @Param('toUserName') toUserName: string = undefined) {
    const convertUserName = toUserName.replace('@', '');
    const fromUserId = req.user ? req.user.userId : undefined;
    if(fromUserId){
      const fromUser = await this.userService.getUserByUserId(fromUserId);
      if(!fromUser){
        throw new OGException({
          errorCode: -208,
          errorMessage: 'Invalid User.',
        }, 400);
      }
    }

    // toUser validation
    if(!convertUserName){
      throw new OGException({
        errorCode: -240,
        errorMessage: 'Invalid UserId.',
      }, 400);
    }

    const toUser = await this.userService.checkSignUserByName(convertUserName);
    if(!toUser){
      throw new OGException({
        errorCode: -208,
        errorMessage: 'Invalid User.',
      }, 400);
    }

    const userProfile = await this.userService.getUserByUserName(convertUserName);
    if(!userProfile){
      throw new OGException({
        errorCode: -246,
        errorMessage: 'Internal Server Error.',
      }, 500);
    }

    return {
      success: true,
      result: new UserProfileDto(userProfile, fromUserId)
    }
  }


  @Get('/:toUserId([0-9]{1,11})/follower')
  async getMyFollowerUserByUserId(@Req() req: OGRequest, @Param('toUserId') toUserId: number = undefined, @Query('page') page: string | number = undefined) {
    // toUser validation
    if(!toUserId || isNaN(toUserId)){
      throw new OGException({
        errorCode: -240,
        errorMessage: 'Invalid UserId.',
      }, 400);
    }

    const toUser = await this.userService.checkSignUserByUserId(toUserId);
    if(!toUser){
      throw new OGException({
        errorCode: -208,
        errorMessage: 'Invalid User.',
      }, 400);
    }

    if(isNaN(Number(page)) || Number(page) < 1){
      page = 1;
    }

    const followerCount = await this.userService.getMyFollowerCountByUserId(toUserId);
    const followers = await this.userService.getMyFollowerUserByUserId(toUserId, page);

    return {
      success: true,
      result: {
        count: followerCount,
        follower: followers
          .filter((user) => user.following)
          .map((activeUser) => new MyFollowing(activeUser))
      }
    }
  }

  @Get('/:toUserId([0-9]{1,11})/following')
  async getMyFollowingByUserId(@Req() req: OGRequest, @Param('toUserId') toUserId: number = undefined, @Query('page') page: string | number = undefined) {
    // toUser validation
    if(!toUserId || isNaN(toUserId)){
      throw new OGException({
        errorCode: -240,
        errorMessage: 'Invalid UserId.',
      }, 400);
    }

    const toUser = await this.userService.checkSignUserByUserId(toUserId);
    if(!toUser){
      throw new OGException({
        errorCode: -208,
        errorMessage: 'Invalid User.',
      }, 400);
    }

    if(isNaN(Number(page)) || Number(page) < 1){
      page = 1;
    }

    const followingCount = await this.userService.getMyFollowingCountByUserId(toUserId);
    const followings = await this.userService.getMyFollowingByUserId(toUserId);

    return {
      success: true,
      result: {
        count: followingCount,
        following: followings
          .filter((user) => user.follower)
          .map((activeUser) => new MyFollower(activeUser))
      }
    }
  }

  // Follow
  @Post('/follow/:toUserId')
  @UseGuards(JWTAuthGuard)
  async postFollow(@Req() req: OGRequest, @Param('toUserId') toUserId: number = undefined){
    const {userId} = req.user;

    // toUser validation
    if(!toUserId || isNaN(toUserId)){
      throw new OGException({
        errorCode: -240,
        errorMessage: 'Invalid UserId.',
      }, 400);
    }

    if(userId === toUserId){
      throw new OGException({
        errorCode: -241,
        errorMessage: 'Can`t follow myself.',
      }, 400);
    }

    const toUser = await this.userService.checkSignUserByUserId(toUserId);
    if(!toUser){
      throw new OGException({
        errorCode: -208,
        errorMessage: 'Invalid User.',
      }, 400);
    }

    // 0: no action & 1: following & -1: unfollow
    const isFollow = await this.userService.checkFollowingUser(userId, toUserId);
    if(isFollow === 1){
      throw new OGException({
        errorCode: -242,
        errorMessage: 'Already Following.',
      }, 400);
    }

    // 0: no action & 1: follow back
    const isFollowBack = await this.userService.checkFollowBack(userId, toUserId);
    const follow = await this.userService.followUser(userId, toUserId);
    if(!follow){
      throw new OGException({
        errorCode: -243,
        errorMessage: 'Internal Server Error.',
      }, 500);
    }

    if(isFollowBack === 1){
      await this.rmqService.publish(ActKey.USER_FOLLOW_BACK, userId, {
        toUserId: toUserId,
      })
    } else {
      await this.rmqService.publish(ActKey.USER_FOLLOW, userId, {
        toUserId: toUserId,
      })
    }

    return {
      success: true,
      result: toUserId
    }
  }

  @Post('/unfollow/:toUserId')
  @UseGuards(JWTAuthGuard)
  async postUnFollow(@Req() req: OGRequest, @Param('toUserId') toUserId: number = undefined){
    const {userId} = req.user;

    // toUser validation
    if(!toUserId || isNaN(toUserId)){
      throw new OGException({
        errorCode: -240,
        errorMessage: 'Invalid UserId.',
      }, 400);
    }

    if(userId === toUserId){
      throw new OGException({
        errorCode: -244,
        errorMessage: 'Can`t unfollow myself.',
      }, 400);
    }

    const toUser = await this.userService.checkSignUserByUserId(toUserId);
    if(!toUser){
      throw new OGException({
        errorCode: -208,
        errorMessage: 'Invalid User.',
      }, 400);
    }

    // 0: no action & 1: following & -1: unfollow
    const isFollow = await this.userService.checkFollowingUser(userId, toUserId);
    if(isFollow !== 1){
      throw new OGException({
        errorCode: -245,
        errorMessage: 'Already Unfollow.',
      }, 400);
    }

    const unfollow = await this.userService.unfollowUser(userId, toUserId);
    if(!unfollow){
      throw new OGException({
        errorCode: -243,
        errorMessage: 'Internal Server Error.',
      }, 500);
    }

    await this.rmqService.publish(ActKey.USER_UNFOLLOW, userId, {
      toUserId: toUserId,
    })

    return {
      success: true,
      result: toUserId
    }
  }

  @Get('/stats/dashboard/report')
  @UseGuards(JWTAuthGuard)
  async getStatsDashboardReportByUserId(@Req() req: OGRequest, @Query('filter') filter: PeriodFilter = PeriodFilter.DAY, @Query('date') date: string | undefined = undefined) {
    const {userId} = req.user;

    const stringDate = convertDateWithoutTime(date);
    if(stringDate === -1){
      throw new OGException({
        errorCode: -247,
        errorMessage: 'Invalid Date.',
      }, 400);
    }

    if(filter !== PeriodFilter.DAY && filter !== PeriodFilter.WEEK && filter !== PeriodFilter.MONTH){
      throw new OGException({
        errorCode: -248,
        errorMessage: 'Invalid Filter.',
      }, 400);
    }

    const stats = await this.userService.getDashboardStats(userId, filter, stringDate);

    return {
      success: true,
      result: stats
    }
  }

  @Get('/stats/dashboard/chart')
  @UseGuards(JWTAuthGuard)
  async getStatsDashboardChartByUserId(@Req() req: OGRequest, @Query('date') date: string | undefined = undefined) {
    const {userId} = req.user;

    const stringDate = convertDateWithoutTime(date);
    if(stringDate === -1){
      throw new OGException({
        errorCode: -247,
        errorMessage: 'Invalid Date.',
      }, 400);
    }

    const chart = await this.userService.getDashboardChart(userId, stringDate);

    return {
      success: true,
      result: chart
    }
  }

  @Get('/stats/dashboard/post')
  @UseGuards(JWTAuthGuard)
  async getStatsDashboardPostByUserId(@Req() req: OGRequest, @Query('filter') filter: PeriodFilter = PeriodFilter.DAY, @Query('date') date: string | undefined = undefined, @Query('page') page: string | number = 1) {
    const {userId} = req.user;

    const stringDate = convertDateWithoutTime(date);
    if(stringDate === -1){
      throw new OGException({
        errorCode: -247,
        errorMessage: 'Invalid Date.',
      }, 400);
    }

    if(filter !== PeriodFilter.DAY && filter !== PeriodFilter.WEEK && filter !== PeriodFilter.MONTH){
      throw new OGException({
        errorCode: -248,
        errorMessage: 'Invalid Filter.',
      }, 400);
    }

    const posts = await this.userService.getDashboardPost(userId, filter, stringDate, page);

    return {
      success: true,
      result: posts
    }
  }

  @Get('/stats/dashboard/comment')
  @UseGuards(JWTAuthGuard)
  async getStatsDashboardCommentByUserId(@Req() req: OGRequest, @Query('filter') filter: PeriodFilter = PeriodFilter.DAY, @Query('date') date: string | undefined = undefined, @Query('page') page: string | number = 1) {
    const {userId} = req.user;

    const stringDate = convertDateWithoutTime(date);
    if(stringDate === -1){
      throw new OGException({
        errorCode: -247,
        errorMessage: 'Invalid Date.',
      }, 400);
    }

    if(filter !== PeriodFilter.DAY && filter !== PeriodFilter.WEEK && filter !== PeriodFilter.MONTH){
      throw new OGException({
        errorCode: -248,
        errorMessage: 'Invalid Filter.',
      }, 400);
    }

    const comments = await this.userService.getDashboardComment(userId, filter, stringDate, page);

    return {
      success: true,
      result: comments
    }
  }

  @Get('/stats/post/:postId/summary')
  @UseGuards(JWTAuthGuard)
  async getStatsPostSummaryByPostId(@Req() req: OGRequest, @Param('postId') postId: number) {
    const {userId} = req.user;

    const post = await this.userService.findPostByPostIdNUserId(postId, userId);
    if(!post){
      throw new OGException({
        errorCode: -255,
        errorMessage: 'Invalid Post.',
      }, 400);
    }

    const summary = await this.userService.getStatsPostByPostId(postId)

    return {
      success: true,
      result: summary
    }
  }

  @Get('/stats/post/:postId/report')
  @UseGuards(JWTAuthGuard)
  async getStatsPostReportByPostId(@Req() req: OGRequest, @Query('filter') filter: PeriodFilter = PeriodFilter.DAY, @Query('date') date: string | undefined = undefined, @Param('postId') postId: number) {
    const {userId} = req.user;

    const stringDate = convertDateWithoutTime(date);
    if(stringDate === -1){
      throw new OGException({
        errorCode: -247,
        errorMessage: 'Invalid Date.',
      }, 400);
    }

    if(filter !== PeriodFilter.DAY && filter !== PeriodFilter.WEEK && filter !== PeriodFilter.MONTH){
      throw new OGException({
        errorCode: -248,
        errorMessage: 'Invalid Filter.',
      }, 400);
    }

    const post = await this.userService.findPostByPostIdNUserId(postId, userId);
    if(!post){
      throw new OGException({
        errorCode: -255,
        errorMessage: 'Invalid Post.',
      }, 400);
    }

    const report = await this.userService.getStatsPostReport(postId, filter, stringDate);

    return {
      success: true,
      result: report
    }
  }

  @Get('/stats/post/:postId/chart')
  @UseGuards(JWTAuthGuard)
  async getStatsPostChartByPostId(@Req() req: OGRequest, @Query('date') date: string | undefined = undefined, @Param('postId') postId: number) {
    const {userId} = req.user;

    const stringDate = convertDateWithoutTime(date);
    if(stringDate === -1){
      throw new OGException({
        errorCode: -247,
        errorMessage: 'Invalid Date.',
      }, 400);
    }

    const post = await this.userService.findPostByPostIdNUserId(postId, userId);
    if(!post){
      throw new OGException({
        errorCode: -255,
        errorMessage: 'Invalid Post.',
      }, 400);
    }

    const chart = await this.userService.getStatsPostChart(postId, stringDate);

    return {
      success: true,
      result: chart
    }
  }

  @Post('/report/:userId')
  @UseGuards(JWTAuthGuard)
  async reportUser(@Req() req: OGRequest, @Param('userId') userId: number, @Body() report: ReportUserDto) {

    const result = await this.userService.reportUser(req.user.userId, userId, report);
    if(result){
      await this.rmqService.publish(ActKey.USER_REPORT, req.user.userId, {
        toUserId: userId,
      })
    }
  }

  @Get('/notification')
  @UseGuards(JWTAuthGuard)
  async getNotificationByUserId(@Req() req: OGRequest, @Query('type') type: NotificationType = NotificationType.ALL){
    const userId = req.user.userId
    const result = await this.userService.getNotificationByUserId(userId, type);
    if(result){
      return {
        success: true,
        result: result
      }
    }
    return {
      success: true,
      result: []
    }
  }

  @Get('/notification/setting')
  @UseGuards(JWTAuthGuard)
  async getNotificationSettingByUserId(@Req() req: OGRequest) {
    const userId = req.user.userId
    const result = await this.userService.getNotificationSettingByUserId(userId);

    return {
      success: true,
      result: result
    }
  }

  @Post('/notification/setting')
  @UseGuards(JWTAuthGuard)
  async updateNotificationSettingByUserId(@Req() req: OGRequest, @Body() notification: NotificationSettingDto) {
    

    const userId = req.user.userId
    const result = await this.userService.updateNotificationSettingByUserId(userId, notification);
    if(result){
      return {
        success: true,
        result: result
      }
    }

    return {
      success: false,
      result: null
    }

  }


}

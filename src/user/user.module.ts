import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/extensions/auth/auth.module';
import MailService from 'src/extensions/services/mail.service';
import { RMQService } from 'src/extensions/services/rmq.service';
import { Post } from 'src/post/entities/post.entity';
import { PostViewHistory } from 'src/post/entities/postViewHistory.entity';
import { PreRegistered } from 'src/sign/entities/preregistered.entity';
import { UserEmailVerificationCode } from 'src/sign/entities/user-email-verification-code.entity';
import { UserSigninFailHistory } from 'src/sign/entities/user-signin-fail-history.entity';
import { UserSigninHistory } from 'src/sign/entities/user-signin-history.entity';
import { SignService } from 'src/sign/sign.service';
import { UserFollowHistory } from './entities/follow/user-follow-history.entity';
import { UserFollow } from './entities/follow/user-follow.entity';
import { UserGradeMap } from './entities/grade-map/user-grade-map.entity';
import { UserPasswordFailHistory } from './entities/password-fail-history/user-password-fail-history.entity';
import { UserReferralHistory } from './entities/referral-code/user-referral-code.entity';
import { UserTitle } from './entities/title/user-title.entity';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserBanList } from './entities/ban-list/ban-list';
import { UserNameHistory } from './entities/name/name-history.entity';
import { UserNotification } from './entities/notification/user-notification.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationCodeDivision } from 'src/notification/entities/notificationCodeDivision.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      User,
      UserTitle,
      UserGradeMap,
      UserPasswordFailHistory,
      UserReferralHistory,
      UserFollow,
      UserFollowHistory,
      UserEmailVerificationCode,
      UserSigninHistory,
      UserSigninFailHistory,
      UserBanList,
      UserNameHistory,
      UserNotification,
      PreRegistered,
      Post,
      PostViewHistory,
      Notification,
      NotificationCodeDivision
    ])
  ],
  controllers: [UserController],
  providers: [
    UserService,
    SignService,
    RMQService,
    MailService,
  ]
})
export class UserModule { }
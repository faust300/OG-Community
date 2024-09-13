import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { Post } from 'src/post/entities/post.entity';
import { PostViewHistory } from 'src/post/entities/postViewHistory.entity';
import { UserPasswordFailHistory } from 'src/user/entities/password-fail-history/user-password-fail-history.entity';
import { UserReferralHistory } from 'src/user/entities/referral-code/user-referral-code.entity';
import { Title } from 'src/user/entities/title/title.entity';
import { UserTitle } from 'src/user/entities/title/user-title.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { PickthemController } from './pickthem.controller';
import { PickthemService } from './pickthem.service';
import { UserFollow } from 'src/user/entities/follow/user-follow.entity';
import { UserFollowHistory } from 'src/user/entities/follow/user-follow-history.entity';
import { UserBanList } from 'src/user/entities/ban-list/ban-list';
import { UserNameHistory } from 'src/user/entities/name/name-history.entity';
import { UserNotification } from 'src/user/entities/notification/user-notification.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationCodeDivision } from 'src/notification/entities/notificationCodeDivision.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Title,
      UserTitle,
      UserPasswordFailHistory,
      UserReferralHistory,
      UserFollow,
      UserFollowHistory,
      UserBanList,
      UserNameHistory,
      UserNotification,
      Post,
      PostViewHistory,
      Notification,
      NotificationCodeDivision
    ]),
  ],
  controllers: [PickthemController],
  providers: [
    PickthemService,
    ConnectionService,
    UserService,
  ]
})
export class PickthemModule {}

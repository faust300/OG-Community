import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import MailService from 'src/extensions/services/mail.service';
import { User } from 'src/user/entities/user.entity';
import { AuthModule } from '../extensions/auth/auth.module';
import { RMQService } from '../extensions/services/rmq.service';
import { PreRegistered } from './entities/preregistered.entity';
import { UserEmailVerificationCode } from './entities/user-email-verification-code.entity';
import { UserSigninFailHistory } from './entities/user-signin-fail-history.entity';
import { UserSigninHistory } from './entities/user-signin-history.entity';
import { SignController } from './sign.controller';
import { SignService } from './sign.service';
import { UserMembershipGroup } from 'src/membership/entities/membership-group.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      User,
      UserEmailVerificationCode,
      UserSigninHistory,
      UserSigninFailHistory,
      PreRegistered,
      UserMembershipGroup,
    ])
  ],
  controllers: [SignController],
  providers: [
    SignService,
    MailService,
    RMQService
  ]
})
export class SignModule { }

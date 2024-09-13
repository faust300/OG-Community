import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMembershipGroup } from 'src/membership/entities/membership-group.entity';
import { UserMembershipMap } from 'src/membership/entities/membership-map.entity';
import { MembershipService } from 'src/membership/membership.service';
import { MembershipManageController } from './membership-manage.controller';
import { MembershipManageService } from './membership-manage.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserMembershipGroup,
      UserMembershipMap,
    ])
  ],
  controllers: [MembershipManageController],
  providers: [
    MembershipManageService,
    MembershipService,
  ]
})
export class MembershipManageModule {}

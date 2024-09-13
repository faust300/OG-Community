import { Module } from '@nestjs/common';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMembershipGroup } from './entities/membership-group.entity';
import { UserMembershipMap } from './entities/membership-map.entity';
import { MembershipManageService } from 'src/membership-manage/membership-manage.service';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserMembershipGroup,
      UserMembershipMap,
    ])
  ],
  controllers: [MembershipController],
  providers: [
    MembershipService,
    MembershipManageService,
  ]
})
export class MembershipModule {}

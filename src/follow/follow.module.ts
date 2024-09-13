import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFollow } from 'src/user/entities/follow/user-follow.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserFollow,
      User
    ])
  ],
  controllers: [FollowController],
  providers: [FollowService]
})
export class FollowModule {}

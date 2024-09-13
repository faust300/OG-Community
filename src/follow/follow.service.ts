import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFollow } from 'src/user/entities/follow/user-follow.entity';
import { User } from 'src/user/entities/user.entity';
import { Not, Repository } from 'typeorm';
import { ReturnFollowers } from './dto/return-follower';
import { UserGradeMap } from '../user/entities/grade-map/user-grade-map.entity';
import { MyFollowing } from '../user/dto/my-following.dto';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(UserFollow)
    private readonly followRepository: Repository<UserFollow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async getFollowers(userId?: number): Promise<ReturnFollowers[]> {
    const getRecommendUserList = this.userRepository
      .createQueryBuilder('User')
      .select('User.id', 'userId')
      .addSelect('User.name', 'userName')
      .addSelect('User.profileImagePath', 'profileImagePath')
      .addSelect(
        '(SELECT COUNT(*) FROM UserFollow WHERE toUserId = User.id)',
        'follower',
      )
      .addSelect('userGradeMap.isVerified', 'isVerified')
      .leftJoinAndSelect('User.userGradeMap', 'userGradeMap')
      .where('userGradeMap.isVerified = 1');

    if (userId) {
      getRecommendUserList
        .andWhere('User.id != :userId', { userId })
        .andWhere((qb) => {
          const query = qb
            .createQueryBuilder()
            .select('UserFollow.toUserId')
            .from(UserFollow, 'UserFollow')
            .where(`UserFollow.fromUserId = ${userId}`)
            .getSql();
          return `User.id NOT IN (${query})`;
        });
    }
    getRecommendUserList.orderBy('RAND()').limit(20);

    const usersRaw = await getRecommendUserList.getRawMany();

    return usersRaw.map((follower) => ({
      userId: follower.userId,
      profileImagePath: follower.profileImagePath
        ? process.env.PROFILE_URL + follower.profileImagePath
        : null,
      userName: follower.userName,
      isVerified: follower.isVerified,
      followersCount: follower.follower,
      action: 'follow',
    }));
  }

  async getFriendFollowList(toUserId: number, fromUserId?: number) {
    const getFriendFollowerList = this.userRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.userGradeMap', 'userGradeMap')
      .leftJoinAndSelect('User.follower', 'follower')
      .where('userGradeMap.isVerified = 1');
    if (fromUserId) {
      getFriendFollowerList
        .andWhere('User.id != :fromUserId', { fromUserId })
        .andWhere((qb) => {
          const query = qb
            .createQueryBuilder()
            .select('UserFollow.fromUserId')
            .from(UserFollow, 'UserFollow')
            .where((subQuery) => {
              const sub = subQuery
                .createQueryBuilder()
                .select('UserFollowSub.toUserId', 'toUserId')
                .from(UserFollow, 'UserFollowSub')
                .where(`UserFollowSub.fromUserId = ${fromUserId}`)
                .getSql();
              return `UserFollow.fromUserId IN (${sub})`;
            })
            .andWhere(`UserFollow.toUserId = ${toUserId}`)
            .andWhere(`UserFollow.fromUserId != ${fromUserId}`)
            .getSql();
          return `User.id IN (${query})`;
        });
    }
    getFriendFollowerList.groupBy('User.id').orderBy('RAND()');

    const users = await getFriendFollowerList.getMany();
    const returnFollows: ReturnFollowers[] = [];
    users.map((follower) => {
      const item = {
        userId: follower.id,
        profileImagePath: follower.profileImagePath
          ? process.env.PROFILE_URL + follower.profileImagePath
          : null,
        userName: follower.name,
        isVerified: follower.userGradeMap.isVerified,
        followersCount: follower.follower.length,
        action: 'follow',
      };
      returnFollows.push(item);
    });

    return returnFollows;
  }
}

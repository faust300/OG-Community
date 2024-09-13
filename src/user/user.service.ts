import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Post } from 'src/post/entities/post.entity';
import { PostViewHistory } from 'src/post/entities/postViewHistory.entity';
import {
  convertDateWithoutTime,
  returnChartDataFromTimeNValue,
} from 'src/utils/User';
import {
  DataSource,
  EntityManager,
  In,
  NotBrackets,
  Raw,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import {
  UpdatePasswordDto,
  UpdateUserDataKey,
  UpdateUserDto,
} from './dto/update-user.dto';
import {
  ActivityHistoryList,
  ActivityHistorySummary,
} from './entities/activity-history/activity-history.entity';
import {
  UserFollowActionType,
  UserFollowHistory,
} from './entities/follow/user-follow-history.entity';
import { UserFollow } from './entities/follow/user-follow.entity';
import { UserPasswordFailHistory } from './entities/password-fail-history/user-password-fail-history.entity';
import { UserReferralHistory } from './entities/referral-code/user-referral-code.entity';
import { UserTitle } from './entities/title/user-title.entity';
import { User, UserSignType } from './entities/user.entity';
import { ReportUserDto } from './dto/report-user.dto';
import { UserBanList } from './entities/ban-list/ban-list';
import { BanListDto } from './dto/ban-list.dto';
import { UserNameHistory } from './entities/name/name-history.entity';
import { UserNotification } from './entities/notification/user-notification.entity';
import { OGException } from 'src/extensions/exception/exception.filter';
import { NotificationSettingDto, NotificationType } from './dto/notificationSetting.dto';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationCodeDivision } from 'src/notification/entities/notificationCodeDivision.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UserTitle)
    private userTitleRepository: Repository<UserTitle>,

    @InjectRepository(UserPasswordFailHistory)
    private userPasswordFailHistoryRepository: Repository<UserPasswordFailHistory>,

    @InjectRepository(UserReferralHistory)
    private userReferralHistoryRepository: Repository<UserReferralHistory>,

    @InjectRepository(UserFollow)
    private userFollowRepository: Repository<UserFollow>,

    @InjectRepository(UserFollowHistory)
    private userFollowHistoryRepository: Repository<UserFollowHistory>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(PostViewHistory)
    private postViewHistoryRepository: Repository<PostViewHistory>,

    @InjectRepository(UserBanList)
    private userBanListRepository: Repository<UserBanList>,

    @InjectRepository(UserNameHistory)
    private userNameHistoryRepository: Repository<UserNameHistory>,

    @InjectRepository(UserNotification)
    private userNotificationRepository: Repository<UserNotification>,

    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,

    @InjectRepository(NotificationCodeDivision)
    private notificationCodeDivisionRepository: Repository<NotificationCodeDivision>,


    @InjectEntityManager()
    private em: EntityManager,

    private dataSource: DataSource,
  ) {}

  async checkSignUserByUserId(userId: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return user;
  }

  async checkSignUserByName(userName: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: {
        name: userName,
      },
    });

    return user;
  }

  async checkSignUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: {
        name: username,
      },
    });

    return user;
  }

  async getUserByUserId(userId: number): Promise<User | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.title', 'Title')
      .leftJoinAndSelect('User.userTitles', 'UserTitle')
      .leftJoinAndSelect('UserTitle.titles', 'Titles')
      .leftJoinAndSelect('User.referralHistories', 'UserReferralHistory')
      .leftJoinAndSelect('User.userGradeMap', 'UserGradeMap')
      .leftJoinAndSelect('User.follower', 'UserFollower')
      .leftJoinAndSelect('User.following', 'UserFollow')
      // .leftJoinAndSelect('User.membershipGroup', 'UserMembershipGroup')
      .where('User.id = :userId', { userId })
      .getOne();

    return user;
  }
  async getUserByUserName(userName: string): Promise<User | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.title', 'Title')
      .leftJoinAndSelect('User.userTitles', 'UserTitle')
      .leftJoinAndSelect('UserTitle.titles', 'Titles')
      .leftJoinAndSelect('User.referralHistories', 'UserReferralHistory')
      .leftJoinAndSelect('User.userGradeMap', 'UserGradeMap')
      .leftJoinAndSelect('User.follower', 'UserFollower')
      .leftJoinAndSelect('User.following', 'UserFollow')
      // .leftJoinAndSelect('User.membershipGroup', 'UserMembershipGroup')
      .where('User.name = :userName', { userName })
      .getOne();
    return user;
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const user: User = await this.userRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.title', 'Title')
      .leftJoinAndSelect('User.userTitles', 'UserTitle')
      .leftJoinAndSelect('User.userGradeMap', 'UserGradeMap')
      .leftJoinAndSelect('User.referralHistories', 'UserReferralHistory')
      .where('User.name = :name', { name })
      .getOne();

    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const user: User = await this.userRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.title', 'Title')
      .leftJoinAndSelect('User.userTitles', 'UserTitle')
      .leftJoinAndSelect('User.userGradeMap', 'UserGradeMap')
      .leftJoinAndSelect('User.referralHistories', 'UserReferralHistory')
      .where('User.referralCode = :referralCode', { referralCode })
      .getOne();

    return user;
  }

  async getUserTitlesByUserId(userId: number): Promise<UserTitle[]> {
    const titles = await this.userTitleRepository
      .createQueryBuilder('UserTitle')
      .leftJoinAndSelect('UserTitle.titles', 'Title')
      .leftJoinAndSelect('UserTitle.user', 'User')
      .where('UserTitle.userId = :userId', { userId })
      .getMany();

    return titles;
  }

  async getActivityHistorySummaryByUserId(
    userId: number,
  ): Promise<ActivityHistorySummary> {
    const summary: ActivityHistorySummary = await this.em
      .createQueryBuilder()
      .select('T.postCount', 'postCount')
      .addSelect('T.commentCount', 'commentCount')
      .addSelect('T.upvotePostCount + T.upvoteCommentCount', 'upvoteCount')
      .addSelect(
        'T.downvotePostCount + T.downvoteCommentCount',
        'downvoteCount',
      )
      .from((qb) => {
        return qb
          .select((subQuery) => {
            return subQuery
              .select('COUNT(Post.id)')
              .from('Post', 'Post')
              .where(`Post.userId = ${userId}`)
              .andWhere('Post.deletedAt IS NULL');
          }, 'postCount')
          .addSelect((subQuery) => {
            return subQuery
              .select('COUNT(Comment.id)')
              .from('Comment', 'Comment')
              .where(`Comment.userId = ${userId}`)
              .andWhere('Comment.deletedAt IS NULL');
          }, 'commentCount')
          .addSelect((subQuery) => {
            return subQuery
              .select('COUNT(PostVote.userId)')
              .from('PostVote', 'PostVote')
              .where(`PostVote.userId = ${userId}`)
              .andWhere('PostVote.deletedAt IS NULL')
              .andWhere('PostVote.voteType = "up"');
          }, 'upvotePostCount')
          .addSelect((subQuery) => {
            return subQuery
              .select('COUNT(CommentVote.userId)')
              .from('CommentVote', 'CommentVote')
              .where(`CommentVote.userId = ${userId}`)
              .andWhere('CommentVote.deletedAt IS NULL')
              .andWhere('CommentVote.voteType = "up"');
          }, 'upvoteCommentCount')
          .addSelect((subQuery) => {
            return subQuery
              .select('COUNT(PostVote.userId)')
              .from('PostVote', 'PostVote')
              .where(`PostVote.userId = ${userId}`)
              .andWhere('PostVote.deletedAt IS NULL')
              .andWhere('PostVote.voteType = "down"');
          }, 'downvotePostCount')
          .addSelect((subQuery) => {
            return subQuery
              .select('COUNT(CommentVote.userId)')
              .from('CommentVote', 'CommentVote')
              .where(`CommentVote.userId = ${userId}`)
              .andWhere('CommentVote.deletedAt IS NULL')
              .andWhere('CommentVote.voteType = "down"');
          }, 'downvoteCommentCount')
          .fromDummy();
      }, 'T')
      .getRawOne();
    return summary;
  }

  getActivityHistoryViewQuery(userId: number): string {
    const result = this.em
    .createQueryBuilder()
    .select(
      "IF(PostActivityHistory.commentId IS NULL, 'post', IF(Comment.parentId = 0, 'comment', 'reply')) ",
      'type',
    )
    .addSelect('PostActivityHistory.postId', 'postId')
    .addSelect('PostActivityHistory.commentId', 'commentId')
    .addSelect('Comment.parentId', 'parentId')
    .addSelect('PostActivityHistory.userId', 'userId')
    .addSelect('( SELECT User.name FROM User WHERE User.id = (SELECT userId FROM Post WHERE Post.id = PostActivityHistory.postId) )', 'writer')
    .addSelect((subquery) => {
      return subquery
        .select('JSON_ARRAYAGG(name)')
        .from('Tag', 'Tag')
        .where('postId = Post.id');
    }, 'tags')
    .addSelect('Topic.imagePath', 'imagePath')
    .addSelect(
      'IF(PostActivityHistory.commentId IS NULL, Post.title, Comment.contents)',
      'contents',
    )
    .addSelect('Post.createdAt', 'createdAt')
    .addSelect('PostActivityHistory.updatedAt', 'updatedAt')
    .addSelect('Post.deletedAt', 'postDeletedAt')
    .addSelect('Comment.deletedAt', 'commentDeletedAt')
    .from('PostActivityHistory', 'PostActivityHistory')
    .withDeleted()
    .leftJoin('Post', 'Post', 'Post.id = PostActivityHistory.postId')
    .leftJoin(
      'Comment',
      'Comment',
      'Comment.id = PostActivityHistory.commentId',
    )
    .leftJoin('User', 'User', 'User.id = PostActivityHistory.userId')
    .leftJoin('Tag', 'Tag', 'Tag.postId = Post.id')
    .leftJoin('Topic', 'Topic', 'Topic.name = Tag.name')
    .where(`PostActivityHistory.userId = ${userId}`)
    .groupBy('postId, commentId')
    .getQuery();
    return result
  }

  getActivityHistoryFilterQuery(
    sql: SelectQueryBuilder<any>,
    filter: string = 'all',
  ): void {
    switch (filter) {
      default:
        break;

      case 'post':
        sql.andWhere("T.type = 'post'");
        break;

      case 'comment':
        sql.andWhere("T.type = 'comment'");
        break;

      case 'reply':
        sql.andWhere("T.type = 'reply'");
        break;
    }
  }

  async getActivityHistoryListCountByUserId(
    userId: number,
    filter: string = 'all',
  ): Promise<Number> {
    const count = this.em
      .createQueryBuilder()
      .select('COUNT(T.type) AS count')
      .from(`(${this.getActivityHistoryViewQuery(userId)})`, 'T')
      .where("IF(T.type = 'post', T.postDeletedAt IS NULL, TRUE)")
      .andWhere("IF(T.type = 'comment', T.commentDeletedAt IS NULL, TRUE)")
      .andWhere("IF(T.type = 'reply', T.commentDeletedAt IS NULL, TRUE)");

    this.getActivityHistoryFilterQuery(count, filter);

    const result = await count.getRawOne();
    return result.count;
  }

  async getActivityHistoryListByUserId(
    userId: number,
    page: string | number = 1,
    sort = 'recent',
    filter: string = 'all',
  ): Promise<ActivityHistoryList[]> {
    const list = this.em
      .createQueryBuilder()
      .select('T.type', 'type')
      .addSelect('T.postId', 'postId')
      .addSelect('T.commentId', 'commentId')
      .addSelect('T.parentId', 'parentId')
      .addSelect('T.userId', 'userId')
      .addSelect('T.writer', 'writer')
      .addSelect('T.tags', 'tags')
      .addSelect('T.imagePath', 'imagePath')
      .addSelect('T.contents', 'contents')
      .addSelect('T.createdAt', 'createdAt')
      .addSelect('T.updatedAt', 'updatedAt')
      .addSelect('IF(T.postDeletedAt IS NULL, TRUE, FALSE )', 'hasLink')
      .from(`(${this.getActivityHistoryViewQuery(userId)})`, 'T')
      .where("IF(T.type = 'post', T.postDeletedAt IS NULL, TRUE)")
      .andWhere("IF(T.type = 'comment', T.commentDeletedAt IS NULL, TRUE)")
      .andWhere("IF(T.type = 'reply', T.commentDeletedAt IS NULL, TRUE)");

    this.getActivityHistoryFilterQuery(list, filter);

    const result = await list
      .take(10)
      .skip((Number(page) - 1) * 10)
      .orderBy({
        'T.updatedAt': sort.toLowerCase() === 'past' ? 'ASC' : 'DESC',
      })
      .getRawMany();

    if (result) {
      result.filter((item: ActivityHistoryList) => {
        item.hasLink = Boolean(item.hasLink);
        item.tags = item.tags ? item.tags : [];
      });
    }
    return result;
  }

  // Update
  async updateMe(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const qr = this.dataSource.createQueryRunner();
    try {
      await qr.connect();
      await qr.startTransaction();
      const user = await this.userRepository.findOneBy({ id: userId });

      for (let i = 0; i < updateUserDto.data.length; i++) {
        const data = updateUserDto.data[i];

        if (data.key === UpdateUserDataKey.IMAGE) {
          user.profileImagePath = data.value;
          continue;
        }

        if (data.key === UpdateUserDataKey.BIO) {
          user.bio = data.value;
          continue;
        }

        if (data.key === UpdateUserDataKey.TITLE) {
          user.titleId = data.value === '0' ? null : Number(data.value);
          continue;
        }

        if (data.key === UpdateUserDataKey.EMAIL) {
          user.email = data.value;
          continue;
        }

        if (data.key === UpdateUserDataKey.USERNAME) {
          const userNameHistory = new UserNameHistory();
          userNameHistory.userId = userId;
          userNameHistory.fromUserName = user.name;
          userNameHistory.toUserName = data.value;
          await qr.manager.save(userNameHistory);

          user.name = data.value;
          user.isChangedName = true;

          continue;
        }
      }
      await qr.manager.save(user);
      await qr.commitTransaction();
      return user;
    } catch (error) {
      console.log(error);
      await qr.rollbackTransaction();
      return undefined;
    } finally{
      await qr.release();
    }
  }

  async createPasswordFailHistory(
    userId: number,
    ip: string | undefined,
  ): Promise<number | undefined> {
    const qr = this.dataSource.createQueryRunner();

    try {
      await qr.connect();
      await qr.startTransaction();

      const history = new UserPasswordFailHistory();
      history.userId = userId;
      history.date = new Date();
      if (ip) {
        history.ipA = ip.split('.')[0] ?? null;
        history.ipB = ip.split('.')[1] ?? null;
        history.ipC = ip.split('.')[2] ?? null;
        history.ipD = ip.split('.')[3] ?? null;
      }

      await qr.manager.save(history);

      const count = qr.manager
        .createQueryBuilder()
        .from(UserPasswordFailHistory, 'UserPasswordFailHistory')
        .where('userId = :userId', { userId })
        .andWhere('createdAt > DATE_SUB(NOW(), INTERVAL 2 HOUR)')
        .getCount();

      await qr.commitTransaction();
      return count;
    } catch (error) {
      await qr.rollbackTransaction();
      console.log(error);
      return undefined;
    } finally {
      await qr.release();
    }
  }

  async getPasswordFailCountByUserId(userId: number): Promise<number> {
    const count = await this.userPasswordFailHistoryRepository
      .createQueryBuilder('UserPasswordFailHistory')
      .where('UserPasswordFailHistory.userId = :userId', { userId })
      .andWhere('createdAt > DATE_SUB(NOW(), INTERVAL 2 HOUR)')
      .andWhere('deletedAt IS NULL')
      .getCount();

    return count;
  }

  async removePasswordFailHistory(userId: number): Promise<void> {
    const failCount = await this.getPasswordFailCountByUserId(userId);

    if (failCount > 0) {
      const historyRepo = this.userPasswordFailHistoryRepository;
      const histories = await this.userPasswordFailHistoryRepository.findBy({
        userId,
        createdAt: Raw(
          (createdAt) => `${createdAt} > DATE_SUB(NOW(), INTERVAL 2 HOUR)`,
        ),
      });

      if (histories.length > 0) {
        for (let i = 0; i < histories.length; i++) {
          const history = histories[i];
          history.deletedAt = new Date();
        }
      }

      await historyRepo.save(histories);
    }
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hashSync(newPassword, salt);

    const userRepo = this.userRepository;
    const user = await this.userRepository.findOne({
      where: {
        email: email,
        signType: UserSignType.EMAIL,
      },
    });

    user.password = hash;
    await userRepo.save(user);
  }

  async deactivateUserFromUserId(userId: number): Promise<void> {
    const userRepo = this.userRepository;
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    const today = new Date(new Date());
    const thirtyDaysLater = today.setDate(today.getDate() + 30);

    user.expiredAt = new Date(thirtyDaysLater);

    await userRepo.save(user);
  }

  async removeUserByUserId(userId: number): Promise<void> {
    const userRepo = this.userRepository;
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    user.deletedAt = new Date();

    await userRepo.save(user);
  }

  async getUserReferralCodeFromUserId(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      select: {
        referralCode: true,
      },
      where: {
        id: userId,
      },
    });

    return user;
  }

  async getUserReferralCodeUsedCountFromReferralCode(
    referralCode: string,
  ): Promise<number> {
    const count = await this.userReferralHistoryRepository.countBy({
      referralCode,
    });

    return count;
  }

  // legacy
  // async getUserReferralCodeUsedUsersFromReferralCode(
  //   referralCode: string,
  // ): Promise<Array<string>> {
  //   const users = await this.connectionService.connectionPool.readerQuery<
  //     User[]
  //   >(SQL`
  //     SELECT
  //       U.name
  //     FROM
  //       UserReferralHistory AS H
  //     LEFT JOIN
  //       User AS U
  //     ON
  //       U.id = H.userId
  //     WHERE
  //       H.referralCode = ${referralCode}
  //   `);

  //   if (users) {
  //     users.filter((user: User) => {
  //       if (user.name) {
  //         user.name = (
  //           user.name.substring(0, 1) +
  //           user.name.substring(1).replace(/([a-z0-9_])/gi, '*')
  //         ).slice(0, 8);
  //       }
  //     });
  //   }

  //   return users.map((user: User) => user.name);
  // }

  async insertReferralCode(
    userId: number,
    referralCode: string,
  ): Promise<void> {
    const referralHistoryRepo = this.userReferralHistoryRepository;
    const referralHistory = new UserReferralHistory();

    referralHistory.userId = userId;
    referralHistory.referralCode = referralCode;

    await referralHistoryRepo.save(referralHistory);
  }

  async unsubscribeByEmail(email: string): Promise<void> {
    const userRepo = this.userRepository;
    const user = await this.userRepository.findOneBy({
      email,
    });

    user.unsubscribedAt = new Date();

    await userRepo.save(user);
  }

  async resubscribeByUserId(userId: number): Promise<void> {
    const userRepo = this.userRepository;
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    user.unsubscribedAt = null;

    await userRepo.save(user);
  }

  // Follow User
  async checkFollowingUser(
    fromUserId: number,
    toUserId: number,
  ): Promise<number> {
    // 0: no action & 1: following & -1: unfollow

    const isFollow = await this.userFollowRepository.findOne({
      where: {
        fromUserId,
        toUserId,
      },
      withDeleted: true,
    });

    if (!isFollow) {
      return 0;
    } else if (isFollow.deletedAt) {
      return -1;
    } else {
      return 1;
    }
  }

  async checkFollowBack(fromUserId: number, toUserId: number): Promise<number> {
    const isFollow = await this.userFollowRepository.findOne({
      where: {
        toUserId: fromUserId,
        fromUserId: toUserId,
      },
    });
    if (isFollow) {
      return 1;
    } else {
      return 0;
    }
  }

  async followUser(fromUserId: number, toUserId: number): Promise<Boolean> {
    const qr = this.dataSource.createQueryRunner();
    try {
      await qr.connect();
      await qr.startTransaction();

      let followingUser = await this.userFollowRepository
        .createQueryBuilder()
        .where('fromUserId = :fromUserId', { fromUserId })
        .andWhere('toUserId = :toUserId', { toUserId })
        .withDeleted()
        .setQueryRunner(qr)
        .getOne();

      if (followingUser && !followingUser.deletedAt) {
        await qr.rollbackTransaction();
        return false;
      } else if (followingUser && followingUser.deletedAt) {
        followingUser.deletedAt = null;
      } else if (!followingUser) {
        followingUser = new UserFollow();
        followingUser.fromUserId = fromUserId;
        followingUser.toUserId = toUserId;
      }

      await qr.manager.save(followingUser);

      const insertHistory = new UserFollowHistory();
      insertHistory.fromUserId = fromUserId;
      insertHistory.toUserId = toUserId;
      insertHistory.action = UserFollowActionType.FOLLOW;
      await qr.manager.save(insertHistory);

      await qr.commitTransaction();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      console.log(error);
      return undefined;
    } finally {
      await qr.release();
    }
  }

  async unfollowUser(fromUserId: number, toUserId: number): Promise<Boolean> {
    const qr = this.dataSource.createQueryRunner();
    try {
      await qr.connect();
      await qr.startTransaction();

      let unfollowUser = await this.userFollowRepository
        .createQueryBuilder()
        .where('fromUserId = :fromUserId', { fromUserId })
        .andWhere('toUserId = :toUserId', { toUserId })
        .withDeleted()
        .setQueryRunner(qr)
        .getOne();

      if (unfollowUser && unfollowUser.deletedAt) {
        await qr.rollbackTransaction();
        return false;
      } else if (unfollowUser && !unfollowUser.deletedAt) {
        unfollowUser.deletedAt = new Date();
      } else if (!unfollowUser) {
        await qr.rollbackTransaction();
        return false;
      }

      await qr.manager.save(unfollowUser);

      const insertHistory = new UserFollowHistory();
      insertHistory.fromUserId = fromUserId;
      insertHistory.toUserId = toUserId;
      insertHistory.action = UserFollowActionType.UNFOLLOW;
      await qr.manager.save(insertHistory);

      await qr.commitTransaction();
      return true;
    } catch (error) {
      await qr.rollbackTransaction();
      console.log(error);
      return undefined;
    } finally {
      await qr.release();
    }
  }

  async manageFollower(fromUserId: number, toUserId: number): Promise<number> {
    const followRepo = this.userFollowRepository;
    const user = await this.userFollowRepository.findOne({
      where: {
        fromUserId: toUserId,
        toUserId: fromUserId,
      },
    });
    if (!user) {
      return -1;
    }

    // Todo: Manage list

    await followRepo.save(user);
    return 1;
  }

  // // User Profile
  async getMyFollowerCountByUserId(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return user.followerCount;
  }

  async getMyFollowerUserByUserId(
    userId: number,
    page: string | number = 1,
  ): Promise<UserFollow[]> {
    const users = await this.userFollowRepository
      .createQueryBuilder('UserFollow')
      .leftJoinAndSelect('UserFollow.following', 'User')
      .leftJoinAndSelect('User.title', 'Title')
      .where('UserFollow.toUserId = :userId', { userId })
      .take(20)
      .skip((Number(page) - 1) * 20)
      .getMany();
    return users;
  }

  async getMyFollowingCountByUserId(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    return user.followingCount;
  }

  async getMyFollowingByUserId(
    userId: number,
    page: string | number = 1,
  ): Promise<UserFollow[]> {
    const followings = await this.userFollowRepository
      .createQueryBuilder('UserFollow')
      .leftJoinAndSelect('UserFollow.follower', 'User')
      .leftJoinAndSelect('User.title', 'Title')
      .where('UserFollow.fromUserId = :userId', { userId })
      .take(20)
      .skip((Number(page) - 1) * 20)
      .getMany();

    return followings;
  }

  // Stats
  async getDashboardStats(
    userId: number,
    filter: string,
    date: string,
  ): Promise<any> {
    // View
    const viewCountSql = this.postViewHistoryRepository
      .createQueryBuilder('PostViewHistory')
      .where(
        new NotBrackets((qb) => {
          qb.where('PostViewHistory.userId = 0');
        }),
      )
      .andWhere(
        new NotBrackets((qb) => {
          qb.where(`PostViewHistory.userId = ${userId}`);
        }),
      )
      .andWhere((qb) => {
        return (
          'PostViewHistory.postId IN ' +
          qb
            .subQuery()
            .select('Post.id', 'id')
            .from('Post', 'Post')
            .where(`Post.userId = ${userId}`)
            .getQuery()
        );
      });

    switch (filter) {
      case 'day':
        viewCountSql.andWhere(`
          DATE_FORMAT(updatedAt, '%Y-%m-%d') = '${date}'
        `);
        break;

      case 'week':
        const weekDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 14)),
        );
        viewCountSql.andWhere(`
          DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') <= '${date}'
        `).andWhere(`
          DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') >= '${weekDate}'
        `);
        break;

      case 'month':
        const monthDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 30)),
        );
        viewCountSql.andWhere(`
          DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') <= '${date}'
        `).andWhere(`
          DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') >= '${monthDate}'
        `);
        break;
    }
    const viewCount = await viewCountSql.getCount();

    // Comment
    let commentCountSql = `
      SELECT
        COUNT(postId) AS count
      FROM
        PostActivityHistory
      WHERE
        NOT userId = 0
        AND NOT userId = ${userId}
        AND commentId IS NOT NULL
        AND postId IN
          (
            SELECT
              id
            FROM
              Post
            WHERE
              userId = ${userId}
              AND deletedAt IS NULL
          )
    `;

    switch (filter) {
      case 'day':
        commentCountSql += `
          AND DATE_FORMAT(updatedAt, '%Y-%m-%d') = '${date}'
        `;
        break;

      case 'week':
        const weekDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 14)),
        );
        commentCountSql += `
          AND DATE_FORMAT(PostActivityHistory.updatedAt, '%Y-%m-%d') <= '${date}'
          AND DATE_FORMAT(PostActivityHistory.updatedAt, '%Y-%m-%d') >= '${weekDate}'
        `;
        break;

      case 'month':
        const monthDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 30)),
        );
        commentCountSql += `
          AND DATE_FORMAT(PostActivityHistory.updatedAt, '%Y-%m-%d') <= '${date}'
          AND DATE_FORMAT(PostActivityHistory.updatedAt, '%Y-%m-%d') >= '${monthDate}'
        `;
        break;
    }
    const commentCount = await this.em.query(commentCountSql);

    // Follow
    const followCountSql = this.userFollowHistoryRepository
      .createQueryBuilder('UserFollowHistory')
      .select('UserFollowHistory.action', 'action')
      .addSelect('COUNT(UserFollowHistory.action)', 'count')
      .where('UserFollowHistory.toUserId = :userId', { userId });

    switch (filter) {
      case 'day':
        followCountSql.andWhere(`
          DATE_FORMAT(UserFollowHistory.createdAt, '%Y-%m-%d') = '${date}'
        `);
        break;

      case 'week':
        const weekDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 14)),
        );
        followCountSql.andWhere(`
          DATE_FORMAT(UserFollowHistory.createdAt, '%Y-%m-%d') <= '${date}'`)
          .andWhere(`DATE_FORMAT(UserFollowHistory.createdAt, '%Y-%m-%d') >= '${weekDate}'
        `);
        break;

      case 'month':
        const monthDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 30)),
        );
        followCountSql.andWhere(`
          DATE_FORMAT(UserFollowHistory.createdAt, '%Y-%m-%d') <= '${date}'`)
          .andWhere(`DATE_FORMAT(UserFollowHistory.createdAt, '%Y-%m-%d') >= '${monthDate}'
        `);
        break;
    }
    const followResult = await followCountSql
      .groupBy('UserFollowHistory.action')
      .orderBy('UserFollowHistory.action', 'ASC')
      .getRawMany();

    let followCount = 0;
    if (followResult.length === 2) {
      followCount = Number(followCount[0].count) - Number(followCount[1].count);
    } else if (followResult.length === 1) {
      followCount =
        followResult[0].action === 'sub'
          ? Number(followResult[0].count)
          : Number(-followResult[0].count);
    }

    return {
      revenue: null,
      viewCount,
      commentCount: Number(commentCount[0].count),
      followCount: followCount,
    };
  }

  async getDashboardChart(userId: number, date: string): Promise<any> {
    const week = 14;
    const weekDate = convertDateWithoutTime(
      String(new Date(new Date(date).getTime() - 86400000 * week)),
    );
    const viewChartSql = this.postViewHistoryRepository
      .createQueryBuilder('PostViewHistory')
      .select("DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d')", 'time')
      .addSelect('COUNT(PostViewHistory.postId)', 'value')
      .where(
        new NotBrackets((qb) => {
          qb.where('PostViewHistory.userId = 0');
        }),
      )
      .andWhere(
        new NotBrackets((qb) => {
          qb.where(`PostViewHistory.userId = ${userId}`);
        }),
      )
      .andWhere((qb) => {
        return (
          'PostViewHistory.postId IN ' +
          qb
            .subQuery()
            .select('Post.id', 'id')
            .from('Post', 'Post')
            .where(`Post.userId = ${userId}`)
            .getQuery()
        );
      })
      .andWhere(
        `
        DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') <= '${date}'
      `,
      )
      .andWhere(
        `
        DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') >= '${weekDate}'
      `,
      )
      .groupBy('time')
      .orderBy('time', 'ASC');
    const viewChartResult = await viewChartSql.getRawMany();
    const viewChart = returnChartDataFromTimeNValue(
      viewChartResult,
      weekDate,
      date,
    );

    return viewChart;
  }

  async getDashboardPost(
    userId: number,
    filter: string,
    date: string,
    page: string | number = 1,
  ): Promise<any> {
    let sql = `
      SELECT
        P.id AS postId,
        P.title,
        TT.count AS viewCount,

        (
          SELECT
            JSON_ARRAYAGG(name)
          FROM
            Tag
          WHERE
            postId = TT.postId
        ) AS tags,

        P.createdAt
      FROM
        (
          SELECT
            postId,
            COUNT(postId) AS count,
            updatedAt
          FROM
            PostViewHistory
          WHERE
            postId IN
              (
                SELECT
                  id
                FROM
                  Post
                WHERE
                  userId = ${userId}
                  AND deletedAt IS NULL
              )
    `;

    switch (filter) {
      case 'day':
        sql += `
          AND DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') = '${date}'
        `;
        break;

      case 'week':
        const weekDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 14)),
        );
        sql += `
          AND DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') <= '${date}'
          AND DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') >= '${weekDate}'
        `;
        break;

      case 'month':
        const monthDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 30)),
        );
        sql += `
          AND DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') <= '${date}'
          AND DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') >= '${monthDate}'
        `;
        break;
    }

    sql += `
      GROUP BY
              postId
            ORDER BY
              count DESC
            LIMIT 20
            OFFSET ${(Number(page) - 1) * 20}
          ) AS TT
      LEFT JOIN
        Post AS P
      ON
        TT.postId = P.id
      ORDER BY
        viewCount DESC, createdAt DESC
    `;

    const posts = await this.em.query(sql);

    return posts;
  }

  async getDashboardComment(
    userId: number,
    filter: string,
    date: string,
    page: string | number = 1,
  ): Promise<any> {
    let sql = `
      SELECT
        PAH.userId,
        U.name,
        U.profileImagePath,
        PAH.postId,
        C.contents,
        C.createdAt,
        C.updatedAt

      FROM
        PostActivityHistory AS PAH

      LEFT JOIN
        Comment AS C

      ON
        PAH.commentId = C.id

      LEFT JOIN
        User AS U

      ON
        U.id = PAH.userId

      WHERE
        PAH.postId IN
          (
            SELECT
              id
            FROM
              Post
            WHERE
              userId = ${userId}
            AND deletedAt IS NULL
          )
        AND PAH.commentId IS NOT NULL
        AND NOT PAH.userId = 0
        AND NOT PAH.userId = ${userId}
        AND C.deletedAt IS NULL
        AND U.deletedAt IS NULL
    `;

    switch (filter) {
      case 'day':
        sql += `
          AND DATE_FORMAT(PAH.updatedAt, '%Y-%m-%d') = '${date}'
        `;
        break;

      case 'week':
        const weekDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 14)),
        );
        sql += `
          AND DATE_FORMAT(PAH.updatedAt, '%Y-%m-%d') <= '${date}'
          AND DATE_FORMAT(PAH.updatedAt, '%Y-%m-%d') >= '${weekDate}'
        `;
        break;

      case 'month':
        const monthDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 30)),
        );
        sql += `
          AND DATE_FORMAT(PAH.updatedAt, '%Y-%m-%d') <= '${date}'
          AND DATE_FORMAT(PAH.updatedAt, '%Y-%m-%d') >= '${monthDate}'
        `;
        break;
    }

    sql += `
    ORDER BY
      C.createdAt DESC

    LIMIT 20
    OFFSET ${(Number(page) - 1) * 20}
    `;
    const comment = await this.em.query(sql);

    return comment;
  }

  async findPostByPostIdNUserId(postId: number, userId: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: {
        postId,
        userId,
      },
    });

    return post;
  }

  async getStatsPostByPostId(postId: number): Promise<any> {
    const summary = await this.em
      .createQueryBuilder()
      .select('T.viewCount', 'viewCount')
      .addSelect('T.commentCount', 'commentCount')
      .addSelect('T.upvoteCount', 'upvoteCount')
      .addSelect('T.followerCount', 'followerCount')
      .from((qb) => {
        return qb
          .select((subQuery) => {
            return subQuery
              .select('COUNT(PostViewHistory.postId)')
              .from('PostViewHistory', 'PostViewHistory')
              .where(`PostViewHistory.postId = ${postId}`);
          }, 'viewCount')
          .addSelect((subQuery) => {
            return subQuery
              .select('COUNT(PostActivityHistory.postId)')
              .from('PostActivityHistory', 'PostActivityHistory')
              .where(`PostActivityHistory.postId = ${postId}`)
              .andWhere('PostActivityHistory.commentId IS NULL');
          }, 'commentCount')
          .addSelect((subQuery) => {
            return subQuery
              .select('COUNT(PostVote.postId)')
              .from('PostVote', 'PostVote')
              .where(`PostVote.postId = ${postId}`)
              .andWhere('PostVote.deletedAt IS NULL')
              .andWhere('PostVote.voteType = "up"');
          }, 'upvoteCount')
          .addSelect('"todo"', 'followerCount')
          .fromDummy();
      }, 'T')
      .getRawOne();

    return summary;
  }

  async getStatsPostReport(
    postId: number,
    filter: string,
    date: string,
  ): Promise<any> {
    // View
    const viewCountSql = this.postViewHistoryRepository
      .createQueryBuilder('PostViewHistory')
      .select('COUNT(PostViewHistory.postId)', 'count')
      .where(`PostViewHistory.postId = ${postId}`);

    switch (filter) {
      case 'day':
        viewCountSql.andWhere(`
          DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') = '${date}'
        `);
        break;

      case 'week':
        const weekDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 14)),
        );
        viewCountSql.andWhere(`
          DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') <= '${date}'
        `).andWhere(`
          DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') >= '${weekDate}'
        `);
        break;

      case 'month':
        const monthDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 30)),
        );
        viewCountSql.andWhere(`
          DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') <= '${date}'
        `).andWhere(`
          DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') >= '${monthDate}'
        `);
        break;
    }
    const viewCount = await viewCountSql.getRawOne();

    const commentCountSql = this.em
      .createQueryBuilder()
      .select('COUNT(PostActivityHistory.postId)', 'count')
      .from('PostActivityHistory', 'PostActivityHistory')
      .where(`PostActivityHistory.postId = ${postId}`)
      .andWhere('PostActivityHistory.commentId IS NULL');

    switch (filter) {
      case 'day':
        commentCountSql.andWhere(`
          DATE_FORMAT(PostActivityHistory.updatedAt, '%Y-%m-%d') = '${date}'
        `);
        break;

      case 'week':
        const weekDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 14)),
        );
        commentCountSql.andWhere(`
          DATE_FORMAT(PostActivityHistory.updatedAt, '%Y-%m-%d') <= '${date}'
        `).andWhere(`
          DATE_FORMAT(PostActivityHistory.updatedAt, '%Y-%m-%d') >= '${weekDate}'
        `);
        break;

      case 'month':
        const monthDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 30)),
        );
        commentCountSql.andWhere(`
          DATE_FORMAT(PostActivityHistory.updatedAt, '%Y-%m-%d') <= '${date}'
        `).andWhere(`
          DATE_FORMAT(PostActivityHistory.updatedAt, '%Y-%m-%d') >= '${monthDate}'
        `);
        break;
    }
    const commentCount = await commentCountSql.getRawOne();

    const upvoteSql = this.em
      .createQueryBuilder()
      .select('COUNT(PostVote.postId)', 'count')
      .from('PostVote', 'PostVote')
      .where(`PostVote.postId = ${postId}`)
      .andWhere('PostVote.deletedAt IS NULL')
      .andWhere('PostVote.voteType = "up"');

    switch (filter) {
      case 'day':
        upvoteSql.andWhere(`
          DATE_FORMAT(updatedAt, '%Y-%m-%d') = '${date}'
        `);
        break;

      case 'week':
        const weekDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 14)),
        );
        upvoteSql.andWhere(`
          DATE_FORMAT(IFNULL(PostVote.updatedAt, PostVote.createdAt), '%Y-%m-%d') <= '${date}'
        `).andWhere(`
          DATE_FORMAT(IFNULL(PostVote.updatedAt, PostVote.createdAt), '%Y-%m-%d') >= '${weekDate}'
        `);
        break;

      case 'month':
        const monthDate = convertDateWithoutTime(
          String(new Date(new Date(date).getTime() - 86400000 * 30)),
        );
        upvoteSql.andWhere(`
          DATE_FORMAT(IFNULL(PostVote.updatedAt, PostVote.createdAt), '%Y-%m-%d') <= '${date}'
        `).andWhere(`
          DATE_FORMAT(IFNULL(PostVote.updatedAt, PostVote.createdAt), '%Y-%m-%d') >= '${monthDate}'
        `);
        break;
    }
    const upvoteCount = await upvoteSql.getRawOne();

    return {
      viewCount: viewCount.count,
      commentCount: commentCount.count,
      upvoteCount: upvoteCount.count,
      followingCount: 'todo',
    };
  }

  async getStatsPostChart(postId: number, date: string): Promise<any> {
    const week = 14;
    const weekDate = convertDateWithoutTime(
      String(new Date(new Date(date).getTime() - 86400000 * week)),
    );
    const viewChartSql = this.postViewHistoryRepository
      .createQueryBuilder('PostViewHistory')
      .select("DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d')", 'time')
      .addSelect('COUNT(PostViewHistory.postId)', 'value')
      .where('PostViewHistory.postId = :postId', { postId })
      .andWhere(
        `
        DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') <= '${date}'
      `,
      )
      .andWhere(
        `
        DATE_FORMAT(PostViewHistory.updatedAt, '%Y-%m-%d') >= '${weekDate}'
      `,
      )
      .groupBy('time')
      .orderBy('time', 'ASC');
    const viewChartResult = await viewChartSql.getRawMany();
    const viewChart = returnChartDataFromTimeNValue(
      viewChartResult,
      weekDate,
      date,
    );

    return viewChart;
  }

  async reportUser(
    fromUserId: number,
    toUserId: number,
    report: ReportUserDto,
  ) {
    return false;
  }

  async checkUserGrade(userId: number) {
    const user = await this.userRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.userGradeMap', 'UserGradeMap')
      .where('User.id = :userId', { userId })
      .getOne();
    if (!user.userGradeMap.isAdmin) {
      if (!user.userGradeMap.isSuper) {
        return false;
      }
    }
    return true;
  }

  async banUser(userId: number, ban: BanListDto) {
    const user = await this.userRepository
      .createQueryBuilder('User')
      .leftJoinAndSelect('User.ban', 'UserBanList')
      .where('User.id = :userId', { userId })
      .getOne();
    let status = true;
    if (user.ban) {
      status = !user.ban.status;
    }
    const banResult = await this.userBanListRepository.save({
      id: user.ban?.id ?? null,
      userId: userId,
      description: ban.description ?? null,
      status: status,
    });

    return banResult;
  }

  async getNotificationByUserId(userId: number, type: NotificationType){

    if(type){
      let division: NotificationCodeDivision = undefined;
      if(type !== NotificationType.ALL){
        division = await this.notificationCodeDivisionRepository.findOne({
          where: {
            type: type
          }
        })
        if(division){
          division.code.map(item => {
            item = Number(item)
            return item
          })
        }
      }

      const notification = await this.notificationRepository.find({
        where: {
          userId: 15,
          code: division ? In(division.code) : null
        },
        order: {
          createdAt: 'DESC'
        }
      })

      if(notification){

        notification.map(item => {
          delete item.id
          delete item.code
          delete item.notificationCode
          item.subject = item.subject["EN"]
          return item
        })

        return notification

      }

      return []

    } else {
      throw new OGException({
        errorCode: -299,
        errorMessage: 'Required type'
      })
    }
  }

  async getNotificationSettingByUserId(userId: number) {

    const notificationSetting = await this.userNotificationRepository.findOne({
      where: {
        userId: userId
      }
    })
    if(notificationSetting){
      delete notificationSetting.id
      delete notificationSetting.userId
      return notificationSetting;
    }

    return {
      missed: 'off',
      newFollowers: false,
      weeklyNewsLetter: false,
      promotionEvent: false,
      newFeatures: false,
    }

  }


  async updateNotificationSettingByUserId(userId: number, notificationConfig: NotificationSettingDto) {

    const {isOn, missed, newFollowers, weeklyNewsLetter, promotionEvent, newFeatures} = notificationConfig
    const userNotification = await this.userNotificationRepository.findOne({
      where: {
        userId: userId
      }
    })
    if(userNotification){
      userNotification.isOn = isOn
      userNotification.missed = missed
      userNotification.newFollowers = newFollowers
      userNotification.weeklyNewsLetter = weeklyNewsLetter
      userNotification.promotionEvent = promotionEvent
      userNotification.newFeatures = newFeatures
      const notificationSettingResult = await this.userNotificationRepository.save(userNotification)
      delete notificationSettingResult.id
      delete notificationSettingResult.userId
      return notificationSettingResult;
    }

    return undefined

  }
}

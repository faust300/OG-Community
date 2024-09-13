import { UserMembershipGroupDto } from 'src/membership/dto/membership-group.dto';
import { User } from '../entities/user.entity';
import { UserFollow } from '../entities/follow/user-follow.entity';

export class ProfileTitle{
  name: string;
  description: string;
}

export class UserProfileDto {
  constructor(user: User, fromUserId?: number) {
    if (user) {
      this.userId = user.id;
      this.name = user.name;
      this.bio = user.bio;
      this.profileImagePath = user.profileImagePath;
      this.isVerified = Boolean(user.userGradeMap?.isVerified);
      this.isOg = Boolean(user.userGradeMap?.isOg);
      // this.isAdmin = Boolean(user.userGradeMap?.isAdmin);
      // this.isSuper = Boolean(user.userGradeMap?.isSuper);
      
      this.isMine = fromUserId ? Boolean(user.id === fromUserId) : false;
      this.followerCount = user.follower ? user.follower.length > 0 ? user.follower.filter((user: UserFollow) => user.deletedAt === null).length : 0 : 0;
      this.followingCount = user.following ? user.following.length > 0 ? user.following.filter((user: UserFollow) => user.deletedAt === null).length : 0 : 0;
      // this.followingCount = user.followingCount;
      // this.followerCount = user.followerCount;
      this.isFollow = user.follower ? user.follower.length > 0 ? Boolean(user.follower.find((user: UserFollow) => user.fromUserId === fromUserId)) : false : false
      // this.isFollow = user.follower.length > 0 ? Boolean(user.follower.find((user: UserFollow) => user.fromUserId === fromUserId)) : false;

      this.title = user.title ? user.title.name : null;
      this.titles = user.userTitles ? user.userTitles.map((title) => {
        if(title && title.titles){
          return {
            name: title.titles.name,
            description: title.titles.description,
          }
        }
      }) : [];
      // this.membershipGroup = user.membershipGroup ? user.membershipGroup.map(membership => {
      //   return {
      //     groupId: membership.id,
      //     name: membership.name,
      //     description: membership.description,
      //     iconPath: membership.iconPath,
      //     grade: membership.grade,
      //     price: membership.price,
      //     isJoined: false,
      //     createdAt: membership.createdAt
      //   }
      // }) : [];
      this.createdAt = user.createdAt;
    }
  }

  userId: number;
  name: string;
  bio: string;
  profileImagePath: string;
  isMine: boolean;
  isVerified: boolean;
  isOg: boolean;
  isAdmin: boolean;
  isSuper: boolean;
  followerCount: number;
  followingCount: number;
  isFollow: boolean;
  title: string | null;
  titles: ProfileTitle[];
  membershipGroup: UserMembershipGroupDto[];
  createdAt: Date;
}

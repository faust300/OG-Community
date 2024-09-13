import { UserFollow } from '../entities/follow/user-follow.entity';

export class MyFollower {
  constructor(user: UserFollow) {
    if (user) {
      this.userId = user.follower.id;
      this.name = user.follower.name;
      this.bio = user.follower.bio;
      this.profileImagePath = user.follower.profileImagePath;
      this.title = user.follower.title ? user.follower.title.name : null;
    }
  }

  userId: number;
  name: string;
  bio: string | null;
  profileImagePath: string | null;
  title: string | null;
  createdAt: Date;
}

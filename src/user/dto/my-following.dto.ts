import { UserFollow } from '../entities/follow/user-follow.entity';

export class MyFollowing {
  constructor(user: UserFollow) {
    if (user) {
      this.userId = user.following.id;
      this.name = user.following.name;
      this.bio = user.following.bio;
      this.profileImagePath = user.following.profileImagePath;
      this.title = user.following.title ? user.following.title.name : null;
    }
  }

  userId: number;
  name: string;
  bio: string | null;
  profileImagePath: string | null;
  title: string | null;
  createdAt: Date;
}

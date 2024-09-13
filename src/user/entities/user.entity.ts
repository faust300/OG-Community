import { UserSigninFailHistory } from 'src/sign/entities/user-signin-fail-history.entity';
import { MySQLAes128 } from 'src/utils/User';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserFollow } from './follow/user-follow.entity';
import { UserGradeMap } from './grade-map/user-grade-map.entity';
import { UserPasswordFailHistory } from './password-fail-history/user-password-fail-history.entity';
import { UserReferralHistory } from './referral-code/user-referral-code.entity';
import { Title } from './title/title.entity';
import { UserTitle } from './title/user-title.entity';
import { UserMembershipGroup } from 'src/membership/entities/membership-group.entity';
import { UserMembershipMap } from 'src/membership/entities/membership-map.entity';
import { UserBanList } from './ban-list/ban-list';
import { UserNotification } from './notification/user-notification.entity';

export enum UserSocialSignType{
  GOOGLE = 'google',
  APPLE = 'apple',
}

export enum UserSignType{
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
}

@Entity({
  name: 'User'
})
export class User {
  constructor(userId?: number) {
    if(userId){
      this.id = userId;
    }
  }

  userId: number;

  @PrimaryGeneratedColumn()
  id: number;

  @Unique(['email'])
  @Column({
    transformer: {
      to(value) {
        if(value){
          return MySQLAes128.encrypt(MySQLAes128.sha256(`${process.env.AES_KEY1}${process.env.AES_KEY2}`), value);
        }
      },
      from(value) {
        if(value){
          return MySQLAes128.decrypt(MySQLAes128.sha256(`${process.env.AES_KEY1}${process.env.AES_KEY2}`), value);
        }
      },
    },
  })
  email: string;

  @Unique(['name'])
  @Column()
  name: string;

  @Column()
  isChangedName: boolean;

  @Column({
    type: 'enum',
    enum: UserSignType,
    default: UserSignType.EMAIL,
  })
  signType: UserSignType;

  @Column({
    select: false,
  })
  password: string;

  @Column()
  googleId: string;

  @Column()
  appleId: string;

  @Column()
  titleId: number;

  @Column()
  localizeCode: string;

  @Column()
  referralCode: string;

  @Column()
  profileImagePath: string;

  @Column()
  bio: string;

  @Column()
  followingCount: number;

  @Column()
  followerCount: number;

  @Column()
  expiredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column()
  unsubscribedAt: Date;

  @OneToOne(() => Title)
  @JoinColumn()
  title: Title;

  @OneToMany(() => UserTitle, (userTitle) => userTitle.user)
  userTitles: UserTitle[];

  @OneToOne(() => UserGradeMap)
  @JoinColumn({ name: 'id', referencedColumnName: 'userId' })
  userGradeMap?: UserGradeMap;

  @OneToMany((type) => UserReferralHistory, (referralHistory) => referralHistory.user)
  referralHistories: UserReferralHistory[];

  @OneToMany((type) => UserFollow, (userFollow) => userFollow.following)
  following: UserFollow[];

  @OneToMany((type) => UserFollow, (userFollow) => userFollow.follower)
  follower: UserFollow[];

  @OneToMany((type) => UserSigninFailHistory, (signinFailHistory) => signinFailHistory.user)
  signinFailHistory: UserSigninFailHistory[];

  @OneToMany((type) => UserPasswordFailHistory, (passwordFailHistory) => passwordFailHistory.user)
  passwordFailHistory: UserPasswordFailHistory[];

  @OneToMany((type) => UserMembershipGroup, (membershipGroup) => membershipGroup.user)
  membershipGroup: UserMembershipGroup[];

  @OneToMany((type) => UserMembershipMap, (membershipMap) => membershipMap.user)
  membershipMap: UserMembershipMap[];

  @OneToOne(() => UserBanList)
  @JoinColumn({ name: 'id', referencedColumnName: 'userId' })
  ban: UserBanList;


  @OneToOne(() => UserNotification)
  notification: UserNotification;
}

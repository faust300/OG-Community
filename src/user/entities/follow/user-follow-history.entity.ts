import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserFollowActionType{
  FOLLOW = 'follow',
  UNFOLLOW = 'unfollow',
}

@Entity({
  name: 'UserFollowHistory'
})
export class UserFollowHistory{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromUserId: number;

  @Column()
  toUserId: number;

  @Column({
    type: 'enum',
    enum: UserFollowActionType,
    default: UserFollowActionType.FOLLOW,
  })
  action: UserFollowActionType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
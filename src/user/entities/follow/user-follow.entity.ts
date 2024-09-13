import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user.entity';

@Entity({
  name: 'UserFollow',
})
export class UserFollow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromUserId: number;

  @Column()
  toUserId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne((type) => User, (user) => user.following)
  @JoinColumn({
    name: 'fromUserId',
    referencedColumnName: 'id',
  })
  following: User;

  @ManyToOne((type) => User, (user) => user.follower)
  @JoinColumn({
    name: 'toUserId',
    referencedColumnName: 'id',
  })
  follower: User;
}

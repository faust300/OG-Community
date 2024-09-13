import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from '../user.entity';

@Entity({
  name: 'UserGradeMap',
})
export class UserGradeMap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  isVerified: boolean;

  @Column()
  isOg: boolean;

  @Column()
  isAdmin: boolean;

  @Column()
  isSuper: boolean;

  @Column()
  memo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  user: User;
}

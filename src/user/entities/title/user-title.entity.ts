import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { User } from '../user.entity';
import { Title } from './title.entity';

@Entity({
  name: 'UserTitle',
})
export class UserTitle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  titleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  isMain?: boolean;
  style: object;
  description;
  title: string;

  @ManyToOne(() => User, (User) => User.userTitles)
  @JoinColumn({name: 'userId'})
  user: User;

  @ManyToOne(() => Title, (Title) => Title.userTitles)
  @JoinColumn({name: 'titleId', referencedColumnName: 'id'})
  titles: Title
}

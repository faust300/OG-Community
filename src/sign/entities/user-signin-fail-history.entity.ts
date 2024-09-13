import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'UserSigninFailHistory'
})
export class UserSigninFailHistory{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  ipA: string;

  @Column()
  ipB: string;

  @Column()
  ipC: string;

  @Column()
  ipD: string;

  @Column()
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne((type) => User, (user) => user.signinFailHistory)
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id'
  })
  user: User
}
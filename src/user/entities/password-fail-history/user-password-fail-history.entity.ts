import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user.entity";

@Entity({
  name: 'UserPasswordFailHistory'
})
export class UserPasswordFailHistory{
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

  @ManyToOne((type) => User, (user) => user.passwordFailHistory)
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id'
  })
  user: User
}
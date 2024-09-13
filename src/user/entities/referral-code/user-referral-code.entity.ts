import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user.entity";

@Entity({
  name: 'UserReferralHistory'
})
export class UserReferralHistory{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  referralCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne((type) => User, (user) => user.referralHistories)
  @JoinColumn({name: 'referralCode', referencedColumnName: 'referralCode'})
  user: User
}
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserMembershipMap } from "./membership-map.entity";
import { User } from "src/user/entities/user.entity";

@Entity({
  name: 'UserMembershipGroup'
})
export class UserMembershipGroup{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  iconPath: string;

  @Column()
  grade: number;

  @Column()
  price: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne((type) => User, (user) => user.membershipGroup)
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id'
  })
  user: User;

  @OneToMany((type) => UserMembershipMap, (membershipMap) => membershipMap.membershipGroup)
  membershipMap: UserMembershipMap[];
}
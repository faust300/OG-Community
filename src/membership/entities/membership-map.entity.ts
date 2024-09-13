import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserMembershipGroup } from "./membership-group.entity";
import { User } from "src/user/entities/user.entity";

@Entity({
  name: 'UserMembershipMap'
})
export class UserMembershipMap{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  groupId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne((type) => UserMembershipGroup, (membershipGroup) => membershipGroup.membershipMap)
  @JoinColumn({
    name: 'groupId',
    referencedColumnName: 'id'
  })
  membershipGroup: UserMembershipGroup;

  @ManyToOne((type) => User, (user) => user.membershipMap)
  @JoinColumn({
    name: 'userId',
    referencedColumnName: 'id'
  })
  user: User;
}
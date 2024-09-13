import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'UserNameHistory'
})
export class UserNameHistory{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  fromUserName: string;

  @Column()
  toUserName: string;

  @CreateDateColumn()
  createdAt: Date;
}
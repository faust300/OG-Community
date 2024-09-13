import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user.entity";
import { UserTitle } from "./user-title.entity";

@Entity({
  name: 'Title'
})
export class Title{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('json')
  i18n: object;

  @Column('json')
  style: object;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  isMain: boolean;
  titleId: number

  @OneToOne(() => User, (user)=>user.title)
  user: User

  @OneToMany((type) => UserTitle, (userTitle) => userTitle.titles)
  userTitles: UserTitle[]
}
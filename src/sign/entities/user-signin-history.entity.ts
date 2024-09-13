import { UserSignType } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'UserSigninHistory'
})
export class UserSigninHistory{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: UserSignType,
    default: UserSignType.EMAIL,
  })
  type: UserSignType;

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
}
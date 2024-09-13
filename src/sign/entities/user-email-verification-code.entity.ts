import { MySQLAes128 } from "src/utils/User";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum UserEmailVerificationCodeType{
  SIGNUP = 'signup',
  PASSWORD = 'password',
  EMAIL = 'email',
}

@Entity({
  name: 'UserEmailVerificationCode'
})
export class UserEmailVerificationCode{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    transformer: {
      to(value) {
        if(value){
          return MySQLAes128.encrypt(MySQLAes128.sha256(`${process.env.AES_KEY1}${process.env.AES_KEY2}`), value);
        }
      },
      from(value) {
        if(value){
          return MySQLAes128.decrypt(MySQLAes128.sha256(`${process.env.AES_KEY1}${process.env.AES_KEY2}`), value);
        }
      },
    },
  })
  email: string;

  @Column()
  code: string;

  @Column({
    type: 'enum',
    enum: UserEmailVerificationCodeType,
    default: UserEmailVerificationCodeType.SIGNUP
  })
  type: UserEmailVerificationCodeType;

  @Column()
  expiryTime: number;

  @CreateDateColumn()
  createdAt: Date;
}
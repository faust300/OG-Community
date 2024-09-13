import { UserEmailVerificationCode, UserEmailVerificationCodeType } from "../entities/user-email-verification-code.entity";

export class UserEmailVerificationCodeDto{
  constructor(codeInfo: UserEmailVerificationCode){
    if(codeInfo){
      this.id = codeInfo.id;
      this.email = codeInfo.email;
      this.emailCode = codeInfo.code;
      this.type = codeInfo.type;
      this.expiryTime = codeInfo.expiryTime;
      this.isExpired = Boolean(codeInfo.createdAt.getTime() + codeInfo.expiryTime*1000 < new Date().getTime())
      this.createdAt = codeInfo.createdAt;
    }
  }

  id: number;
  email: string;
  emailCode: string;
  type: UserEmailVerificationCodeType;
  expiryTime: number;
  isExpired: boolean;
  createdAt: Date;
}
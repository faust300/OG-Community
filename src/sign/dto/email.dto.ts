import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserEmailVerificationCodeType } from '../entities/user-email-verification-code.entity';

export class EmailDto {
  @IsEmail()
  readonly email: string;
}


export class SendEmailVerificataionCodeDto extends EmailDto{
  @IsEnum(UserEmailVerificationCodeType)
  readonly type: UserEmailVerificationCodeType;
}

export class EmailCodeDto{
  @IsString()
  readonly emailCode: string;
}

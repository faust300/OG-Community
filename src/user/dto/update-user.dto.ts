import { IntersectionType } from "@nestjs/mapped-types";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { EmailDto } from "src/sign/dto/email.dto";
import { IsUpdateUserData } from "../decorator/is-update-user-data.decorator";
import { UserEmailVerificationCodeType } from "src/sign/entities/user-email-verification-code.entity";

export enum UpdateUserDataKey{
  IMAGE = 'image',
  USERNAME = 'username',
  BIO = 'bio',
  TITLE = 'title',
  EMAIL = 'email',
}

export class UpdateUserData{
  constructor(key: UpdateUserDataKey){
    this.key = key;
  }
  @IsEnum(UpdateUserDataKey)
  readonly key: UpdateUserDataKey;

  @IsString()
  readonly value: string;
}

export class UpdateUserDto {
  @IsUpdateUserData()
  data:UpdateUserData[]
}

export class UpdateReferralCodeDto{
  @IsString()
  readonly referralCode: string;
}

export class UpdatePasswordDto extends IntersectionType(
  EmailDto
){
  @IsString()
  @Transform(({value}) => value.trim())
  @MinLength(8)
  readonly password: string;

  @IsString()
  @Transform(({value}) => value.trim())
  @MinLength(8)
  readonly newPassword: string;
}

export class ResetPasswordDto extends IntersectionType(
  EmailDto
){
  // reset
  @IsOptional()
  @IsEnum(UserEmailVerificationCodeType)
  readonly type: UserEmailVerificationCodeType.PASSWORD;

  @IsOptional()
  @IsString()
  readonly emailCode: string;

  @IsString()
  @Transform(({value}) => value.trim())
  @MinLength(8)
  readonly newPassword: string;
}

export class UpdateEmailDto extends IntersectionType(
  EmailDto
){
  @IsString()
  readonly emailCode: string;
}
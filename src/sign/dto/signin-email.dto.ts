import { IntersectionType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { EmailCodeDto, EmailDto } from './email.dto';

export class SignInEmailDto extends EmailDto {
  // Todo: @IsPassword
  @IsString()
  readonly password: string;
}


export class SignupEmailDto extends IntersectionType(
  SignInEmailDto,
  EmailCodeDto,
){
  @IsOptional()
  @IsString()
  readonly referralCode: string;
 }
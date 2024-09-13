import { IsOptional, IsString } from "class-validator";

export class SigninGoogleDto{
  @IsString()
  readonly token: string;

  @IsOptional()
  @IsString()
  readonly referralCode: string;
}
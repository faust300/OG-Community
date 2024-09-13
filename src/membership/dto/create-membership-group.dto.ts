import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateMembershipGroupDto{
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsString()
  readonly iconPath: string;

  @IsInt()
  readonly grade: number;

  @IsString()
  readonly price: string;
}
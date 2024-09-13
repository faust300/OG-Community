import { IsInt, IsOptional, IsString } from "class-validator";

export class UpdateMembershipGroupDto{
  @IsInt()
  readonly groupId: number;

  @IsOptional()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsOptional()
  @IsString()
  readonly iconPath: string;

  @IsOptional()
  @IsInt()
  readonly grade: number;

  @IsOptional()
  @IsString()
  readonly price: string;
}
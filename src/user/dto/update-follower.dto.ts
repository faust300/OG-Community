import { IsInt } from "class-validator";
export class UpdateMyFollowerDto{
  @IsInt()
  readonly userId: number;

}
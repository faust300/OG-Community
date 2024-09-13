import { IsEnum, IsInt, IsString } from "class-validator";
import { BettingType } from "../entity/pickThemStageBetting.entity";

export class CreateStageDto{
  @IsString()
  readonly coinId: string;

  @IsEnum(BettingType)
  readonly bettingType: string;
}
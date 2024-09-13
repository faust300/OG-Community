import { IsEnum, IsNumber, IsNumberString, IsString } from "class-validator";
import { PromotionUnitDisplayPlace } from "../entities/promotion-unit.entity";

export class HistoryPromotionDto {

    @IsNumberString()
    promotionId: number;

    @IsEnum(PromotionUnitDisplayPlace)
    unitType: PromotionUnitDisplayPlace;

}

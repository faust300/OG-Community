import { IsEnum, IsNumber, IsNumberString, IsOptional, Max } from "class-validator";
import { PromotionUnitDisplayPlace } from "src/promotion/entities/promotion-unit.entity";
export class GetPromotionDto {
    @IsEnum(PromotionUnitDisplayPlace)
    unit: PromotionUnitDisplayPlace
}

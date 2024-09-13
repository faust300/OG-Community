import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsObject, IsOptional, Max, Min, ValidateNested } from 'class-validator';

export class UpdateWidgetDto {

    @IsNumber()
    @Min(1)
    readonly widgetId: number

    @IsNumber()
    @Min(0)
    @Max(100)
    readonly order: number

    @IsObject()
    @IsOptional()
    readonly setting:any | null

}

export class UpdateWidgetDtos {

    @ValidateNested({ each: true })
    @Type(() => UpdateWidgetDto)
    @IsArray()
    @ArrayMinSize(0)
    @ArrayMaxSize(10)
    readonly data: UpdateWidgetDto[];
}

import { IsInt, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateReportDto {

    @IsArray()
    reportTypeId: number[];

    @IsString()
    @IsOptional()
    reportReason: string;

}

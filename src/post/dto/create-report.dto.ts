import { IsArray, IsInt, IsOptional, IsString } from "class-validator";
export class CreateReportDto {
    @IsArray()
    reportTypeId: number[];

    @IsString()
    @IsOptional()
    reportReason: string;

}

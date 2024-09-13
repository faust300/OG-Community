import { IsArray, IsInt, IsOptional, IsString } from "class-validator";
export class ReportUserDto {
    @IsArray()
    reportTypeId: number[];

    @IsString()
    @IsOptional()
    reportReason: string;

}

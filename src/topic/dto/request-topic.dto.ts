import { IsArray, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class RequestTopicDto {

    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @MaxLength(300)
    reason: string;

}

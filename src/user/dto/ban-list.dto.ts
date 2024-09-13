import { IsOptional } from "class-validator";

export class BanListDto {

    @IsOptional()
    description: string;
}
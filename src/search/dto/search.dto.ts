import { IsNumber, IsNumberString, IsOptional, IsString, Max, Min } from "class-validator";

export class SearchDto {
    @IsOptional()
    @IsNumberString()
    page: number;

    @IsString()
    q: string;

    @IsOptional()
    @IsNumberString()
    size: number;

    @IsOptional()
    @IsString()
    sort: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented' = 'recent';
}
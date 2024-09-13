import { IsString, IsInt, MinLength, MaxLength, IsOptional, IsBoolean, IsObject, IsArray } from 'class-validator';
import { PostContent } from '../entities/post.entity';

export class PostDraftDto {

    @IsString()
    tempKey: string;

    @IsObject()
    @IsOptional()
    contents: PostContent;

}

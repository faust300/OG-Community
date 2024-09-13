import { IsString, IsInt, MinLength, MaxLength, IsOptional, IsBoolean, IsObject, IsArray } from 'class-validator';
import { PostContent } from '../entities/post.entity';

export class CreatePostRequetDto {

    @IsString()
    tempKey: string;

    @IsString()
    @IsOptional()
    title: string;

    @IsObject()
    contents: PostContent;

    @IsString()
    @IsOptional()
    thumbnail: string;

    @IsInt()
    imageCount: number;

    @IsOptional()
    @IsArray()
    tags: string[]

    @IsBoolean()
    hasReferral: boolean;

    @IsBoolean()
    isNSFW: boolean;

}


export class CreatePostDto {

    userId: number;
    userName: string;
    userProfilePath: string | null;
    userTitle: number | null;
    title: string | null;
    contents: string;
    thumbnail: string | null;
    imageCount: number;
    hasReferral: boolean;
    isNSFW: boolean;

}
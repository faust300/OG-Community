import { IsNumber, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CommentContents {
    mention: Mention[];
    text: string;
}

export class Mention {
    id: number;
    name: string;
}

export class CreateCommentDto {

    @IsNumber()
    readonly postId: number

    @IsOptional()
    @IsNumber()
    readonly commentId?: number

    @IsObject()
    readonly content: CommentContents;

}
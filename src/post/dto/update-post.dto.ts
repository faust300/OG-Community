import { PartialType } from '@nestjs/mapped-types';
import { CreatePostRequetDto } from './create-post.dto';
import { IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostRequetDto) {

}

import { PartialType } from '@nestjs/mapped-types';
import { IsInt } from 'class-validator';
import { CreateTopicDto } from './create-topic.dto';

export class UpdateTopicDto extends PartialType(CreateTopicDto) {
    @IsInt()
    order: number
}

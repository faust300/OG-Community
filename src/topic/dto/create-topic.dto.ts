import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateTopicDto {

    @IsString()
    name: string;

    @IsArray()
    topic: string[];

    @IsArray()
    tag: string[];
}

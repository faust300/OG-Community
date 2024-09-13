import { buildMessage, IsEnum, IsString, ValidateBy, ValidationOptions } from "class-validator";

export enum Key{
  A = 'a'
}

export class Data{
  @IsEnum(Key)
  readonly key: Key;

  @IsString()
  readonly value: string;
}

export const IS_DATA = "";

export function isData(value: unknown): boolean {
    return value instanceof Data && value.key !== undefined && value.value !== undefined
}

export function IsData(validationOptions?: ValidationOptions): PropertyDecorator {
    return ValidateBy(
        {
            name: IS_DATA,
            constraints: [],
            validator: {
                validate: (value): boolean => isData(value),
                defaultMessage: buildMessage(() => `must be a valid data type`, validationOptions),
            }
        },
        validationOptions
    )
};

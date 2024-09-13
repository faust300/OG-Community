import { buildMessage, ValidateBy, ValidationOptions } from "class-validator";
import { UpdateUserData, UpdateUserDataKey } from "../dto/update-user.dto";

export const IS_UPDATEUSERDATA = "";

export function isUpdateUserData(value: UpdateUserData[]): boolean {
  let flag: boolean = true;

  for(let i=0; i<value.length; i++){
    if(value[i].key !== UpdateUserDataKey.IMAGE && value[i].key !== UpdateUserDataKey.USERNAME &&
        value[i].key !== UpdateUserDataKey.BIO && value[i].key !== UpdateUserDataKey.TITLE ){
      flag = false;
      break;
    }
  }

  return flag;
}

export function IsUpdateUserData(validationOptions?: ValidationOptions): PropertyDecorator {
    return ValidateBy(
        {
            name: IS_UPDATEUSERDATA,
            constraints: [],
            validator: {
                validate: (value): boolean => isUpdateUserData(value),
                defaultMessage: buildMessage(() => `must be a valid UserUpdateData type`, validationOptions),
            }
        },
        validationOptions
    )
};

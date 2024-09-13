export const isEmpty = (object: any): boolean => {
    return object == undefined || object == null || object == '' || Object.keys(object).length === 0;
}
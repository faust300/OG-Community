import { Request } from "express";

export interface IUser {
    userId: number;
}

export interface OGRequest extends Request {
    readonly user: IUser
    realIP:string
    lang:string
}
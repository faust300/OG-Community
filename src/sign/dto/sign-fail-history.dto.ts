import { UserSigninFailHistory } from "../entities/user-signin-fail-history.entity";

export class UserSigninFailHistoryDto{
  constructor(history?: UserSigninFailHistory){
    if(history){
      this.id = history.id;
      this.userId = history.userId;
      this.ip = history.ipA && history.ipB && history.ipC && history.ipD
        ? `${history.ipA}.${history.ipB}.${history.ipC}.${history.ipD}` : null;
      this.createdAt = history.createdAt;
      this.unixCreatedAt = new Date(history.createdAt).getTime();
    }
  }

  id: number;
  userId: number;
  ip: string | null;
  createdAt: Date;
  unixCreatedAt: number;
}
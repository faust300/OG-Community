export enum BettingType{
  UP = 'up',
  DOWN = 'down'
}

export class PickThemStageBetting{
  pickThemStageBettingId: number;
  pickThemId: number;
  pickThemStageId: number;
  userId: number;
  coinId: string;
  bettingType: BettingType;
  createdAt: Date;
}
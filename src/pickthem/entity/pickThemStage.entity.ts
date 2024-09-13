export enum PickThemState{
  BEFORE = 'before',
  ONGOING = 'ongoing',
  WAIT = 'wait',
  END = 'end',
}

export class PickThemStage{
  pickThemStageId: number;
  pickThemId: number;
  state: PickThemState;
  bettingStartDate: Date;
  bettingEndDate: Date;
  targetDate: Date;

  bettingStartUTC: number;
  bettingEndUTC: number;
  nowUTC: number;
  isParticipable: boolean;

  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
import { PickThemState } from "./pickThemStage.entity";

export class PickThemPrediction{
  pickThemStageId: number;
  state: PickThemState;
  coinId?: string | null;
  iconPath?: string | null;
  symbol: string;
  isHit?: number | null;
  bettingType?: string | null;
  beforePrice?: string | null;
  afterPrice?: string | null;
  answer?: string | null;
  bettingStartDate: Date;
}
export class PickThemStageCoin{
  coinId: string;
  name: string;
  symbol: string;
  iconPath: string;
  position: string;
}

export class PickThemCoinData{
  marketCapId: number;
  coinId?: string | null;
  startDate?: Date | null;
  startPrice?: number | null;
  latestDate?: Date | null;
  latestPrice?: number | null;
}
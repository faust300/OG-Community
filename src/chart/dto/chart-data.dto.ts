export interface ChartDataData {
    prices: number[][];
    marketCaps: number[][];
    totalVolumes: number[][];
  }
  
  export class ChartDataDTO {
    chartDataId: string;
    period: string;
    data: ChartDataData;
  }
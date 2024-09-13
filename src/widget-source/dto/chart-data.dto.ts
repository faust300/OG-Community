export class ChartDataWidgetDTO {
    chartDataId: string;
    name: string;
    symbol: string;
    compare: 'USD';
    data: string | ChartDataData;
    updatedAt: Date;
}

export class ChartDataData {
    prices: Array<Array<number>>;
    marketCaps: Array<Array<number>>;
    totalVolumes: Array<Array<number>>;
}
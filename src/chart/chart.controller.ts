import { Controller, Get, Param } from '@nestjs/common';
import { ChartService } from './chart.service';

@Controller('chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get(':id/:period?')
  async getChartData(@Param('id') id: string, @Param('period') period: "24H" | "7D" | "30D" | "90D" = "24H") {
    const result = await this.chartService.getChartDataFromIdWithPeriod(
      id,
      period,
    );

    if (result) {
      return {
        success: true,
        result: result.data,
      };
    }

    return {
      success: true,
      result: {
        prices: [],
        marketCpas: [],
        totalVolumes: [],
      },
    };
  }
}

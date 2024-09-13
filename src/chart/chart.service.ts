import { Injectable } from '@nestjs/common';
import { ConnectionService } from 'src/extensions/services/connection.service';
import SQL from 'sql-template-strings';
import { ChartData } from './entities/chart.entitiy';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChartDataDTO } from './dto/chart-data.dto';

@Injectable()
export class ChartService {
  constructor(
    @InjectRepository(ChartData)
    private readonly chartDataRepository: Repository<ChartData>
  ) {}

  async getChartDataFromIdWithPeriod(
    id: string,
    period: "24H" | "7D" | "30D" | "90D",
  ): Promise<ChartDataDTO | undefined> {

    const queryObj = await this.chartDataRepository.findOneBy({
      chartDataId: id,
      period: period
    });

    return queryObj.convertChartDataDTO(queryObj);
  }
}

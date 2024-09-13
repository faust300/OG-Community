import { Module } from '@nestjs/common';
import { ChartService } from './chart.service';
import { ChartController } from './chart.controller';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChartData } from './entities/chart.entitiy';
import { ChartDataId } from './entities/chartDataId.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChartData, ChartDataId])],
  controllers: [ChartController],
  providers: [ChartService, ConnectionService],
})
export class ChartModule {}

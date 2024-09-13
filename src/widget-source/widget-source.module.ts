import { Module } from '@nestjs/common';
import { WidgetSourceService } from './widget-source.service';
import { WidgetSourceController } from './widget-source.controller';
import { AggregateService } from 'src/aggregate/aggregate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WidgetDateCalendar } from './entities/widgetDataCalendar.entity';
import { ChartData } from '../chart/entities/chart.entitiy';
import { ChartDataId } from 'src/chart/entities/chartDataId.entity';
import { Aggregate } from 'src/aggregate/entities/aggregate.entity';
import { WidgetUserDefined } from 'src/widgets/entities/widgetUserDefined.entity';
import { WidgetDefaultDefined } from 'src/widgets/entities/widgetDefaultDefined.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WidgetDateCalendar, ChartData, ChartDataId, Aggregate, WidgetUserDefined, WidgetDefaultDefined])],
  controllers: [WidgetSourceController],
  providers: [WidgetSourceService, AggregateService]
})
export class WidgetSourceModule {}

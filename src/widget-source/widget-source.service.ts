import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import moment from 'moment';
import { ChartData } from 'src/chart/entities/chart.entitiy';
import { OGException } from 'src/extensions/exception/exception.filter';
import { WidgetDefaultDefined } from 'src/widgets/entities/widgetDefaultDefined.entity';
import { WidgetUserDefined } from 'src/widgets/entities/widgetUserDefined.entity';
import { Between, In, Repository } from 'typeorm';
import { CalendarWidget } from './dto/calendar-widget.dto';
import { ChartDataWidgetDTO } from './dto/chart-data.dto';
import { WidgetDateCalendar } from './entities/widgetDataCalendar.entity';

@Injectable()
export class WidgetSourceService {
  constructor(
    @InjectRepository(WidgetDateCalendar)
    private readonly calendarRepository: Repository<WidgetDateCalendar>,

    @InjectRepository(ChartData)
    private readonly chartDataRepository: Repository<ChartData>,

    @InjectRepository(WidgetUserDefined)
    private readonly userDefinedRepository: Repository<WidgetUserDefined>,

    @InjectRepository(WidgetDefaultDefined)
    private readonly defaultDefinedRepository: Repository<WidgetDefaultDefined>
  ) {}

  async getDefinedByUserId(widgetId: number, userId: number): Promise<JSON> {
    try {
      let queryObj;
      if (userId) {
        queryObj = await this.userDefinedRepository.findOneBy({
          userId,
          widgetId
        })
      } else {
        queryObj = await this.defaultDefinedRepository.findOneBy({
          widgetId
        })
      }
      
      return queryObj ? queryObj.setting : undefined;
    } catch (e) {
      console.error(e);
    }

    return undefined;
  }

  async getCalendar(types: string[]): Promise<CalendarWidget[]> {
    try {
      
      const queryObj = await this.calendarRepository.find({
        where: {
          type: typeof types == 'string' ? types as 'crypto' | 'economics' : In(types),
          date: Between(new Date(moment().format('YYYY-MM-DD 00:00:00')), new Date(moment().format('YYYY-MM-DD 23:59:59')))
        },
        order: {
          date: 'ASC'
        },
        take: 30
      });

      const calendarEvent = queryObj.map(item => {
        return item.convertCalendarWidget(item);
      });

      return calendarEvent ?? [];
    } catch (err) {
      throw new OGException(
        {
          errorCode: -30304,
          errorMessage: 'Calendar Widget Load Failed',
        },
        500,
      );
    }
  }

  async getCryptoCurrency(): Promise<ChartDataWidgetDTO[]> {
    try {
      const queryObj = await this.chartDataRepository.find({
        relations: {
          chartDataIdRelation: true
        },
        where: {
          period: '24H',
          chartDataIdRelation: {
            isChart: true
          }
        }
      })

      return queryObj.map(item => {
        return item.convertChartDataWidgetDTO(item);
      })
    } catch (err) {
      return [];
    }
  }
}

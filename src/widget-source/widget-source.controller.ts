import { Controller, Get, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { get } from 'http';
import { AggregateService } from 'src/aggregate/aggregate.service';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { JWTAuthGuard } from 'src/extensions/auth/jwt-auth.guard';
import { JWTAuthInterceptor } from 'src/extensions/auth/jwt-auth.interceptor';
import { OGException } from 'src/extensions/exception/exception.filter';
import langCheck from 'src/util/langCheck';
import { WidgetSourceService } from './widget-source.service';

@Controller('widget/source')
export class WidgetSourceController {
  constructor(
    private readonly widgetSourceService: WidgetSourceService,
    private readonly aggregateService: AggregateService,
  ) { }

  @Get("calendar")
  @UseInterceptors(JWTAuthInterceptor)
  async getCalendar(
    @Req() req: OGRequest
  ) {
    let types: any = await this.widgetSourceService.getDefinedByUserId(4, req.user?.userId);
    if(types){
      const calendar = await this.widgetSourceService.getCalendar(types.types);

      return {
        success: calendar.length > 0,
        result: calendar,
      }
    }

    return {
      success: false,
      result: []
    }
    

  }

  @Get('cryptocurrency')
  async getCryptoCurrency() {
    const result = await this.widgetSourceService.getCryptoCurrency();
    return {
      success: result.length > 0,
      result: result ?? [],
    };
  }

  @Get('trend/keyword')
  async getTrendKeywords(@Req() req: OGRequest) {
    const trendKeywords = await this.aggregateService.getTrendingKeyword(req.lang);

    return {
      success: true,
      result: trendKeywords ?? []
    }
  }


}

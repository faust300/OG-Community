import { Body, Controller, Get, Patch, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { OGRequest } from '../extensions/auth/auth.request';
import { JWTAuthGuard } from '../extensions/auth/jwt-auth.guard';
import { JWTAuthInterceptor } from '../extensions/auth/jwt-auth.interceptor';
import { ActKey, RMQService } from '../extensions/services/rmq.service';
import { UpdateWidgetDtos } from './dto/update-widget.dto';
import { WidgetDTO } from './dto/widget.dto';
import { WidgetsService } from './widgets.service';

@Controller('widgets')
export class WidgetsController {
  constructor(
    private readonly widgetsService: WidgetsService,
    private readonly rmqService: RMQService
  ) { }

  @Get('')
  @UseInterceptors(JWTAuthInterceptor)
  async getWidgets(@Req() req: OGRequest) {
    let widgets: WidgetDTO[];
    const lang = req.lang;
    
    if (req.user) {
      widgets = await this.widgetsService.getWidgetsByUserId(req.lang, req.user.userId);
    } else {
      widgets = await this.widgetsService.getWidgetsByAnonymous(lang);
    }

    return {
      success: widgets.length > 0,
      result: widgets
    }
  }

  @Get('all')
  @UseInterceptors(JWTAuthInterceptor)
  async getWidgetsAll(@Req() req: OGRequest) {
    const widgets = await this.widgetsService.getWidgetsAll(req.lang, req.user?.userId);
    return {
      success: widgets.length > 0,
      result: widgets
    }
  }

  @Patch('')
  @UseGuards(JWTAuthGuard)
  async updateWidgets(@Req() req: OGRequest, @Body() updateWidgetsDtos: UpdateWidgetDtos) {
    const result = await this.widgetsService.updateWidgetUserDefinedByUserId(req.user.userId, updateWidgetsDtos.data);

    this.rmqService.publish(ActKey.USER_SET_WIDGET, req.user.userId);
    return {
      success: result,
      result: result ? 'widget updated successfully' : 'widget updated failed'
    }
  }

  
}

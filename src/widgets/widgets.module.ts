import { Module } from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { WidgetsController } from './widgets.controller';
import { RMQService } from '../extensions/services/rmq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Widget } from './entities/widget.entity';
import { WidgetUserDefined } from './entities/widgetUserDefined.entity';
import { WidgetDefaultDefined } from './entities/widgetDefaultDefined.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Widget, WidgetUserDefined, WidgetDefaultDefined])],
  controllers: [WidgetsController],
  providers: [
    WidgetsService, 
    RMQService
  ]
})
export class WidgetsModule {}

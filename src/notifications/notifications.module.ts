import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ConnectionService } from 'src/extensions/services/connection.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, ConnectionService],
})
export class NotificationsModule {}

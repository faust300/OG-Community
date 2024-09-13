import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { JWTAuthGuard } from 'src/extensions/auth/jwt-auth.guard';
import { OGException } from 'src/extensions/exception/exception.filter';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JWTAuthGuard)
  async getNotificationsFromUserId(@Req() req: OGRequest) {
    if (req.user) {
      const notifications =
        await this.notificationsService.getNotificationsFromUserId(
          req.user.userId,
          req.lang
        );
      return {
        success: true,
        result: notifications,
      };
    } else {
      throw new OGException({
        errorCode: -19000,
        errorMessage: 'Failed',
      });
    }
  }
}

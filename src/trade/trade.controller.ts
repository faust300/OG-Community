import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TradeService } from './trade.service';

@Controller('trade')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Get('referral/programs')
  async getReferralPrograms() {
    return {
      success: true,
      result: await this.tradeService.getReferralPrograms(),
    };
  }
}

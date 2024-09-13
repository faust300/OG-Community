import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';
import { ConnectionService } from 'src/extensions/services/connection.service';

@Module({
  controllers: [TradeController],
  providers: [TradeService, ConnectionService],
})
export class TradeModule {}

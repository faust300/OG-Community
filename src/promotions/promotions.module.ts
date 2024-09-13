import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from '../promotion/entities/promotion.entity';
import { PromotionUnit } from '../promotion/entities/promotion-unit.entity';
import { PromotionUser } from '../promotion/entities/promotion-user.entity';
import { PromotionViewHistory } from '../promotion/entities/promotion-view.entity';
import { PromotionVoteHistory } from '../promotion/entities/promotion-vote.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      Promotion,
      PromotionUnit,
      PromotionUser,
      PromotionViewHistory,
      PromotionVoteHistory
    ])
  ],
  controllers: [PromotionsController],
  providers: [PromotionsService, ConnectionService]
})
export class PromotionsModule {}

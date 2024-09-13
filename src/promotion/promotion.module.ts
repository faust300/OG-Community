import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { PromotionUnit } from './entities/promotion-unit.entity';
import { PromotionUser } from './entities/promotion-user.entity';
import { PromotionViewHistory } from './entities/promotion-view.entity';
import { PromotionVoteHistory } from './entities/promotion-vote.entity';
import { PromotionClickHistory } from './entities/promotion-click.entity';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      Promotion,
      PromotionUnit,
      PromotionUser,
      PromotionViewHistory,
      PromotionVoteHistory,
      PromotionClickHistory
    ])
  ],
  controllers: [PromotionController],
  providers: [PromotionService, ConnectionService]
})
export class PromotionModule {}

import { Injectable } from '@nestjs/common';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { OkPacket } from 'mysql2';
import { SQL, SQLStatement } from 'sql-template-strings';
import { HistoryPromotionDto } from './dto/history-promotion.dto';
import { OGException } from 'src/extensions/exception/exception.filter';
import { Count } from './dto/promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { Repository } from 'typeorm';
import { PromotionViewHistory } from './entities/promotion-view.entity';
import { PromotionClickHistory } from './entities/promotion-click.entity';
import { PromotionVoteHistory, VoteType } from './entities/promotion-vote.entity';

@Injectable()
export class PromotionService {
  constructor(
    private readonly connectionService: ConnectionService,

    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,

    @InjectRepository(PromotionClickHistory)
    private readonly clickHistoryRepository: Repository<PromotionClickHistory>,

    @InjectRepository(PromotionVoteHistory)
    private readonly voteHistoryRepository: Repository<PromotionVoteHistory>
  ) {}

  async updatePromotionClickHistory(promotion: HistoryPromotionDto, userId: number = 0): Promise<boolean> {
    try {

      const promotionObj = await this.promotionRepository.findOne({
        relations: {
          promotionUnits: true
        },
        where: {
          id: promotion.promotionId,
          promotionUnits: {
            promotionId: promotion.promotionId,
            displayPlace: promotion.unitType
          }
        }
      })

      if ( ! promotionObj && ! promotionObj.promotionUnits) {
        return false;
      }

      const userClickHistory = await this.clickHistoryRepository.findOneBy({
        promotionUnitId: promotionObj.promotionUnits[0].id,
        userId
      })

      let saveObj: PromotionClickHistory = new PromotionClickHistory();

      if (userClickHistory) {
        saveObj = userClickHistory;

        saveObj.count++;
      } else {
        saveObj.promotionId = promotion.promotionId;
        saveObj.promotionUnitId = promotionObj.promotionUnits[0].id;
        saveObj.userId = userId;
        saveObj.count = 1;
      }

      this.clickHistoryRepository.save(saveObj, {transaction: false, reload: false});

      return true;
    } catch (e) {
      console.log(e);
      throw new OGException({
        errorCode: -602,
        errorMessage: 'Update Promotion Click History Failed'
      })
    }
  }

  async updatePromotionVoteByPromotionId(type: VoteType, promotionId: number, userId: number): Promise<boolean> {
    try {
      const originVoteObj = await this.voteHistoryRepository.findOneBy({
        promotionId: promotionId,
        userId: userId
      })
      
      let saveObj = new PromotionVoteHistory();

      if (originVoteObj) {
        saveObj = originVoteObj;

        saveObj.deletedAt = saveObj.voteType == type ? saveObj.deletedAt ? null : new Date() : null;
        saveObj.voteType = type;
      } else {
        saveObj.promotionId = promotionId;
        saveObj.userId = userId;
        saveObj.voteType = type;
      }

      await this.voteHistoryRepository.save(saveObj, {transaction: false, reload: false});

      return true;
    } catch (e) {
      throw new OGException({
        errorCode: -603,
        errorMessage: 'Update Promotion Vote History Failed'
      })
    }
  }

}

import { Injectable } from '@nestjs/common';
import { ConnectionService } from '../extensions/services/connection.service';
import { OkPacket } from 'mysql2';
import { SQL, SQLStatement } from 'sql-template-strings';
import { ActivePromotion } from './dto/promotion.dto';
import { OGException } from 'src/extensions/exception/exception.filter';
import { Post } from 'src/posts/entities/posts.entity';
import { PromotionDTO } from 'src/promotion/dto/promotion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, MoreThanOrEqual, Raw, Repository } from 'typeorm';
import { Promotion } from 'src/promotion/entities/promotion.entity';
import { PromotionUnit, PromotionUnitDisplayPlace } from 'src/promotion/entities/promotion-unit.entity';
import { PromotionUser } from 'src/promotion/entities/promotion-user.entity';
import { PromotionViewHistory } from 'src/promotion/entities/promotion-view.entity';
import { ReturnPost } from 'src/post/dto/return-post.dto';

@Injectable()
export class PromotionsService {

  constructor(
    private readonly connectionService: ConnectionService,

    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,

    @InjectRepository(PromotionViewHistory)
    private readonly viewHistoryRepository: Repository<PromotionViewHistory>
  ) {}

  async getActivePromotions(unit: PromotionUnitDisplayPlace, size: number = 1, userId: number = 0): Promise<ActivePromotion[]> {
    try {

      // const promotionObj = await this.promotionRepository.find({
      //   relations: {
      //     promotionUser: true,
      //     promotionUnits: true
      //   },
      //   where: {
      //     promotionUnits: {
      //       displayPlace: unit,
      //       isActive: true
      //     },
      //     promotionUser: {
      //       //Raw('`Promotion__Promotion_promotionUnits`.`viewPrice` + `Promotion__Promotion_promotionUnits`.`clickPrice`')
      //       //TODO: user Point check
      //       point: MoreThanOrEqual(0),
      //       status: 1
      //     }
      //   },
      //   order: {
      //     // TODO: ORDER BY RAND()
      //   },
      //   take: Number(size)
      // })

      const promotion = await this.promotionRepository.createQueryBuilder('promotion')
      .select('promotionUnits.id', 'promotionUnitId')
      .addSelect('promotion.id', 'promotionId')
      .addSelect('promotionUnits.viewCount', 'viewCount')
      .addSelect('promotionUnits.clickCount', 'clickCount')
      .addSelect('promotionUnits.voteCount', 'voteCount')
      .addSelect('promotion.title', 'title')
      .addSelect('promotion.contentsImageUrl', 'contentsImageUrl')
      .addSelect('promotion.bannerImageUrl', 'bannerImageUrl')
      .addSelect('promotion.contentsVideoUrl', ' contentsVideoUrl')
      .addSelect('promotion.bannerVideoUrl', 'bannerVideoUrl')
      .addSelect('promotion.externalUrl', 'externalUrl')
      .addSelect('promotionUser.userName', 'userName')
      .addSelect('promotionUser.userProfile', 'userProfile')
      .addSelect('promotionUnits.createdAt', 'promotionUnitCreatedAt')
      .addSelect('promotionUnits.updatedAt', 'promotionUnitUpdatedAt')
      // TODO: Vote Sub Query
      // .addSelect(`(select voteType from PromotionVoteHistory AS V where V.promotionId = promotion.id and userId = ${userId} and deletedAt IS NULL)`, 'voteType')
      .leftJoinAndSelect('promotion.promotionUser', 'promotionUser')
      .leftJoinAndSelect('promotion.promotionUnits', 'promotionUnits')
      .where('promotionUnits.displayPlace = :unit', {unit})
      .andWhere('promotionUnits.isActive = true')
      .andWhere('promotionUser.point >= promotionUnits.viewPrice + promotionUnits.clickPrice')
      .andWhere('promotionUser.status = 1')
      .orderBy('RAND()')
      .limit(size)
      .execute();

      if (promotion.length > 0) {
        this.updatePromotionsViewHistory(promotion, userId);
        
        return promotion;
      } 

      return [];
    } catch (e) {
      console.log(e);
      throw new OGException({
        errorCode: -501,
        errorMessage: 'Get Promotions Failed'
      })
    }
  }

  async updatePromotionsViewHistory(promotions: ActivePromotion[], userId: number = 0) {
    try {

      const targetUser = await this.viewHistoryRepository.find({
        where: {
          promotionId: In(promotions.map(promotion => promotion.promotionId)),
          promotionUnitId: In(promotions.map(promotion => promotion.promotionUnitId)),
          userId
        }
      })

      promotions.map(promotion => {
        const target = targetUser.filter(tu => tu.promotionId == promotion.promotionId && tu.promotionUnitId == tu.promotionUnitId)[0]

        if (target) {
          target.count++;
        } else {
          const historyObj = new PromotionViewHistory();
          historyObj.promotionId = promotion.promotionId;
          historyObj.promotionUnitId = promotion.promotionUnitId;
          historyObj.userId = userId;
          historyObj.count = 1;

          targetUser.push(historyObj);
        }
      })

      this.viewHistoryRepository.save(targetUser, {transaction: false, reload: false});
    } catch (e) {
      throw new OGException({
        errorCode: -502,
        errorMessage: 'Update Promotions View History Failed'
      })
    }
  }

  convertPromotionToDefault(promotions: ActivePromotion[], unit: "postList"|"postDetail"|"sideBar"|"banner"): PromotionDTO[] {
    return promotions.map(p => {
      return {
        promotionId: p.promotionId,
        promotionUnit: unit,
        promotionUnitId: p.promotionUnitId,
        bannerImageUrl: p.bannerImageUrl,
        contentsImageUrl: p.contentsImageUrl,
        bannerVideoUrl: p.bannerVideoUrl,
        contentsVideoUrl: p.contentsVideoUrl,
        externalUrl: p.externalUrl
      }
    })
  }

  convertPromotionToPost(promotion: ActivePromotion): ReturnPost {
    return {
      dataType: 'promotion',
      title: promotion.title,
      postId: 0,
      userId: 0,
      userName: promotion.userName,
      userProfilePath: promotion.userProfile,
      userTitle: 0,
      userTitleName: 'promoted',
      authorId: 0,
      authorName: '',
      authorProfilePath: '',
      authorLink: '',
      authorType: '',
      authorReservation1: '',
      authorReservation2: '',
      originLink: promotion.externalUrl,
      contents: {
        blocks: [
          {
            data: {
              text: "promotion",
              type: "paragraph"
            }
          }
        ]
      } as any,
      thumbnail: promotion.contentsImageUrl,
      videoThumbnail:promotion.contentsVideoUrl,
      viewCount: promotion.viewCount,
      voteCount: promotion.voteCount,
      commentCount: 0,
      hasReferral: false,
      isEdit: false,
      isNSFW: false,
      isVerified: true,
      createdAt: promotion.promotionUnitCreatedAt,
      updatedAt: promotion.promotionUnitUpdatedAt,
      vote: promotion.voteType,
      isMine: promotion.voteType != null,
      lang: 'EN',
      imageCount: 0
    }
  }
}

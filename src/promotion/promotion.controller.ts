import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, UseGuards } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { JWTAuthInterceptor } from 'src/extensions/auth/jwt-auth.interceptor';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { HistoryPromotionDto } from './dto/history-promotion.dto';
import { JWTAuthGuard } from 'src/extensions/auth/jwt-auth.guard';
import { VoteType } from './entities/promotion-vote.entity';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) { }

  @Post('/click/:promotionId/:unitType')
  @UseInterceptors(JWTAuthInterceptor)
  async promotionClick(
    @Req() req: OGRequest,
    @Param() dto: HistoryPromotionDto
  ) {
    const userId = req.user?.userId ?? 0
    const result: boolean = await this.promotionService.updatePromotionClickHistory(dto, userId);

    return {
      success: result,
      result: result ? 'insert click history' : 'not found promotion',
    }

  }

  @Post('/view/:promotionId/:unitType')
  async promotionView() {

  }

  @Post(':promotionId/upvote')
  @UseGuards(JWTAuthGuard)
  async updateUpVotePostByPostId(@Req() req: OGRequest, @Param('promotionId') promotionId: number) {

    const result = await this.promotionService.updatePromotionVoteByPromotionId(VoteType.UP, promotionId, req.user.userId);

    if (result) {
      return {
        success: true,
        result: result
      }
    }

    return {
      success: false,
      result: {
        postId: promotionId,
        message: "Upvote Promotion failed"
      }
    }
  }

  @Post(':promotionId/downvote')
  @UseGuards(JWTAuthGuard)
  async updateDownVotePostByPostId(@Req() req: OGRequest, @Param('promotionId') promotionId: number) {
    const result = await this.promotionService.updatePromotionVoteByPromotionId(VoteType.DOWN, promotionId, req.user.userId);

    if (result) {
      return {
        success: true,
        result: result
      }
    }

    return {
      success: false,
      result: {
        postId: promotionId,
        message: "downVote Promotion failed"
      }
    }
  }
}

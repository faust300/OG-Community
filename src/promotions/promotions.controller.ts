import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Req, Query } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { OGException } from 'src/extensions/exception/exception.filter';
import { JWTAuthInterceptor } from 'src/extensions/auth/jwt-auth.interceptor';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { GetPromotionDto } from './dto/get-promotion.dto';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get('')
  @UseInterceptors(JWTAuthInterceptor)
  async getPromotions(
    @Req() req: OGRequest,
    @Query() dto: GetPromotionDto,
  ) {
    const userId = req.user?.userId ?? 0;

    const promotions = await this.promotionsService.getActivePromotions(dto.unit, 4, userId);
    const promotion = this.promotionsService.convertPromotionToDefault(promotions, dto.unit);
    return {
      success: promotion.length > 0,
      result: promotion
    }
  }
}

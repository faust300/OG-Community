import { Controller, Get, Query, Req, UseInterceptors } from '@nestjs/common';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { JWTAuthInterceptor } from 'src/extensions/auth/jwt-auth.interceptor';
import { OGException } from 'src/extensions/exception/exception.filter';
import { PostsService } from 'src/posts/posts.service';
import { PromotionUnitDisplayPlace } from 'src/promotion/entities/promotion-unit.entity';
import { PromotionsService } from 'src/promotions/promotions.service';
import { OverviewService } from './overview.service';
import { AggregateService } from 'src/aggregate/aggregate.service';

@Controller('overview')
export class OverviewController {
  constructor(
    private readonly overviewService: OverviewService,
    private readonly aggregationService: AggregateService,
    private readonly promotionsService: PromotionsService,
    private readonly postsService: PostsService,
  ) {}

  @Get()
  async getOverviewTemplate(@Req() req: OGRequest) {
    const overview = await this.overviewService.getOverviewTemplate();

    return {
      success: true,
      result: overview,
    };
  }

  @Get('/best')
  async getOverviewBest(@Req() req: OGRequest) {
    const overViewData = await this.overviewService.getOverviewData('BEST');
    if (overViewData) {
      const bestPosts = await this.overviewService.getPostByPostIds(
        overViewData.data,
      );

      let result = [];
      const ids = overViewData.data as number[];
      for( let i = 0 ; i < ids.length ; i++ ){
        result = [...result, ...bestPosts.filter(post=>post.postId == ids[i])]
      }

      return {
        success: result.length > 0,
        result: result,
      };
    } else {
      const recentPosts = await this.overviewService.getPostByRecent();

      return {
        success: recentPosts.length > 0,
        result: recentPosts,
      };
    }
  }

  @Get('/topic')
  async getOverviewTopic() {
    const topics = await this.overviewService.getTopics();

    return {
      success: true,
      result: topics,
    };
  }

  @Get('/promotion')
  @UseInterceptors(JWTAuthInterceptor)
  async getPromotion(@Req() req: OGRequest) {
    const promotions = await this.promotionsService.getActivePromotions(
      PromotionUnitDisplayPlace.BANNER,
      4,
      req.user?.userId ?? 0,
    );
    const promotion = this.promotionsService.convertPromotionToDefault(
      promotions,
      PromotionUnitDisplayPlace.BANNER,
    );

    return {
      success: promotion.length > 0,
      result: promotion,
    };
  }


  @Get('/posts')
  @UseInterceptors(JWTAuthInterceptor)
  async getPosts(
    @Req() req: OGRequest,
    @Query('topics') topics: string[] = [],
    @Query('tags') tags: string[] = [],
    @Query('sort')
    sort: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented' = 'recent',
    @Query('next') next: string | undefined = undefined,
    @Query('bot') bot: string | undefined = 'true',
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.postsService.getPosts(
      req.user ? req.user.userId : null,
      // topics,
      tags,
      sort,
      next,
      bot,
      'EN'
    );

    return {
      success: true,
      result: result.list.slice(0, limit),
    };
  }

  @Get('/pick')
  @UseInterceptors(JWTAuthInterceptor)
  async getOverviewAdminPick(@Req() req: OGRequest, @Query('key') key: string) {

    if (!key) {
      throw new OGException(
        {
          errorCode: -301,
          errorMessage: 'Invalid Access.',
        },
        400,
      );
    }

    const getPickedPosts = await this.overviewService.getOverviewPickedPosts(
      req.user?.userId,
      key
    );

    if (!getPickedPosts) {
      throw new OGException(
        {
          errorCode: -302,
          errorMessage: 'Invalid Access.',
        },
        400,
      );
    }

    return {
      success: true,
      result: getPickedPosts,
    };
  }

  @Get('/data')
  async getOverviewRawData(@Req() req: OGRequest, @Query('key') key: string) {
    if (!key) {
      throw new OGException(
        {
          errorCode: -301,
          errorMessage: 'Invalid Access.',
        },
        400,
      );
    }

    const getOverviewRawData = await this.overviewService.getOverviewRawData(
      key,
    );

    return {
      success: true,
      result: getOverviewRawData ? getOverviewRawData.data : null,
    };
  }

  @Get('/data/keyword')
  async getOverviewRawDataByKeyword(@Req() req: OGRequest){
    const lang = req.lang

    const getTrendKeyword = await this.aggregationService.getTrendingKeyword(lang);
    
    return {
      success: true,
      result: getTrendKeyword ? getTrendKeyword : null,
    }

  }
}

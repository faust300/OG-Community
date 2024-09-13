import { Controller, Get, Query, UseInterceptors, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { JWTAuthInterceptor } from 'src/extensions/auth/jwt-auth.interceptor';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { SearchDto } from './dto/search.dto';
import { AggregateService } from 'src/aggregate/aggregate.service';

@Controller('search')
@UseInterceptors(JWTAuthInterceptor)
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly aggregateService: AggregateService
  ) { }

  @Get('')
  async getSearchInPostAndTagByKeyword(
      @Req() req: OGRequest,
      @Query() search: SearchDto
    ) {

    let posts = [];
    let assets = [];
    let users = [];
    if(search.page > 1){
      posts = await this.searchService.getSearchInPostByKeyword(search.q, search.page, req.lang, search.size, search.sort, Number(req.user ? req.user.userId : null));
    } else {
      posts = await this.searchService.getSearchInPostByKeyword(search.q, search.page, req.lang, search.size, search.sort, Number(req.user ? req.user.userId : null));
      assets = await this.searchService.getSearchInAssetByKeyword(search.q, search.page, req.lang);
      users = await this.searchService.getSearchInUserByKeyword(search.q, search.page, req.lang, search.size);
    }
    
    // history
    if (search.q?.length > 1) {
      this.searchService.createHistoryToEs(search.q, req.lang);
    }

    return {
      success: posts.length > 0 || assets.length > 0 || users.length > 0,
      result: {
        posts,
        users,
        assets,
      }
    }
  }

  @Get('post')
  async getSearchInPostByKeyword(
    @Req() req: OGRequest,
    @Query() search: SearchDto
  ) {
    const posts = await this.searchService.getSearchInPostByKeyword(search.q, search.page, req.lang, search.size, search.sort, Number(req.user ? req.user.userId : null));

    // history
    if (search.q?.length > 1) {
      this.searchService.createHistoryToEs(search.q, req.lang);
    }

    return {
      success: posts.length > 0,
      result: {
        posts
      }
    }
  }

  @Get('asset')
  async getSearchInAssetByKeyword(
    @Req() req: OGRequest,
    @Query() search: SearchDto
  ) {
    const assets = await this.searchService.getSearchInAssetByKeyword(search.q, search.page, req.lang, search.size);

    return {
      success: assets.length > 0,
      result: {
        assets
      }
    }
  }


  @Get('user')
  async getSearchInUserByKeyword(
    @Req() req: OGRequest,
    @Query() search: SearchDto
  ) {
    const users = await this.searchService.getSearchInUserByKeyword(search.q, search.page, req.lang, search.size);

    // history
    if (search.q?.length > 1) {
      this.searchService.createHistoryToEs(search.q, req.lang);
    }

    return {
      success: users.length > 0,
      result: {
        users
      }
    }
  }

  @Get('trend-keyword')
  async getHotTag(@Req() req: OGRequest) {
    const trendKeyword = await this.aggregateService.getTrendingKeyword(req.lang);
    const reserve = ['OG', 'MEME', 'playground', 'bank', 'economy']
    if (trendKeyword.length < 6) {
      const insertCnt = 5 - trendKeyword.length;

      for (let i = 0; i < insertCnt; i++) {
        trendKeyword.push({
          word: reserve[i],
          useCount: 0
        })
      }
    }

    return {
      success: trendKeyword.length > 0,
      result: {
        trendKeyword
      }
    }
  }

}

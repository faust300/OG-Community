import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { PromotionsService } from 'src/promotions/promotions.service';
import { OGRequest } from '../extensions/auth/auth.request';
import { JWTAuthInterceptor } from '../extensions/auth/jwt-auth.interceptor';
import { Post } from 'src/post/entities/post.entity';
import { PostsService } from './posts.service';
import { PostService } from '../post/post.service';
import { ReturnPost } from 'src/post/dto/return-post.dto';
import { PromotionUnitDisplayPlace } from 'src/promotion/entities/promotion-unit.entity';
import {
  addPromotionPost,
  addRecommendFollowers,
  addRecommendTopic,
  postListTemplate,
} from 'src/utils/Post';
import { FollowService } from '../follow/follow.service';
import { TopicsService } from 'src/topics/topics.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly topicService: TopicsService,
    private readonly promotionsService: PromotionsService,
    private readonly followService: FollowService,
  ) {}

  // og.xyz/?topics=playgound&topics=market&topics=trading&tags=btc

  @Get()
  @UseInterceptors(JWTAuthInterceptor)
  async getPosts(
    @Req() req: OGRequest,
    @Query('topics') topics: string[] = [],
    @Query('tags') tags: string[] = [],
    @Query('sort')
    sort: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented' | 'recommend' = 'recommend',
    @Query('next') next: string | undefined = undefined,
    @Query('bot') bot: string | undefined = 'true',
  ) {
    const lang = req.lang;
    const result = await this.postsService.getPosts(
      req.user ? req.user.userId : null,
      // topics,
      tags,
      sort,
      next,
      bot,
      lang,
    );

    let posts: ReturnPost[] = [];

    if (result.list && result.list.length > 0) {
      const userId = req.user?.userId ?? 0;
      const promotions = await this.promotionsService.getActivePromotions(
        PromotionUnitDisplayPlace.POST_LIST,
        1,
        userId,
      );
      const recommendFollowers = await this.followService.getFollowers(
        req.user ? req.user.userId : null,
      );
      const recommendTopic = await this.topicService.recommendTopics();
      const template = await this.postsService.getPostListTemplate();
      posts = await postListTemplate(result.list, tags, promotions, recommendFollowers, recommendTopic, template, next, result.next)
  
    }

    return {
      success: true,
      result: {
        posts: posts,
        next: result.next,
      },
    };
  }

  @Get(':touserId([0-9]{1,11})')
  @UseInterceptors(JWTAuthInterceptor)
  async getUserPost(
    @Req() req: OGRequest,
    @Query('topics') topics: string[] = [],
    @Query('tags') tags: string[] = [],
    @Query('sort')
    sort: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented' = 'recent',
    @Query('next') next: string | undefined = undefined,
    @Param('touserId') touserId: string,
  ) {
    const lang = req.lang;
    const result = await this.postsService.getPosts(
      req.user ? req.user.userId : null,
      // topics,
      tags,
      sort,
      next,
      'false',
      lang,
      Number(touserId),
    );

    // let posts: ReturnPost[] = [];

    // if (result.list && result.list.length > 0) {
    //   const userId = req.user?.userId ?? 0;
    //   // const promotions = await this.promotionsService.getActivePromotions(
    //   //   PromotionUnitDisplayPlace.POST_LIST,
    //   //   1,
    //   //   userId,
    //   // );
    //   // const recommendFollowers = await this.followService.getFollowers();
    //   // posts = await addPromotionPost(result.list, promotions);
    //   // posts = await addRecommendFollowers(result.list, recommendFollowers);
    // }

    return {
      success: true,
      result: {
        posts: result.list,
        next: result.next,
      },
    };
  }

  @Get('recommended/:postId?')
  @UseInterceptors(JWTAuthInterceptor)
  async getRecommendedPosts(
    @Req() req: OGRequest,
    @Param('postId') postId: number | null = null,
  ) {
    const lang = req.lang;
    const result = await this.postsService.getRecommendedPosts(
      req.user?.userId,
      Number.isNaN(postId) ? null : postId,
      lang,
    );

    return {
      success: true,
      result: result,
    };
  }

  @Get('popular')
  @UseInterceptors(JWTAuthInterceptor)
  async getPopularPosts(
    @Req() req: OGRequest,
    @Query('topics') topics: string[] = [],
    @Query('tags') tags: string[] = [],
    @Query('sort')
    sort: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented' | 'recommend' = 'recommend',
    @Query('next') next: string | undefined = undefined,
    @Query('bot') bot: string | undefined = 'true',
    @Query('type') type: '1' | '2' | '3' = '3'
    
  ) {

    const lang = req.lang;
    // const result = await this.postsService.getPopularPosts(
    //   req.user ? req.user.userId : null,
    //   // topics,
    //   tags,
    //   sort,
    //   next,
    //   bot,
    //   lang,
    // );

    const result = await this.postsService.getPopularPosts(
      req.user ? req.user.userId : null,
      // topics,
      tags,
      sort,
      next,
      bot,
      lang,
    )

    
    const userId = req.user?.userId ?? 0;
    const promotions = await this.promotionsService.getActivePromotions(
      PromotionUnitDisplayPlace.POST_LIST,
      1,
      userId,
    );
    const recommendFollowers = await this.followService.getFollowers(
      req.user ? req.user.userId : null,
    );
    const recommendTopic = await this.topicService.recommendTopics();
    const template = await this.postsService.getPostListTemplate();
    const posts = await postListTemplate(result.list, tags, promotions, recommendFollowers, recommendTopic, template, next, result.next)

    return {
      success: true,
      result: {
        posts: posts,
        next: result.next,
      },
    };
  }

  @Get('follow')
  @UseInterceptors(JWTAuthInterceptor)
  async getFollowPosts(
    @Req() req: OGRequest,
    @Query('topics') topics: string[] = [],
    @Query('tags') tags: string[] = [],
    @Query('sort')
    sort: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented' = 'recent',
    @Query('next') next: string | undefined = undefined,
    @Query('bot') bot: string | undefined = 'true',
  ) {
    const lang = req.lang;
    const result = await this.postsService.getFollowPosts(
      req.user ? req.user.userId : null,
      // topics,
      tags,
      sort,
      next,
      bot,
      lang,
    );

    const userId = req.user?.userId ?? 0;
    const promotions = await this.promotionsService.getActivePromotions(
      PromotionUnitDisplayPlace.POST_LIST,
      1,
      userId,
    );
    const recommendTopic = await this.topicService.recommendTopics();
    const recommendFollowers = await this.followService.getFollowers(userId);
    const template = await this.postsService.getPostListTemplate();
    console.log(template)
    const posts = await postListTemplate(result.list, tags, promotions, recommendFollowers, recommendTopic, template, next, result.next)

    return {
      success: true,
      result: {
        posts: posts,
        next: result.next,
      },
    };
  }
}

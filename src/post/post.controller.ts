import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { OGException } from 'src/extensions/exception/exception.filter';
import { ActivePromotion } from 'src/promotions/dto/promotion.dto';
import { PromotionsService } from 'src/promotions/promotions.service';
import { ReportType } from 'src/report/entities/report.entity';
import { ReportService } from 'src/report/report.service';
import { OGRequest } from '../extensions/auth/auth.request';
import { JWTAuthGuard } from '../extensions/auth/jwt-auth.guard';
import { JWTAuthInterceptor } from '../extensions/auth/jwt-auth.interceptor';
import { ActKey, PlayGroundActKey, RMQService } from '../extensions/services/rmq.service';
import { CreatePostRequetDto } from './dto/create-post.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostDraftDto } from './dto/post-draft.dto'
import { PostService } from './post.service';
import { PromotionUnitDisplayPlace } from 'src/promotion/entities/promotion-unit.entity';
import { BanInterceptor } from 'src/extensions/auth/ban-auth.interceptor';


@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly rmqService:RMQService,
    private readonly reportService:ReportService,
    private readonly promotionsService: PromotionsService,
    
    ) { }

  @Get(':postId([0-9]{1,10})')
  @UseInterceptors(JWTAuthInterceptor)
  async getPostByPostId(@Req() req: OGRequest, @Param('postId') postId: number) {
    const lang = req.lang
    let viewResult = false
    const ip = req.realIP;
    if(req.user){
      viewResult = await this.postService.upsertPostViewCount(req.user.userId, postId, ip);
    } else {
      viewResult = await this.postService.upsertPostViewCount(0, postId, ip);
    }
    const result = await this.postService.getPostByPostId(req.user? req.user.userId : null, postId);
    if(viewResult && result && result.userId !== 0){
      this.rmqService.publish(ActKey.COMMUNITY_VIEW_POST, req.user ? req.user.userId : 0, {postId:result.postId, viewCount: result.viewCount, language: lang})
    }
    const promotions = await this.promotionsService.getActivePromotions(PromotionUnitDisplayPlace.POST_DETAIL, 1, req.user?.userId ?? 0);
    const promotion = this.promotionsService.convertPromotionToDefault(promotions, 'postDetail');

    return {
      success:true,
      result:{
        post: result ?? null,
        promotion
      }
    }
  }

  @Get('/view/:postId([0-9]{1,10})')
  @UseInterceptors(JWTAuthInterceptor)
  async getPostByPostIdWithNotRaiseViewCount(@Req() req: OGRequest, @Param('postId') postId: number) {
    
    const lang = req.lang
    const result = await this.postService.getPostByPostId(req.user? req.user.userId : null, postId);
    if(result && result.userId !== 0){
      this.rmqService.publish(ActKey.COMMUNITY_VIEW_POST, req.user ? req.user.userId : 0, {postId:result.postId, viewCount: result.viewCount, language: lang})
    }
    const promotions = await this.promotionsService.getActivePromotions(PromotionUnitDisplayPlace.POST_DETAIL, 1, req.user?.userId ?? 0);
    const promotion = this.promotionsService.convertPromotionToDefault(promotions, 'postDetail');

    return {
      success:true,
      result:{
        post: result ?? null,
        promotion
      }
    }
  }

  @Post()
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async createPost(@Req() req: OGRequest, @Body() createPostDto: CreatePostRequetDto) {
    const lang = req.lang
    const postId = await this.postService.createPost(req.user.userId, createPostDto);
    if( postId !== undefined ){
      this.rmqService.publish(ActKey.COMMUNITY_CREATE_POST, req.user.userId, {postId:postId, language: lang})
      return {
        success:true,
        result:{
          postId:postId
        }
      }
    }

    throw new OGException({
      errorCode:-201,
      errorMessage:"Failed"
    });
  }

  @Patch(':postId([0-9]{1,10})')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async updatePostByPostId(@Req() req: OGRequest, @Param('postId') postId: number, @Body() updatePostDto: UpdatePostDto,) {
    const lang = req.lang
    const editPostId = await this.postService.updatePostByPostId(req.user.userId, updatePostDto, postId);
    if( editPostId !== undefined ){
      return {
        success:true,
        result:{
          postId:editPostId
        }
      }
    }

    throw new OGException({
      errorCode:-202,
      errorMessage:"Update post failed"
    });
  }


  @Delete(':postId([0-9]{1,10})')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async removePostByPostId(@Req() req: OGRequest, @Param('postId') postId: number) {
    const lang = req.lang
    const result = await this.postService.removePostByPostId(req.user.userId, postId);
    if(result.admin){
      this.rmqService.publish(ActKey.COMMUNITY_ADMIN_DELETE_POST, req.user ? req.user.userId : 0, {userId: req.user ? req.user.userId : 0, postId: result.postId, language: lang})
    }

    if(result.success){
      return {
        success:true,
        result:{
          postId:result.postId
        }
      }
    }
    return {
      success:false,
      result:{
        postId:postId,
        message:"Delete post failed"
      }
    };
  }

  @Post(':postId/upvote')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async updateUpVotePostByPostId(@Req() req: OGRequest, @Param('postId') postId: number) {
    const lang = req.lang
    const result = await this.postService.updateVotePostByPostId(req.user.userId, postId, 'up');
    if(result){
      await this.rmqService.publish(PlayGroundActKey.VOTE_POST, req.user.userId, {}, 'og.playground')   
      this.rmqService.publish(ActKey.COMMUNITY_VOTE_POST, req.user.userId, {postId:result.postId, language: lang})
      return {
        success: true,
        result: result
      }
    }

    return {
      success: false,
      result: {
        postId: postId,
        message: "Upvote post failed"
      }
    }
  }

  @Post(':postId/downvote')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async updateDownVotePostByPostId(@Req() req: OGRequest, @Param('postId') postId: number) {
    const lang = req.lang
    const result = await this.postService.updateVotePostByPostId(req.user.userId, postId, 'down');

    if(result){
      this.rmqService.publish(ActKey.COMMUNITY_VOTE_POST, req.user.userId, {postId:result.postId, language: lang})
      return {
        success: true,
        result: result
      }
    }

    return {
      success: false,
      result: {
        postId: postId,
        message: "downVote post failed"
      }
    }
  }

  @Post(':postId/report')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async createReportPostByPostId(@Req() req: OGRequest, @Param('postId') postId: number, @Body() createReportDto: CreateReportDto) {
    const lang = req.lang

    const reportTypes = await this.reportService.getReportTypes(lang);
    let dtoErrorFlag = false;
    for(let i=0; i<createReportDto.reportTypeId.length; i++){
      if(!reportTypes.map((type: ReportType) => type.reportTypeId).includes(createReportDto.reportTypeId[i])){
        dtoErrorFlag = true;
        break;
      }
    }

    if(dtoErrorFlag){
      throw new OGException({
        errorCode: -401,
        errorMessage: "Invalid Report Type Ids"
      }, 400);
    }

    const result = await this.postService.createReportPostByPostId(req.user.userId, postId, createReportDto);
    if(result){
      this.rmqService.publish(ActKey.COMMUNITY_REPORT_POST, req.user.userId, {postId:result, language: lang})
      return {
        success: true,
        result: {
          postId: result
        }
      }
    }

    return {
      success: false,
      result: {
        message: "Report post failed",
        postId: postId
      }
    }
  }

  @Get('draft')
  @UseGuards(JWTAuthGuard)
  async getDrafts(@Req() req: OGRequest){
    const result = await this.postService.getPostDraftByUserId(req.user.userId)
    return {
      success: true,
      result: result
    }
  }

  @Post('draft')
  @UseGuards(JWTAuthGuard)
  async postDraftHandler(@Req() req: OGRequest, @Body() PostDraftDto: PostDraftDto){

    const result = await this.postService.postDraftHandler(PostDraftDto, req.user.userId)
    return {
      success: true,
      result: result
    }
  }

  @Delete('draft/:tempKey')
  @UseGuards(JWTAuthGuard)
  async deleteDraft(@Req() req: OGRequest, @Param('tempKey') tempKey: string){
    const result = await this.postService.deleteDraft(tempKey, req.user.userId)
    if(result){
      return {
        success: true,
        result: result
      }
    } else {
      return {
        success: false,
      }
    }
  }

  @Delete('all/draft')
  @UseGuards(JWTAuthGuard)
  async deleteAllDraft(@Req() req: OGRequest){
    const result = await this.postService.deleteAllDraft(req.user.userId)
    if(result){
      return {
        success: true
      }
    }

    return {
      success: false
    }
  }
}

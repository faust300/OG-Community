import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Req, UseGuards, Headers } from '@nestjs/common';
import { OGRequest } from '../extensions/auth/auth.request';
import { JWTAuthGuard } from '../extensions/auth/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ActKey, RMQService } from '../extensions/services/rmq.service';
import { BanInterceptor } from 'src/extensions/auth/ban-auth.interceptor';

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService, 
    private readonly rmqService: RMQService,
    ) { }

  @Post()
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async createComment(@Req() req: OGRequest, @Body() createCommentDto: CreateCommentDto) {
    // Todo : Insert Comment & reply
    const lang = req.lang
    const result = await this.commentService.createComment(req.user.userId, createCommentDto, lang)
    if(result){
      this.rmqService.publish(ActKey.COMMUNITY_CREATE_COMMENT, req.user.userId, {commentId: result.commentId, language: lang})
      return {
        success: true,
        result: {
          commentId: result.commentId
        } 
      }
    }
    return {
      success: false,
      result: null
    }
  }

  @Patch(':commentId')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async updateCommentByCommentId(@Req() req: OGRequest, @Param('commentId') commentId: number, @Body() updateCommentDto: UpdateCommentDto) {
    const lang = req.lang
    const result = await this.commentService.updateCommentByCommentId(req.user.userId, commentId, updateCommentDto)
    if(result){
      return {
        success: true,
        result: {
          commentId: result.commentId
        }
      }
    }
    return {
      success: false,
      result: commentId
    }
  }

  @Delete(':postId/:commentId')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async removeCommentByCommentId(@Req() req: OGRequest, @Param('postId') postId: number, @Param('commentId') commentId: number) {
    const lang = req.lang
    const result = await this.commentService.removeCommentByCommentId(req.user.userId, commentId)
    if(result){
      return {
        success: true,
        result: {
          commentId: result.commentId
        }
      }
    }
    return {
      success: false,
      result: commentId
    }
  }

  @Post(':commentId/upvote')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async updateUpVoteCommentByCommentId(@Req() req: OGRequest, @Param('commentId') commentId: number) {
    const lang = req.lang
    const result = await this.commentService.updateVoteCommentByCommentId(req.user.userId, commentId, 'up');
    if(result){
      this.rmqService.publish(ActKey.COMMUNITY_VOTE_COMMENT, req.user.userId, {commentId: commentId, language: lang})
      return {
        success: true,
        result: {
          commentId: result.commentId,
          voteCount: result.voteCount
        }
      }
    }
    return {
      success: false,
      result: commentId
    }
  }

  @Post(':commentId/downvote')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async updateDownVoteCommentByCommentId(@Req() req: OGRequest, @Param('commentId') commentId: number) {
    const lang = req.lang
    const result = await this.commentService.updateVoteCommentByCommentId(req.user.userId, commentId, 'down');
    if(result){
      this.rmqService.publish(ActKey.COMMUNITY_VOTE_COMMENT, req.user.userId, {commentId: commentId, language: lang})
      return {
        success: true,
        result: {
          commentId: result.commentId,
          voteCount: result.voteCount
        }
      }
    }
    return {
      success: false,
      result: commentId
    }
  }

  @Post(':commentId/report')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(BanInterceptor)
  async createReportCommentByCommentId(@Req() req: OGRequest, @Param('commentId') commentId: number, @Body() createReportDto: CreateReportDto) {
    const lang = req.lang
    const result = await this.commentService.createReportCommentByCommentId(req.user.userId, commentId, createReportDto)
    if(result){
      // this.rmqService.publish(ActKey.COMMUNITY_REPORT_COMMENT, req.user.userId, {commentId: commentId, language: lang})
      return {
        success: true,
        result: {
          commentId: result.commentId
        }
      }
    }
    return {
      success: false,
      result: commentId
    }
    
  }
}

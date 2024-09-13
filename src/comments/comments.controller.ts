import { Headers, Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Req, Query } from '@nestjs/common';
import { OGRequest } from '../extensions/auth/auth.request';
import { JWTAuthInterceptor } from '../extensions/auth/jwt-auth.interceptor';
import { CommentsService } from './comments.service';



@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Get(':postId')
  @UseInterceptors(JWTAuthInterceptor)
  async getCommentsByPostId(@Req() req: OGRequest, @Param('postId') postId: number, @Query('next') next: string | undefined = undefined) {
    const result =  await this.commentsService.getCommentsByPostId(req.user? req.user.userId : null, postId, next)
    return {
      success:true,
      result:result
    }
  }

  @Get('/reply/:parentId')
  @UseInterceptors(JWTAuthInterceptor)
  async getCommentsByParentId(@Req() req: OGRequest, @Param('parentId') parentId: string, @Query('next') next: string | undefined = undefined) {
    const result = await this.commentsService.getReplyCommentsByParentId(req.user? req.user.userId : null, Number(parentId), next)
    return {
      success:true,
      result:result
    }
  }
}

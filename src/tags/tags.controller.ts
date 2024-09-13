// import { Controller, Get, Param, Query, Req } from '@nestjs/common';
// import { TagsService } from './tags.service';
// import { OGRequest } from '../extensions/auth/auth.request';

// @Controller('tags')
// export class TagsController {
//   constructor(private readonly tagsService: TagsService) { }

//   @Get(':postId')
//   async getTagsByPostId(@Req() req: OGRequest, @Param('postId') postId: number) {
//     const result = await this.tagsService.getTagsByPostId(postId)
//     if(result){
//       return {
//         success: true,
//         result: result
//       }
//     }
//     return {
//       success: false,
//       result: null
//     }
    
//   }


//   // @Get()
//   // async getTagsByTopicId(@Req() req: OGRequest, @Query('topics') topics: string[] | null) {
//   //   const result = await this.tagsService.getTagsByTopicId(topics)
//   //   return {
//   //     success: true,
//   //     result: result
//   //   }
//   // }

//   @Get()
//   async getTags(@Req() req: OGRequest){
//     const result = await this.tagsService.getTags()
//     return {
//       success: true,
//       result: result
//     }
//   }

// }

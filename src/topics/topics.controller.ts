import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { OGRequest } from '../extensions/auth/auth.request';
import { JWTAuthGuard } from '../extensions/auth/jwt-auth.guard';
import { TopicsService } from './topics.service';
import { OGException } from 'src/extensions/exception/exception.filter';
import { Me } from 'src/user/dto/me.dto';

@Controller('topics')
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    ) {}

  @Get()
  async getTopics(@Req() req: OGRequest) {
    const result = await this.topicsService.getTopics();
    if (result) {
      return {
        success: true,
        result: result,
      };
    } else {
      return {
        success: false,
        result: null,
      };
    }
  }

  // @Get(':userName(@+[0-9a-zA-Z_]{1,30})')
  // async getUserPostTopics(
  //   @Req() req: OGRequest,
  //   @Param('userName') userName: string,
  // ){
  //   let convertUserName: string | undefined = undefined
  //   if(userName.includes('@')){
  //     convertUserName = userName.replace('@', '');
  //   }
  //   const user: Me = await this.topicsService.checkByUserName(convertUserName)
  //   if(!user){
  //     throw new OGException({
  //       errorCode: -208,
  //       errorMessage: 'Invalid User.',
  //     }, 400);
  //   }

  //   const result = await this.topicsService.getTopicListByUserName(user)
  //   if(result){
  //     return {
  //       success: true,
  //       result: result
  //     }
  //   }

  //   return {
  //     success: true,
  //     result: []
  //   }

  // }
  
}
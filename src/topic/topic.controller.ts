import { Body, Controller, Delete, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OGRequest } from '../extensions/auth/auth.request';
import { JWTAuthGuard } from '../extensions/auth/jwt-auth.guard';
import { CreateTopicDto } from './dto/create-topic.dto';
import { RequestTopicDto } from './dto/request-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicService } from './topic.service';
import { ActKey, RMQService } from '../extensions/services/rmq.service';

@Controller('topic')
export class TopicController {
  constructor(
    private readonly topicService: TopicService,
    private readonly rmqService: RMQService
    ) { }

  // @Post()
  // @UseGuards(JWTAuthGuard)
  // async createTopic(@Req() req: OGRequest, @Body() createTopicDto: CreateTopicDto) {
  //   const lang = req.lang
  //   const result = await this.topicService.createTopic(req.user.userId, createTopicDto, lang)
  //   if(result){
  //     this.rmqService.publish(ActKey.USER_SET_CUSTOM_TOPIC, req.user.userId, {language: lang})
  //     return {
  //       success:true,
  //       result:{
  //         topicId:result
  //       }
  //     }
  //   }
  //   return {
  //     success:false,
  //     result:{
  //       message:'create topic failed'
  //     }
  //   }
  // }

  // @Patch(':topicUserDefinedId')
  // @UseGuards(JWTAuthGuard)
  // async updateTopicByTopicUserDefinedId(@Req() req: OGRequest, @Param('topicUserDefinedId') topicUserDefinedId: number, @Body() updateTopicDto: UpdateTopicDto) {
  //   const lang = req.lang
  //   const result = await this.topicService.updateTopic(req.user.userId, topicUserDefinedId, updateTopicDto, lang)
  //   if(result){
  //     return {
  //       success:true,
  //       result:{
  //         definedTopicId:result
  //       }
  //     }
  //   }
  //   return {
  //     successs: false,
  //     result: {
  //       message: 'update topic failed'
  //     }
  //   }
  // }

  // @Delete(':topicUserDefinedId')
  // @UseGuards(JWTAuthGuard)
  // async removeTopic(@Req() req: OGRequest, @Param('topicUserDefinedId') removeTopicId: number) {
  //   const result = await this.topicService.removeTopic(req.user.userId, removeTopicId)
  //   if(result){
  //     return {
  //       success: true,
  //       result: {
  //         definedTopicId: result
  //       }
  //     }
  //   }
  //   return {
  //     success: false,
  //     result: {
  //       message: 'Already deleted'
  //     }
  //   }
  // }

  // @Post('/request')
  // @UseGuards(JWTAuthGuard)
  // async requestTopic(@Req() req: OGRequest, @Body() requestTopicDto: RequestTopicDto) {
  //   const lang = req.lang
  //   const result = await this.topicService.requestTopic(req.user.userId, requestTopicDto, lang)
  //   if(result){
  //     return {
  //       success: true
  //     }
  //   }
  //   return {
  //     success: false
  //   }
  // }

}

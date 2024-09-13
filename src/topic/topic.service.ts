import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { SQL } from 'sql-template-strings';
import { ConnectionService } from '../extensions/services/connection.service';
import { OkPacket } from 'mysql2';
import { OGException } from '../extensions/exception/exception.filter';
import { RequestTopicDto } from './dto/request-topic.dto';

@Injectable()
export class TopicService {
  constructor(private readonly ConnectionService: ConnectionService) { }

  // // custom topic
  // async createTopic(userId: number, createTopicDto: CreateTopicDto, lang: string = 'EN'): Promise<number | undefined>{
  //   try {
  //     const query = SQL`
  //     INSERT INTO TopicUserDefined
  //       (
  //         TopicUserDefined.userId,
  //         TopicUserDefined.order,
  //         TopicUserDefined.language,
  //         TopicUserDefined.name,
  //         TopicUserDefined.topics,
  //         TopicUserDefined.tags
  //       )
  //     VALUES
  //       (
  //         ${userId},
  //         (
  //           SELECT
  //             orderCount
  //           FROM
  //             (
  //             SELECT
  //               IFNULL(MAX(TopicUserDefined.order) + 1, 1) as orderCount
  //             FROM
  //               TopicUserDefined
  //             WHERE
  //               userId = ${userId}
  //             ) AS orderCount
  //         ),
  //         ${lang},
  //         ${createTopicDto.name},
  //         JSON_ARRAY(${createTopicDto.topic}),
  //         JSON_ARRAY(${createTopicDto.tag})
  //       )
  //     `
  //     const result = await this.ConnectionService.connectionPool.writerQuery<OkPacket>(query);
  //     if(result.affectedRows > 0){
  //       return result.insertId
  //     } else {
  //       return undefined
  //     }
  //   } catch (error) {
  //     console.log(error)
  //     throw new OGException({
  //       errorCode: -231,
  //       errorMessage: "Internal Server Error"
  //     }, 500);
  //   }
  // }

  // async updateTopic(userId: number, definedId: number, updateTopicDto: UpdateTopicDto, lang: string = 'EN'): Promise<number | undefined>{

  //   try {
  //     const query = SQL`
  //     UPDATE
  //       TopicUserDefined
  //     SET
  //       TopicUserDefined.order = ${updateTopicDto.order},
  //       TopicUserDefined.language = ${lang},
  //       TopicUserDefined.name = ${updateTopicDto.name},
  //       TopicUserDefined.topics = JSON_ARRAY(${updateTopicDto.topic}),
  //       TopicUserDefined.tags = JSON_ARRAY(${updateTopicDto.tag})
  //     WHERE
  //       TopicUserDefined.id = ${definedId} AND
  //       TopicUserDefined.userId = ${userId} AND
  //       TopicUserDefined.deletedAt IS NULL
  //     `
  //     const result = await this.ConnectionService.connectionPool.writerQuery<OkPacket>(query);
  //     if(result.affectedRows > 0){
  //       return definedId
  //     } else {
  //       return undefined
  //     }
  //   } catch (error) {
  //     console.log(error)
  //     throw new OGException({
  //       errorCode: -232,
  //       errorMessage: "internal server error"
  //     }, 500);
  //   }
  // }

  // async removeTopic(userId: number, removeTopicId: number): Promise<number | undefined> {
  //   try {
  //     const query = SQL`
  //       UPDATE
  //         TopicUserDefined
  //       SET
  //         deletedAt = NOW()
  //       WHERE
  //         id = ${removeTopicId} AND
  //         userId = ${userId} AND
  //         deletedAt IS NULL
  //     `
  //     const result = await this.ConnectionService.connectionPool.writerQuery<OkPacket>(query);
  //     if(result.affectedRows > 0){
  //       return removeTopicId
  //     } else {
  //       return undefined
  //     }
  //   } catch (error) {
  //     console.log(error)
  //     throw new OGException({
  //       errorCode: -233,
  //       errorMessage: "internal server error"
  //     }, 500);
  //   }
  // }
  // // custom topic


  // async requestTopic(userId: number, requestTopicDto: RequestTopicDto, lang: string = 'EN'): Promise<boolean> {
  //   try {
  //     const query = SQL`
  //     INSERT INTO TopicRequest
  //       (
  //         userId,
  //         userName,
  //         lang,
  //         reason
  //       )
  //       VALUES
  //       (
  //         ${userId},
  //         ${requestTopicDto.name},
  //         ${lang},
  //         ${requestTopicDto.reason}
  //       )
  //     `
  //     const result = await this.ConnectionService.connectionPool.writerQuery<OkPacket>(query);
  //     if(result.affectedRows > 0){
  //       return true
  //     } else {
  //       return false
  //     }
  //   } catch (error) {
  //     console.log(error)
  //     throw new OGException({
  //       errorCode: -234,
  //       errorMessage: "internal server error"
  //     }, 500);
  //   }
  // }
}

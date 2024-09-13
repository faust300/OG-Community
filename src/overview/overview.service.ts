import { Injectable } from '@nestjs/common';
import { ConnectionService } from 'src/extensions/services/connection.service';
import SQL from 'sql-template-strings';
import { Overview } from './entities/overview.entity';
import {
  OverviewTopic,
  OverviewTopicData,
  OverviewTopicName,
} from './dto/overview-topic.dto';
import { OverviewBest } from './dto/overview-best.dto';
import { OverviewOg } from './og/overview-og.entity';
import { OverviewToday } from './entities/today/overview-today.entity';
import { OverviewDefaultPost } from './entities/default-overview.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OGException } from 'src/extensions/exception/exception.filter';
import { OverviewData, OverviewDataDTO } from './entities/overview-data.entity';
import { Post } from 'src/post/entities/post.entity';
import { OverviewTemplateDTO } from './dto/overview.dto';

@Injectable()
export class OverviewService {
  constructor(
    private readonly connectionService: ConnectionService,

    @InjectRepository(Overview)
    private readonly overviewRepository: Repository<Overview>,

    @InjectRepository(OverviewData)
    private readonly overviewDataRepository: Repository<OverviewData>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  async getOverviewTemplate(): Promise<OverviewTemplateDTO[]> {

    try {
      const queryObj = await this.overviewRepository.find();

      return queryObj.map(item => item.convertOverviewTemplateDTO(item));
    } catch (e) {
      console.error(e);
    }

    return [];
  }

  async getOverviewData(key: string): Promise<OverviewDataDTO | undefined> {
    try {

      const queryObj = await this.overviewDataRepository.findOneBy({
        key
      })

      return queryObj.convertOverviewDataDTO(queryObj);
    } catch (e) {
      console.error(e);
    }

    return undefined;
  }

  async getPostByPostIds(postIds: number[]): Promise<OverviewBest[]> {
    try {
      const queryObj = await this.postRepository.find({
        relations: {
          tagRelation: true
        },
        where: {
          postId: In(postIds)
        }
      });

      return queryObj.map(item => item.convertOverviewBest(item));
    } catch (e) {
      console.error(e);
    }

    return [];
  }

  /** if getPostByPostIds function return error, this function call */
  async getPostByRecent(): Promise<OverviewBest[]> {
    try {

      const queryObj = await this.postRepository.find({
        order: {
          createdAt: 'DESC'
        },
        take: 10
      })

      return queryObj.map(item => item.convertOverviewBest(item));
    } catch (e) {
      console.error(e);
    }

    return [];
  }

  async getTopics(): Promise<OverviewTopicData[]> {

    try {
      const queryObj = await this.overviewDataRepository.findOneBy({
        key: 'TOPIC'
      })

      return queryObj.convertOverviewTopic(queryObj);
    } catch (e) {
      console.error(e);
    }

    return [];
  }

  async getOverviewPickedPosts(
    userId: number | undefined,
    inputKey: string
  ): Promise<OverviewDefaultPost[] | undefined> {
    const getKeys = await this.overviewDataRepository.find();;

    let valueOfKey: Array<any> = [];
    for (let i = 0; i < getKeys.length; i++) {
      if (
        getKeys[i].key.trim().toLowerCase() === inputKey.trim().toLowerCase()
      ) {
        valueOfKey = getKeys[i].data as any;
        break;
      }
    }

    if (valueOfKey.length === 0) {
      return undefined;
    }

    const queryObj = await this.postRepository.createQueryBuilder('post')
    .leftJoinAndSelect('post.user', 'user')
    .leftJoinAndSelect('user.title', 'title')
    .leftJoinAndSelect('post.tagRelation', 'tag')
    .select('post.id', 'postId')
    .addSelect('post.dataType', 'dataType')
    .addSelect('user.id', 'userId')
    .addSelect('user.name', 'userName')
    .addSelect('user.profileImagePath', 'userProfilePath')
    .addSelect('user.titleId', 'titleId')
    .addSelect(`IFNULL(title.i18n->>'$.EN', title.name)`, 'userTitleName')
    .addSelect('post.authorName', 'authorName')
    .addSelect('post.authorProfilePath', 'authorProfilePath')
    .addSelect('post.authorLink', 'authorLink')
    .addSelect('post.authorType', 'authorType')
    .addSelect('post.authorReservation1', 'authorReservation1')
    .addSelect('post.authorReservation2', 'authorReservation2')
    .addSelect('post.originLink', 'originLink')
    .addSelect('post.thumbnail', 'thumbnail')
    .addSelect('post.title', 'title')
    .addSelect('post.contents', 'contents')
    .addSelect('post.viewCount', 'viewCount')
    .addSelect('post.commentCount', 'commentCount')
    .addSelect('post.voteCount', 'voteCount')
    .addSelect('post.reportCount', 'reportCount')
    .addSelect('post.reportStatus', 'reportStatus')
    .addSelect(`(
      SELECT
        voteType
      FROM
        PostVote AS PV
      WHERE
        PV.userId = ${userId ?? null} AND
        PV.postId = post.id AND
        PV.deletedAt IS NULL
    )`, 'vote')
    .addSelect('post.createdAt', 'createdAt')
    .addSelect('post.updatedAt', 'updatedAt')
    .addSelect('post.deletedAt', 'deletedAt')
    .where('post.deletedAt IS NULL')
    .andWhere('post.id IN (:ids)', {ids: valueOfKey})
    .groupBy('post.id')
    .execute();

    return queryObj;
  }

  async getOverviewRawData(key: string): Promise<OverviewDataDTO | undefined> {
    const overviewRawData = await this.overviewDataRepository.findOneBy({
      key
    });

    return overviewRawData;
  }
}

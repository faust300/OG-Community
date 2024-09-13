import { Injectable } from '@nestjs/common';
import { SQL } from 'sql-template-strings';
import { ConnectionService } from '../extensions/services/connection.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Me } from 'src/user/dto/me.dto';
import crypto from 'crypto';
import { ReturnRecommendTopic } from 'src/topic/dto/recommend-topic.dto';

// export interface Topic {
//   topicId: number;
//   topic: string;
//   tags: string[];
//   topics: string[];
//   name: string;
//   subTitle?: string | null;
//   imagePath: string | null;
//   iconPath: string;
//   description: string;
//   style: any | null;

//   subTopics?: SubTopic[];
// }

// export interface SubTopic extends Topic {
//   breadCrumb: string[];
//   chartDataId: string | null;
//   extras: any;
// }



interface GoToTopic {
    dataType: string;
    description: string;
    topics: Topic[];
    matchingKeyword: string;
}

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly connectionService: ConnectionService,
    ) {}


  async checkByUserName(userName: string | undefined): Promise<Me | undefined> {
    const user = await this.userRepository.findOne({where: {name: userName}});
    if (user) return new Me(user);
    return undefined;

  }
  async getTopics(): Promise<Topic[]> {
    try {

      const topics = await this.topicRepository.find();
      
      return topics
    } catch (e) {
      console.log(e);
      return [];
    }
  }


  async recommendTopics(): Promise<ReturnRecommendTopic>{
    try {

      const randomNum = (min: number, max: number) => {
        var randNum = Math.floor(Math.random()*(max-min+1)) + min;
        return randNum;
      }

      const topicTypeArray = ['cryptocurrency','nft']
      const recommendTopicGroup: 'cryptocurrency' | 'nft' = topicTypeArray[randomNum(0,1)] as 'cryptocurrency' | 'nft' 

      const topics: Topic[] = await this.topicRepository.find({
        where: {type: recommendTopicGroup},
      })
      const returnValue = {
        dataType: 'topics',
        description: `Talk about your favorite ${recommendTopicGroup ? recommendTopicGroup : 'nft'}`,
        topics: topics,
        matchingKeyword: recommendTopicGroup
      }
      return returnValue
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }

  async getTopicListByUserName(user: Me){
    
    const topicList = await this.tagRepository.createQueryBuilder('Tag')
      .select('Tag.name', 'topic')
      .addSelect('Topic.type', 'type')
      .addSelect('Topic.synonyms', 'synonyms')
      .addSelect('Topic.imagePath', 'imagePath')
      .addSelect('Topic.iconPath', 'iconPath')
      .addSelect('Topic.symbol', 'symbol')
      .addSelect('Topic.description', 'description')
      .addSelect('Topic.chartDataId', 'chartDataId')
      .addSelect('Topic.externalLinks', 'externalLinks')
      .addSelect('Topic.createdAt', 'createdAt')
      .addSelect('Topic.deletedAt', 'deletedAt')
      .addSelect('COUNT(Tag.name)', 'usingCount')
      .leftJoin(Topic, 'Topic', 'Topic.name = Tag.name')
      .where('userId = :userId', {userId: user.userId})
      .groupBy('Tag.name')
      .orderBy('COUNT(Tag.name)', 'DESC')
      .getRawMany()
      return topicList

  }
}
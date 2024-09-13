// import { Injectable } from '@nestjs/common';
// import { User } from '../user/entities/user.entity';
// import { SQL, SQLStatement } from 'sql-template-strings';
// import { ConnectionService } from '../extensions/services/connection.service';
// import { Tag, TopicTags } from './entities/tag.entity';
// import { OGException } from '../extensions/exception/exception.filter';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, QueryRunner, DataSource } from 'typeorm';
// import { TopicTag } from './entities/topicTag.entity';

// @Injectable()
// export class TagsService {

//   @InjectRepository(Tag)
//   private readonly tagRepository: Repository<Tag>
//   @InjectRepository(TopicTag)
//   private readonly topicTagsRepository: Repository<TopicTag>
//   private readonly dataSource: DataSource

//   constructor(private readonly ConnectionService: ConnectionService) { }

//   async getTagsByPostId(postId: number): Promise<string[]> {
//     try {
//       const tags = await this.tagRepository.createQueryBuilder()
//         .where('postId = :postId', { postId: postId })
//         .getRawMany()      
//       const mappingTags: string[] = []
//       tags.map(tag => {
//         mappingTags.push(tag.Tag_name)
//       })
//       return mappingTags
//     } catch (error) {
//       console.log(error)
//       throw new OGException({
//         errorCode: -241,
//         errorMessage: "Internal Server Error"
//       }, 500);
//     }
//   }

//   // async getTagsQuery(topic: string[] | null) {
//   //   const QueryRunner = this.dataSource.createQueryRunner('slave');
//   //   const tags = await this.tagRepository.createQueryBuilder()
//   //     .select('Tag.name')
//   //     .addSelect('count(Tag.name)', 'count')
//   //     .groupBy('Tag.name')
//   //     .orderBy('count', 'DESC')
//   //     .setQueryRunner(QueryRunner)
//   //     .limit(10)

//   //   return tags
//   // }

//   async getTagsByTopicId(topic: string[]) {
//     const QueryRunner = this.dataSource.createQueryRunner('slave');
//     try {
      
    
//     const tags = await this.tagRepository.createQueryBuilder()
//       .select('Tag.name')
//       .addSelect('count(Tag.name)', 'count')
//       .groupBy('Tag.name')
//       .orderBy('count', 'DESC')
//       .setQueryRunner(QueryRunner)
//       .limit(10)
//       .getRawMany()

//       if(tags.length > 0){
//         tags.map(tag => tag.name.toLowerCase())
//         return tags
//       } else {
//         return []
//       }
//     } catch (error) {
//       console.log(error)
//       throw new OGException({
//         errorCode: -241,
//         errorMessage: "Internal Server Error"
//       }, 500);
//     }
//   }

//   async getTags(){
//     try {

//       const getTopicTags = await this.topicTagsRepository.find()
//       return getTopicTags

//     } catch (error) {
//       console.log(error)
//       throw new OGException({
//         errorCode: -241,
//         errorMessage: "Internal Server Error"
//       }, 500);
//     }
//   }
// }

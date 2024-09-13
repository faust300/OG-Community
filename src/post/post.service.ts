import { Injectable } from '@nestjs/common';
import { CreatePostRequetDto } from './dto/create-post.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ConnectionService } from '../extensions/services/connection.service';
import { SQL } from 'sql-template-strings';
import {
  Post,
  PostContent,
  ReturnPostDelete,
} from './entities/post.entity';
import { OGException } from '../extensions/exception/exception.filter';
import { PostDraftDto } from './dto/post-draft.dto';
import { PostDraft } from './entities/draft.entity';
import { DataSource, Repository, Not, MoreThanOrEqual, LessThan, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserSignType } from 'src/user/entities/user.entity';
import { UserTitle } from 'src/user/entities/title/user-title.entity';
import { Title } from 'src/user/entities/title/title.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { ReturnPost } from './dto/return-post.dto';
import { PostVote } from './entities/postVote.entity';
import { PostReport } from './entities/postReport.entity';
import { Me } from 'src/user/dto/me.dto';
import { UserGradeMap } from 'src/user/entities/grade-map/user-grade-map.entity';
import { UserProfileDto } from 'src/user/dto/profile.dto';
import moment from 'moment';
import { CommentVote } from 'src/comment/entities/commentVote.entity';

export interface ViewUserCheck {
  postId: number;
}

@Injectable()
export class PostService {
  constructor(

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserGradeMap)
    private readonly userGradeMapRepository: Repository<UserGradeMap>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,
    @InjectRepository(PostDraft)
    private readonly postDraftRepository: Repository<PostDraft>,
    @InjectRepository(PostReport)
    private readonly postReportRepository: Repository<PostReport>,
    @InjectRepository(CommentVote)
    private readonly commentVoteRepository: Repository<CommentVote>,

    private dataSource: DataSource,
    private readonly connectionService: ConnectionService
    ) {}

  async getUserByUserId(userId: number): Promise<Me | undefined> {

    const user = await this.userRepository.findOne({where: {id: userId}});
    if (user) return new Me(user);
    return undefined;
  }

  async getUserGrade(userId: number) {
    const grade = await this.userGradeMapRepository.findOne({where: {userId: userId}});
    return grade
  }
  /////////////////////////////////////////
  // getPostByPostIdQuery(userId: number | undefined, postId: number): SQLStatement {
  //   const query = SQL`
  //     SELECT
  //       P.id as postId,
  //       P.dataType,
  //       P.userId,
  //       UT.name AS userName,
  //       UT.profileImagePath AS userProfilePath,
  //       UT.titleId,
  //       TT.name AS userTitleName,
  //       P.authorId,
  //       P.authorName,
  //       P.authorprofilePath,
  //       P.authorLink,
  //       P.authorType,
  //       P.authorReservation1,
  //       P.authorReservation2,
  //       P.originLink,
  //       P.topicId,
  //       TP.name AS topic,
  //       TP.iconPath AS topicIconPath,
  //       P.title,
  //       P.contents,
  //       P.thumbnail,
  //       P.viewCount,
  //       P.voteCount,
  //       P.commentCount,
  //       P.hasReferral,
  //       P.isNSFW,
  //       P.createdAt,
  //       P.updatedAt,
  //       (
  //         SELECT
  //           voteType
  //         FROM
  //           PostVote AS PV
  //         WHERE
  //           PV.userId = ${userId ? userId : null} AND
  //           PV.postId = P.id AND
  //           PV.deletedAt IS NULL
  //       ) AS vote,
	// 			IF(userId = ${userId ? userId : null}, true, false) AS isMine,
  //       P.isEdit
  //     FROM
  //       Post AS P
  //     JOIN
  //       User AS UT
  //     ON
  //       UT.id = P.userId
  //     LEFT JOIN
  //       Title AS TT
  //     ON
  //       TT.id = UT.titleId
  //     LEFT JOIN
  //       Topic AS TP
  //     ON
  //       TP.id = P.topicId
  //     WHERE
  //       P.id = ${postId} AND
  //       P.deletedAt IS NULL
  //   `;
  //   return query;
  // }

  async upsertPostViewCount(
    userId: number,
    postId: number,
    ip: string | undefined
  ): Promise<boolean> {
    try {
      const ipA = ip ? ip.split('.')[0] : 0;
      const ipB = ip ? ip.split('.')[1] : 0;
      const ipC = ip ? ip.split('.')[2] : 0;
      const ipD = ip ? ip.split('.')[3] : 0;

      const upsertView = await this.dataSource.query(`
        INSERT INTO PostViewHistory
          (postId, userId, ipA, ipB, ipC, ipD, count)
        VALUES
          (${postId}, ${userId}, ${ipA}, ${ipB}, ${ipC}, ${ipD}, 1)
        ON DUPLICATE KEY UPDATE
          count = count + 1
      `)
        
      if(upsertView.affectedRows > 0){
        return true
      }
      return false;
    } catch (error) {
      console.log(error)
      throw new OGException(
        {
          errorCode: -217,
          errorMessage: 'Failed to upsert post view count',
        },
        500,
      );
    }

  }

  async getPostByPostId(
    userId: number,
    postId: number,
  ): Promise<ReturnPost | undefined> {
    const queryRunner = this.dataSource.createQueryRunner('slave');
    // const user = await this.getUserByUserId(userId);
    
    try {

      const postResult = this.postRepository.createQueryBuilder('Post')
        .select()
        .leftJoinAndSelect(User, 'user', 'user.id = Post.userId')
        .leftJoinAndSelect(Title, 'title', 'title.id = user.titleId')
        .leftJoinAndSelect(UserGradeMap, 'userGradeMap', 'userGradeMap.userId = user.id')
        .leftJoinAndSelect('Post.tag', 'tag')
        .addSelect(subQuery => {
          return subQuery
            .select('PostVote.voteType', 'voteType')
            .from(PostVote, 'PostVote')
            .where('PostVote.userId = :userId', {userId: userId})
            .andWhere('PostVote.postId = :postId', {postId: postId})
            .andWhere('PostVote.deletedAt IS NULL')
        }, 'vote')
        // .groupBy('Post.id')
        .setQueryRunner(queryRunner)
        .where('Post.id = :postId', {postId: postId})

      const excuteResult = await postResult.getRawAndEntities()
      const tagResult = await this.tagRepository.createQueryBuilder('Tag')
        .where('Tag.postId = :postId', {postId: postId})
        .getRawAndEntities();
      const tagArray: string[] = []
      tagResult.raw.map((tag: any) => {
        tagArray.push(tag.Tag_name)
      })
      const returnPost: ReturnPost = {
        postId: excuteResult.entities[0].postId,
        lang: excuteResult.entities[0].lang,
        dataType: excuteResult.entities[0].dataType,
        userId: excuteResult.raw[0].user_id,
        userName: excuteResult.raw[0].user_name,
        userProfilePath: excuteResult.raw[0].user_profileImagePath ? excuteResult.raw[0].user_profileImagePath : null,
        userTitle: excuteResult.raw[0].user_titleId,
        userTitleName: excuteResult.raw[0].title_name,
        authorId: excuteResult.entities[0].authorId,
        authorName: excuteResult.entities[0].authorName,
        authorProfilePath: excuteResult.entities[0].authorProfilePath,
        authorLink: excuteResult.entities[0].authorLink,
        authorType: excuteResult.entities[0].authorType,
        authorReservation1: excuteResult.entities[0].authorReservation1,
        authorReservation2: excuteResult.entities[0].authorReservation2,
        originLink: excuteResult.entities[0].originLink,
        title: excuteResult.entities[0].title,
        contents: excuteResult.entities[0].contents,
        thumbnail: excuteResult.entities[0].thumbnail ? excuteResult.entities[0].thumbnail : null,
        imageCount: excuteResult.entities[0].imageCount,
        viewCount: excuteResult.entities[0].viewCount,
        commentCount: excuteResult.entities[0].commentCount,
        voteCount: excuteResult.entities[0].upVoteCount,
        createdAt: excuteResult.entities[0].createdAt,
        updatedAt: excuteResult.entities[0].updatedAt,
        vote: excuteResult.raw[0].vote,
        isMine: excuteResult.raw[0].user_id === userId ? true : false,
        isEdit: excuteResult.entities[0].isEdit,
        isNSFW: excuteResult.entities[0].isNSFW,
        isVerified: Boolean(excuteResult.raw[0].userGradeMap_isVerified),
        hasReferral: excuteResult.entities[0].hasReferral,
        tags: tagArray,
      }
      
      return returnPost
      
    } catch (e) {
      console.log(e)
    } finally {
      await queryRunner.release();
    }

    // return postResult
    return undefined;
  }
  /////////////////////////////////////////

  // legacy
  // async getContents(contents: string): Promise<string | EditorJS> {
  //   try {
  //     return await JSON.parse(String(contents));
  //   } catch (e) {
  //     return contents;
  //   }
  // };

  async createPost(
    userId: number,
    createPostRequestDto: CreatePostRequetDto,
  ): Promise<number | undefined> {
    const user = await this.getUserByUserId(userId);
    const grade = await this.getUserGrade(userId)
    if (createPostRequestDto.tags.includes('OG')) {
      if (!grade.isSuper) {
        if (!grade.isAdmin) {
          if (!grade.isOg) {
            throw new OGException({
              errorCode: -210,
              errorMessage: 'You are not OG',
            });
          }
        }
      }
    }

    if (createPostRequestDto.tags.length > 5) {
      throw new OGException({
        errorCode: -210,
        errorMessage: 'Too many tags',
      });
    }

    const regEx = /^[가-힇A-Za-z0-9_ \u4e00-\u9fff \p{Emoji}]/u;
    const tags = createPostRequestDto.tags;

    let tagConvert: string[] = [];
    if (!Array.isArray(tags)) {
      tagConvert = Array(tags);
    } else {
      tagConvert = tags;
    }

    if (tagConvert.length > 5) {
      throw new OGException({
        errorCode: -210,
        errorMessage: 'Too many tags',
      });
    }

    const lowerTagArray = tagConvert.map((tag) => tag.toLowerCase());

    const tagArrayLength = lowerTagArray.length;
    const dupLength = new Set(lowerTagArray).size;
    if (tagArrayLength != dupLength) {
      throw new OGException({
        errorCode: -210,
        errorMessage: 'Duplicated tags',
      });
    }

    for (let tag of lowerTagArray) {
      if (regEx.test(tag) == false) {
        console.log(tag)
        throw new OGException({
          errorCode: -210,
          errorMessage: 'Invalid tags',
        });
      }
    }

    // let text: string = '';
    // if (contents.version == '3.0.0') {
    // } else {
    //   for (let i of contents.blocks as EditorJSBlock[]) {
    //     if (i.data.text) {
    //       text += i.data.text;
    //     }
    //   }
    // }

    // if (text.length < 5) {
    //   throw new OGException({
    //     errorCode: -210,
    //     errorMessage: 'Contents is too short',
    //   });
    // }

    const appConfig =
      await this.connectionService.connectionPool.readerQuerySingle<{
        [key: string]: number;
      }>(
        SQL`SELECT AppConfig.value FROM AppConfig WHERE AppConfig.key = 'CONTENTS_LIMIT'`,
      );
    const contentsLimit = (appConfig && appConfig['value']) ?? 3000;

    // if (text.length > Number(contentsLimit)) {
    //   throw new OGException({
    //     errorCode: -210,
    //     errorMessage: 'Contents is too long',
    //   });
    // }

      const queryRunner = this.dataSource.createQueryRunner('master');
      await queryRunner.connect();
      await queryRunner.startTransaction();
    try {

      const createPost = await this.postRepository.createQueryBuilder()
        .insert()
        .into(Post)
        .values({
          userId: user.userId,
          userName: user.name,
          userProfilePath: user.profileImagePath,
          userTitle: user.titleId,
          title: createPostRequestDto.title,
          contents: JSON.stringify(createPostRequestDto.contents),
          thumbnail: createPostRequestDto.thumbnail ? createPostRequestDto.thumbnail : null,
          hasReferral: createPostRequestDto.hasReferral ? createPostRequestDto.hasReferral : false,
          isNSFW: createPostRequestDto.isNSFW ? createPostRequestDto.isNSFW : false,
          imageCount: createPostRequestDto.imageCount ? createPostRequestDto.imageCount : 0,
        })
        .setQueryRunner(queryRunner)
        // .returning('id')
        .execute();
        

        await this.postDraftRepository.createQueryBuilder()
          .update({deletedAt: new Date()})
          .where('userId = :userId', {userId: userId})
          .andWhere('tempKey = :tempKey', {tempKey: createPostRequestDto.tempKey})
          .setQueryRunner(queryRunner)
          .execute();
        
        if(createPostRequestDto.tags.length > 0){
          const InsertTag = await this.tagRepository.createQueryBuilder()
            .insert()
            .into(Tag)
            .values(
              createPostRequestDto.tags.map((tag) => ({
                postId: createPost.identifiers[0].postId,
                userId: userId,
                name: tag,
              })
            ))
            .setQueryRunner(queryRunner)
            .execute();
        }

        await queryRunner.commitTransaction();
        return createPost.identifiers[0].postId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error)
      throw new OGException(
        {
          errorCode: -210,
          errorMessage: 'Post creation failed',
        },
        500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updatePostByPostId(
    userId: number,
    updatePostDto: UpdatePostDto,
    postId: number,
  ): Promise<number | undefined> {
    const user = await this.getUserByUserId(userId);
    const contents: PostContent = updatePostDto.contents;
    const grade = await this.getUserGrade(userId)
    if (updatePostDto.tags.includes('OG')) {
      if (!grade.isSuper) {
        if (!grade.isAdmin) {
          if (!grade.isOg) {
            throw new OGException({
              errorCode: -210,
              errorMessage: 'You are not OG',
            });
          }
        }
      }
    }

    const regEx = /^[가-힇A-Za-z0-9_ \u4e00-\u9fff \p{Emoji}]{1,15}$/u;
    const tags = updatePostDto.tags;

    let tagConvert: string[] = [];
    if (!Array.isArray(tags)) {
      tagConvert = Array(tags);
    } else {
      tagConvert = tags;
    }

    if (tagConvert.length > 5) {
      throw new OGException({
        errorCode: -211,
        errorMessage: 'Too many tags',
      });
    }

    const lowerTagArray = tagConvert.map((tag) => tag.toLowerCase());

    const tagArrayLength = lowerTagArray.length;
    const dupLength = new Set(lowerTagArray).size;
    if (tagArrayLength != dupLength) {
      throw new OGException({
        errorCode: -211,
        errorMessage: 'Duplicated tags',
      });
    }

    for (let tag of lowerTagArray) {
      if (regEx.test(tag) == false) {
        throw new OGException({
          errorCode: -211,
          errorMessage: 'Invalid tags',
        });
      }
    }

    const queryRunner = this.dataSource.createQueryRunner('master');
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {

      const updatePost = await this.postRepository.createQueryBuilder()
        .update(Post)
        .set({
          topicId: 0,
          userId: user.userId,
          userName: user.name,
          userProfilePath: user.profileImagePath,
          userTitle: user.titleId,
          title: updatePostDto.title,
          contents: JSON.stringify(updatePostDto.contents),
          thumbnail: updatePostDto.thumbnail,
          hasReferral: updatePostDto.hasReferral,
          isNSFW: updatePostDto.isNSFW,
          isEdit: true,
        })
        .setQueryRunner(queryRunner)
        .where('id = :id', {id: postId})
        .andWhere('userId = :userId', {userId: user.userId})
        .andWhere('deletedAt IS NULL')
        .execute();
      
      await this.postDraftRepository.createQueryBuilder()
        .update({deletedAt: new Date()})
        .where('userId = :userId', {userId: userId})
        .andWhere('tempKey = :tempKey', {tempKey: updatePostDto.tempKey})
        .setQueryRunner(queryRunner)
        .execute();
        
      const deleteOldTags = await this.tagRepository.createQueryBuilder()
        .delete()
        .from(Tag)
        .where('postId = :postId', {postId: postId})
        .setQueryRunner(queryRunner)
        .execute();

      const insertTags = await this.tagRepository.createQueryBuilder()
        .insert()
        .into(Tag)
        .values(
          updatePostDto.tags.map((tag) => ({
            postId: postId,
            userId: userId,
            name: tag,
          })
        ))
        .setQueryRunner(queryRunner)
        .execute();
        
      await queryRunner.commitTransaction();
      return postId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new OGException(
        {
          errorCode: -211,
          errorMessage: 'Post update failed',
        },
        500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async removePostByPostId(
    userId: number,
    postId: number,
  ): Promise<ReturnPostDelete> {
    const user = await this.getUserByUserId(userId);
    const queryRunner = this.dataSource.createQueryRunner('master');
    if (Boolean(user.isAdmin) || Boolean(user.isSuper)) {
      try {

        const deleteAdminPost = await this.postRepository.createQueryBuilder()
          .update(Post)
          .softDelete()
          .where('id = :id', {id: postId})
          .andWhere('deletedAt IS NULL')
          .setQueryRunner(queryRunner)
          .execute();

        
        if(deleteAdminPost.affected > 0){
          return {
            success: true,
            postId: postId,
            admin: true,
          }
        } else {
          return {
            success: false,
            postId: postId,
            admin: true,
          }
        }

      } catch (error) {
        console.log(error);
        throw new OGException(
          {
            errorCode: -213,
            errorMessage: 'Post remove failed',
          },
          500,
        );
      } finally {
        await queryRunner.release();
      }
    } else {
      try {
        
        const deleteUserPost = await this.postRepository.createQueryBuilder()
          .update(Post)
          .softDelete()
          .where('id = :id', {id: postId})
          .andWhere('userId = :userId', {userId: user.userId})
          .andWhere('deletedAt IS NULL')
          .setQueryRunner(queryRunner)
          .execute();

        if(deleteUserPost.affected > 0){
          return {
            success: true,
            postId: postId,
            admin: false,
          }
        } else {
          return {
            success: false,
            postId: postId,
            admin: false,
          }
        }

      } catch (error) {
        console.log(error);
        throw new OGException(
          {
            errorCode: -213,
            errorMessage: 'Post remove failed',
          },
          500,
        );
      } finally {
        await queryRunner.release();
      }
      
    }

  }

  async updateVotePostByPostId(
    userId: number,
    postId: number,
    voteType: string,
  ) {

    const queryRunner = this.dataSource.createQueryRunner('master');
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      const voteUpdate = await this.postVoteRepository.query(`
        INSERT INTO
          PostVote
          (
            postId,
            userId,
            voteType
          )
          VALUES
          (
            ${postId},
            ${userId},
            '${voteType}'
          )
        ON DUPLICATE KEY UPDATE
        deletedAt = IF(voteType = '${voteType}', IF(deletedAt IS NULL, CURRENT_TIMESTAMP, NULL), NULL),
        voteType = '${voteType}'
      `);
      if(voteUpdate.affectedRows > 0){
        const voteCount = await this.postRepository.createQueryBuilder()
        .where('id = :id', {id: postId})
        .andWhere('deletedAt IS NULL')
        .setQueryRunner(queryRunner)
        .getOne();

        await queryRunner.commitTransaction();
  
        return {
          postId: postId,
          voteCount: voteCount.upVoteCount,
        };
      } else {
        await queryRunner.rollbackTransaction();
        throw new OGException(
          {
            errorCode: -214,
            errorMessage: 'Post vote failed',
          },
          500,
        );
      }

    } catch(e) {
      await queryRunner.rollbackTransaction();
      console.log(e)
      throw new OGException(
        {
          errorCode: -214,
          errorMessage: 'Post vote failed',
        },
        500,
      );
    }
    finally {
      await queryRunner.release();
    }
  }

  // checkPost(): string {
  //   const postQuery = `
  //     SELECT
  //       id,
  //       userId
  //     FROM
  //       Post
  //     WHERE
  //       id = ? AND
  //       userId != ? AND
  //       deletedAt IS NULL
  //   `;
  //   return postQuery;
  // }

  async createReportPostByPostId(
    userId: number,
    postId: number,
    createReportDto: CreateReportDto,
  ): Promise<number | undefined> {
    const queryRunner = this.dataSource.createQueryRunner('master');
    try {
      const user = await this.getUserByUserId(userId);
      const checkPost = await this.postRepository.findOneBy({postId: postId});
      if(checkPost){
        const report = await this.postReportRepository.createQueryBuilder()
        .insert()
        .into(PostReport)
        .values({
          postId: postId,
          reportTypeId: createReportDto.reportTypeId,
          reason: createReportDto.reportReason,
          accuserId: userId,
          accusedId: checkPost.userId,
        })
        .setQueryRunner(queryRunner)
        .execute();

        if(report.raw.affectedRows > 0){
          return postId;
        } else {
          return undefined
        }
        
      } else {
        return undefined
      }
    } catch (error) {
      console.log(error);
      throw new OGException(
        {
          errorCode: -215,
          errorMessage: 'Report invalid error',
        },
        500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async sameDraftCheck(userId: number, postDraftDto:PostDraftDto){
    const draft = await this.postDraftRepository.findOneBy({userId: userId, tempKey: postDraftDto.tempKey});
    return draft ? true : false
  }

  async postDraftHandler(postDraftDto: PostDraftDto, userId: number){
    const user = await this.getUserByUserId(userId);
    const queryRunner = this.dataSource.createQueryRunner('master');
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const checkDraft = await this.sameDraftCheck(userId, postDraftDto)
      if(!checkDraft){
        const draft = await this.postDraftRepository.find({
          where: {userId: userId, tempKey: Not(postDraftDto.tempKey), deletedAt: null},
          order: {updatedAt: 'DESC'},
        })
        if(draft.length >= 3){
          await this.postDraftRepository.createQueryBuilder()
            .delete()
            .where('id = :id', {id: draft[draft.length - 1].draftId})
            .setQueryRunner(queryRunner)
            .execute();
        }
        const insertDraft = await this.postDraftRepository.createQueryBuilder()
          .insert()
          .into(PostDraft)
          .values(
            {
              userId: user.userId,
              tempKey: postDraftDto.tempKey,
              contents: JSON.stringify(postDraftDto.contents),
            }
          )
          .setQueryRunner(queryRunner)
          .execute();
        if(insertDraft.raw.affectedRows == 0){
          await queryRunner.rollbackTransaction();
          throw new OGException(
            {
              errorCode: -216,
              errorMessage: 'Post draft failed',
            },
            500,
          );
        }
      } else {
        const updateDraft = await this.postDraftRepository.createQueryBuilder()
          .update(PostDraft)
          .set({contents: JSON.stringify(postDraftDto.contents)})
          .where('userId = :userId', {userId: userId})
          .andWhere('tempKey = :tempKey', {tempKey: postDraftDto.tempKey})
          .andWhere('deletedAt IS NULL')
          .setQueryRunner(queryRunner)
          .execute();
        if(updateDraft.affected == 0){
          await queryRunner.rollbackTransaction();
          throw new OGException(
            {
              errorCode: -216,
              errorMessage: 'Post draft failed',
            },
            500,
          );
        }
      }
      await queryRunner.commitTransaction();

      const getDraft = await this.postDraftRepository.createQueryBuilder()
        .where('userId = :userId', {userId: userId})
        .andWhere('deletedAt IS NULL')
        .orderBy('updatedAt', 'DESC')
        .limit(3)
        .setQueryRunner(queryRunner)
        .getMany();

      return getDraft;
         
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new OGException(
        {
          errorCode: -216,
          errorMessage: 'Post draft failed',
        },
        500,
      );
    } finally {
      await queryRunner.release();
    }
  }


  async getPostDraftByUserId(userId: number): Promise<PostDraft[]> {
    const draft = await this.postDraftRepository.find(
      {
        where: {userId: userId, deletedAt: null},
        order: {updatedAt: 'DESC'},
        take: 3
      }
    );
    return draft;
  }

  async deleteDraft(tempKey: string, userId: number): Promise<PostDraft[] | undefined>{
    const user = await this.getUserByUserId(userId);
    const queryRunner = this.dataSource.createQueryRunner('master');
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      const deleteDraft = await this.postDraftRepository.createQueryBuilder()
        .delete()
        .where('userId = :userId AND tempKey = :tempKey', {userId: userId, tempKey: tempKey})
        .setQueryRunner(queryRunner)
        .execute();
      if(deleteDraft.affected > 0){
        const selectDraft = await this.postDraftRepository.createQueryBuilder()
          .where('userId = :userId', {userId: userId})
          .orderBy('updatedAt', 'DESC')
          .take(3)
          .setQueryRunner(queryRunner)
          .getMany();
        await queryRunner.commitTransaction();
        return selectDraft;
      } else {
        return undefined
      }
    } catch(e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
      throw new OGException(
        {
          errorCode: -216,
          errorMessage: 'Post draft delete failed',
        },
        500,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAllDraft(userId: number){
    const queryRunner = this.dataSource.createQueryRunner('master');
    try{

      const deleteDraft = await this.postDraftRepository.createQueryBuilder()
        .delete()
        .where('userId = :userId', {userId: userId})
        .setQueryRunner(queryRunner)
        .execute();
      if(deleteDraft.affected > 0){
        return true;
      } else {
        return false;
      }
    } catch(e) {
      console.log(e);
      throw new OGException(
        {
          errorCode: -216,
          errorMessage: 'Post draft delete all failed',
        },
        500,
      );
    } finally {
      await queryRunner.release();
    }
  }

}

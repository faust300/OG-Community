import { Injectable } from '@nestjs/common';
import { SQL } from 'sql-template-strings';
import { ConnectionService } from '../extensions/services/connection.service';
import { Comments, CommentNext, CommentCount, ReplyComments, CommentReplyNext, Mention, TotalCOunt } from './entities/comments.entity';
import { OGException } from '../extensions/exception/exception.filter';
import { CommentUser } from '../comment/entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../comment/entities/comment.entity';
import { Brackets, DataSource, QueryRunner, Raw, Repository, SelectQueryBuilder } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Title } from 'src/user/entities/title/title.entity';
import { ReplyComment } from 'src/comment/dto/reply-comment.dto';
import { Me } from 'src/user/dto/me.dto';
import { CommentVote } from 'src/comment/entities/commentVote.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly datasource: DataSource,
    private readonly ConnectionService: ConnectionService
    ){ }


  async getUserByUserId(userId: number | null): Promise<Me | undefined>{
    const user = await this.userRepository.findOne({where: {id: userId}});
    if (user) return new Me(user);
    return undefined;
  }


  async getTotalCount(postId: number): Promise<number> {
    return await this.commentRepository.count({where: {postId: postId, deletedAt: null}});
  }

  async getCommentCount(postId: number): Promise<number> {

    const commentCountNotReply = await this.commentRepository.query(`
      SELECT
        COUNT(*) AS commentCount
      FROM
        Comment AS C
      WHERE
        C.postId = ${postId} AND
        C.parentId = 0 AND
        (
          (
          SELECT
            COUNT(*)
          FROM
            Comment AS CC
          WHERE
            CC.parentId = C.id AND
            CC.deletedAt IS NULL
          ) > 0 OR C.deletedAt IS NULL
        )
    `)
    return Number(commentCountNotReply[0].commentCount)
  }

  async getCommentReplyCount(commentId: number): Promise<number> {
    const replyCommentCount = await this.commentRepository.count({where: {parentId: commentId, deletedAt: null}});
    return replyCommentCount
  }

  // query for getting comments
  async getCommentsByPostIdQuery(postId: number, userId: number, next: CommentNext | undefined, queryRunner: QueryRunner){
    
    const query = this.commentRepository
      .createQueryBuilder('Comment')
      .select('Comment.id', 'commentId')
      .addSelect('Comment.lang', 'lang')
      .addSelect('Comment.userId', 'userId')
      .addSelect('User.name', 'userName')
      .addSelect('User.profileImagePath', 'userProfilePath')
      .addSelect('User.titleId', 'titleId')
      .addSelect('Title.name', 'userTitleName')
      .addSelect('Comment.contents', 'contents')
      .addSelect('Comment.upVoteCount', 'voteCount')
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)', 'commentCount')
            .from(Comment, 'subComment')
            .where('subComment.parentId = Comment.id')
            .andWhere('subComment.deletedAt IS NULL'),
        'commentCount',
      )
      .addSelect('Comment.createdAt', 'createdAt')
      .addSelect('Comment.updatedAt', 'updatedAt')
      .addSelect('Comment.deletedAt', 'deletedAt')
      .addSelect('Comment.isEdit', 'isEdit')
      .addSelect(
        (subQuery) =>
          subQuery
            .select('CommentVote.voteType', 'vote')
            .from(CommentVote, 'CommentVote')
            .where('CommentVote.userId = :userId', { userId: userId })
            .andWhere('CommentVote.commentId = Comment.id')
            .andWhere('CommentVote.deletedAt IS NULL'),
        'vote',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('subComment.userId = :userId', 'isMine')
            .from(Comment, 'subComment')
            .where('subComment.userId = :userId', { userId: userId })
            .andWhere('Comment.id = subComment.id'),
        'isMine',
      )
      .leftJoin('Comment.user', 'User')
      .leftJoin('User.title', 'Title')
      .where('Comment.postId = :postId', { postId })
      .andWhere('Comment.parentId = 0')
      .andWhere(
        `((SELECT COUNT(*) FROM Comment AS subComment WHERE subComment.parentId = Comment.id AND subComment.deletedAt IS NULL) > 0 OR Comment.deletedAt IS NULL)`,
      )
      .orderBy('Comment.createdAt', 'DESC')
      .limit(5);
  
    if (next) {
      query.andWhere('Comment.id < :commentId', {
        commentId: next.cursor.commentId,
      });
    }
    
  const result = await query.getRawMany();

    // const commentRawQuery = await this.commentRepository.query(`
    //   SELECT
    //     C.id as commentId,
    //     C.lang,
    //     C.userId,
    //     U.name AS userName,
    //     U.profileImagePath AS userProfilePath,
    //     U.titleId,
    //     TT.name AS userTitleName,
    //     C.contents,
    //     C.voteCount,
    //     (
    //       SELECT
    //         COUNT(*)
    //       FROM
    //         Comment AS CC
    //       WHERE
    //         CC.parentId = C.id AND
    //         CC.deletedAt IS NULL
    //     ) AS commentCount,
    //     C.createdAt,
    //     C.updatedAt,
    //     C.deletedAt,
    //     C.isEdit,
    //     (
    //       SELECT
    //         voteType
    //       FROM
    //         CommentVote AS CV
    //       WHERE
    //         CV.userId = ${userId ? userId : null} AND
    //         CV.commentId = C.id AND
    //         CV.deletedAt IS NULL
    //     ) AS vote,
    //     IF(C.userId = ${userId ? userId : null}, true, false) AS isMine
    //   FROM
    //     Comment AS C
    //   JOIN
    //     User AS U
    //   ON
    //     C.userId = U.id
    //   LEFT JOIN
    //     Title AS TT
    //   ON
    //     TT.id = U.titleId
    //   WHERE
    //     ${next ? `C.id <` + next.cursor.commentId + ` AND` : ``}
    //     C.postId = ${postId} AND
    //     C.parentId = 0 AND
    //     ((
    //       SELECT
    //         COUNT(*)
    //       FROM  
    //         Comment AS CCC
    //       WHERE
    //         CCC.parentId = C.id AND
    //         CCC.deletedAt IS NULL
    //     ) > 0 OR
    //     C.deletedAt IS NULL)
    //   ORDER BY
    //     C.createdAt 
    //   DESC
    //   LIMIT 5
    // `)

      return result
  }

  async getCommentsReplyByCommentIdQuery(commentId:number, userId: number, queryRunner: QueryRunner){

    const commentReplyList = await this.commentRepository.createQueryBuilder('Comment')
      .select('Comment.commentId', 'replyId')
      .addSelect('Comment.lang', 'lang')
      .addSelect('Comment.userId', 'userId')
      .addSelect('Comment.contents', 'contents')
      .addSelect('Comment.upVoteCount', 'voteCount')
      .addSelect('Comment.createdAt', 'createdAt')
      .addSelect('Comment.updatedAt', 'updatedAt')
      .addSelect('Comment.deletedAt', 'deletedAt')
      .addSelect('Comment.isEdit', 'isEdit')
      .addSelect('Comment.seq', 'seq')
      .addSelect(`IF(Comment.userId = ${userId ? userId : null}, true, false)`, 'isMine')

      // (
      //   SELECT
      //     COUNT(*)
      //   FROM
      //     Comment AS CC
      //   WHERE
      //     CC.parentId = C.id AND
      //     CC.deletedAt IS NULL
      // ) AS commentCount,
      .addSelect(subQuery => {
        return subQuery
        .select('COUNT(*)')
        .from('Comment', 'CC')
        .where('CC.parentId = Comment.commentId AND CC.deletedAt IS NULL')
      }, 'commentCount')
      .addSelect(subQuery => {
        return subQuery
        .select('CV.voteType')
        .from('CommentVote', 'CV')
        .where(`CV.userId = ${userId ? userId : null} AND CV.commentId = Comment.commentId AND CV.deletedAt IS NULL`)
      }, 'vote')
      .leftJoinAndSelect('Comment.user', 'user')
      .leftJoinAndSelect(Title, 'Title', 'Title.id = user.titleId')
      .where('Comment.parentId = :commentId', {commentId: commentId})
      .andWhere('Comment.deletedAt IS NULL')
      .orderBy('Comment.seq', 'ASC')
      .limit(2)
      .setQueryRunner(queryRunner)
      .getRawMany()
    return commentReplyList
    
    // const query = SQL`
    //   SELECT
    //     C.id as replyId,
    //     C.lang,
    //     C.userId,
    //     U.name AS userName,
    //     U.profileImagePath AS userProfilePath,
    //     U.titleId,
    //     TT.name AS userTitleName,
    //     C.contents,
    //     C.voteCount,
    //     C.createdAt,
    //     C.updatedAt,
    //     C.deletedAt,
    //     C.isEdit,
    //     (
    //       SELECT
    //         voteType
    //       FROM
    //         CommentVote AS CV
    //       WHERE
    //         CV.userId = ${userId ? userId : null} AND
    //         CV.commentId = C.id AND
    //         CV.deletedAt IS NULL
    //     ) AS vote,
    //     IF(C.userId = ${userId ? userId : null}, true, false) AS isMine,
    //     C.seq
    //   FROM
    //     Comment AS C
    //   JOIN
    //     User AS U
    //   ON
    //     C.userId = U.id
    //   LEFT JOIN
    //     Title AS TT
    //   ON
    //     TT.id = U.titleId
    //   WHERE
    //   `
    //   query.append(SQL`
    //     C.parentId = ${commentId} AND
    //     C.deletedAt IS NULL
    //   ORDER BY
    //     C.seq 
    //   ASC
    //   LIMIT 2
    // `)
    // return query
  }

  async getReplyCommentsByParentIdQuery(commentId:number, userId: number, next: CommentReplyNext | undefined){
    const replyComments = await this.commentRepository.createQueryBuilder('Comment')
      .select('Comment.commentId', 'replyId')
      .addSelect('Comment.lang', 'lang')
      .addSelect('Comment.seq', 'seq')
      .addSelect('Comment.userId', 'userId')
      .addSelect('Comment.contents', 'contents')
      .addSelect('Comment.upVoteCount', 'voteCount')
      .addSelect('Comment.createdAt', 'createdAt')
      .addSelect('Comment.updatedAt', 'updatedAt')
      .addSelect('Comment.deletedAt', 'deletedAt')
      .addSelect('Comment.isEdit', 'isEdit')
      .addSelect(`IF(Comment.userId = ${userId ? userId : null}, true, false)`, 'isMine')
      .addSelect(subQuery => {
        return subQuery
        .select('COUNT(*)')
        .from('Comment', 'CC')
        .where('CC.parentId = Comment.commentId AND CC.deletedAt IS NULL')
      }, 'commentCount')
      .addSelect(subQuery => {
        return subQuery
        .select('CV.voteType')
        .from('CommentVote', 'CV')
        .where(`CV.userId = ${userId ? userId : null} AND CV.commentId = Comment.commentId AND CV.deletedAt IS NULL`)
      }, 'vote')
      .leftJoinAndSelect('Comment.user', 'user')
      .leftJoinAndSelect(Title, 'Title', 'Title.id = user.titleId')
      .where('Comment.parentId = :commentId', {commentId: commentId})
      .andWhere('Comment.deletedAt IS NULL')

    if(next){
      replyComments.andWhere('Comment.seq > :seq', {seq: next.cursor.seq})
    }
      replyComments.orderBy('Comment.seq', 'ASC')
      
    if(next){
      if(next.clickCount < 5){
        replyComments.limit(5)
      }
    } else {
      replyComments.limit(5)
    }
      const replyResult = await replyComments.getRawMany()

    // const query = SQL`
    //   SELECT
    //     C.id as replyId,
    //     C.lang,
    //     C.userId,
    //     U.name AS userName,
    //     U.profileImagePath AS userProfilePath,
    //     U.titleId,
    //     TT.name AS userTitleName,
    //     C.contents,
    //     C.voteCount,
    //     (
    //       SELECT
    //         COUNT(*)
    //       FROM
    //         Comment AS CC
    //       WHERE
    //         CC.parentId = C.id AND
    //         CC.deletedAt IS NULL
    //     ) AS commentCount,
    //     C.createdAt,
    //     C.updatedAt,
    //     C.deletedAt,
    //     C.isEdit,
    //     (
    //       SELECT
    //         voteType
    //       FROM
    //         CommentVote AS CV
    //       WHERE
    //         CV.userId = ${userId ? userId : null} AND
    //         CV.commentId = C.id AND
    //         CV.deletedAt IS NULL
    //     ) AS vote,
    //     IF(C.userId = ${userId ? userId : null}, true, false) AS isMine,
    //     C.seq
    //   FROM
    //     Comment AS C
    //   JOIN
    //     User AS U
    //   ON
    //     C.userId = U.id
    //   LEFT JOIN
    //     Title AS TT
    //   ON
    //     TT.id = U.titleId
    //   WHERE
    //   `
    // if(next){
    //   query.append(SQL`
    //     C.seq < ${next.cursor.seq} AND
    //   `)
    // }
    //   query.append(SQL`
    //     C.parentId = ${commentId} AND
    //     C.deletedAt IS NULL
    //   ORDER BY
    //     C.seq
    //   ASC
    // `)
    // if(next){
    //   if(next.clickCount < 5){
    //     query.append(SQL`
    //       LIMIT 5
    //     `)
    //   }
    // } else {
    //   query.append(SQL`
    //     LIMIT 5
    //   `)
    // }

    return replyResult
  }

  // query for getting comments

  // return controller

  async getCommentsByPostId(userId: number | null, postId: number, cursor: string) {
    const queryRunner = this.datasource.createQueryRunner('slave')
    try {

      const cursorDecode: CommentNext = cursor ? JSON.parse(Buffer.from(cursor, 'base64').toString('utf8')) : undefined;

      const commentCount: number = await this.getCommentCount(postId);
      const getTotalCommentCount = await this.getTotalCount(postId) ? await this.getTotalCount(postId) : 0;

      const commentList = await this.getCommentsByPostIdQuery(postId, userId, cursorDecode, queryRunner)
      
      const totalComment: Comments[] = []
      for(let comment of commentList){
        const parentId = comment.commentId
        comment.isMine = comment.userId == userId ? true : false;
        comment.isEdit = Number(comment.isEdit) === 1 ? true : false;
        comment.userProfilePath = comment.userProfilePath
        
        if(comment.commentCount > 0){
          const replyList = await this.getCommentsReplyByCommentIdQuery(parentId, userId, queryRunner)
          const replyListResult:ReplyComment[] = []
          replyList.map(async reply => {
            const comment: ReplyComment = {
              replyId: reply.replyId,
              lang: reply.lang,
              userId: reply.user_id,
              userName: reply.user_name,
              userProfilePath: reply.user_profileImagePath ? reply.user_profileImagePath : null,
              titleId: reply.Title_Id,
              userTitleName: reply.Title_name,
              contents: reply.contents,
              voteCount: reply.voteCount,
              commentCount: Number(reply.commentCount),
              createdAt: reply.createdAt,
              updatedAt: reply.updatedAt,
              deletedAt: reply.deletedAt,
              isEdit: reply.isEdit,
              vote: reply.vote,
              isMine: reply.isMine,
              seq: reply.seq
            }
            replyListResult.push(comment)
          })
          const replyNext: CommentReplyNext = {
            sort: 'recent',
            clickCount: 0,
            cursor: {
              seq: replyListResult[replyListResult.length - 1].seq
            }
          }
          replyListResult.map(async reply => {

            reply.isMine = reply.userId == userId ? true : false;
            reply.isEdit = Number(reply.isEdit) === 1 ? true : false;
            reply.next = Buffer.from(JSON.stringify(replyNext), "utf8").toString('base64');
            if(reply.contents.mention){
              await reply.contents.mention.reduce(async (prev: any, cur: Mention) => {

                const userInfo = cur.userId ? await this.getUserByUserId(cur.userId) : null
                cur.userName = userInfo ? userInfo.name : null;
                cur.deleted = comment.deletedAt ? true : false;
                cur.userId = cur.userId
                prev.push(cur)
                return prev
              }, [] as Mention[])
            }
          })
          comment.reply = replyListResult
        }
        totalComment.push(comment)
      }
      
      if(totalComment.length > 0){
        const next = {
          sort: 'recent',
          cursor: {
            commentId: totalComment[totalComment.length - 1].commentId
          }
        }
        const next64 = Buffer.from(JSON.stringify(next), "utf8").toString('base64');
        return {
          totalCount: getTotalCommentCount,
          commentCount: commentCount,
          comments: totalComment,
          next: next64
        }
      }
      return {
        totalCount: getTotalCommentCount,
        commentCount: commentCount,
        comments: []
      }
      
    } catch (error) {
      console.log(error)
      throw new OGException({
          errorCode: -225,
          errorMessage: "Failed to get comments"
      }, 500);
    } finally {
      await queryRunner.release()
    }
  }

  async getReplyCommentsByParentId(userId: number | null, parentId: number, cursor: string) {
    try{

      const cursorDecode: CommentReplyNext = cursor ? JSON.parse(Buffer.from(cursor, 'base64').toString('utf8')) : undefined;

      const reply = await this.getReplyCommentsByParentIdQuery(parentId, userId, cursorDecode)
      let commentCount: number = await this.getCommentReplyCount(parentId);
      // const result = await this.ConnectionService.connectionPool.readerQuery<ReplyComments[]>(query)
      const replyList: ReplyComment[] = []
      if(reply.length > 0){
        for(let items of reply){
            items.isMine = items.userId == userId ? true : false;
            items.isEdit = Number(items.isEdit) === 1 ? true : false;
            if(items.contents.mention){
              await items.contents.mention.reduce(async (prev: any, cur: Mention) => {
                const userInfo = cur.userId ? await this.getUserByUserId(cur.userId) : null
                cur.userName = userInfo ? userInfo.name : null;
                cur.deleted = items.deletedAt ? true : false;
                cur.userId = cur.userId
                prev.push(cur)
                return prev
              }, [] as Mention[])
            }
            const replyReturn: ReplyComment = {
              replyId: items.replyId,
              lang: items.lang,
              userId: items.user_Id,
              userName: items.user_Name,
              userProfilePath: items.user_profileImagePath ? items.user_profileImagePath : null,
              titleId: items.Title_id ? items.Title_id : null,
              userTitleName: items.Title_name ? items.Title_name : null,
              contents: items.contents,
              voteCount: items.voteCount,
              commentCount: Number(items.itemsCount),
              createdAt: items.createdAt,
              updatedAt: items.updatedAt,
              deletedAt: items.deletedAt,
              isEdit: items.isEdit,
              vote: items.vote,
              isMine: items.isMine,
              seq: items.seq
            }
            replyList.push(replyReturn)
        }
        const next: CommentReplyNext = {
          sort: 'recent',
          clickCount: cursorDecode ? cursorDecode.clickCount + 1 : 1,
          cursor: {
            seq: replyList[replyList.length - 1].seq
          }
        }
  
        const next64 = Buffer.from(JSON.stringify(next), "utf8").toString('base64');
        return {
          totalCount: commentCount,
          comments: replyList,
          next: next64
        }
      } else {
        return {
          totalCount: commentCount,
          comments: replyList
        }
      }
    }
    catch(error){
      console.log(error)
      throw new OGException({
          errorCode: -225,
          errorMessage: "Failed to get comments reply"
      }, 500);
    }
  }
}


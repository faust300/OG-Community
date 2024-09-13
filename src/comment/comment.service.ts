import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ConnectionService } from '../extensions/services/connection.service';
import { OGException } from '../extensions/exception/exception.filter';
import { CreateReportDto } from './dto/create-report.dto';
import { Comment, CommentUser } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, InsertResult, Not } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { PostReport } from 'src/post/entities/postReport.entity';
import { Me } from 'src/user/dto/me.dto';
import { CommentVote } from './entities/commentVote.entity';
import moment from 'moment';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PostReport)
        private readonly reportRepository: Repository<PostReport>,
        @InjectRepository(CommentVote)
        private readonly commentVoteRepository: Repository<CommentVote>,
        private readonly dataSource: DataSource,
        private readonly ConnectionService: ConnectionService
        ) { }

    async getUserByUserId(userId: number): Promise<Me | undefined>{
        
        const user = await this.userRepository.findOne({where: {id: userId}});
        if (user) return new Me(user);
        return undefined;
    }

    async createCommentQuery(user: CommentUser, createCommentDto: CreateCommentDto, lang: string): Promise<InsertResult> {
        const createComment = await this.commentRepository.insert({
            userId: user.userId,
            postId: createCommentDto.postId,
            contents: createCommentDto.content,
            lang: lang
        })
        return createComment
    }

    async createReplyQuery(user: Me, createCommentDto: CreateCommentDto, lang: string): Promise<any> {
        const seq = await this.commentRepository
        .createQueryBuilder()
        .select('IFNULL(MAX(comment.seq + 1), 1)', 'count')
        .from(Comment, 'comment')
        .withDeleted()
        .where('comment.parentId = :parentId', { parentId: createCommentDto.commentId })
        .getRawOne();
        
        const comment = new Comment();
        comment.userId = user.userId;
        comment.postId = createCommentDto.postId;
        comment.contents = createCommentDto.content;
        comment.parentId = createCommentDto.commentId;
        comment.seq = seq.count;
        comment.depth = 1;
        comment.lang = lang;

        return await this.commentRepository.save(comment);
    }

    async createComment(userId: number, createCommentDto: CreateCommentDto, lang: string) {
        const user = await this.getUserByUserId(userId)
        if(user){
            try {
                if(createCommentDto.content.text.length > 1000){
                    throw new OGException({
                        errorCode: -220,
                        errorMessage: 'Contents is too long',
                    });
                }
                if(createCommentDto.commentId){
                    const createComment = await this.createReplyQuery(user, createCommentDto, lang)
                    if(createComment){
                        return {
                            commentId: createComment.commentId
                        }
                    } else {
                        return undefined
                    }

                } else {

                    const createComment = await this.commentRepository.insert({
                        userId: user.userId,
                        postId: createCommentDto.postId,
                        contents: createCommentDto.content,
                        lang: lang
                    })
                    if(createComment.raw.affectedRows > 0){
                        return {
                            commentId: createComment.raw.insertId
                        }
                    } else {
                        return undefined
                    }
                }

            } catch (error) {
                console.log(error)
                throw new OGException({
                  errorCode: -220,
                  errorMessage: "Create Comment Error"
                }, 500);
            } finally {

            }
        } else {
            throw new OGException({
                errorCode: -223,
                errorMessage: "unknown user"
            }, 500);
        }
    }

    async updateCommentByCommentId(userId: number, commentId: number, updateCommentDto: UpdateCommentDto) {
        const user = await this.getUserByUserId(userId)
        const queryRunner = this.dataSource.createQueryRunner('master');
        if(user){
            try {
                const updateComment = await this.commentRepository.createQueryBuilder()
                .update(Comment)
                .set({
                    contents: updateCommentDto.content,
                    isEdit: true
                })
                .where("id = :id AND userId = :userId AND deletedAt IS NULL", {id: commentId, userId: userId})
                .setQueryRunner(queryRunner)
                .execute()
                if(updateComment.affected > 0){
                    return {
                        commentId: commentId
                    }
                } else {
                    return undefined
                }
            } catch (error) {
                console.log(error)
                throw new OGException({
                    errorCode: -221,
                    errorMessage: "Update Comment Error"
                  }, 500);
            } finally {
                await queryRunner.release();
            }
        } else {
            await queryRunner.release();
            throw new OGException({
                errorCode: -223,
                errorMessage: "unknown user"
            }, 500);
        }
    }

    async removeCommentByCommentId(userId: number, commentId: number) {
        const user = await this.getUserByUserId(userId)
        const queryRunner = this.dataSource.createQueryRunner('master');
        if(user){

            try {
                
                const removeComment = await this.commentRepository.createQueryBuilder()
                    .softDelete()
                    .where("id = :id AND userId = :userId AND deletedAt IS NULL", {id: commentId, userId: userId})
                    .setQueryRunner(queryRunner)
                    .execute()
                if(removeComment.affected > 0){
                    return {
                        commentId: commentId
                    }
                } else {
                    return undefined
                }
            } catch (error) {
                console.log(error)
                throw new OGException({
                    errorCode: -222,
                    errorMessage: "Remove Comment Error"
                  }, 500);
            } finally {
                await queryRunner.release();
            }
        } else {
            await queryRunner.release();
            throw new OGException({
                errorCode: -223,
                errorMessage: "unknown user"
            }, 500);
        }
    }

    async afterVoteCount(commentId: number, queryRunner: QueryRunner): Promise<number>{
        const count = await this.commentRepository.createQueryBuilder('Comment')
            .select('Comment.upVoteCount', 'voteCount')
            .where({commentId: commentId})
            .setQueryRunner(queryRunner)
            .getRawOne()
        return count.voteCount
    }

	async updateVoteCommentByCommentId(userId: number, commentId: number, voteType: string) {
        const queryRunner = this.dataSource.createQueryRunner('master');
		try {

            const existingCommentVote = await this.commentVoteRepository.findOne({
                where: {
                    commentId,
                    userId,
                },
                withDeleted: true
            });

            if (existingCommentVote) {
                if (existingCommentVote.voteType === voteType) {
                existingCommentVote.deletedAt = existingCommentVote.deletedAt ? null : new Date();
                } else {
                existingCommentVote.voteType = voteType;
                existingCommentVote.deletedAt = null;
                }

                const savedCommentVote = await this.commentVoteRepository.save(existingCommentVote);
                if(savedCommentVote){
                    const count = await this.afterVoteCount(commentId, queryRunner)
                    return {
                        commentId: commentId,
                        voteCount: count
                    }
                }
            } else {
                const newCommentVote = this.commentVoteRepository.create({
                commentId,
                userId,
                voteType,
                });
                const savedCommentVote = await this.commentVoteRepository.save(newCommentVote);
                if(savedCommentVote){
                    const count = await this.afterVoteCount(commentId, queryRunner)
                    return {
                        commentId: commentId,
                        voteCount: count
                    }
                }
            }

            return undefined
            
		} catch (error) {
			console.log(error)
            throw new OGException({
                errorCode: -223,
                errorMessage: "Vote Comment Error"
            }, 500);
		} finally {
            await queryRunner.release();
        }
	}

    async createReportCommentByCommentId(userId: number, commentId: number, createReportDto: CreateReportDto) {
        const user = await this.getUserByUserId(userId)
        const queryRunner = await this.dataSource.createQueryRunner('master');
        if(user){
            try {
                const comment = await this.commentRepository.findOne({
                    where: {
                        commentId: commentId,
                        deletedAt: null,
                        userId: Not(userId)
                    }
                })
                if(comment){
                    
                    const report = await this.reportRepository.createQueryBuilder()
                    .insert()
                    .into(PostReport)
                    .values({
                        commentId: commentId,
                        reportTypeId: createReportDto.reportTypeId,
                        reason: createReportDto.reportReason,
                        accuserId: userId,
                        accusedId: comment.userId
                    })
                    .setQueryRunner(queryRunner)
                    .execute()
                    if(report.raw.affectedRows > 0){
                        return {
                            commentId: commentId
                        }
                    } else {
                        return undefined
                    }
                } else {
                    throw new OGException({
                        errorCode: -224,
                        errorMessage: "unknown comment"
                    }, 500);
                }
            } catch(error) {
                console.log(error)
                throw new OGException({
                    errorCode: -224,
                    errorMessage: "Report Comment Error"
                }, 500);
            } finally {
                await queryRunner.release();
            }
        } else {
            await queryRunner.release();
            throw new OGException({
                errorCode: -224,
                errorMessage: "unknown user"
            }, 500);
        }
    }
}
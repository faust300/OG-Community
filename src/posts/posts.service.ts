import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { escape } from 'querystring';
import { OverviewData } from 'src/overview/entities/overview-data.entity';
import { ReturnPost } from 'src/post/dto/return-post.dto';
import { PostDraft } from 'src/post/entities/draft.entity';
import { Post } from 'src/post/entities/post.entity';
import { PostReport } from 'src/post/entities/postReport.entity';
import { PostVote } from 'src/post/entities/postVote.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { UserFollow } from 'src/user/entities/follow/user-follow.entity';
import { UserGradeMap } from 'src/user/entities/grade-map/user-grade-map.entity';
import { Title } from 'src/user/entities/title/title.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, In, Repository, SelectQueryBuilder } from 'typeorm';
import { ConnectionService } from '../extensions/services/connection.service';
import { ReturnListPost } from './entities/posts.entity';
import { OGException } from 'src/extensions/exception/exception.filter';
import { SQL } from 'sql-template-strings';
import { response } from 'express';

export interface AppConfig {
  key: string;
  value: string;
}


export enum postWeight {
  POST_VIEW_WEIGHT = 0.4,
  POST_VOTE_WEIGHT = 0.2,
  POST_COMMENT_WEIGHT = 0.2,
  POST_SCORE_WEIGHT = 1,
  POST_MAX_SCORE = 110,
  POST_DATE_MAX = 120,
  POST_DATE_DEDUCTION = 5,
  POST_DATE_WEIGHT = 0.8,
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,
    @InjectRepository(PostDraft)
    private readonly postDraftRepository: Repository<PostDraft>,
    @InjectRepository(PostReport)
    private readonly postReportRepository: Repository<PostReport>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(OverviewData)
    private readonly overviewDataRepository: Repository<OverviewData>,

    private dataSource: DataSource,
    private readonly connectionService: ConnectionService,
  ) {}

  async checkByUserId(userId: number | null): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { userId: userId },
    });
    if (user) return user;
    return undefined;
  }

  nextToObject(next: string) {
    try {
      return JSON.parse(Buffer.from(next, 'base64').toString('utf-8'));
    } catch (e) {}
    return {};
  }

  paramsToArray(values: String | Array<String> | null): Array<String> {
    if (values instanceof Array) {
      return values;
    } else {
      return [values];
    }
  }

  convertInQuery(values: string[]): string {
    return this.paramsToArray(values)
      .map((value) => `"${escape(String(value))}"`)
      .join(',');
  }

  async getPosts(
    userId: number | null,
    tags: string[],
    sort: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented'| 'recommend',
    next: string,
    bot: string | undefined,
    lang: string,
    touserId?: number,
  ): Promise<ReturnListPost> {
    const queryRunner = this.dataSource.createQueryRunner('slave');
    try {
      const nextDecoded = this.nextToObject(next);

      const postCount = 20;
      const topics = await this.topicRepository.find();
      const topicSorting = (tags: string[], topics: Topic[]) => {
        return tags.sort((a, b) => {
          if (
            topics.findIndex((t) => [...[t.topic], t.synonyms].includes(a)) > 0 &&
            topics.findIndex((t) => [...[t.topic], t.synonyms].includes(b)) < 0
          ) {
            return -1;
          } else if (
            topics.findIndex((t) => [...[t.topic], t.synonyms].includes(a)) < 0 &&
            topics.findIndex((t) => [...[t.topic], t.synonyms].includes(b)) > 0
          ) {
            return 1;
          }
          return 0;
        });
      };

      const post: SelectQueryBuilder<Post> = this.postRepository
        .createQueryBuilder('Post')
        .select('Post.postId AS postId')
        .addSelect('Post.lang AS lang')
        .addSelect('Post.dataType AS dataType')
        .addSelect('Post.userId AS userId')

        .addSelect('Post.authorId AS authorId')
        .addSelect('Post.authorName AS authorName')
        .addSelect('Post.authorProfilePath AS authorProfilePath')
        .addSelect('Post.authorLink AS authorLink')
        .addSelect('Post.authorType AS authorType')
        .addSelect('Post.authorReservation1 AS authorReservation1')
        .addSelect('Post.authorReservation2 AS authorReservation2')
        .addSelect('Post.originLink AS originLink')

        .addSelect('Post.title AS title')
        .addSelect('Post.thumbnail AS thumbnail')
        .addSelect('Post.contents AS contents')
        .addSelect('Post.imageCount AS imageCount')
        .addSelect('Post.viewCount AS viewCount')
        .addSelect('Post.commentCount AS commentCount')
        .addSelect('Post.upVoteCount AS voteCount')

        .addSelect('Post.isNSFW AS isNSFW')
        .addSelect('Post.isEdit AS isEdit')
        .addSelect('Post.hasReferral AS hasReferral')
        .addSelect('Post.createdAt AS createdAt')
        .addSelect('Post.updatedAt AS updatedAt')
        .addSelect(`IF(Post.userId = ${userId}, TRUE, FALSE) AS isMine`)
        // .addSelect('GROUP_CONCAT(Tag.name) AS tags')
        .addSelect(
          `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.id, 10, '0')) AS recentCursor`,
        )
        .addSelect(
          `CONCAT(LPAD(Post.viewCount, 10, '0'), LPAD(Post.id, 10, '0')) AS viewCursor`,
        )
        .addSelect(
          `CONCAT(LPAD(Post.commentCount, 10, '0'), LPAD(Post.id, 10, '0')) AS commentCursor`,
        )
        .addSelect(
          `CONCAT(LPAD(Post.voteCount, 10, '0'), LPAD(Post.id, 10, '0')) AS voteCursor`,
        )
        .addSelect((subQuery) => {
          return subQuery
            .select(`GROUP_CONCAT(Tag.name)`)
            .from(Tag, 'Tag')
            .where('Tag.postId = Post.postId');
        }, 'tags')
        .addSelect((subQuery) => {
          return subQuery
            .select('PostVote.voteType', 'voteType')
            .from(PostVote, 'PostVote')
            .where('PostVote.userId = :userId', { userId: userId })
            .andWhere('PostVote.postId = :postId', { postId: 'Post.postId' })
            .andWhere('PostVote.deletedAt IS NULL');
        }, 'vote')
        .leftJoinAndSelect('Post.user', 'User')
        .leftJoinAndSelect(Title, 'Title', 'Title.id = User.titleId')
        .leftJoinAndSelect(
          UserGradeMap,
          'UserGradeMap',
          'UserGradeMap.userId = User.id',
        )
        .leftJoin('Post.tag', 'Tag')
        .groupBy('Post.postId')
        .where('Post.deletedAt IS NULL')
        .andWhere('Post.dataType != :dataType', { dataType: 'retweeted' })
        .andWhere(`Post.lang = 'EN'`);
      if (touserId) {
        post.andWhere(`User.id = :touserId`, { touserId });
      }
      if (!JSON.parse(bot)) {
        post.andWhere('Post.userId != 0');
      }
      if (this.paramsToArray(tags).length > 0) {
        post.andWhere(`Tag.name IN (${this.convertInQuery(tags)})`);
      }
      if (nextDecoded) {
        if (sort == 'recent' && nextDecoded.recent) {
          post.andWhere(
            `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.recent}`,
          );
        } else if (sort == 'mostViewed' && nextDecoded.mostViewed) {
          post.andWhere(
            `CONCAT(LPAD(Post.viewCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostViewed}`,
          );
        } else if (sort == 'mostCommented' && nextDecoded.mostCommented) {
          post.andWhere(
            `CONCAT(LPAD(Post.commentCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostCommented}`,
          );
        } else if (sort == 'mostVoted' && nextDecoded.mostVoted) {
          post.andWhere(
            `CONCAT(LPAD(Post.voteCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostVoted}`,
          );
        }
      }
      switch (sort) {
        case 'recent':
          post
          .addOrderBy('Post.createdAt', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC');
          break;
        case 'mostViewed':
          post
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC')
            .addOrderBy('Post.createdAt', 'DESC');
          break;
        case 'mostCommented':
          post
            .addOrderBy('Post.commentCount', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.createdAt', 'DESC');
          break;
        case 'mostVoted':
          post
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC')
            .addOrderBy('Post.createdAt', 'DESC');
          break;
        default:
          post
            .addOrderBy('Post.createdAt', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC');
      }
      post.limit(postCount).setQueryRunner(queryRunner);

      const postResult = await post.getRawMany();

      const finalPost: ReturnPost[] = postResult.map((item) => {
        return {
          postId: item.postId,
          lang: item.lang,
          dataType: item.dataType,
          userId: item.User_id,
          userName: item.User_name,
          userProfilePath: item.User_profileImagePath
            ? item.User_profileImagePath
            : null,
          userTitle: item.User_titleId,
          userTitleName: item.Title_name,
          authorId: item.authorId,
          authorName: item.authorName,
          authorProfilePath: item.authorProfilePath,
          authorLink: item.authorLink,
          authorType: item.authorType,
          authorReservation1: item.authorReservation1,
          authorReservation2: item.authorReservation2,
          originLink: item.originLink,
          title: item.title,
          contents: item.contents,
          thumbnail: item.thumbnail ? item.thumbnail : null,
          imageCount: item.imageCount,
          viewCount: item.viewCount,
          commentCount: item.commentCount,
          voteCount: item.voteCount,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          vote: item.vote,
          isMine: item.userId === userId ? true : false,
          isEdit: Boolean(item.isEdit),
          isNSFW: Boolean(item.isNSFW),
          isVerified: Boolean(item.UserGradeMap_isVerified),
          hasReferral: Boolean(item.hasReferral),
          tags: topicSorting(item.tags ? String(item.tags).split(',') : [], topics),
        };
      });

      const lastPost = postResult[postResult.length - 1];

      let responseNext: any = null;
      if (lastPost) {
        if (sort == 'recent') {
          responseNext = {
            recent: lastPost.recentCursor,
          };
        } else if (sort == 'mostViewed') {
          responseNext = {
            mostViewed: lastPost.viewCursor,
          };
        } else if (sort == 'mostCommented') {
          responseNext = {
            mostCommented: lastPost.commentCursor,
          };
        } else if (sort == 'mostVoted') {
          responseNext = {
            mostVoted: lastPost.voteCursor,
          };
        }
      }

      if (responseNext) {
        responseNext = Buffer.from(
          JSON.stringify(responseNext),
          'utf-8',
        ).toString('base64');
      }
      return {
        list: finalPost ? finalPost : [],
        next: responseNext,
      };
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release();
    }
    return {
      list: [],
      next: null,
    };
  }

  async getRecommendedPosts(
    userId: number | null,
    postId: number | null,
    lang: string,
  ): Promise<ReturnPost[]> {
    try {
      const topicArray = await this.tagRepository
        .createQueryBuilder()
        .where('Tag.postId = :postId', { postId })
        .getRawMany();
      let key: string[] = [];
      if (topicArray.length > 0) {
        topicArray.forEach((item) => {
          key.push(`overview_${item.Tag_name}`.toUpperCase());
        });
      } else {
        key.push('BEST');
      }
      // const key = topicArray ? `overview_${topic.topic}`.toUpperCase() : 'BEST';
      const overview = await this.overviewDataRepository.find({
        where: {
          key: In(key),
        },
      });
      // const overview =
      //   await this.connectionService.connectionPool.readerQuerySingle<{
      //     key: string;
      //     data: number[];
      //   }>(
      //     SQL`SELECT OverviewData.key, OverviewData.data FROM OverviewData WHERE OverviewData.key = ${key}`,
      //   );
      const overviewPostId = [];
      overview
        ? overview.map((item) => {
            overviewPostId.push(...item.data);
          })
        : [];
      const randomOverviewPostId = overviewPostId.sort(
        () => 0.5 - Math.random(),
      );
      const suffledOverviewPostId = randomOverviewPostId.slice(0, 5);

      const topics = await this.topicRepository.find();
      const topicSorting = (tags: string[], topics: Topic[]) => {
        return tags.sort((a, b) => {
          console.log(
            a,
            b,
            topics.findIndex((t) => [...[t.topic], t.synonyms].includes(a)),
            topics.findIndex((t) => [...[t.topic], t.synonyms].includes(b)),
          );
          if (
            topics.findIndex((t) => [...[t.topic], t.synonyms].includes(a)) > 0 &&
            topics.findIndex((t) => [...[t.topic], t.synonyms].includes(b)) < 0
          ) {
            return -1;
          } else if (
            topics.findIndex((t) => [...[t.topic], t.synonyms].includes(a)) < 0 &&
            topics.findIndex((t) => [...[t.topic], t.synonyms].includes(b)) > 0
          ) {
            return 1;
          }
          return 0;
        });
      };

      if (overview.length > 0) {
        const posts = await this.postRepository
          .createQueryBuilder('Post')
          .select('Post.postId AS postId')
          .addSelect('Post.dataType AS dataType')
          .addSelect('Post.userId AS userId')

          .addSelect('Post.authorId AS authorId')
          .addSelect('Post.authorName AS authorName')
          .addSelect('Post.authorProfilePath AS authorProfilePath')
          .addSelect('Post.authorLink AS authorLink')
          .addSelect('Post.authorType AS authorType')
          .addSelect('Post.authorReservation1 AS authorReservation1')
          .addSelect('Post.authorReservation2 AS authorReservation2')
          .addSelect('Post.originLink AS originLink')

          .addSelect('Post.title AS title')
          .addSelect('Post.thumbnail AS thumbnail')
          .addSelect('Post.contents AS contents')
          .addSelect('Post.imageCount AS imageCount')
          .addSelect('Post.viewCount AS viewCount')
          .addSelect('Post.commentCount AS commentCount')
          .addSelect('Post.upVoteCount AS voteCount')

          .addSelect('Post.isNSFW AS isNSFW')
          .addSelect('Post.isEdit AS isEdit')
          .addSelect('Post.hasReferral AS hasReferral')
          .addSelect('Post.createdAt AS createdAt')
          .addSelect('Post.updatedAt AS updatedAt')
          .addSelect((subQuery) => {
            return subQuery
              .select('PostVote.voteType', 'voteType')
              .from(PostVote, 'PostVote')
              .where('PostVote.userId = :userId', { userId: userId })
              .andWhere('PostVote.postId = Post.postId')
              .andWhere('PostVote.deletedAt IS NULL');
          }, 'vote')
          .addSelect((subQuery) => {
            return subQuery
              .select(`GROUP_CONCAT(Tag.name)`)
              .from(Tag, 'Tag')
              .where('Tag.postId = Post.postId');
          }, 'tags')
          .leftJoinAndSelect('Post.user', 'User')
          .leftJoinAndSelect(Title, 'Title', 'Title.id = User.titleId')
          .leftJoinAndSelect(
            UserGradeMap,
            'UserGradeMap',
            'UserGradeMap.userId = User.id',
          )
          .where('Post.deletedAt IS NULL')
          .andWhere('Post.isNSFW = 0')
          .andWhere(`Post.id IN (${suffledOverviewPostId})`)
          .getRawMany();

        const finalPost: ReturnPost[] = posts.map((item) => {
          return {
            postId: item.postId,
            lang: item.lang,
            dataType: item.dataType,
            userId: item.User_id,
            userName: item.User_name,
            userProfilePath: item.User_profileImagePath
              ? item.User_profileImagePath
              : null,
            userTitle: item.User_titleId,
            userTitleName: item.Title_name,
            authorId: item.authorId,
            authorName: item.authorName,
            authorProfilePath: item.authorProfilePath,
            authorLink: item.authorLink,
            authorType: item.authorType,
            authorReservation1: item.authorReservation1,
            authorReservation2: item.authorReservation2,
            originLink: item.originLink,
            title: item.title,
            contents: item.contents,
            thumbnail: item.thumbnail ? item.thumbnail : null,
            imageCount: item.imageCount,
            viewCount: item.viewCount,
            commentCount: item.commentCount,
            voteCount: item.voteCount,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            vote: item.vote,
            isMine: item.userId === userId ? true : false,
            isEdit: Boolean(item.isEdit),
            isNSFW: Boolean(item.isNSFW),
            isVerified: Boolean(item.UserGradeMap_isVerified),
            hasReferral: Boolean(item.hasReferral),
            tags: topicSorting(
              item.tags ? String(item.tags).split(',') : [],
              topics,
            ),
          };
        });

        return finalPost;

        //   let postSql = `
        //   SELECT

        //     P.id AS postId,
        //     P.dataType,

        //     U.id AS userId,
        //     U.name AS userName,
        //     U.profileImagePath AS userProfilePath,
        //     U.titleId,
        //     TI.name AS userTitleName,

        //     P.topicId,
        //     TOP.name AS topic,
        //     TOP.iconPath AS topicIconPath,

        //     P.authorName,
        //     P.authorProfilePath,
        //     P.authorLink,
        //     P.authorType,
        //     P.authorReservation1,
        //     P.authorReservation2,
        //     P.originLink,

        //     P.thumbnail,
        //     P.title,
        //     P.contents,
        //     P.viewCount,
        //     P.commentCount,
        //     P.voteCount,
        //     P.reportCount,
        //     P.reportStatus,

        //     (
        //       SELECT
        //         voteType
        //       FROM
        //         PostVote AS PV
        //       WHERE
        //         PV.userId = ${userId ?? null} AND
        //         PV.postId = P.id AND
        //         PV.deletedAt IS NULL
        //     ) AS vote,

        //     P.createdAt,
        //     P.updatedAt,
        //     P.deletedAt

        //   FROM

        //     Post AS P

        //   LEFT JOIN

        //     User AS U

        //   ON

        //     U.id = P.userId

        //   LEFT JOIN

        //     Title AS TI

        //   ON

        //     U.titleId = TI.id

        //   LEFT JOIN

        //     Topic AS TOP

        //   ON

        //     P.topicId = TOP.id

        //   WHERE

        //     P.deletedAt IS NULL
        //     AND P.isNSFW = 0
        //     AND P.id IN ();
        // `

        // const posts = await this.connectionService.connectionPool.readerQuery<
        //   Post[]
        // >(postSql, []);
        // return [];
      }
    } catch (error) {
      console.log(error);
    }
    return [];
  }

  async getPopularPosts(
    userId: number | null,
    tags: string[],
    sort: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented' | 'recommend',
    next: string,
    bot: string | undefined,
    lang: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner('slave');
    try {
      const nextDecoded = this.nextToObject(next);
      const postCount = 20;
      const popularPosts = this.postRepository
        .createQueryBuilder('Post')
        .select('Post.postId AS postId')
        .addSelect('Post.lang AS lang')
        .addSelect('Post.score AS score')
        .addSelect('Post.dataType AS dataType')
        .addSelect('Post.userId AS userId')

        .addSelect('Post.authorId AS authorId')
        .addSelect('Post.authorName AS authorName')
        .addSelect('Post.authorProfilePath AS authorProfilePath')
        .addSelect('Post.authorLink AS authorLink')
        .addSelect('Post.authorType AS authorType')
        .addSelect('Post.authorReservation1 AS authorReservation1')
        .addSelect('Post.authorReservation2 AS authorReservation2')
        .addSelect('Post.originLink AS originLink')

        .addSelect('Post.title AS title')
        .addSelect('Post.thumbnail AS thumbnail')
        .addSelect('Post.contents AS contents')
        .addSelect('Post.imageCount AS imageCount')
        .addSelect('Post.viewCount AS viewCount')
        .addSelect('Post.commentCount AS commentCount')
        .addSelect('Post.upVoteCount AS voteCount')

        .addSelect('Post.isNSFW AS isNSFW')
        .addSelect('Post.isEdit AS isEdit')
        .addSelect('Post.hasReferral AS hasReferral')
        .addSelect('Post.createdAt AS createdAt')
        .addSelect('Post.updatedAt AS updatedAt')
        .addSelect(`IF(Post.userId = ${userId}, TRUE, FALSE) AS isMine`)
        
        .addSelect(
          `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.id, 10, '0')) AS recentCursor`,
        )
        .addSelect(
          `CONCAT(LPAD(Post.viewCount, 10, '0'), LPAD(Post.id, 10, '0')) AS viewCursor`,
        )
        .addSelect(
          `CONCAT(LPAD(Post.commentCount, 10, '0'), LPAD(Post.id, 10, '0')) AS commentCursor`,
        )
        .addSelect(
          `CONCAT(LPAD(Post.voteCount, 10, '0'), LPAD(Post.id, 10, '0')) AS voteCursor`,
        )
        .addSelect(`
          (Post.score * ${postWeight.POST_SCORE_WEIGHT}) 
          + IF(
            (Post.viewCount * ${postWeight.POST_VIEW_WEIGHT})
            + (Post.commentCount * ${postWeight.POST_COMMENT_WEIGHT})
            + (Post.upVoteCount * ${postWeight.POST_VOTE_WEIGHT}) > ${postWeight.POST_MAX_SCORE},
            ${postWeight.POST_MAX_SCORE},
            (Post.viewCount * ${postWeight.POST_VIEW_WEIGHT})
            + (Post.commentCount * ${postWeight.POST_COMMENT_WEIGHT})
            + (Post.upVoteCount * ${postWeight.POST_VOTE_WEIGHT})
          )
          - EXP(TIMESTAMPDIFF(DAY, Post.createdAt, NOW()) * ${postWeight.POST_DATE_WEIGHT}) AS recommendScore
        `)
        // ((Post.score * ${postWeight.POST_SCORE_WEIGHT}) + IF((Post.viewCount * ${postWeight.POST_VIEW_WEIGHT}) + (Post.commentCount * ${postWeight.POST_COMMENT_WEIGHT}) + (Post.upVoteCount * ${postWeight.POST_VOTE_WEIGHT}) > ${postWeight.POST_MAX_SCORE}, ${postWeight.POST_MAX_SCORE}, (Post.viewCount * ${postWeight.POST_VIEW_WEIGHT}) + (Post.commentCount * ${postWeight.POST_COMMENT_WEIGHT}) + (Post.upVoteCount * ${postWeight.POST_VOTE_WEIGHT})) + GREATEST(${postWeight.POST_DATE_MAX} - (TIMESTAMPDIFF(DAY, Post.createdAt, NOW()) * ${postWeight.POST_DATE_DEDUCTION}), 0))
        .addSelect((subQuery) => {
          return subQuery
            .select(`GROUP_CONCAT(Tag.name)`)
            .from(Tag, 'Tag')
            .where('Tag.postId = Post.postId');
        }, 'tags')
        .addSelect((subQuery) => {
          return subQuery
            .select('PostVote.voteType', 'voteType')
            .from(PostVote, 'PostVote')
            .where('PostVote.userId = :userId', { userId: userId })
            .andWhere('PostVote.postId = Post.id')
            .andWhere('PostVote.deletedAt IS NULL');
        }, 'vote')
        .leftJoinAndSelect('Post.user', 'User')
        .leftJoinAndSelect(Title, 'Title', 'Title.id = User.titleId')
        .leftJoinAndSelect(
          UserGradeMap,
          'UserGradeMap',
          'UserGradeMap.userId = User.id',
        )
        .leftJoin('Post.tag', 'Tag')
        .groupBy('Post.postId')
        .where('Post.deletedAt IS NULL')
        // .andWhere('Post.dataType != :dataType', { dataType: 'retweeted' })
        .andWhere(`Post.lang = 'EN'`)
        .andWhere('Post.userId != 0')
        .andWhere('Post.id != 33321')
      if(sort == 'recommend'){
        popularPosts.andWhere('Post.score > 0.7')
      }
      if (this.paramsToArray(tags).length > 0) {
        popularPosts.andWhere(`Tag.name IN (${this.convertInQuery(tags)})`);
      }
      if (Object.keys(nextDecoded).length > 0) {
        if(sort){
          switch(sort){
            case 'recent':
              popularPosts.andWhere(
                `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.recent}`,
              );
              break;
            case 'mostViewed':
              popularPosts.andWhere(
                `CONCAT(LPAD(Post.viewCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostViewed}`,
              )
              break;
            case 'mostCommented':
              popularPosts.andWhere(
                `CONCAT(LPAD(Post.commentCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostCommented}`,
              )
              break;
            case 'mostVoted':
              popularPosts.andWhere(
                `CONCAT(LPAD(Post.voteCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostVoted}`,
              )
              break;
            default:
              popularPosts.andWhere(
                `
                (Post.score * ${postWeight.POST_SCORE_WEIGHT}) 
                + IF(
                  (Post.viewCount * ${postWeight.POST_VIEW_WEIGHT})
                  + (Post.commentCount * ${postWeight.POST_COMMENT_WEIGHT})
                  + (Post.upVoteCount * ${postWeight.POST_VOTE_WEIGHT}) > ${postWeight.POST_MAX_SCORE},
                  ${postWeight.POST_MAX_SCORE},
                  (Post.viewCount * ${postWeight.POST_VIEW_WEIGHT})
                  + (Post.commentCount * ${postWeight.POST_COMMENT_WEIGHT})
                  + (Post.upVoteCount * ${postWeight.POST_VOTE_WEIGHT})
                )
                - EXP(TIMESTAMPDIFF(DAY, Post.createdAt, NOW()) * ${postWeight.POST_DATE_WEIGHT})
                < ${nextDecoded.score}`,
              );
              break;
          }
        }
      }
      switch (sort) {
        case 'recent':
          popularPosts
            .addOrderBy('Post.createdAt', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC');
        case 'mostViewed':
          popularPosts
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC')
            .addOrderBy('Post.createdAt', 'DESC');
          break;
        case 'mostCommented':
          popularPosts
            .addOrderBy('Post.commentCount', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.createdAt', 'DESC');
          break;
        case 'mostVoted':
          popularPosts
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC')
            .addOrderBy('Post.createdAt', 'DESC');
          break;
        default:
          popularPosts
            .addOrderBy(`

            (Post.score * ${postWeight.POST_SCORE_WEIGHT}) 
            + IF(
              (Post.viewCount * ${postWeight.POST_VIEW_WEIGHT})
              + (Post.commentCount * ${postWeight.POST_COMMENT_WEIGHT})
              + (Post.upVoteCount * ${postWeight.POST_VOTE_WEIGHT}) > ${postWeight.POST_MAX_SCORE},
              ${postWeight.POST_MAX_SCORE},
              (Post.viewCount * ${postWeight.POST_VIEW_WEIGHT})
              + (Post.commentCount * ${postWeight.POST_COMMENT_WEIGHT})
              + (Post.upVoteCount * ${postWeight.POST_VOTE_WEIGHT})
            )
            - EXP(TIMESTAMPDIFF(DAY, Post.createdAt, NOW()) * ${postWeight.POST_DATE_WEIGHT})
            
            `, 'DESC')
            .addOrderBy('Post.createdAt', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC');
      }
      popularPosts.limit(postCount).setQueryRunner(queryRunner);
      const postResult = await popularPosts.getRawMany();

      const finalPost: ReturnPost[] = postResult.map((item) => {
        return {
          postId: item.postId,
          lang: item.lang,
          score: item.score,
          recommendScore: item.recommendScore,
          dataType: item.dataType,
          userId: item.User_id,
          userName: item.User_name,
          userProfilePath: item.User_profileImagePath
            ? item.User_profileImagePath
            : null,
          userTitle: item.User_titleId,
          userTitleName: item.Title_name,
          authorId: item.authorId,
          authorName: item.authorName,
          authorProfilePath: item.authorProfilePath,
          authorLink: item.authorLink,
          authorType: item.authorType,
          authorReservation1: item.authorReservation1,
          authorReservation2: item.authorReservation2,
          originLink: item.originLink,
          title: item.title,
          contents: item.contents,
          thumbnail: item.thumbnail ? item.thumbnail : null,
          imageCount: item.imageCount,
          viewCount: item.viewCount,
          commentCount: item.commentCount,
          voteCount: item.voteCount,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          vote: item.vote,
          isMine: item.userId === userId ? true : false,
          isEdit: Boolean(item.isEdit),
          isNSFW: Boolean(item.isNSFW),
          isVerified: Boolean(item.UserGradeMap_isVerified),
          hasReferral: Boolean(item.hasReferral),
          tags: item.tags ? String(item.tags).split(',') : [],
        };
      });

      const lastPost = postResult[postResult.length - 1];

      let responseNext: any = null;
      if (lastPost) {
        if(sort == 'recent'){
          responseNext = {
            recent: lastPost.recentCursor,
          };
        } else if (sort == 'mostViewed') {
          responseNext = {
            mostViewed: lastPost.viewCursor,
          };
        } else if (sort == 'mostCommented') {
          responseNext = {
            mostCommented: lastPost.commentCursor,
          };
        } else if (sort == 'mostVoted') {
          responseNext = {
            mostVoted: lastPost.voteCursor,
          };
        } else {
          responseNext = {
            score: lastPost.recommendScore
          }
        }
      }

      if (responseNext) {
        responseNext = Buffer.from(
          JSON.stringify(responseNext),
          'utf-8',
        ).toString('base64');
      }

      return {
        list: finalPost ? finalPost : [],
        next: responseNext,
      };
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release();
    }

    return {
      list: [],
      next: null,
    };
  }

  async getFollowPosts(
    userId: number | null,
    tags: string[],
    sort: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented' | 'recommend',
    next: string,
    bot: string | undefined,
    lang: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner('slave');
    try {
      const nextDecoded = this.nextToObject(next);
      const postCount = 20;
      const followPosts = this.postRepository
        .createQueryBuilder('Post')
        .select('Post.postId AS postId')
        .addSelect('Post.lang AS lang')
        .addSelect('Post.dataType AS dataType')
        .addSelect('Post.userId AS userId')

        .addSelect('Post.authorId AS authorId')
        .addSelect('Post.authorName AS authorName')
        .addSelect('Post.authorProfilePath AS authorProfilePath')
        .addSelect('Post.authorLink AS authorLink')
        .addSelect('Post.authorType AS authorType')
        .addSelect('Post.authorReservation1 AS authorReservation1')
        .addSelect('Post.authorReservation2 AS authorReservation2')
        .addSelect('Post.originLink AS originLink')

        .addSelect('Post.title AS title')
        .addSelect('Post.thumbnail AS thumbnail')
        .addSelect('Post.contents AS contents')
        .addSelect('Post.imageCount AS imageCount')
        .addSelect('Post.viewCount AS viewCount')
        .addSelect('Post.commentCount AS commentCount')
        .addSelect('Post.upVoteCount AS voteCount')

        .addSelect('Post.isNSFW AS isNSFW')
        .addSelect('Post.isEdit AS isEdit')
        .addSelect('Post.hasReferral AS hasReferral')
        .addSelect('Post.createdAt AS createdAt')
        .addSelect('Post.updatedAt AS updatedAt')
        .addSelect(`IF(Post.userId = ${userId}, TRUE, FALSE) AS isMine`)
        .addSelect(
          `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.id, 10, '0')) AS recentCursor`,
        )
        .addSelect(
          `CONCAT(LPAD(Post.viewCount, 10, '0'), LPAD(Post.id, 10, '0')) AS viewCursor`,
        )
        .addSelect(
          `CONCAT(LPAD(Post.commentCount, 10, '0'), LPAD(Post.id, 10, '0')) AS commentCursor`,
        )
        .addSelect(
          `CONCAT(LPAD(Post.voteCount, 10, '0'), LPAD(Post.id, 10, '0')) AS voteCursor`,
        )
        .addSelect((subQuery) => {
          return subQuery
            .select(`GROUP_CONCAT(Tag.name)`)
            .from(Tag, 'Tag')
            .where('Tag.postId = Post.postId');
        }, 'tags')
        .addSelect((subQuery) => {
          return subQuery
            .select('PostVote.voteType', 'voteType')
            .from(PostVote, 'PostVote')
            .where('PostVote.userId = :userId', { userId: userId })
            .andWhere('PostVote.postId = Post.postId')
            .andWhere('PostVote.deletedAt IS NULL');
        }, 'vote')
        .leftJoinAndSelect('Post.user', 'User')
        .leftJoinAndSelect(Title, 'Title', 'Title.id = User.titleId')
        .leftJoinAndSelect(
          UserGradeMap,
          'UserGradeMap',
          'UserGradeMap.userId = User.id',
        )
        .leftJoin('Post.tag', 'Tag')
        .groupBy('Post.postId')
        .where('Post.deletedAt IS NULL')
        .andWhere('Post.dataType != :dataType', { dataType: 'retweeted' })
        .andWhere(`Post.lang = 'EN'`)
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('UserFollow.toUserId')
            .from(UserFollow, 'UserFollow')
            .where('UserFollow.fromUserId = :userId', { userId: userId })
            .getQuery();
          return 'Post.userId IN ' + subQuery;
        });
      if (!JSON.parse(bot)) {
        followPosts.andWhere('Post.userId != 0');
      }
      if (this.paramsToArray(tags).length > 0) {
        followPosts.andWhere(`Tag.name IN (${this.convertInQuery(tags)})`);
      }
      if (nextDecoded) {
        if (sort == 'recent' && nextDecoded.recent) {
          followPosts.andWhere(
            `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.recent}`,
          );
        } else if (sort == 'mostViewed' && nextDecoded.mostViewed) {
          followPosts.andWhere(
            `CONCAT(LPAD(Post.viewCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostViewed}`,
          );
        } else if (sort == 'mostCommented' && nextDecoded.mostCommented) {
          followPosts.andWhere(
            `CONCAT(LPAD(Post.commentCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostCommented}`,
          );
        } else if (sort == 'mostVoted' && nextDecoded.mostVoted) {
          followPosts.andWhere(
            `CONCAT(LPAD(Post.voteCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostVoted}`,
          );
        }
      }
      switch (sort) {
        case 'mostViewed':
          followPosts
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC')
            .addOrderBy('Post.createdAt', 'DESC');
          break;
        case 'mostCommented':
          followPosts
            .addOrderBy('Post.commentCount', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.createdAt', 'DESC');
          break;
        case 'mostVoted':
          followPosts
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC')
            .addOrderBy('Post.createdAt', 'DESC');
          break;
        default:
          followPosts
            .addOrderBy('Post.createdAt', 'DESC')
            .addOrderBy('Post.postId', 'DESC')
            .addOrderBy('Post.viewCount', 'DESC')
            .addOrderBy('Post.voteCount', 'DESC')
            .addOrderBy('Post.commentCount', 'DESC');
      }
      followPosts.limit(postCount).setQueryRunner(queryRunner);
      // console.log(followPosts.getQuery())
      const postResult = await followPosts.getRawMany();

      const finalPost: ReturnPost[] = postResult.map((item) => {
        return {
          postId: item.postId,
          lang: item.lang,
          dataType: item.dataType,
          userId: item.User_id,
          userName: item.User_name,
          userProfilePath: item.User_profileImagePath
            ? item.User_profileImagePath
            : null,
          userTitle: item.User_titleId,
          userTitleName: item.Title_name,
          authorId: item.authorId,
          authorName: item.authorName,
          authorProfilePath: item.authorProfilePath,
          authorLink: item.authorLink,
          authorType: item.authorType,
          authorReservation1: item.authorReservation1,
          authorReservation2: item.authorReservation2,
          originLink: item.originLink,
          title: item.title,
          contents: item.contents,
          thumbnail: item.thumbnail ? item.thumbnail : null,
          imageCount: item.imageCount,
          viewCount: item.viewCount,
          commentCount: item.commentCount,
          voteCount: item.voteCount,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          vote: item.vote ? item.vote : null,
          isMine: item.userId === userId ? true : false,
          isEdit: Boolean(item.isEdit),
          isNSFW: Boolean(item.isNSFW),
          isVerified: Boolean(item.UserGradeMap_isVerified),
          hasReferral: Boolean(item.hasReferral),
          tags: item.tags ? String(item.tags).split(',') : [],
        };
      });

      const lastPost = postResult[postResult.length - 1];

      let responseNext: any = null;
      if (lastPost) {
        if (sort == 'recent') {
          responseNext = {
            recent: lastPost.recentCursor,
          };
        } else if (sort == 'mostViewed') {
          responseNext = {
            mostViewed: lastPost.viewCursor,
          };
        } else if (sort == 'mostCommented') {
          responseNext = {
            mostCommented: lastPost.commentCursor,
          };
        } else if (sort == 'mostVoted') {
          responseNext = {
            mostVoted: lastPost.voteCursor,
          };
        }
      }

      if (responseNext) {
        responseNext = Buffer.from(
          JSON.stringify(responseNext),
          'utf-8',
        ).toString('base64');
      }

      return {
        list: finalPost ? finalPost : [],
        next: responseNext,
      };
    } catch (error) {
      console.log(error);
    } finally {
      await queryRunner.release();
    }

    return {
      list: [],
      next: null,
    };
  }

  // randomNum(min: number, max: number){
  //   var randNum = Math.floor(Math.random()*(max-min+1)) + min;
  //   return randNum;
  // }

  // async getPostsByRandomBot(
  //   userId: number | null,
  //   tags: string[],
  //   sort: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented',
  //   next: string,
  //   bot: string | undefined,
  //   lang: string,
  // ){
  //   try {
  //     const nextDecoded = this.nextToObject(next);
  //     const postCount = 20;
  //     const humanPostCount = bot == 'true' ? this.randomNum(10, 12) : 20
  //     const botPostCount = postCount - humanPostCount
  //     const queryRunner = this.dataSource.createQueryRunner('slave');
  //     const popularPosts = this.postRepository
  //       .createQueryBuilder('Post')
  //       .select('Post.postId AS postId')
  //       .addSelect('Post.lang AS lang')
  //       .addSelect('Post.dataType AS dataType')
  //       .addSelect('Post.userId AS userId')

  //       .addSelect('Post.authorId AS authorId')
  //       .addSelect('Post.authorName AS authorName')
  //       .addSelect('Post.authorProfilePath AS authorProfilePath')
  //       .addSelect('Post.authorLink AS authorLink')
  //       .addSelect('Post.authorType AS authorType')
  //       .addSelect('Post.authorReservation1 AS authorReservation1')
  //       .addSelect('Post.authorReservation2 AS authorReservation2')
  //       .addSelect('Post.originLink AS originLink')

  //       .addSelect('Post.title AS title')
  //       .addSelect('Post.thumbnail AS thumbnail')
  //       .addSelect('Post.contents AS contents')
  //       .addSelect('Post.imageCount AS imageCount')
  //       .addSelect('Post.viewCount AS viewCount')
  //       .addSelect('Post.commentCount AS commentCount')
  //       .addSelect('Post.upVoteCount AS voteCount')

  //       .addSelect('Post.isNSFW AS isNSFW')
  //       .addSelect('Post.isEdit AS isEdit')
  //       .addSelect('Post.hasReferral AS hasReferral')
  //       .addSelect('Post.createdAt AS createdAt')
  //       .addSelect('Post.updatedAt AS updatedAt')
  //       .addSelect(`IF(Post.userId = ${userId}, TRUE, FALSE) AS isMine`)
  //       .addSelect(
  //         `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.id, 10, '0')) AS recentCursor`,
  //       )
  //       .addSelect(
  //         `CONCAT(LPAD(Post.viewCount, 10, '0'), LPAD(Post.id, 10, '0')) AS viewCursor`,
  //       )
  //       .addSelect(
  //         `CONCAT(LPAD(Post.commentCount, 10, '0'), LPAD(Post.id, 10, '0')) AS commentCursor`,
  //       )
  //       .addSelect(
  //         `CONCAT(LPAD(Post.voteCount, 10, '0'), LPAD(Post.id, 10, '0')) AS voteCursor`,
  //       )
  //       .addSelect((subQuery) => {
  //         return subQuery
  //           .select(`GROUP_CONCAT(Tag.name)`)
  //           .from(Tag, 'Tag')
  //           .where('Tag.postId = Post.postId');
  //       }, 'tags')
  //       .addSelect((subQuery) => {
  //         return subQuery
  //           .select('PostVote.voteType', 'voteType')
  //           .from(PostVote, 'PostVote')
  //           .where('PostVote.userId = :userId', { userId: userId })
  //           .andWhere('PostVote.postId = Post.id')
  //           .andWhere('PostVote.deletedAt IS NULL');
  //       }, 'vote')
  //       .leftJoinAndSelect('Post.user', 'User')
  //       .leftJoinAndSelect(Title, 'Title', 'Title.id = User.titleId')
  //       .leftJoinAndSelect(
  //         UserGradeMap,
  //         'UserGradeMap',
  //         'UserGradeMap.userId = User.id',
  //       )
  //       .leftJoin('Post.tag', 'Tag')
  //       .groupBy('Post.postId')
  //       .where('Post.deletedAt IS NULL')
  //       .andWhere('Post.dataType != :dataType', { dataType: 'retweeted' })
  //       .andWhere(`Post.lang = 'EN'`)
  //       .andWhere('Post.userId != 0');
  //     if (this.paramsToArray(tags).length > 0) {
  //       popularPosts.andWhere(`Tag.name IN (${this.convertInQuery(tags)})`);
  //     }
  //     if (nextDecoded) {
  //       if (sort == 'recent' && nextDecoded.recent) {
  //         popularPosts
  //           .andWhere(
  //             `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.recent}`,
  //           );
  //       } else if (sort == 'mostViewed' && nextDecoded.mostViewed) {
  //         popularPosts
  //           .andWhere(
  //             `CONCAT(LPAD(Post.viewCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostViewed}`,
  //           )
  //           .andWhere(`Post.selectedAt IS NOT NULL`);
  //       } else if (sort == 'mostCommented' && nextDecoded.mostCommented) {
  //         popularPosts
  //           .andWhere(
  //             `CONCAT(LPAD(Post.commentCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostCommented}`,
  //           )
  //           .andWhere(`Post.selectedAt IS NOT NULL`);
  //       } else if (sort == 'mostVoted' && nextDecoded.mostVoted) {
  //         popularPosts
  //           .andWhere(
  //             `CONCAT(LPAD(Post.voteCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostVoted}`,
  //           )
  //           .andWhere(`Post.selectedAt IS NOT NULL`);
  //       }
  //     }
  //     switch (sort) {
  //       case 'mostViewed':
  //         popularPosts
  //           .addOrderBy('Post.viewCount', 'DESC')
  //           .addOrderBy('Post.postId', 'DESC')
  //           .addOrderBy('Post.voteCount', 'DESC')
  //           .addOrderBy('Post.commentCount', 'DESC')
  //           .addOrderBy('Post.createdAt', 'DESC');
  //         break;
  //       case 'mostCommented':
  //         popularPosts
  //           .addOrderBy('Post.commentCount', 'DESC')
  //           .addOrderBy('Post.postId', 'DESC')
  //           .addOrderBy('Post.viewCount', 'DESC')
  //           .addOrderBy('Post.voteCount', 'DESC')
  //           .addOrderBy('Post.createdAt', 'DESC');
  //         break;
  //       case 'mostVoted':
  //         popularPosts
  //           .addOrderBy('Post.voteCount', 'DESC')
  //           .addOrderBy('Post.postId', 'DESC')
  //           .addOrderBy('Post.viewCount', 'DESC')
  //           .addOrderBy('Post.commentCount', 'DESC')
  //           .addOrderBy('Post.createdAt', 'DESC');
  //         break;
  //       default:
  //         popularPosts
  //           .addOrderBy('Post.createdAt', 'DESC')
  //           .addOrderBy('Post.postId', 'DESC')
  //           .addOrderBy('Post.viewCount', 'DESC')
  //           .addOrderBy('Post.voteCount', 'DESC')
  //           .addOrderBy('Post.commentCount', 'DESC');
  //     }
  //     popularPosts.limit(humanPostCount).setQueryRunner(queryRunner);
  //     const humanResult = await popularPosts.getRawMany();
  //     const lastHumanPostNext = humanResult.length > 0 ? humanResult[humanResult.length - 1].recentCursor : null;
  //     const firstHumanPostNext = humanResult.length > 0 ? humanResult[0].recentCursor : null;
      
  //     let botResult = [];
  //     if(botPostCount > 0){
  //       const addBotPost = this.postRepository
  //         .createQueryBuilder('Post')
  //         .select('Post.postId AS postId')
  //         .addSelect('Post.lang AS lang')
  //         .addSelect('Post.dataType AS dataType')
  //         .addSelect('Post.userId AS userId')

  //         .addSelect('Post.authorId AS authorId')
  //         .addSelect('Post.authorName AS authorName')
  //         .addSelect('Post.authorProfilePath AS authorProfilePath')
  //         .addSelect('Post.authorLink AS authorLink')
  //         .addSelect('Post.authorType AS authorType')
  //         .addSelect('Post.authorReservation1 AS authorReservation1')
  //         .addSelect('Post.authorReservation2 AS authorReservation2')
  //         .addSelect('Post.originLink AS originLink')

  //         .addSelect('Post.title AS title')
  //         .addSelect('Post.thumbnail AS thumbnail')
  //         .addSelect('Post.contents AS contents')
  //         .addSelect('Post.imageCount AS imageCount')
  //         .addSelect('Post.viewCount AS viewCount')
  //         .addSelect('Post.commentCount AS commentCount')
  //         .addSelect('Post.upVoteCount AS voteCount')

  //         .addSelect('Post.isNSFW AS isNSFW')
  //         .addSelect('Post.isEdit AS isEdit')
  //         .addSelect('Post.hasReferral AS hasReferral')
  //         .addSelect('Post.createdAt AS createdAt')
  //         .addSelect('Post.updatedAt AS updatedAt')
  //         .addSelect(`IF(Post.userId = ${userId}, TRUE, FALSE) AS isMine`)
  //         .addSelect(
  //           `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.id, 10, '0')) AS recentCursor`,
  //         )
  //         .addSelect(
  //           `CONCAT(LPAD(Post.viewCount, 10, '0'), LPAD(Post.id, 10, '0')) AS viewCursor`,
  //         )
  //         .addSelect(
  //           `CONCAT(LPAD(Post.commentCount, 10, '0'), LPAD(Post.id, 10, '0')) AS commentCursor`,
  //         )
  //         .addSelect(
  //           `CONCAT(LPAD(Post.voteCount, 10, '0'), LPAD(Post.id, 10, '0')) AS voteCursor`,
  //         )
  //         .addSelect((subQuery) => {
  //           return subQuery
  //             .select(`GROUP_CONCAT(Tag.name)`)
  //             .from(Tag, 'Tag')
  //             .where('Tag.postId = Post.postId');
  //         }, 'tags')
  //         .addSelect((subQuery) => {
  //           return subQuery
  //             .select('PostVote.voteType', 'voteType')
  //             .from(PostVote, 'PostVote')
  //             .where('PostVote.userId = :userId', { userId: userId })
  //             .andWhere('PostVote.postId = Post.id')
  //             .andWhere('PostVote.deletedAt IS NULL');
  //         }, 'vote')
  //         .leftJoinAndSelect('Post.user', 'User')
  //         .leftJoinAndSelect(Title, 'Title', 'Title.id = User.titleId')
  //         .leftJoinAndSelect(
  //           UserGradeMap,
  //           'UserGradeMap',
  //           'UserGradeMap.userId = User.id',
  //         )
  //         .leftJoin('Post.tag', 'Tag')
  //         .groupBy('Post.postId')
  //         .where('Post.deletedAt IS NULL')
  //         .andWhere('Post.dataType != :dataType', { dataType: 'retweeted' })
  //         .andWhere(`Post.lang = 'EN'`)
  //         .andWhere('Post.userId = 0');
        
  //       if (this.paramsToArray(tags).length > 0) {
  //         addBotPost.andWhere(`Tag.name IN (${this.convertInQuery(tags)})`);
  //       }

  //       if(humanResult.length > 0){
  //         addBotPost
  //         .andWhere(
  //           `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.postId, 10, '0')) < ${firstHumanPostNext}`,
  //         )
  //         .andWhere(
  //           `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.postId, 10, '0')) > ${lastHumanPostNext}`,
  //         )
  //       } else {
  //         if (nextDecoded) {
  //           if (sort == 'recent' && nextDecoded.recent) {
  //             addBotPost
  //               .andWhere(
  //                 `CONCAT(LPAD(UNIX_TIMESTAMP(Post.createdAt), 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.recent}`,
  //               );
  //           } else if (sort == 'mostViewed' && nextDecoded.mostViewed) {
  //             addBotPost
  //               .andWhere(
  //                 `CONCAT(LPAD(Post.viewCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostViewed}`,
  //               )
  //               .andWhere(`Post.selectedAt IS NOT NULL`);
  //           } else if (sort == 'mostCommented' && nextDecoded.mostCommented) {
  //             addBotPost
  //               .andWhere(
  //                 `CONCAT(LPAD(Post.commentCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostCommented}`,
  //               )
  //               .andWhere(`Post.selectedAt IS NOT NULL`);
  //           } else if (sort == 'mostVoted' && nextDecoded.mostVoted) {
  //             addBotPost
  //               .andWhere(
  //                 `CONCAT(LPAD(Post.voteCount, 10, '0'), LPAD(Post.postId, 10, '0')) < ${nextDecoded.mostVoted}`,
  //               )
  //               .andWhere(`Post.selectedAt IS NOT NULL`);
  //           }
  //         }
  //       }
  //       if(humanResult.length > 0){

  //         addBotPost
  //         .orderBy('RAND()')
  //       } else {
  //         addBotPost
  //         .orderBy('Post.createdAt', 'DESC')
  //       }
  //       addBotPost
  //         .limit(botPostCount)
  //         .setQueryRunner(queryRunner);

  //       botResult = await addBotPost.getRawMany();
  //     }

  //     const postResult = [...humanResult, ...botResult];
  //     postResult.sort((a, b) => {
  //       if (a.createdAt > b.createdAt) {
  //         return -1;
  //       } else if (a.createdAt < b.createdAt) {
  //         return 1;
  //       } else {
  //         return 0;
  //       }
  //     })

  //     const lastPost = postResult[postResult.length - 1];

  //     const finalPost: ReturnPost[] = postResult.map((item) => {
  //       return {
  //         postId: item.postId,
  //         lang: item.lang,
  //         dataType: item.dataType,
  //         userId: item.User_id,
  //         userName: item.User_name,
  //         userProfilePath: item.User_profileImagePath
  //           ? item.User_profileImagePath
  //           : null,
  //         userTitle: item.User_titleId,
  //         userTitleName: item.Title_name,
  //         authorId: item.authorId,
  //         authorName: item.authorName,
  //         authorProfilePath: item.authorProfilePath,
  //         authorLink: item.authorLink,
  //         authorType: item.authorType,
  //         authorReservation1: item.authorReservation1,
  //         authorReservation2: item.authorReservation2,
  //         originLink: item.originLink,
  //         title: item.title,
  //         contents: item.contents,
  //         thumbnail: item.thumbnail ? item.thumbnail : null,
  //         imageCount: item.imageCount,
  //         viewCount: item.viewCount,
  //         commentCount: item.commentCount,
  //         voteCount: item.voteCount,
  //         createdAt: item.createdAt,
  //         updatedAt: item.updatedAt,
  //         vote: item.vote,
  //         isMine: item.userId === userId ? true : false,
  //         isEdit: Boolean(item.isEdit),
  //         isNSFW: Boolean(item.isNSFW),
  //         isVerified: Boolean(item.UserGradeMap_isVerified),
  //         hasReferral: Boolean(item.hasReferral),
  //         tags: item.tags ? String(item.tags).split(',') : [],
  //       };
  //     });

  //     let responseNext: any;
  //     if (lastPost) {
  //       if (sort == 'recent') {
  //         responseNext = {
  //           recent: lastPost.recentCursor,
  //         };
  //       } else if (sort == 'mostViewed') {
  //         responseNext = {
  //           mostViewed: lastPost.viewCursor,
  //         };
  //       } else if (sort == 'mostCommented') {
  //         responseNext = {
  //           mostCommented: lastPost.commentCursor,
  //         };
  //       } else if (sort == 'mostVoted') {
  //         responseNext = {
  //           mostVoted: lastPost.voteCursor,
  //         };
  //       }
  //     }

  //     if (responseNext) {
  //       responseNext = Buffer.from(
  //         JSON.stringify(responseNext),
  //         'utf-8',
  //       ).toString('base64');
  //     }

  //     return {
  //       list: finalPost ? finalPost : [],
  //       next: responseNext,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //   }

  //   return {
  //     list: [],
  //     next: null,
  //   };
  // }


  async getPostListTemplate(): Promise<string>{

    try {
      const query = SQL`SELECT AppConfig.value FROM AppConfig WHERE AppConfig.key = 'POST_LIST_TEMPLATE'`
      // POST_LIST_TEMPLATE
      // const result = await this.connectionService.connectionPool.readerQuerySingle<
      // [key: string]: number[][]
      // >(query)
      const result = 
      await this.connectionService.connectionPool.readerQuerySingle<{
        [key: string]: string;
      }>(query)
      return result['value']
      
    } catch (error) {
      console.log(error)
      throw new OGException({
        errorCode: -1,
        errorMessage: 'Get App config template failed'
      })
    }

    return 

  }
}







import { Injectable } from '@nestjs/common';
import axios from 'axios';
import moment from 'moment';
import { SearchPost, SearchPostSource } from './entities/search-post.entity';
import { SearchAssets, SearchTag, SearchTagSource } from './entities/search-tag.entity';
import { SearchUser } from './entities/search-user.entity';
import { escape } from 'querystring';
import { Repository, Like, ILike, Brackets } from 'typeorm';
import { Topic } from 'src/topics/entities/topic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { take } from 'rxjs';
import { PostVote } from 'src/post/entities/postVote.entity';
import { ChartDataId } from 'src/chart/entities/chartDataId.entity';
import { ChartData } from 'src/chart/entities/chart.entitiy';
import { Post } from 'src/post/entities/post.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { Title } from 'src/user/entities/title/title.entity';
import { UserGradeMap } from 'src/user/entities/grade-map/user-grade-map.entity';
import { ReturnPost } from 'src/post/dto/return-post.dto';

@Injectable()
export class SearchService {

  constructor(

    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,
    @InjectRepository(ChartData)
    private readonly chartDataRepository: Repository<ChartData>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    

  ){}

  async getSearchInPostByKeyword(
    q: string,
    page: number = 1,
    lang: string,
    size: number = 20,
    sorting: 'recent' | 'mostViewed' | 'mostVoted' | 'mostCommented' = 'recent',
    userId: number
  ): Promise<ReturnPost[]> {
    try {
      if (page <= 0) throw new Error()
      if (size <= 0 || size > 20) throw new Error()
      let sortString = 'postCreatedAt';
      switch (sorting) {
        case 'mostViewed':
          sortString = 'viewCount';
          break;
        case 'mostVoted':
          sortString = 'voteCount';
          break;
        case 'mostCommented':
          sortString = 'commentCount';
          break;
        default:
          sortString = 'postCreatedAt'
      }
      const sort = [
        { [sortString]: { order: 'desc' } },
        '_score'
      ]
      const result = await axios.post(
        `https://vpc-og-community-vza7okejvxlssdzzhrxza2m2hi.ap-southeast-1.es.amazonaws.com/post/_search`,
        {
          sort,
          "query": {
            "bool": {
              "must": [{
                "multi_match": {
                  "query": q,
                  "fields": ["title^3", "contentSerialize^2", "userName", "authorName"]
                }
              }],
              "must_not": [
                {
                  "exists": {
                    "field": "postDeletedAt"
                  },
                },
                {
                  "term": {
                    "dataType": "retweeted"
                  }
                }
              ]
            }
          },
          "track_total_hits": false,
          "track_scores": false,
          from: ((page - 1) * size) ?? 0,
          "size": size
        }
      )
      const resultArray = result.data?.hits?.hits?.reduce((prev: any, cur: any) => {
        const source: SearchPostSource = cur._source;
        prev.push(source.id)
        return prev
      }, []);


      let finalPost: ReturnPost[] = [];
      if(resultArray.length > 0){

        const searchPost = this.postRepository
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
          .andWhere('Post.postId IN (:...postId)', { postId: resultArray })
          .andWhere('Post.dataType != :dataType', { dataType: 'retweeted' })
          .andWhere(`Post.lang = 'EN'`);
        switch (sorting) {
          case 'mostViewed':
            searchPost
              .addOrderBy('Post.viewCount', 'DESC')
              .addOrderBy('Post.postId', 'DESC')
              .addOrderBy('Post.voteCount', 'DESC')
              .addOrderBy('Post.commentCount', 'DESC')
              .addOrderBy('Post.createdAt', 'DESC');
            break;
          case 'mostCommented':
            searchPost
              .addOrderBy('Post.commentCount', 'DESC')
              .addOrderBy('Post.postId', 'DESC')
              .addOrderBy('Post.viewCount', 'DESC')
              .addOrderBy('Post.voteCount', 'DESC')
              .addOrderBy('Post.createdAt', 'DESC');
            break;
          case 'mostVoted':
            searchPost
              .addOrderBy('Post.voteCount', 'DESC')
              .addOrderBy('Post.postId', 'DESC')
              .addOrderBy('Post.viewCount', 'DESC')
              .addOrderBy('Post.commentCount', 'DESC')
              .addOrderBy('Post.createdAt', 'DESC');
            break;
          default:
            searchPost
              .addOrderBy('Post.createdAt', 'DESC')
              .addOrderBy('Post.postId', 'DESC')
              .addOrderBy('Post.viewCount', 'DESC')
              .addOrderBy('Post.voteCount', 'DESC')
              .addOrderBy('Post.commentCount', 'DESC');
        }
        const postResult = await searchPost.getRawMany();

        finalPost = postResult.map((item) => {
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
            tags: item.tags ? String(item.tags).split(',') : [],
          };
        });
      }

      return finalPost
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async getSearchInUserByKeyword(q: string, page: number = 1, lang: string, size: number = 100): Promise<SearchUser[]> {

    if (page <= 0) throw new Error()
    if (size <= 0 || size > 200) throw new Error()

    const quertyildCard = `*${q}*`;
    const result = await axios.post(
      `https://vpc-og-community-vza7okejvxlssdzzhrxza2m2hi.ap-southeast-1.es.amazonaws.com/user/_search`,
      {
        "sort": [
          { "followerCount": { "order": "desc" } },
          "_score"
        ],
        "query": {
          "bool": {
            "should": [
              { "wildcard": { "name": { "value":quertyildCard, "boost": 1.0 } } },
              { "wildcard": { "bio": { "value":quertyildCard, "boost": 0.2 } } }
            ],
            "must_not": [{
              "exists": {
                "field": "deletedAt"
              }
            }]
          }
        },
        "track_total_hits": false,
        "track_scores": false,
        from: ((page - 1) * size) ?? 0,
        "size": size
      }
    )
    return result.data?.hits?.hits?.map(hit => {
      const source: SearchUser = hit._source;
      return {
        id: source.id,
        bio: source.bio,
        followerCount: source.followerCount,
        followingCount: source.followingCount,
        localizeCode: source.localizeCode,
        name: source.name,
        profileImagePath: source.profileImagePath,
        titleId: source.titleId,
        titleName: source.titleName,
        createdAt: source.createdAt,
        updatedAt: source.updatedAt,
        deletedAt: source.deletedAt,
        expiredAt: source.expiredAt,
      }
    });

  }

  async getSearchInAssetByKeyword(q: string, page: number = 1, lang: string, size: number = 100): Promise<SearchAssets[]> {
    try {
      if (page <= 0) throw new Error()
      if (size <= 0 || size > 200) throw new Error()

      const assets: SearchAssets[] = await this.topicRepository.createQueryBuilder('Topic')
        .select('Topic.name', 'topic')
        .addSelect('Topic.name', 'name')
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
        .where(new Brackets(qb => {
          qb.where('Topic.type = "cryptocurrency"')
            .orWhere('Topic.type = "nft"')
        }))
        .andWhere(new Brackets(qb => {
          qb.where('Topic.name LIKE :name', { name: `%${q}%` })
            .orWhere(`Topic.synonyms REGEXP '${q.toUpperCase()}'`)
            .orWhere(`Topic.synonyms REGEXP '${q.toLowerCase()}'`)
        }))
        .getRawMany()

      const resultArray = []

      for(let i = 0; i < assets.length; i++){
        const item = assets[i]
        item.changePrice = null
        item.price = null
        if(item.type == 'cryptocurrency'){
          const data = await this.chartDataRepository.createQueryBuilder('ChartData')
            .select('ChartData.data', 'data')
            .where('ChartData.chartDataId = :chartDataId', { chartDataId: item.chartDataId })
            .andWhere('ChartData.period = :period', { period: '24H' })
            .getRawOne()
          const firstPrice = data.data.prices[0][1]
          const lastPrice = data.data.prices[data.data.prices.length - 1][1]
          const changePercent = ((lastPrice - firstPrice)/firstPrice) * 100
          item.changePrice = Number(changePercent.toFixed(2))
          item.price = Number(lastPrice.toFixed(2))
        }
        resultArray.push(item)
      }
      
      return resultArray

    } catch (e) {
      console.log(e);
      return [];
    }
  }

  createHistoryToEs(q: string, lang: string): void {
    try {
      const date: string = moment().format();
      axios.post(
        `https://vpc-og-community-vza7okejvxlssdzzhrxza2m2hi.ap-southeast-1.es.amazonaws.com/auto_complete/_update/${q}`,
        {
          script: {
            source: "ctx._source.useCount += params.count; ctx._source.updatedAt = params.now",
            lang: "painless",
            params: {
              count: 1,
              now: date
            }
          },
          upsert: {
            word: q,
            useCount: 0,
            updatedAt: date
          }
        }
      )

    } catch (e) {
      console.log(e);
    }
  }
}

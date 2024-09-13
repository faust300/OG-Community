import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowService } from 'src/follow/follow.service';
import { OverviewData } from 'src/overview/entities/overview-data.entity';
import { PostDraft } from 'src/post/entities/draft.entity';
import { Post } from 'src/post/entities/post.entity';
import { PostReport } from 'src/post/entities/postReport.entity';
import { PostViewHistory } from 'src/post/entities/postViewHistory.entity';
import { PostVote } from 'src/post/entities/postVote.entity';
import { PromotionViewHistory } from 'src/promotion/entities/promotion-view.entity';
import { Promotion } from 'src/promotion/entities/promotion.entity';
import { PromotionsService } from 'src/promotions/promotions.service';
import { Tag } from 'src/tags/entities/tag.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { TopicsService } from 'src/topics/topics.service';
import { UserFollow } from 'src/user/entities/follow/user-follow.entity';
import { User } from 'src/user/entities/user.entity';
import { ConnectionService } from '../extensions/services/connection.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      User,
      Tag,
      PostVote,
      PostViewHistory,
      PostDraft,
      PostReport,
      Promotion,
      PromotionViewHistory,
      UserFollow,
      Topic,
      OverviewData
    ])
  ],
  controllers: [PostsController],
  providers: [PostsService, ConnectionService, PromotionsService, FollowService, TopicsService]
})
export class PostsModule {}

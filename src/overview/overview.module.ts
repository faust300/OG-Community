import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { PostDraft } from 'src/post/entities/draft.entity';
import { Post } from 'src/post/entities/post.entity';
import { PostReport } from 'src/post/entities/postReport.entity';
import { PostViewHistory } from 'src/post/entities/postViewHistory.entity';
import { PostVote } from 'src/post/entities/postVote.entity';
import { PostsService } from 'src/posts/posts.service';
import { PromotionViewHistory } from 'src/promotion/entities/promotion-view.entity';
import { Promotion } from 'src/promotion/entities/promotion.entity';
import { PromotionsService } from 'src/promotions/promotions.service';
import { Tag } from 'src/tags/entities/tag.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { User } from 'src/user/entities/user.entity';
import { OverviewData } from './entities/overview-data.entity';
import { Overview } from './entities/overview.entity';
import { OverviewController } from './overview.controller';
import { OverviewService } from './overview.service';
import { AggregateService } from 'src/aggregate/aggregate.service';
import { Aggregate } from 'src/aggregate/entities/aggregate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Overview, 
    OverviewData, 
    Post, 
    Tag, 
    Promotion, 
    PromotionViewHistory,
    User,
    PostVote,
    PostViewHistory,
    PostDraft,
    PostReport,
    Topic,
    Aggregate
  ])],
  controllers: [OverviewController],
  providers: [
    OverviewService,
    ConnectionService,
    PromotionsService,
    PostsService,
    AggregateService
  ]
})
export class OverviewModule {}

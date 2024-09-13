import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { AggregateService } from '../aggregate/aggregate.service';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aggregate } from 'src/aggregate/entities/aggregate.entity';
import { Topic } from 'src/topics/entities/topic.entity';
import { PostVote } from 'src/post/entities/postVote.entity';
import { ChartData } from 'src/chart/entities/chart.entitiy';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Aggregate,
    Topic,
    PostVote,
    ChartData,
    Post,
    User,
    PostVote,

  ])],
  controllers: [SearchController],
  providers: [SearchService, ConnectionService, AggregateService]
})
export class SearchModule {}

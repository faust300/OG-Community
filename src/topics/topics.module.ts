import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity';
import { UserService } from 'src/user/user.service';
import { Tag } from 'src/tags/entities/tag.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Topic,
      Tag,
      User
    ]),
  ],
  controllers: [TopicsController],
  providers: [TopicsService, ConnectionService]
})
export class TopicsModule {}

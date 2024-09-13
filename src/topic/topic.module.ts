import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { ConnectionService } from 'src/extensions/services/connection.service';
import { RMQService } from '../extensions/services/rmq.service';

@Module({
  controllers: [TopicController],
  providers: [TopicService, ConnectionService, RMQService]
})
export class TopicModule {}

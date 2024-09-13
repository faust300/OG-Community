import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ConnectionService } from '../extensions/services/connection.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Comment
    ])
  ],
  controllers: [CommentsController],
  providers: [CommentsService, ConnectionService]
})
export class CommentsModule {}

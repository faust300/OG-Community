import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { ConnectionService } from '../extensions/services/connection.service';
import { RMQService } from '../extensions/services/rmq.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { PostReport } from 'src/post/entities/postReport.entity';
import { CommentVote } from './entities/commentVote.entity';
import { AuthService } from 'src/extensions/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserSigninFailHistory } from 'src/sign/entities/user-signin-fail-history.entity';
import { UserPasswordFailHistory } from 'src/user/entities/password-fail-history/user-password-fail-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Comment,
      PostReport,
      CommentVote,
      UserSigninFailHistory,
      UserPasswordFailHistory,
    ])
  ],
  controllers: [CommentController],
  providers: [CommentService, ConnectionService, RMQService, AuthService, JwtService]
})
export class CommentModule {}

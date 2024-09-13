import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { ConnectionService } from '../extensions/services/connection.service';
import { RMQService } from '../extensions/services/rmq.service';
import { ReportService } from 'src/report/report.service';
import { PromotionsService } from 'src/promotions/promotions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Tag } from 'src/tags/entities/tag.entity';
import { PostVote } from './entities/postVote.entity';
import { PostViewHistory } from './entities/postViewHistory.entity';
import { PostDraft } from './entities/draft.entity';
import { PostReport } from './entities/postReport.entity';
import { Promotion } from 'src/promotion/entities/promotion.entity';
import { PromotionViewHistory } from 'src/promotion/entities/promotion-view.entity';
import { UserGradeMap } from 'src/user/entities/grade-map/user-grade-map.entity';
import { AuthService } from 'src/extensions/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserSigninFailHistory } from 'src/sign/entities/user-signin-fail-history.entity';
import { UserPasswordFailHistory } from 'src/user/entities/password-fail-history/user-password-fail-history.entity';
import { CommentVote } from 'src/comment/entities/commentVote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      User,
      UserGradeMap,
      Tag,
      PostVote,
      PostViewHistory,
      PostDraft,
      PostReport,
      Promotion,
      PromotionViewHistory,
      UserSigninFailHistory,
      UserPasswordFailHistory,
      CommentVote,
    ])
  ],
  controllers: [PostController],
  providers: [
    PostService,
    ConnectionService,
    RMQService,
    ReportService,
    PromotionsService,
    AuthService,
    JwtService,
  ]
})
export class PostModule {}

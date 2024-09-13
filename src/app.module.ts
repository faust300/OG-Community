import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregateModule } from './aggregate/aggregate.module';
import { AnalyzeModule } from './analyze/analyze.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChartModule } from './chart/chart.module';
import { CommentModule } from './comment/comment.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './extensions/auth/auth.module';
import { GlobalMiddleware } from './global.middleware';
import { Logger } from './libs/logger';
import { MemeBoxModule } from './meme-box/meme-box.module';
import { NotificationModule } from './notification/notification.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OverviewModule } from './overview/overview.module';
import { PickthemModule } from './pickthem/pickthem.module';
import { PostModule } from './post/post.module';
import { PostsModule } from './posts/posts.module';
import { PromotionModule } from './promotion/promotion.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReportModule } from './report/report.module';
import { SearchModule } from './search/search.module';
import { SignModule } from './sign/sign.module';
// import { TagsModule } from './tags/tags.module';
import { TopicModule } from './topic/topic.module';
import { TopicsModule } from './topics/topics.module';
import { TradeModule } from './trade/trade.module';
import { UserModule } from './user/user.module';
import { WidgetSourceModule } from './widget-source/widget-source.module';
import { WidgetsModule } from './widgets/widgets.module';
import { MembershipModule } from './membership/membership.module';
import { MembershipManageModule } from './membership-manage/membership-manage.module';
import { FollowController } from './follow/follow.controller';
import { FollowModule } from './follow/follow.module';
import { ConnectionService } from './extensions/services/connection.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      replication: {
        master: {
          host: process.env.DATABASE_HOST,
          port: 3306,
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASS,
          database: process.env.DATABASE_NAME,
        },
        slaves: [
          {
            host: process.env.DATABASE_RO_HOST,
          port: 3306,
          username: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASS,
          database: process.env.DATABASE_NAME,
          }
        ]
      },
      synchronize: false,
      logging: false,
      autoLoadEntities: true,
      entities: [
      ],
      migrations: [],
      extra: {
        connectionLimit: 2048
      }
    }),
    Logger.module,
    UserModule,
    PostModule,
    CommentModule,
    WidgetSourceModule,
    SearchModule,
    SignModule,
    TopicsModule,
    PostsModule,
    CommentsModule,
    WidgetsModule,
    // TagsModule,
    NotificationsModule,
    NotificationModule,
    TopicModule,
    AuthModule,
    WidgetsModule,
    ChartModule,
    OverviewModule,
    AggregateModule,
    ReportModule,
    PromotionModule,
    PromotionsModule,
    TradeModule,
    PickthemModule,
    AnalyzeModule,
    MemeBoxModule,
    MembershipModule,
    MembershipManageModule,
    FollowModule,
  ],
  controllers: [AppController],
  providers: [AppService, GlobalMiddleware, ConnectionService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(GlobalMiddleware).forRoutes('*');
  }
}

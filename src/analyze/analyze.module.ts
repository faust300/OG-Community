import { Module } from '@nestjs/common';
import { AnalyzeService } from './analyze.service';
import { AnalyzeController } from "./analyze.controller";
import { RedisService } from 'src/extensions/services/redis.service';

@Module({
  controllers: [AnalyzeController],
  providers: [
    AnalyzeService,
    RedisService
  ]
})
export class AnalyzeModule {}

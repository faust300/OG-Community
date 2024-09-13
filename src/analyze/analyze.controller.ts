import {Body, Controller, Post, Req, UseInterceptors} from '@nestjs/common';
import { AnalyzeService } from './analyze.service';
import { JWTAuthInterceptor } from 'src/extensions/auth/jwt-auth.interceptor';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { } from './dto/analyze.dto';
import {RedisService} from "../extensions/services/redis.service";

interface IBody {
	event: "HeartBeat" | "Push" | "Replace" | "Enter" | "Pop" | string,
	sessionId: string,
	userKey: number | null,
	referrer: string | null,
	from: string | null,
	to: string | null,
	ars: any[]
}

@Controller('analyze')
@UseInterceptors(JWTAuthInterceptor)
export class AnalyzeController {
  constructor(
    private readonly analyzeService: AnalyzeService,
    private readonly RedisService: RedisService
  ) { }

  @Post('record') // redis sessionKey, id
  async insertRecord(@Req() req: OGRequest, @Body() body: IBody) {
    const { lang, user } = req;
    const now = Date.now();

    /** :data */
    this.RedisService.redis.RPUSH('analyze:data', JSON.stringify({
      timestamp: now,
      ip: req.realIP || null,
      ...body
    }));

    /** :health */
    if(body.sessionId && body.userKey) {
      if(await this.RedisService.redis.HEXISTS('analyze:health:anonymous', body.sessionId)) {
        this.RedisService.redis.HDEL('analyze:health:anonymous', body.sessionId);
      }

      const exist = await this.RedisService.redis.HEXISTS('analyze:health:user', String(body.userKey));
      if(exist) {
        const prev = JSON.parse(await this.RedisService.redis.HGET('analyze:health:user', String(body.userKey)));
        this.RedisService.redis.HSET('analyze:health:user', body.userKey, JSON.stringify({
          start: prev.start,
          end: now,
          ip: req.realIP
        }));
      } else {
        this.RedisService.redis.HSET('analyze:health:user', body.userKey, JSON.stringify({
          start: now,
          ip: req.realIP
        }));
      }
    } else if(body.sessionId) {
      const exist = await this.RedisService.redis.HEXISTS('analyze:health:anonymous', body.sessionId);
      if(exist) {
        const prev = JSON.parse(await this.RedisService.redis.HGET('analyze:health:anonymous', body.sessionId));
        this.RedisService.redis.HSET('analyze:health:anonymous', body.sessionId, JSON.stringify({
          start: prev.start,
          end: now,
          ip: req.realIP
        }));
      } else {
        this.RedisService.redis.HSET('analyze:health:anonymous', body.sessionId, JSON.stringify({
          start: now,
          ip: req.realIP
        }));
      }
    }

    return {
      success: true
    };
  }

  @Post('health-check')
  async healthCheck(@Req() req: OGRequest, @Body() body) {

  }
}

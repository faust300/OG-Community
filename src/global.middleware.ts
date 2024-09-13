import { Injectable, NestMiddleware } from '@nestjs/common';
import { OGRequest } from './extensions/auth/auth.request';

const langs = ["KO", "EN", "ZH"]

@Injectable()
export class GlobalMiddleware implements NestMiddleware {
  use(req: OGRequest, res: any, next: () => void) {
    req.lang = langs.includes(String(req.headers['accepted-language'])) ? String(req.headers['accepted-language']) : "EN";
    req.realIP = req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']) : undefined;
    next();
  }
}

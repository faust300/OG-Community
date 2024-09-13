import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import moment from 'moment';
import { OGException } from 'src/extensions/exception/exception.filter';
import { AuthService } from '../auth.service';

@Injectable()
export class UserBlockPasswordGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ){ }
  async canActivate(context: ExecutionContext): Promise<boolean>{
    const headers = context.switchToHttp().getRequest().headers ?? { authorization: String() };
    const authorization = headers.authorization;
    const {body} = context.switchToHttp().getRequest();
    const nowUnixTime = Math.floor(new Date().getTime()/1000);

    // reset password
    if(!authorization){
      const userPasswordFailHistories = await this.authService.getUserPasswordFailHistoriesByEmail(body.email);
      if(userPasswordFailHistories.length >= 5){
        const lastFailUnixTime = userPasswordFailHistories[0].unixCreatedAt;
        if(nowUnixTime - lastFailUnixTime < 7200){
          throw new OGException({
            errorCode: -222,
            errorMessage: `Last access time: ${moment(userPasswordFailHistories[0].createdAt).format('YYYY-MM-DD hh:mm:ss')}`,
          }, 403);
        }
      }

      return true;
    }
    // change password
    else if(authorization.indexOf('Bearer') !== -1){
      const accessToken = authorization.split('Bearer ')[1];

      // JWT validation
      let user: null | { [key: string]: any; } | string = await this.authService.validateAccessToken(accessToken);

      const userPasswordFailHistories = await this.authService.getUserPasswordFailHistoriesByuserId(user['userId']);
      if(userPasswordFailHistories.length >= 5){
        const lastFailUnixTime = userPasswordFailHistories[0].unixCreatedAt;
        if(nowUnixTime - lastFailUnixTime < 7200){
          throw new OGException({
            errorCode: -222,
            errorMessage: `Last access time: ${moment(userPasswordFailHistories[0].createdAt).format('YYYY-MM-DD hh:mm:ss')}`,
          }, 403);
        }
      }

      return true;
    }
  }
}

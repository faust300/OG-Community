import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import moment from 'moment';
import { OGException } from 'src/extensions/exception/exception.filter';
import { AuthService } from '../auth.service';

@Injectable()
export class UserBlockSigninGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ){ }
  async canActivate(context: ExecutionContext): Promise<boolean>{

    const {body} = context.switchToHttp().getRequest();
    const nowUnixTime = Math.floor(new Date().getTime()/1000);

    const userSigninFailHistories = await this.authService.getUserSigninFailHistoriesByEmail(body.email);
    if(userSigninFailHistories.length >= 5){
      const lastFailUnixTime = userSigninFailHistories[0].unixCreatedAt;
        if(nowUnixTime - lastFailUnixTime < 7200){
          throw new OGException({
            errorCode: -126,
            errorMessage: `Last access time: ${moment(userSigninFailHistories[0].createdAt).format('YYYY-MM-DD hh:mm:ss')}`,
          }, 403);
        }
    }

    return true;
  }
}

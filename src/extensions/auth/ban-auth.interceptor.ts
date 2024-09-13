import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUser } from './auth.request';
import { AuthService } from './auth.service';
import { OGException } from '../exception/exception.filter';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class BanInterceptor implements NestInterceptor  {

    constructor(
        private readonly authService: AuthService,
        
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        
        const headers = context.switchToHttp().getRequest().headers ?? { authorization: String() };
        const authorization = headers.authorization ?? String();
        const accessToken = authorization.split('Bearer ')[1];
        const validate = await this.authService.decode(accessToken);
        const checkBan = await this.authService.userBanCheck(validate['userId']);
        if(checkBan){
            throw new OGException({
                errorCode: -255,
                errorMessage: 'You do not have Permission.',
            }, 400);
        }

        return next.handle().pipe();
    }
}
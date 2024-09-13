import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUser } from './auth.request';
import { AuthService } from './auth.service';
import { OGException } from '../exception/exception.filter';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY ?? "Password",
    });
  }

  async validate(payload: any): Promise<IUser> {
    try {
      if(payload && payload.userId){
        const {userId} = payload;
        const user = await this.authService.findUser(userId);
        if(user){
          return payload;
        } else{
          throw new OGException({
            errorCode: -208,
            errorMessage: 'Invalid User.',
          }, 400);
        }
      }
    } catch (error) {
      console.log(error)
      throw new OGException({
        errorCode: -208,
        errorMessage: 'Invalid User.',
      }, 400);
    }
    return undefined;
  }
}
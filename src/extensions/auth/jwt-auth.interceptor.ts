import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JWTAuthInterceptor implements NestInterceptor {

    private jwtService: JwtService;

    constructor() {
        this.jwtService = new JwtService({
            secret: process.env.JWT_SECRET_KEY ?? "Password",
            signOptions: { expiresIn: '86400s' }
        })
    }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const headers = context.switchToHttp().getRequest().headers ?? { authorization: String() };
        const authorization = headers.authorization ?? String();
        const accessToken = authorization.split('Bearer ')[1];
        const validate = this.jwtService.decode(accessToken);
        context.switchToHttp().getRequest().user = validate;
        return next.handle().pipe();
    }
}
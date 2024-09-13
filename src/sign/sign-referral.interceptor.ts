import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { SignService } from "./sign.service";

@Injectable()
export class SignReferralInterceptor implements NestInterceptor {

    constructor(
      private readonly signService: SignService,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {

        const {body} = context.switchToHttp().getRequest();
        if(body.referralCode){
          const isExistReferralCode = await this.signService.getUserFromReferral(body.referralCode);
          if(!isExistReferralCode){
            body.referralCode = null;
          }
        }

        return next.handle().pipe();
    }
}
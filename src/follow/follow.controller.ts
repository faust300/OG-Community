import { Controller, Get, Param, Req, UseInterceptors } from '@nestjs/common';
import { FollowService } from './follow.service';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { JWTAuthInterceptor } from 'src/extensions/auth/jwt-auth.interceptor';

@Controller('follow')
export class FollowController {

    constructor(private readonly followService: FollowService){}

    @Get(':toUserId')
    @UseInterceptors(JWTAuthInterceptor)
    async getFollowBackList(
        @Req() req: OGRequest,
        @Param('toUserId') toUserId: number
    ){
        const result = await this.followService.getFriendFollowList(toUserId, req.user.userId ? req.user.userId : null)
        if(result){
            return {
                success: true,
                result: result
            }
        }
        
        return {
            success: true,
            result: []
        }
    }

}

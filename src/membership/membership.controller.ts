import { Controller, Get, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { JWTAuthGuard } from 'src/extensions/auth/jwt-auth.guard';
import { JWTAuthInterceptor } from 'src/extensions/auth/jwt-auth.interceptor';
import { OGException } from 'src/extensions/exception/exception.filter';
import { MembershipManageService } from 'src/membership-manage/membership-manage.service';
import { UserMembershipGroupDto } from './dto/membership-group.dto';
import { MembershipDto } from './dto/membership.dto';
import { MembershipService } from './membership.service';

@Controller('membership')
export class MembershipController {
  constructor(
    private readonly membershipService:MembershipService,
    private readonly membershipManageService:MembershipManageService,
  ){}

  @Get('/group/:toUserId')
  @UseInterceptors(JWTAuthInterceptor)
  async getUserMembershipGroup(@Req() req: OGRequest, @Param('toUserId') toUserId: number = undefined){
    const fromUserId = req.user ? req.user.userId : undefined;

    // toUser validation
    if(!toUserId || isNaN(toUserId)){
      throw new OGException({
        errorCode: -240,
        errorMessage: 'Invalid UserId.',
      }, 400);
    }

    const groups = await this.membershipService.getUserMembershipGroup(toUserId);
    let result = groups.length > 0 ? groups.map(group => new UserMembershipGroupDto(group)) : [];

    if(await this.membershipManageService.getUserWithGradeByUserId(fromUserId)){
      const myMemberships = await this.membershipService.getMyMembership(fromUserId)
      if(myMemberships.length > 0){
        for(let i=0; i<result.length; i++){
          const isJoinedGroup = myMemberships.find(membership => membership.groupId === result[i].groupId);
          if(isJoinedGroup){
            result[i].isJoined = true;
            continue;
          }
        }
      }
    }

    return {
      success: true,
      result
    }
  }

  @Get('/join')
  @UseGuards(JWTAuthGuard)
  async getUserJoinedMembership(@Req() req: OGRequest){
    const userId = req.user.userId;

    const myMemberships = await this.membershipService.getMyMembership(userId);

    return {
      success: true,
      result: myMemberships.map(membership => new MembershipDto(membership))
    }
  }

  @Post('/join/:groupId')
  @UseGuards(JWTAuthGuard)
  async joinUserMembershipGroup(@Req() req: OGRequest, @Param('groupId') groupId: number = undefined){
    const userId = req.user.userId;

    const myMemberships = await this.membershipService.getMyMembership(userId);
    if(myMemberships.map(membership => new MembershipDto(membership)).map(my => my.groupId).includes(groupId)){
      throw new OGException({
        errorCode: -255,
        errorMessage: 'Already joined this group.',
      }, 400);
    }

    // Todo: Access & pay grade is not 0.
    const willJoinGroup = await this.membershipService.getUserMembershipGroupByGroupId(groupId);
    if(willJoinGroup.grade !== 0){
      throw new OGException({
        errorCode: -254,
        errorMessage: 'Not opened paid group.',
      }, 400);
    }

    await this.membershipService.joinGruop(userId, willJoinGroup.id);

    return {
      success: true,
      result: willJoinGroup.id
    }
  }
}

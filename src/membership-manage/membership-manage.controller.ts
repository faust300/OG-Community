import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OGRequest } from 'src/extensions/auth/auth.request';
import { JWTAuthGuard } from 'src/extensions/auth/jwt-auth.guard';
import { OGException } from 'src/extensions/exception/exception.filter';
import { CreateMembershipGroupDto } from 'src/membership/dto/create-membership-group.dto';
import { UpdateMembershipGroupDto } from 'src/membership/dto/update-membership-group.dto';
import { MembershipService } from 'src/membership/membership.service';
import { Me } from 'src/user/dto/me.dto';
import { MembershipManageService } from './membership-manage.service';

@Controller('/membership/manage')
export class MembershipManageController {
  constructor(
    private readonly membershipManageService: MembershipManageService,
    private readonly membershipService: MembershipService,
  ){}

  @Post('')
  @UseGuards(JWTAuthGuard)
  async createUserMembershipGroup(@Req() req: OGRequest, @Body() createMembershipDto: CreateMembershipGroupDto){
    const userId = req.user.userId;

    const user = await this.membershipManageService.getUserWithGradeByUserId(userId);
    const me = new Me(user);
    if(!me.isVerified){
      throw new OGException({
        errorCode: -251,
        errorMessage: 'You are not Verified.',
      }, 400);
    }

    const myMemberships = await this.membershipService.getUserMembershipGroup(userId);
    if(myMemberships.map(membership => membership.grade).includes(createMembershipDto.grade)){
      throw new OGException({
        errorCode: -249,
        errorMessage: 'This grade already exist.',
      }, 400);
    }
    if(myMemberships.map(membership => membership.name).includes(createMembershipDto.name)){
      throw new OGException({
        errorCode: -250,
        errorMessage: 'This name already exist.',
      }, 400);
    }
    const newMembership = await this.membershipManageService.createMembershipGroup(userId, createMembershipDto);

    return {
      success: true,
      result: newMembership.id
    }
  }

  @Patch('')
  @UseGuards(JWTAuthGuard)
  async updateUserMembershipGroup(@Req() req: OGRequest, @Body() updateMembershipGroupDto: UpdateMembershipGroupDto){
    const userId = req.user.userId;

    const user = await this.membershipManageService.getUserWithGradeByUserId(userId);
    const me = new Me(user);
    if(!me.isVerified){
      throw new OGException({
        errorCode: -251,
        errorMessage: 'You are not OG.',
      }, 400);
    }

    const myMemberships = await this.membershipService.getUserMembershipGroup(userId);
    if(!myMemberships.map(membership => membership.id).includes(updateMembershipGroupDto.groupId)){
      throw new OGException({
        errorCode: -252,
        errorMessage: 'Invalid group.',
      }, 400);
    }
    if(String(updateMembershipGroupDto.grade) && myMemberships.map(membership => membership.grade).includes(updateMembershipGroupDto.grade)){
      throw new OGException({
        errorCode: -249,
        errorMessage: 'This grade already exist.',
      }, 400);
    }

    if(updateMembershipGroupDto.name && myMemberships.map(membership => membership.name).includes(updateMembershipGroupDto.name)){
      throw new OGException({
        errorCode: -250,
        errorMessage: 'This name already exist.',
      }, 400);
    }
    await this.membershipManageService.updateMembershipGroup(userId, updateMembershipGroupDto);

    return {
      success: true,
      result: updateMembershipGroupDto.groupId
    }
  }
}

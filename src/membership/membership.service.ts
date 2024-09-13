import { Injectable } from '@nestjs/common';
import { UserMembershipMap } from './entities/membership-map.entity';
import { UserMembershipGroup } from './entities/membership-group.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(UserMembershipGroup)
    private userMembershipGroupRepository: Repository<UserMembershipGroup>,

    @InjectRepository(UserMembershipMap)
    private userMembershipMapRepository: Repository<UserMembershipMap>,
  ){}

  async getUserMembershipGroup(toUserId: number): Promise<UserMembershipGroup[]>{
    const membership = await this.userMembershipGroupRepository.find({
      where:{
        userId: toUserId
      }
    });

    return membership;
  }

  async getUserMembershipGroupByGroupId(groupId: number): Promise<UserMembershipGroup>{
    const membership = await this.userMembershipGroupRepository.findOne({
      where:{
        id: groupId
      }
    });

    return membership;
  }

  async getMyMembership(userId: number): Promise<UserMembershipMap[]>{
    const membership = await this.userMembershipMapRepository.createQueryBuilder('UserMembershipMap')
      .leftJoinAndSelect('UserMembershipMap.membershipGroup', 'UserMembershipGroup')
      .where('UserMembershipMap.userId = :userId', {userId})
      .getMany();

      return membership;
  }

  async joinGruop(userId: number, groupId: number): Promise<void>{
    const membershipMapRepo = this.userMembershipMapRepository;
    const membershipMap = new UserMembershipMap();
    membershipMap.userId = userId;
    membershipMap.groupId = groupId;
    await membershipMapRepo.save(membershipMap);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMembershipGroupDto } from 'src/membership/dto/create-membership-group.dto';
import { UpdateMembershipGroupDto } from 'src/membership/dto/update-membership-group.dto';
import { UserMembershipGroup } from 'src/membership/entities/membership-group.entity';
import { UserMembershipMap } from 'src/membership/entities/membership-map.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MembershipManageService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UserMembershipGroup)
    private userMembershipGroupRepository: Repository<UserMembershipGroup>,

    @InjectRepository(UserMembershipMap)
    private userMembershipMapRepository: Repository<UserMembershipMap>,
  ){}

  async getUserWithGradeByUserId(userId: number): Promise<User>{
    const user = await this.userRepository.createQueryBuilder('User')
      .leftJoinAndSelect('User.userGradeMap', 'UserGradeMap')
      .where('User.id = :userId', {userId})
      .getOne();

    return user;
  }

  async createMembershipGroup(userId: number, dto: CreateMembershipGroupDto): Promise<UserMembershipGroup>{
    const membershipRepo = this.userMembershipGroupRepository;
    const membership = new UserMembershipGroup();
    membership.userId = userId;
    membership.name = dto.name;
    membership.description = dto.description ?? null;
    membership.iconPath = dto.iconPath ?? null;
    membership.grade = dto.grade;
    membership.price = dto.price;
    const newMembership = await membershipRepo.save(membership);
    return newMembership;
  }

  async updateMembershipGroup(userId: number, dto: UpdateMembershipGroupDto): Promise<void>{
    const membershipRepo = this.userMembershipGroupRepository;
    const membership = await this.userMembershipGroupRepository.findOne({
      where: {
        id: dto.groupId,
        userId
      }
    });

    if(dto.name){
      membership.name = dto.name;
    }
    if(dto.description){
      membership.description = dto.description;
    }
    if(dto.iconPath){
      membership.iconPath = dto.iconPath;
    }
    if(dto.grade){
      membership.grade = dto.grade;
    }
    if(dto.price){
      membership.price = dto.price;
    }

    await membershipRepo.save(membership);
  }
}

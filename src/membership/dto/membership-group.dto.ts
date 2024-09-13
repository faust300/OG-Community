import { UserMembershipGroup } from "../entities/membership-group.entity";

export class UserMembershipGroupDto{
  constructor(group: UserMembershipGroup){
    this.groupId = group.id;
    this.name = group.name;
    this.description = group.description ?? null;
    this.iconPath = group.iconPath ?? null;
    this.grade = group.grade;
    this.price = group.price;
    this.isJoined = false;
    this.createdAt = group.createdAt;
  }

  groupId: number;
  name: string;
  description: string | null;
  iconPath: string | null;
  grade: number;
  price: string;
  isJoined: boolean;
  createdAt: Date;
}
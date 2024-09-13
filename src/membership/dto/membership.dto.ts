import { UserMembershipMap } from "../entities/membership-map.entity";

export class MembershipDto{
  constructor(membership?: UserMembershipMap){
    if(membership){
      this.groupId = membership.membershipGroup ? membership.membershipGroup.id : null;
      this.userId = membership.membershipGroup ? membership.membershipGroup.userId : null;
      this.name = membership.membershipGroup ? membership.membershipGroup.name : null;
      this.description = membership.membershipGroup ? membership.membershipGroup.description : null;
      this.iconPath = membership.membershipGroup ? membership.membershipGroup.iconPath : null;
      this.grade = membership.membershipGroup ? membership.membershipGroup.grade : null;
      this.price = membership.membershipGroup ? membership.membershipGroup.price : null;
      this.joinedAt = membership.createdAt;
    }
  }

  groupId: number;
  userId: number;
  name: string;
  description: string | null;
  iconPath: string | null;
  grade: number;
  price: string;
  joinedAt: Date;
}
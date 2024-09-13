import { User, UserSignType } from '../entities/user.entity';
import { UserProfileDto } from './profile.dto';

export class Me extends UserProfileDto {
  constructor(user: User) {
    super(user, user.id);
    if (user) {
      this.email = user.email;
      this.isChangedName = user.isChangedName;
      this.signType = user.signType;
      this.googleId = user.googleId;
      this.appleId = user.appleId;

      this.isExpired = Boolean(user.expiredAt && user.expiredAt.getTime() > new Date().getTime());
      this.needChangeEmail = Boolean(this.signType == UserSignType.APPLE && this.email.split("@")[1] == "privaterelay.appleid.com");
      this.isAvailableReferral =  Boolean( user.referralHistories && user.referralHistories.length > 0 && new Date().getTime() - user.createdAt.getTime() < 86400000);

      this.titleId = user.titleId;

      this.referralCode = user.referralCode;
      this.localizeCode = user.localizeCode;

      this.unsubscribedAt =  user.unsubscribedAt;
      this.expiredAt = user.expiredAt;
      this.updatedAt = user.updatedAt;
      this.deletedAt = user.deletedAt;

    }
  }

  email: string;
  isChangedName: boolean;
  signType: UserSignType;
  googleId: string | null;
  appleId: string | null;
  needChangeEmail: boolean;
  isExpired: boolean;
  titleId: number | null;
  title: string | null;
  isAvailableReferral: boolean;
  referralCode: string | null;
  localizeCode: string;
  unsubscribedAt: Date | null;
  verifiedAt: Date | null;
  expiredAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

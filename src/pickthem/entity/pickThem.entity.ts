export class PickThem{
  pickThemId: number;
  name: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  maxCrystal: number;
  goalStreak: number;

  startUTC?: number | null;
  endUTC?: number | null;
  nowUTC?: number | null;
  isParticipable: boolean;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
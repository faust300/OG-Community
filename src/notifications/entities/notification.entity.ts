export class Notification {
    notificationId: number | null;
    noticeId: number | null;
    code: number;
    notificationCode: string;
    behaviorData: string | any;
    subject: string | any;
    entities: string[] | string;
    contents: string;
    createdAt: Date;
    readedAt: Date | null;
  }
  
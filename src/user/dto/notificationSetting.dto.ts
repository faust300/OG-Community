import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { MissedNotification } from "../entities/notification/user-notification.entity";

export enum NotificationType {
    ALL = 'all',
    FROMOG = 'fromog',
    ACTIVITIES = 'activities',
    TRADE = 'trade',
}

export class NotificationSettingDto {

    @IsBoolean()
    isOn: boolean;

    @IsEnum(MissedNotification)
    missed: MissedNotification;

    @IsBoolean()
    newFollowers: boolean;

    @IsBoolean()
    weeklyNewsLetter: boolean;

    @IsBoolean()
    promotionEvent: boolean;

    @IsBoolean()
    newFeatures: boolean;
}
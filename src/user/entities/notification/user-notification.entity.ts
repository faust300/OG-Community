import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user.entity";


export enum MissedNotification {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    PERIODICALLY = 'periodically',
    OFF = 'off'
}

@Entity({name: 'UserNotification'})
export class UserNotification {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    isOn: boolean;

    @Column()
    missed: MissedNotification;

    @Column()
    newFollowers: boolean;

    @Column()
    weeklyNewsLetter: boolean;

    @Column()
    promotionEvent: boolean;

    @Column()
    newFeatures: boolean;

    @OneToOne(() => User)
    user: User;

}
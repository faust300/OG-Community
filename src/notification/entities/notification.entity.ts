import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity({name: 'Notification'})
export class Notification {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: number;

    @Column()
    notificationCode: string;

    @Column()
    behaviorData: string;

    @Column()
    userId: number;

    @Column()
    subject: string;

    @Column()
    entities: string;

    @Column()
    contents: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column()
    readedAt: Date;

}

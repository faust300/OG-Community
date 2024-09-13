import moment from "moment";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CalendarWidget } from "../dto/calendar-widget.dto";

@Entity('WidgetDataCalendar')
export class WidgetDateCalendar {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({enum: ['crypto', 'economics']})
    type: 'crypto' | 'economics';

    @Column()
    date: Date;

    @Column()
    title: string;

    @Column({type: 'json'})
    description: JSON;

    @Column()
    indicate: string;

    @Column()
    indicateColor: string;

    @Column()
    sourceId: number;

    @Column()
    source: string

    @Column()
    sourceLink: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    convertCalendarWidget(obj): CalendarWidget {
        delete obj.id;
        delete obj.description;
        delete obj.indicateColor;
        delete obj.sourceId;
        delete obj.createdAt;
        delete obj.updatedAt;
        delete obj.deletedAt;

        obj.date = moment(obj.date).format('HH:mm a').toString()

        return obj;
    }
}
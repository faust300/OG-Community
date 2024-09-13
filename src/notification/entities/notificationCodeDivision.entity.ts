import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({
    name: 'NotificationCodeDivision'
})
export class NotificationCodeDivision {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column("json")
    code: number[];
}
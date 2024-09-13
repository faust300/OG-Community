import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { Widget } from "./widget.entity";


@Entity('WidgetDefaultDefined')
export class WidgetDefaultDefined {

  @PrimaryColumn()
  widgetId: number;

  @Column({type: 'json'})
  setting: JSON;

  @Column()
  order: number;

  @OneToOne(() => Widget)
  @JoinColumn({name: 'widgetId'})
  widget: Widget;
}
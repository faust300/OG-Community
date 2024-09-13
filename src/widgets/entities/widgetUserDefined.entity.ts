
import { Widget } from "./widget.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";

class WidgetUserSetting {
  type: string[]
}

@Entity('WidgetUserDefined')
export class WidgetUserDefined {

  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  widgetId: number;

  @PrimaryColumn()
  order: number;

  @Column({type: 'json'})
  setting: WidgetUserSetting;

  @OneToOne(() => Widget)
  @JoinColumn({name: 'widgetId'})
  widget: Widget;
}
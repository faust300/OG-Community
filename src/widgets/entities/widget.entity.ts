import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { WidgetDTO } from "../dto/widget.dto";
import { WidgetDefaultDefined } from "./widgetDefaultDefined.entity";
import { WidgetUserDefined } from "./widgetUserDefined.entity";

export class WidgetSetting{
  key: string;
  type: "set" | "enum" | "string" | "number";
  value: (string | number | boolean)[];
}

@Entity('Widget')
export class Widget {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column({type: 'json'})
  label: {[key:string]:(string|number|boolean)[]|(string|number|boolean)} | string;

  @Column({type: 'json'})
  description: {[key:string]:(string|number|boolean)[]|(string|number|boolean)} | string;

  @Column()
  iconPath: string;

  @Column({type: 'json'})
  headerStyle: {[key:string]:(string|number|boolean)[]|(string|number|boolean)} | string;

  @Column()
  sourceType: string;

  @Column()
  source: string;

  @Column({type: 'json'})
  payload: {[key:string]:any};

  @Column({type: 'json'})
  setting: WidgetSetting[];

  @OneToMany(type => WidgetUserDefined, (defined) => defined.widget)
  @JoinColumn({name: 'id'})
  userSetting: Relation<WidgetUserDefined[]>; 

  @OneToOne(() => WidgetDefaultDefined)
  @JoinColumn({name: 'id'})
  defaultSetting: Relation<WidgetDefaultDefined>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  convertWidgetDTO(obj, lang: string = 'EN'): WidgetDTO {
    obj.label = obj.label[lang];
    obj.description = obj.description[lang];

    delete obj.createdAt;
    delete obj.updatedAt;
    delete obj.deletedAt;

    obj.widgetId = obj.id;
    delete obj.id;

    obj.definedSetting = {}

    if (obj.userSetting) {
        obj.definedSetting = obj.userSetting[0].setting ?? {}
    } else {
        obj.definedSetting = obj.defaultSetting?.setting ?? {}
    }

    delete obj.userSetting;
    delete obj.defaultSetting;

    return obj;
  }
}

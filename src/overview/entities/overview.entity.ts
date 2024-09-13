import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OverviewTemplateDTO } from "../dto/overview.dto";

export enum SourceType {
  NONE = 'none',
  WEBSOCKET = 'websocket',
  API = 'api',
  GRAPHQL = 'graphql',
  RSS = 'rss',
}

@Entity('Overview')
export class Overview {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  device: number;

  @Column()
  type: string;

  @Column({type: 'json'})
  label: JSON;

  @Column({type: 'json'})
  description: JSON;

  @Column()
  iconPath: string;

  @Column({type: 'json'})
  headerStyle: JSON;

  @Column({enum: SourceType})
  sourceType: SourceType;

  @Column()
  source: string;

  @Column()
  link: string;

  @Column()
  desktopOrder: number;

  @Column()
  tabletOrder: number;

  @Column()
  mobileOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  convertOverviewTemplateDTO(obj, lang:string = 'EN'): OverviewTemplateDTO {
    obj.overviewId = obj.id;
    obj.label = obj.label[lang]
    obj.description = obj.description[lang];
    if (obj.iconPath && ! (obj.iconPath as string).includes('https')) {
      obj.iconPath = `https://dj95uwsw6egvp.cloudfront.net/image/resized/${obj.iconPath}`
    }

    delete obj.id;

    return obj;
  }
}

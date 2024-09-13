import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { OverviewTopicData } from "../dto/overview-topic.dto";

export enum OverviewDataType {
  DEFAULT = 'default',
  CREATE = 'create'
}

@Entity('OverviewData')
export class OverviewData {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @Column({ type: 'json' })
  data: string[];

  @Column({ enum: OverviewDataType })
  type: OverviewDataType;

  convertOverviewDataDTO(obj): OverviewDataDTO {
    delete obj.id;
    delete obj.type;

    return obj;
  }

  convertOverviewTopic(obj): OverviewTopicData[] {
    return obj.data.map(item => {
      item.iconPath = `https://dj95uwsw6egvp.cloudfront.net/image/resized/${item.iconPath}`;
      return {
        ...item
      }
    })
  }
}

export interface OverviewDataDTO {
  key: string;
  data: any;
}
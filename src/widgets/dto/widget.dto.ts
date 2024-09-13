import { WidgetSetting } from "../entities/widget.entity";

export class WidgetDTO {
    widgetId: number;
    label: string;
    type: string;
    description: {
      label: string,
      description: string
    };
    iconPath: string;
    headerStyle: {
      background: string
    };
    sourceType: 'websocket'|'api'|'graphql'|'rss';
    source: string;
    payload: any;
    setting: WidgetSetting[];
  
    definedSetting?: any
  }
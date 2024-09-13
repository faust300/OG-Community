import { SourceType } from "../entities/overview.entity";

export class OverviewTemplateDTO {
    overviewId: number;
    device: number;
    type: string;
    label: JSON;
    description: JSON;
    iconPath: string;
    headerStyle: JSON;
    sourceType: SourceType;
    source: URL;
    link: string;
    desktopOrder: number;
    tabletOrder: number;
    mobileOrder: number;
    payload: JSON;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
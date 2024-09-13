import { Tag } from '../../tags/entities/tag.entity';

export class SearchTag extends Tag  {};

export class SearchTagSource {
    useCount: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    encodeName: string;
}


// .select('Topic.name', 'topic')
// .addSelect('Topic.name', 'name')
// .addSelect('Topic.type', 'type')
// .addSelect('Topic.synonyms', 'synonyms')
// .addSelect('Topic.imagePath', 'imagePath')
// .addSelect('Topic.iconPath', 'iconPath')
// .addSelect('Topic.symbol', 'symbol')
// .addSelect('Topic.description', 'description')
// .addSelect('Topic.chartDataId', 'chartDataId')
// .addSelect('Topic.externalLinks', 'externalLinks')
// .addSelect('Topic.createdAt', 'createdAt')
// .addSelect('Topic.deletedAt', 'deletedAt')

export class SearchAssets {
    topic: string;
    name: string;
    synonyms: string[];
    symbol: string;
    type: string;
    imagePath: string;
    iconPath: string;
    description: string;
    chartDataId: string;
    externalLinks: string;
    changePrice?: number;
    price?: number;
    createdAt: Date;
    deletedAt: Date;
}
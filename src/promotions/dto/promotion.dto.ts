export class ActivePromotion {
    promotionUnitId: number;
    promotionId: number;

    viewCount: number;
    clickCount: number;
    voteCount: number;

    title: string;
    contentsImageUrl: string;
    bannerImageUrl: string;
    contentsVideoUrl?: string;
    bannerVideoUrl?: string;
    externalUrl: string;

    userName: string;
    userProfile: string;

    promotionUnitCreatedAt: Date;
    promotionUnitUpdatedAt: Date | null;

    voteType: 'up'| 'down' | null;
}


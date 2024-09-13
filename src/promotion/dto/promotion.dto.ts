export class PromotionDTO {

    promotionId: number;
    promotionUnit: "postList"|"postDetail"|"sideBar"|"banner";
    promotionUnitId: number;
    bannerImageUrl: string;
    contentsImageUrl: string;
    externalUrl: string;

}

export class Count {
    count: number;
}

import { ActivePromotion } from "src/promotions/dto/promotion.dto";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PromotionUnit } from "./promotion-unit.entity";
import { PromotionUser } from "./promotion-user.entity";
import { PromotionViewHistory } from "./promotion-view.entity";


@Entity('Promotion')
export class Promotion {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    contentsImageUrl: string;

    @Column()
    bannerImageUrl: string;

    @Column()
    bannerVideoUrl: string;

    @Column()
    contentsVideoUrl: string;

    @Column()
    promotionUserId: number;

    @Column()
    externalUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => PromotionUnit, object => object.promotion)
    @JoinColumn({ name: 'id' })
    promotionUnits: PromotionUnit[];

    @OneToOne(() => PromotionUser)
    @JoinColumn({ name: 'promotionUserId' })
    promotionUser: PromotionUser;

    @OneToMany(() => PromotionViewHistory, obj => obj.promotions)
    @JoinColumn({ name: 'id' })
    promotionViewHistories: PromotionViewHistory[];

    convertActivePromotion(obj): ActivePromotion {
        const unit = obj.promotionUnits[0];
        const user = obj.promotionUser;
        return {
            promotionUnitId: unit.id,
            promotionId: obj.id,

            viewCount: unit.viewCount,
            clickCount: unit.clickCount,
            voteCount: unit.voteCount,

            title: obj.title,
            contentsImageUrl: obj.contentsImageUrl,
            bannerImageUrl: obj.bannerImageUrl,
            contentsVideoUrl: obj.contentsVideoUrl,
            bannerVideoUrl: obj.bannerVideoUrl,
            externalUrl: obj.externalUrl,

            userName: user.name,
            userProfile: user.userProfile,

            promotionUnitCreatedAt: unit.createdAt,
            promotionUnitUpdatedAt: unit.updatedAt,

            voteType: null
        }
    }
}
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { PromotionUnit } from "./promotion-unit.entity";
import { Promotion } from "./promotion.entity";

@Entity('PromotionViewHistory')
export class PromotionViewHistory {

    @PrimaryColumn()
    promotionId: number;

    @PrimaryColumn()
    promotionUnitId: number;

    @PrimaryColumn()
    userId: number;

    @Column()
    count: number;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Promotion, obj => obj.promotionViewHistories)
    @JoinColumn({ name: "promotionId" })
    promotions: Promotion[];

    @ManyToOne(() => PromotionUnit, obj => obj.promotionViewHistories)
    @JoinColumn({ name: "promotionUnitId" })
    promotionUnit: PromotionUnit;
}
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { PromotionUnit } from "./promotion-unit.entity";
import { Promotion } from "./promotion.entity";

@Entity('PromotionClickHistory')
export class PromotionClickHistory {

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

    @ManyToOne(() => PromotionUnit, obj => obj.promotionClickHistories)
    @JoinColumn({name: 'promotionUnitId'})
    promotionUnit: PromotionUnit;

}
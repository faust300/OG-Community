import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PromotionClickHistory } from "./promotion-click.entity";
import { PromotionViewHistory } from "./promotion-view.entity";
import { Promotion } from "./promotion.entity";

export enum PromotionUnitDisplayPlace {
    POST_LIST = 'postList',
    POST_DETAIL = 'postDetail',
    SIDE_BAR = 'sideBar',
    BANNER = 'banner'
}

@Entity('PromotionUnit')
export class PromotionUnit {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    promotionId: number;

    @Column({ enum: PromotionUnitDisplayPlace})
    displayPlace: PromotionUnitDisplayPlace;

    @Column()
    clickPrice: number;

    @Column()
    viewPrice: number;

    @Column()
    usedPoint: number;

    @Column({type: 'bool'})
    isActive: boolean;

    @Column()
    viewCount: number;

    @Column()
    clickCount: number;

    @Column()
    voteCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Promotion, object => object.promotionUnits)
    @JoinColumn({ name: 'promotionId' })
    promotion: Promotion;

    @OneToMany(() => PromotionViewHistory, obj => obj.promotionUnit)
    @JoinColumn({ name: 'id' })
    promotionViewHistories: PromotionViewHistory;

    @OneToMany(() => PromotionClickHistory, obj => obj.promotionUnit)
    @JoinColumn({ name: 'id' })
    promotionClickHistories: PromotionClickHistory[];
}
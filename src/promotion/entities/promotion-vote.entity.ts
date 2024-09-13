import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

export enum VoteType {
    UP = 'up',
    DOWN = 'down'
}

@Entity('PromotionVoteHistory')
export class PromotionVoteHistory {

    @PrimaryColumn()
    promotionId: number;

    @PrimaryColumn()
    userId: number;

    @Column({enum: VoteType})
    voteType: VoteType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column() // Exclude from where clause
    deletedAt: Date;
}
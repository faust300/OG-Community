import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity({name: 'PostVote'})
export class PostVote {

    @PrimaryColumn({select: false})
    PostId: number;

    @PrimaryColumn({select: false})
    UserId: number;

    @Column()
    voteType: 'up' | 'down';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({select: false})
    deletedAt: Date;

}
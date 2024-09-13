import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";


@Entity({name: 'CommentVote'})
export class CommentVote {

    @PrimaryColumn()
    commentId: number;
    
    @PrimaryColumn()
    userId: number;

    @Column()
    voteType: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
import { Column, CreateDateColumn, Entity, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";

@Entity({name: 'PostViewHistory'})
export class PostViewHistory {

    @PrimaryColumn()
    @Unique(['postId', 'userId'])
    postId: number;

    @PrimaryColumn()
    @Unique(['postId', 'userId'])
    userId: number;

    @Column()
    ipA: number;

    @Column()
    ipB: number;

    @Column()
    ipC: number;

    @Column()
    ipD: number;

    @Column({default: 0, type: 'int'})
    count: number;

    @UpdateDateColumn()
    updatedAt: Date;
}
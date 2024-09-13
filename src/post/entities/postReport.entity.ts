import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";



@Entity({name: 'Report'})
export class PostReport {

    @PrimaryGeneratedColumn({name: 'id'})
    id: number;

    @Unique(['postId', 'commentId', 'accuserId'])
    @Column()
    postId: number;

    @Unique(['postId', 'commentId', 'accuserId'])
    @Column()
    commentId: number;

    @Column({
        type: 'json'
    })
    reportTypeId: number[];

    @Column()
    reason: string;

    @Unique(['postId', 'commentId', 'accuserId'])
    @Column()
    accuserId: number;

    @Column()
    accusedId: number;

    @CreateDateColumn()
    createdAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

}
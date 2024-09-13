import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { PostContent } from "./post.entity";

@Entity({name: 'PostDraft'})
export class PostDraft {

    @PrimaryGeneratedColumn({name: 'id'})
    draftId: number;

    @Unique(['userId', 'tempKey'])
    @Column()
    userId: number;

    @Unique(['userId', 'tempKey'])
    @Column()
    tempKey: string;

    @Column()
    contents: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ReplyComment } from "../dto/reply-comment.dto";

export class CommentUser {
    userId: number;
    name: string;
    profileImagePath?: string;
    title?: string;
    deletedAt?: string;
}

export class CommentContents {
    mention: Mention[];
    text: string;
}

export class Mention {
    id: number;
    name: string;
}

@Entity({name: 'Comment'})
export class Comment {

    @PrimaryGeneratedColumn({name: "id"})
    commentId: number;

    @Column()
    lang: string;

    @Column({unique: true})
    postId: number;

    @Column({unique: true})
    userId: number;

    @OneToOne(() => User)
    @JoinColumn({name: 'userId'})
    user: User;

    @Column({type: 'json'})
    contents: CommentContents;

    @Column({default: 0})
    parentId: number;

    @Column({default: 0})
    seq: number

    @Column({default: 0})
    depth: number;

    @Column({default: 0})
    voteCount: number;

    @Column({default: 0})
    upvoteCount: number;

    @Column({default: 0})
    downvoteCount: number;

    @Column({default: 0})
    reportCount: number;

    @Column({default: false})
    isEdit: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    reply?: ReplyComment[];
}

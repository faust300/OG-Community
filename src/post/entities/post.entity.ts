import { Topic } from "src/topics/entities/topic.entity";
import { UserTitle } from "src/user/entities/title/user-title.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation, UpdateDateColumn } from "typeorm";
import { Tag } from "src/tags/entities/tag.entity";
import { PostVote } from "./postVote.entity";
import { Title } from "src/user/entities/title/title.entity";
import { OverviewBest } from "src/overview/dto/overview-best.dto";
import { Me } from "src/user/dto/me.dto";

export class GetPostIdWithUserId {
    id: number;
    userId: number;
}

export class BreadCrumb {
  route?: string;
  name: string;
}

export class Report {
    id: number
}

export class Cursor {
    sort: string;
    next: string;
}

export class VoteCount {
    voteCount: number;
}

export class PostContent {
    time: number;
    blocks: EditorJSBlock[]|EditorDelta;
    version: string;
}

export class EditorDelta {
    ops: EditorOP[];
    text: string;
}

export class EditorOP {
    insert: string | OPInsert;
    attributes?: {
        header?: number;
        bold?: boolean;
        italic?: boolean;
        code?: boolean;
    }
}

export class OPInsert {
    ogImage?: {
        src: string;
        width: number;
        height: number;
        loading: boolean;
    };
    ogVideo?: {
        src: string;
    };
}

export class EditorJSBlock {
    type: string;
    data: EditorJSData;
}

export class EditorJSData {
    text?: string;
    level?: number;
    style?: string;
    items?: string[];
    caption?: string;
    withBorder?: boolean;
    withBackground?: boolean;
    stretched?: boolean;
    file?: EditorJSFile;
}

export class EditorJSFile {
    url: string;
}

export class PostUser{
    userId: number;
    name: string;
    profileImagePath: string;
    title: string;
    isOg: boolean;
    isAdmin: boolean;
    isSuper: boolean;
}

// export class Tag {
//     name: string;
//     count: number;
// }



export interface ReturnPostDelete {
    admin: boolean;
    success: boolean;
    postId: number;
}

@Entity({name: 'Post'})
export class Post { 
    @PrimaryGeneratedColumn({name: "id"})
    postId: number;

    @Column({default: 'normal'})
    dataType: 'normal'|'tweet'|'quoted'|'retweeted'|'repliedTo'|'discord'|'medium'|'gpt';

    @Column({default: 'EN'})
    lang: string;

    @Column()
    userId: number;

    @OneToOne(() => User)
    @JoinColumn({name: 'userId'})
    user: User;

    @Column()
    userName: string;

    @Column()
    userProfilePath: string;

    @Column()
    userTitle: number;
  
    // @Column()
    userTitleName: string;

    @Column()
    authorId: number;

    @Column()
    authorName: string;

    @Column()
    authorProfilePath: string;

    @Column()
    authorLink: string;

    @Column()
    authorType: string;

    @Column()
    authorReservation1: string;

    @Column()
    authorReservation2: string;

    @Column()
    originLink: string;
    
    // topic: string;
    // topicIconPath: string;

    @Column({default: 0})
    topicId: number;

    @Column()
    title: string;

    @Column()
    contents: string;

    @Column()
    thumbnail: string;

    @Column({default: 0, type: 'int'})
    imageCount: number;

    @Column({default: 0, type: 'int'})
    viewCount: number;

    @Column({default: 0, type: 'int'})
    voteCount: number;

    @Column({default: 0, type: 'int'})
    upVoteCount: number;

    @Column({default: 0, type: 'int'})
    commentCount: number;

    @Column()
    hasReferral: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    vote: 'up' | 'down' | null;

    isMine: boolean;

    @Column({
        transformer: {
            to(value: boolean) {
                return value === true ? 1 : 0;
            },
            from(value: number): boolean {
                return Boolean(value);
            }
        },
        default: false
    })
    isEdit: boolean;

    @Column()
    isNSFW: boolean;

    isVerified?: boolean;

    @OneToMany(() => Tag, Tag => Tag.post)
    @JoinColumn({name: 'postId'})
    tag: Tag[];

    // @Column()
    tags?: Tag[];
    topicGroupName: string;
    breadCrumb?: BreadCrumb[];

    @OneToMany(() => Tag, object => object.post)
    @JoinColumn({ name: 'id' })
    tagRelation: Tag[];

    convertOverviewBest(obj): OverviewBest{
        return {
            postId: obj.postId,
            title: obj.title,
            contents: obj.contents,
            commentCount: obj.commentCount,
            viewCount: obj.viewCount,
            tags: obj.tagRelation?.map(tag => tag.name),
            createdAt: obj.createdAt,
            updatedAt: obj.updatedAt
        };
    }
}
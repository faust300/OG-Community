import { Tag } from "src/tags/entities/tag.entity";
import { Post } from "../entities/post.entity";



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


export class ReturnPost {
    constructor(post: Post, userId: number) {
        this.postId = post.postId;
        this.lang = post.lang;
        this.dataType = post.dataType;
        this.userId = post.userId;
        this.userName = post.userName;
        this.userProfilePath = post.userProfilePath;
        this.userTitle = post.userTitle;
        this.userTitleName = post.userTitleName;
        this.authorId = post.authorId;
        this.authorName = post.authorName;
        this.authorProfilePath = post.authorProfilePath;
        this.authorLink = post.authorLink;
        this.authorType = post.authorType;
        this.authorReservation1 = post.authorReservation1;
        this.authorReservation2 = post.authorReservation2;
        this.originLink = post.originLink;
        this.title = post.title;
        this.contents = post.contents;
        this.thumbnail = post.thumbnail;
        this.imageCount = post.imageCount;
        this.viewCount = post.viewCount;
        this.voteCount = post.voteCount;
        this.commentCount = post.commentCount;
        this.hasReferral = post.hasReferral;
        this.createdAt = post.createdAt;
        this.updatedAt = post.updatedAt;
        this.vote = post.vote;
        this.isMine = post.userId == userId;
        this.isEdit = post.userId == userId;
        this.isNSFW = post.isNSFW;
        this.tags = post.tags ? String(post.tags).split(',') : [];
    }
    
    postId: number;
    lang: string;
    dataType: string;
    userId: number;
    userName: string;
    userProfilePath: string | null;
    userTitle: number | null;
    userTitleName: string | null;
    authorId: number | null;
    authorName: string | null;
    authorProfilePath: string | null;
    authorLink: string | null;
    authorType: string | null;
    authorReservation1: string | null;
    authorReservation2: string | null;
    originLink: string | null;
    title: string | null;
    contents: string;
    thumbnail: string | null;
    videoThumbnail?: string | null;
    imageCount: number;
    viewCount: number;
    voteCount: number;
    commentCount: number;
    hasReferral: boolean;
    createdAt: Date;
    updatedAt: Date;
    vote: 'up' | 'down' | null;
    isMine: boolean;
    isEdit: boolean;
    isNSFW: boolean;
    isVerified?: boolean;
    tags?: string[];
}


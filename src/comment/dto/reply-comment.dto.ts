

export class CommentContents {
    mention: Mention[];
    text: string;
}

export class Mention {
    userId: number;
    userName: string;
    deleted: boolean;
}

export class ReplyComment {

    replyId: number;
    lang: string;
    userId: number;
    userName: string;
    userProfilePath: string;
    titleId: number;
    userTitleName: string;
    contents: CommentContents;
    voteCount: number;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    isEdit: boolean;
    vote: number;
    isMine: boolean;
    seq: number;
    next?: any
}
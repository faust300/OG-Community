
export class CommentContents {
    mention: Mention[];
    text: string;
}

export class Mention {
    userId: number;
    userName: string;
    deleted: boolean;
}


export class Comments {
    commentId: number;
    lang: string;
    userId: number;
    userName: string;
    userProfilePath: string;
    titleId: string;
    userTitleName: string;
    contents: CommentContents;
    voteCount: number;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    isEdit: boolean;
    vote: string | null;
    isMine: boolean;
    reply: ReplyComments[] | [];
}

export class ReplyComments {
    replyId: number;
    lang: string;
    userId: number;
    userName: string;
    userProfilePath: string;
    titleId: string;
    userTitleName: string;
    contents: CommentContents;
    voteCount: number;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    isEdit: boolean;
    vote: string | null;
    isMine: boolean;
    seq: number;
    next: string;
}

export class CommentNext {
    sort: string
    cursor?: CommentCursor;
}

export class CommentCursor {
    commentId: number;
}

export class CommentReplyNext {
    sort: string;
    clickCount: number;
    cursor: CommentReplyCursor;
}
export class CommentReplyCursor {
    seq: number;
}

export class CommentCount {
    commentCount: number;
}

export class TotalCOunt {
    totalCount: number;
}
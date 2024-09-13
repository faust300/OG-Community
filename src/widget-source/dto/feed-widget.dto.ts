export class FeedWidget {
    postId: number;
    title: string;
    userName: string;
    profileImagePath: string;

    dataType: string;
    contents: JSON;

    authorProfilePath?: string | null;
    authorName?: string | null;

    viewCount: number;
    commentCount: number;
    voteCount: number;

    userId: number;

    topicId: number;
    topic: string;
    topicImagePath: string;
    topicIconPath: string;
}

import { Post } from 'src/posts/entities/posts.entity';

export class SearchPost extends Post{}

export class SearchPostSource {
    lang: string;
    postCreatedAt: Date;
    authorId: string | null;
    topicId: number;
    userId: number;
    authorReservation1: string | null;
    authorReservation2: string | null;
    userTitleI18N: JSON | null;
    downVoteCount: number;
    isAdmin: boolean;
    fixedUserTitle: string | null;
    postDeletedAt: Date | null;
    dataType: string | null;
    authorType: string | null
    contents: JSON;
    authorLink: string | null;
    userLocalizeCode: string;
    title: string;
    voteCount: number;
    userTitleName: string | null;
    fixedUserName: string;
    authorProfilePath: string | null;
    topicI18N: JSON;
    userDeletedAt: Date | null;
    postUpdatedAt_UT: number;
    commentCount: number
    reportCount: number
    fixedUserProfilePath: string | null
    isNSFW: boolean;
    upVoteCount: number;
    isEdit: boolean;
    tags: Array<string> | null;
    hasReferral: number | null;
    originLink: string | null;
    userTitleStyle: string | null
    userName: string | null;
    reportStatus: number;
    postUpdatedAt: Date | null;
    viewCount: number;
    contentSerialize: string;
    topicName: string;
    userProfilePath: string | null;
    thumbnail: string | null;
    authorName: string | null;
    id: number;
}

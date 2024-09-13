export enum PostType{
  POST = 'post',
  COMMENT = 'comment',
  REPLY = 'reply'
}

export class ActivityHistorySummary{
  postCount: number;
  commentCount: number;
  upvoteCount: number;
  downvoteCount: number;
}

export class ActivityHistoryList{
  type: PostType;
  postId: number;
  commentId: number | null;
  parentId: number | null;
  userId: number;
  writer: string | null;
  tags: Array<string>;
  imagePath: string;
  style: object;
  contents: string;
  createdAt: Date;
  updatedAt: Date;
  hasLink: boolean;
}
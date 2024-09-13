import { ReturnPost } from 'src/post/dto/return-post.dto';

export class PostUser {
  userId: number
}

export class EditorJSFile {
  url: string;
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

export class EditorJSBlock {
  type: string;
  data: EditorJSData;
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


export class Next {
  cursor?: Cursor | null;
}

export class Cursor {
  count: number;
  createdAt: Date;
  custom?: string;
}

export class Post {
  postId: number;
  lang:string;
  dataType: string;
  userId: number;
  userName: string;
  userProfilePath: string;
  userTitle: number;
  userTitleName: string;
  authorId: number;
  authorName: string;
  authorProfilePath: string;
  authorLink: string;
  authorType: string;
  authorReservations1: string;
  authorReservations2: string;
  originLink: string;
  topicId: number;
  topic: string;
  topicIconPath: string;
  title: string;
  contents: PostContent;
  thumbnail: string;
  videoThumbnail?: string;
  viewCount: number;
  voteCount: number;
  commentCount: number;
  hasReferral: boolean;
  isEdited: boolean;
  isNSFW: boolean;
  createdAt: Date;
  updatedAt: Date;
  vote: string | null;
  isMine: boolean;
  tags?: string | string[];
  viewCursor: string;
  commentCursor: string;
  voteCursor: string;

  static fromObject(obj: any): Post {
    let post = new Post();
    post.postId = obj.postId;
    post.lang = obj.lang;
    post.dataType = obj.dataType;
    post.userId = obj.userId;
    post.userName = obj.userName;
    post.userProfilePath = obj.userProfilePath;
    post.userTitle = obj.userTitle;
    post.userTitleName = obj.userTitleName;
    post.authorId = obj.authorId;
    post.authorName = obj.authorName;
    post.authorProfilePath = obj.authorProfilePath;
    post.authorLink = obj.authorLink;
    post.authorType = obj.authorType;
    post.authorReservations1 = obj.authorReservations1;
    post.authorReservations2 = obj.authorReservations2;
    post.topicId = obj.topicId;
    post.topic = obj.topic;
    post.title = obj.title;
    post.contents = obj.contents;
    post.thumbnail = obj.thumbnail;
    post.viewCount = obj.viewCount;
    post.voteCount = obj.voteCount;
    post.commentCount = obj.commentCount;
    post.hasReferral = obj.hasReferral;
    post.isEdited = obj.isEdited;
    post.isNSFW = obj.isNSFW;
    post.createdAt = obj.createdAt;
    post.updatedAt = obj.updatedAt;
    post.vote = obj.vote;
    post.isMine = obj.isMine;
    post.tags = obj.tags;
    return post;
  }

  textContentsToJsonContents(): Post {
    try {
      if (this.contents) this.contents = JSON.parse(String(this.contents));
    } catch (e) {}
    return this;
  }
}



export class ReturnListPost {
  list: ReturnPost[] | [];
  next: string | null;
}
export class OverviewOg{
  postId: number;
  dataType: string;

  userId: number;
  userName: string;
  userProfilePath: string;
  titleId: number;
  userTitleName: string;

  authorName: string;
  authorProfilePath: string;
  authorLink: string;
  authorType: string;
  authorReservation1: string;
  authorReservation2: string;
  originLink: string;

  thumbnail?: string | null;
  title: string;
  contents: JSON;
  viewCount: number;
  commentCount: number;
  voteCount: number;
  reportCount: number;
  reportStatus: number;

  vote: string;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
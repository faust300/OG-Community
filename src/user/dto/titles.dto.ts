import { UserTitle } from '../entities/title/user-title.entity';


export class MyTitles {
  constructor(userTitle: UserTitle) {
    this.titleId = userTitle.titleId;
    this.title = userTitle.titles.name;
    this.style = userTitle.titles.style;
    this.description = userTitle.titles.description;
    this.isMain = Boolean(userTitle.user.titleId === userTitle.titleId);
  }

  titleId: number;
  title: string;
  style: object;
  description: string;
  isMain: boolean;
}

export class OverviewTopic{
  key: string;
  data: OverviewTopicData[]
}

export class OverviewTopicData {
  overviewTopicId: number;
  groupId: number;
  topicId: number;
  name: string;
  style: string;
  iconPath: string;
}

export class OverviewTopicName{
  topicId: number;
  name: string;
}
import { Topic } from "src/topics/entities/topic.entity";



export class ReturnRecommendTopic {
    dataType: string;
    description: string;
    topics: Topic[];
    matchingKeyword: "cryptocurrency" | "nft" | "normal";
}
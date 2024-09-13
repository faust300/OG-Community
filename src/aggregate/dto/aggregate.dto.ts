export class TrendKeywordDTO {
    value: TrendKeywordValue[];
}

export class TrendKeywordValue {
    word: string;
    useCount: number;
    updatedAt?: Date;
}
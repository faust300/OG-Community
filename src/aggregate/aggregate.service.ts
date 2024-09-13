import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Widget } from 'src/widgets/entities/widget.entity';
import { Repository } from 'typeorm';
import { TrendKeywordValue } from './dto/aggregate.dto';
import { Aggregate } from './entities/aggregate.entity';

@Injectable()
export class AggregateService {
  constructor(
    @InjectRepository(Aggregate)
    private readonly aggregateRepository: Repository<Aggregate>,
  ) {}

  async getTrendingKeyword(lang: string): Promise<TrendKeywordValue[]> {
    const queryObj = await this.aggregateRepository.findOneBy({
      code: 'TREND_KEYWORD'
    });

    const returnArray = []
    let i = 0;
    do {
      const value = queryObj.convertTrendKeywordDTO(queryObj).value[i];
      if(value){
        returnArray.push({
          word: value.word ? value.word : '',
          useCount: value.useCount ? value.useCount : 0
        })
      }
      i++;
    }
    while(i < 10)
    return returnArray
    // return queryObj.convertTrendKeywordDTO(queryObj).value.map((value:TrendKeywordValue) => {
    //   return {
    //     word: value.word,
    //     useCount: value.useCount
    //   }
    // })
  }
}

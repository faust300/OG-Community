import { Module } from '@nestjs/common';
import { AggregateService } from './aggregate.service';
import { AggregateController } from './aggregate.controller';
import { Aggregate } from './entities/aggregate.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Aggregate])],
  controllers: [AggregateController],
  providers: [AggregateService]
})
export class AggregateModule {}

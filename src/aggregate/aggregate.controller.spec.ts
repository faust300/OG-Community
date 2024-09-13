import { Test, TestingModule } from '@nestjs/testing';
import { AggregateController } from './aggregate.controller';
import { AggregateService } from './aggregate.service';

describe('AggregateController', () => {
  let controller: AggregateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AggregateController],
      providers: [AggregateService],
    }).compile();

    controller = module.get<AggregateController>(AggregateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

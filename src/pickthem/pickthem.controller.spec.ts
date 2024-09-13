import { Test, TestingModule } from '@nestjs/testing';
import { PickemController } from './pickthem.controller';

describe('PickemController', () => {
  let controller: PickemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PickemController],
    }).compile();

    controller = module.get<PickemController>(PickemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

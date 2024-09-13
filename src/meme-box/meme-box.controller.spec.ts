import { Test, TestingModule } from '@nestjs/testing';
import { MemeBoxController } from './meme-box.controller';
import { MemeBoxService } from './meme-box.service';

describe('MemeBoxController', () => {
  let controller: MemeBoxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemeBoxController],
      providers: [MemeBoxService],
    }).compile();

    controller = module.get<MemeBoxController>(MemeBoxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

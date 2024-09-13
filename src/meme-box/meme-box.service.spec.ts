import { Test, TestingModule } from '@nestjs/testing';
import { MemeBoxService } from './meme-box.service';

describe('MemeBoxService', () => {
  let service: MemeBoxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemeBoxService],
    }).compile();

    service = module.get<MemeBoxService>(MemeBoxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

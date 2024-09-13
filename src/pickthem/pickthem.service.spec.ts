import { Test, TestingModule } from '@nestjs/testing';
import { PickthemService } from './pickthem.service';

describe('PickemService', () => {
  let service: PickthemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PickthemService],
    }).compile();

    service = module.get<PickthemService>(PickthemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

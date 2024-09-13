import { Test, TestingModule } from '@nestjs/testing';
import { WidgetSourceService } from './widget-source.service';

describe('WidgetSourceService', () => {
  let service: WidgetSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WidgetSourceService],
    }).compile();

    service = module.get<WidgetSourceService>(WidgetSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

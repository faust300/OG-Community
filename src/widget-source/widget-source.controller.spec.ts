import { Test, TestingModule } from '@nestjs/testing';
import { WidgetSourceController } from './widget-source.controller';
import { WidgetSourceService } from './widget-source.service';

describe('WidgetSourceController', () => {
  let controller: WidgetSourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WidgetSourceController],
      providers: [WidgetSourceService],
    }).compile();

    controller = module.get<WidgetSourceController>(WidgetSourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

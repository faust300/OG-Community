import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../extensions/auth/auth.module';
import { ConnectionService } from '../extensions/services/connection.service';
import { WidgetsService } from './widgets.service';

describe('[WidgetsService]', () => {
  let service: WidgetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionService, WidgetsService],
    }).compile();

    service = module.get<WidgetsService>(WidgetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

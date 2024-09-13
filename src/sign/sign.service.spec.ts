import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionService } from '../extensions/services/connection.service';
import { SignService } from './sign.service';

describe('SignService', () => {
  let service: SignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignService, ConnectionService],
    }).compile();

    service = module.get<SignService>(SignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

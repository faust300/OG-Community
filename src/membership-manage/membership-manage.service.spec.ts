import { Test, TestingModule } from '@nestjs/testing';
import { MembershipManageService } from './membership-manage.service';

describe('MembershipManageService', () => {
  let service: MembershipManageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MembershipManageService],
    }).compile();

    service = module.get<MembershipManageService>(MembershipManageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

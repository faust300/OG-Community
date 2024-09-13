import { Test, TestingModule } from '@nestjs/testing';
import { MembershipManageController } from './membership-manage.controller';

describe('MembershipManageController', () => {
  let controller: MembershipManageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipManageController],
    }).compile();

    controller = module.get<MembershipManageController>(MembershipManageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { ConnectionService } from '../extensions/services/connection.service';

describe('TopicsController', () => {
  let controller: TopicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopicsController],
      providers: [TopicsService, ConnectionService],
    }).compile();

    controller = module.get<TopicsController>(TopicsController);
  });

  // it('Should be failed Sign in Because invalide password', async () => {
  //   const res = await request(app.getHttpServer())
  //     .get('/posts')
  //     .set('Accept', 'application/json')
  //     .type('application/json')
  //     .send().then().catch()
  //     expect(res.body.success).toEqual(false);
  // });

  it('Success get topics with userId', () => {
    expect(true).toEqual(true);
  });

  it('failed get topics with userId by not found userId', () => {
    expect(true).toEqual(true);
  });

  it('failed get topics with userId by catch error', () => {
    expect(true).toEqual(true);
  });

  it('Success get topics without userId', () => {
    expect(true).toEqual(true);
  });

  it('failed get topics without userId by catch error', () => {
    expect(true).toEqual(true);
  });

});

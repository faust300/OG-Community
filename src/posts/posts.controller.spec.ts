import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import request from 'supertest';
import { ConnectionService } from '../extensions/services/connection.service';
import { AppModule } from '../app.module';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';
import { INestApplication } from '@nestjs/common';

describe('PostsController', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    await module.init();

    app = module.createNestApplication();
    await app.init();
  });

  const cursor = {
    sort: 'recent',
    next: {
      count: 0,
      time: '2021-01-01T00:00:00.000Z'
    }
  }
  
  it('success get posts list', async () => {
    const res = await request(app.getHttpServer())
      .get('/posts')
      .set('Accept', 'application/json')
      .type('application/json')
      .send().then().catch()
      expect(res.body.success).toEqual(true);
  });
  
  it('failed get posts list', async () => {
    const res = await request(app.getHttpServer())
      .get('/posts')
      .set('Accept', 'application/json')
      .type('application/json')
      .send().then().catch()
      expect(res.body.success).toEqual(true);
  });

  // it('success get posts list', async () => {
  //     expect(true).toEqual(true);
  // });

  // it('failed get posts list because catch error', async () => {
  //     expect(true).toEqual(true);
  // });

});

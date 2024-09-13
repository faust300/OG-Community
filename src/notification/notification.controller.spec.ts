import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppController } from '../app.controller';
import { AppModule } from '../app.module';
import { AppService } from '../app.service';

describe('NotificationController', () => {
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

  it('Should be failed Sign in Because invalide password', async () => {
    const res = await request(app.getHttpServer())
      .post('/sign/email/in')
      .set('Accept', 'application/json')
      .type('application/json')
      .send({
        email: 'test@hypelabs.com',
        password: 'Abcd123!@@@',
      }).then().catch()

      expect(res.body.success).toEqual(false);
  });

  it('success signin', async () => {
    const res = await request(app.getHttpServer())
      .post('/sign/email/in')
      .set('Accept', 'application/json')
      .type('application/json')
      .send({
        email: 'test@hypelabs.com',
        password: 'Abcd123!',
      })
      .then();

    
    expect(res.body.success).toEqual(true);
    accessToken = res.body.result.accessToken;
  });

  it('get me', async () => {
    const res = await request(app.getHttpServer())
      .get('/user/me')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .type('application/json')
      .then();

    return expect(res.body.success).toEqual(true);
  });

  afterAll(() => {
    app.close();
  });
});

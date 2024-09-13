import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppController } from '../app.controller';
import { AppModule } from '../app.module';
import { AppService } from '../app.service';
import { OGExceptionFilter } from '../extensions/exception/exception.filter';
import { UserService } from './user.service';

describe('UserController', () => {
  let app: INestApplication;
  let userService: UserService;

  let signinEmail: string = 'bearwcw@naver.com';
  let signinPassword: string = '!1Aaaaaa';

  let expiredAccessToken: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwLCJpYXQiOjE2Njc0NjYzMzYsImV4cCI6MTY2NzQ2NjMzNn0.MmT5ZqGkmWGJQWOptA3sBw_X5KrFdiW5quYfsXMLEss'
  let invalidUserAccessToken: string = '';
  let accessToken: string = '';
  let userId: number;

  let patchMeContinue: boolean = false;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new OGExceptionFilter())
    await app.init();

    userService = module.get<UserService>(UserService);
  });

  describe('POST /sign/email/in', () => {
    it('should be success to get accessToken.', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/in')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: signinEmail,
          password: signinPassword,
        }).then().catch();

      expect(res.body.success).toEqual(true);
      accessToken = res.body.result.accessToken;
    });

    it('should be success to get invalidAccessToken.', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/test?userId=999999999999999999999999999999999999999')
        .set('Accept', 'application/json')
        .type('application/json').then().catch();

      expect(res.body.success).toEqual(true);
      invalidUserAccessToken = res.body.result.accessToken;
    });
  })

  describe('GET /me', () => {
    it('should be success to get accessToken.', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .type('application/json')
        .then().catch();

      expect(res.body.success).toEqual(true);
      userId = res.body.result.userId;
    });

    it('should be error to invalid accessToken.', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer 123`)
        .type('application/json')
        .then().catch();

      expect(res.body.success).toEqual(false);
    });

    it('should be error to expired accessToken.', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${expiredAccessToken}`)
        .type('application/json')
        .then().catch();

      expect(res.body.success).toEqual(false);
      expect(res.body.error.errorCode).toEqual(-401);
    });

    it('should be error to invalid accessToken.', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${invalidUserAccessToken}`)
        .type('application/json')
        .then().catch();

      expect(res.body.success).toEqual(false);
      expect(res.body.error.errorCode).toEqual(-208);
    });
  });

  describe('GET /titles', () => {
    it('should be true.', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/titles')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .type('application/json')
        .then().catch();

      expect(res.body.success).toEqual(true);
    });
  });

  describe('GET /activity-history/summary', () => {
    it('should be true.', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/activity-history/summary')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .type('application/json')
        .then().catch();

      expect(res.body.success).toEqual(true);
    });
  });

  describe('GET /activity-history/list', () => {
    it('should be true.', async () => {
      const res = await request(app.getHttpServer())
        .get('/user/activity-history/list')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .type('application/json')
        .then().catch();

      expect(res.body.success).toEqual(true);
    });
  });

  describe('PATCH /me', () => {
    if(patchMeContinue){
      it('should be true.', async () => {
        const res = await request(app.getHttpServer())
          .patch('/user/me')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            data: [
              {
                "key": "image",
                "value": "/path/hi/1"
              },{
                  "key": "username",
                  "value": "Jun111"
              },{
                  "key": "bio",
                  "value": "hi man~"
              },{
                  "key": "title",
                  "value": "2"
              }
            ]
          })
          .type('application/json')
          .then().catch();

        expect(res.body.success).toEqual(true);
      });
    }

    it('should be error to Name is already changed.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [
            {
                "key": "username",
                "value": "Jun11"
            }
          ]
        })
        .type('application/json')
        .then().catch();

      expect(res.body.error.errorCode).toEqual(-203);
    });

    it('should be error to This username is not allowed.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [
            {
                "key": "username",
                "value": "! #@#Dd a.+-"
            }
          ]
        })
        .type('application/json')
        .then().catch();

      expect(res.body.error.errorCode).toEqual(-205);
    });

    it('should be error to This username is already exist.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [
            {
                "key": "username",
                "value": "kim"
            }
          ]
        })
        .type('application/json')
        .then().catch();

      expect(res.body.error.errorCode).toEqual(-207);
    });

    it('should be error to This bio is not allowed.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [
            {
                "key": "bio",
                "value": `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                `
            }
          ]
        })
        .type('application/json')
        .then().catch();

        expect(res.body.error.errorCode).toEqual(-206);
    });

    it('should be error to You don`t have this title.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [
            {
                "key": "title",
                "value": "0"
            }
          ]
        })
        .type('application/json')
        .then().catch();

        expect(res.body.error.errorCode).toEqual(-204);
    });

    it('should be error to Invalid Referral Code.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [
            {
                "key": "referralCode",
                "value": "1"
            }
          ]
        })
        .type('application/json')
        .then().catch();

        expect(res.body.error.errorCode).toEqual(-214);
    });

    it('should be error to Invalid Request for Referral Code.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [
            {
              "key": "referralCode",
              "value": "41FYeo362v"
            },{
              "key": "bio",
              "value": "123"
            }
          ]
        })
        .type('application/json')
        .then().catch();

        expect(res.body.error.errorCode).toEqual(-212);
    });

    it('should be error to Invalid password.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [
            {
              "key": "password",
              "value": "123"
            }
          ]
        })
        .type('application/json')
        .then().catch();

        expect(res.body.error.errorCode).toEqual(-216);
    });

    it('should be error to Invalid Request for Reset Password.', async () => {
      const res = await request(app.getHttpServer())
        .patch('/user/me')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          data: [
            {
              "key": "password",
              "value": "123"
            },{
              "key": "bio",
              "value": "123"
            }
          ]
        })
        .type('application/json')
        .then().catch();

        expect(res.body.error.errorCode).toEqual(-217);
    });
  });


  afterAll(() => {
    app.close();
  });
});

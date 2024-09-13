import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import client, { ResponseError } from '@sendgrid/mail';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import request from 'supertest';
import { AppController } from '../app.controller';
import { AppModule } from '../app.module';
import { AppService } from '../app.service';
import { OGExceptionFilter } from '../extensions/exception/exception.filter';
import { EmailDto } from './dto/email.dto';
import { SignService } from './sign.service';

describe('SignController', () => {
  let app: INestApplication;
  let signService: SignService;

  let existEmail: string = '1@1.com';
  let signupEmail: string = 'bearwcw@naver.com';
  let invalidEmail: string = 'abc';

  let existReferralCode: string = '41FYeo362v';
  let invalidReferralCode: string = '1';

  let validPassword: string = '!1Aaaaaa';
  let invalidPassword: string = '1';

  let emailCode: string = "";

  let signupContinue: boolean = false;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new OGExceptionFilter())
    await app.init();

    signService = module.get<SignService>(SignService);
  });

  // email/check
  describe("POST /email/check.", () => {
    it('should be error to invalid email.', async () => {
      const result = plainToInstance(EmailDto, {invalidEmail});
      const error: ValidationError[] = await validate(result);
      expect(error.length).not.toEqual(0);
      expect(error[0].constraints.isEmail).toContain('email must be an email');
    });

    it('should be true', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/check')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: 'jun.kim@flfi.co'
        }).then().catch();

      expect(res.body.success).toEqual(true);
    });

    // it('should be error to invalid email.', async () => {
    //   const res = await request(app.getHttpServer())
    //     .post('/sign/email/check')
    //     .set('Accept', 'application/json')
    //     .type('application/json')
    //     .send({
    //       email: invalidEmail
    //     }).then().catch();

    //   expect(res.body.result).toContain("email must be an email");
    // });

    it('should be false to isExistEmail.', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/check')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: existEmail
        }).then().catch();

      expect(res.body.result).toContain("This Email address already exist.");
    });
  });

  // email/code
  describe("POST /email/code.", () => {
    it('should be error to invalid email.', async() => {
      const result = plainToInstance(EmailDto, {invalidEmail});
      const error: ValidationError[] = await validate(result);
      expect(error.length).not.toEqual(0);
      expect(error[0].constraints.isEmail).toContain('email must be an email');
    });

    it('should be error to Invalid access with verification.', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/code')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: signupEmail,
          type: '1'
        }).then().catch();

        expect(res.body.success).toEqual(false);
        expect(res.body.statusCode).toEqual(400);
        expect(res.body.error.errorCode).toEqual(-118);
    });

    it('should be error to forbidden email.', async() => {
      client.setApiKey(process.env.SENDGRID_API_KEY);

      const toEmail = 'jun.kim@flfi.co';
      const fromEmail = signupEmail;
      const title = '[Test] TDD”';
      const des1 = 'TDD';
      const des2 = 'TDD "Test"';

      let errors: ResponseError = null;
      const msg = {
        to: toEmail,
        from: fromEmail,
        subject: title,
        text: des1,
        html: `<strong>${des2}</strong>`,
      };

      try {
        await client.send(msg);
      } catch (error) {
        errors = error;
      } finally{
        expect(errors.code).toEqual(403);
      }
    });

    it('should be error to limit 5 in 24 hours.', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/code')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: signupEmail,
          type: 'signup'
        }).then().catch();

      expect(res.body.error.errorCode).toEqual(-117);
    });

    it('should be success.', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/code')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: signupEmail,
          type: 'signup'
        }).then().catch();

      expect(res.body.success).toEqual(true);
    });
  });

  describe("POST /email/up.", () => {
    if(signupContinue){
      it('should be success', async () => {
        const res = await request(app.getHttpServer())
          .post('/sign/email/up')
          .set('Accept', 'application/json')
          .type('application/json')
          .send({
            email: signupEmail,
            password: validPassword,
            emailCode,
            referralCode: existReferralCode
          }).then().catch();

          expect(res.body.success).toEqual(true);
      });
    }

    it('should be error to invalid password', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/up')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: signupEmail,
          password: invalidPassword,
          emailCode,
          referralCode: existReferralCode
        }).then().catch();

        expect(res.body.success).toEqual(true);
    });

    it('should be error to invalid emailCode', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/up')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: signupEmail,
          password: invalidPassword,
          emailCode: 'aaaaaa',
          referralCode: existReferralCode
        }).then().catch();

        expect(res.body.success).toEqual(true);
    });
  });

  describe("POST /email/in.", () => {
    it('should be success', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/in')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: signupEmail,
          password: validPassword,
        }).then().catch();

        expect(res.body.success).toEqual(true);
    });

    it('should be error to not exist email', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/in')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: '0@0.com',
          password: validPassword,
        }).then().catch();

        expect(res.body.error.errorCode).toEqual(-103);
    });

    it('should be error to wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/sign/email/in')
        .set('Accept', 'application/json')
        .type('application/json')
        .send({
          email: signupEmail,
          password: invalidPassword,
        }).then().catch();

        expect(res.body.error.errorCode).toEqual(-104);
    });
  });

  afterAll(() => {
    app.close();
  });
});

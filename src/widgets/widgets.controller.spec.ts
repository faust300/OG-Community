import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request, { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { OGRequest } from '../extensions/auth/auth.request';
import { OGException } from '../extensions/exception/exception.filter';
import { ConnectionService } from '../extensions/services/connection.service';
import { RMQService } from '../extensions/services/rmq.service';
import { UpdateWidgetDtos } from './dto/update-widget.dto';
import { WidgetsController } from './widgets.controller';
import { WidgetsService } from './widgets.service';
import { AppModule } from '../app.module';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';

describe('[WidgetsController]', () => {
  let app: INestApplication;
  let controller: WidgetsController;
  let connectionService: ConnectionService;
  let user1: String;
  let user2: String;

  const error30104 = new OGException({
    errorCode: 30104,
    errorMessage: "User Widgets Update Failed"
  }, 500);

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

    const user1Res = await request(app.getHttpServer()).post('/sign/test?userId=1')
    user1 = user1Res.body.result.accessToken;
    const user2Res = await request(app.getHttpServer()).post('/sign/test?userId=2')
    user2 = user2Res.body.result.accessToken;
  });

  it('should first init', async () => {
    await expect(true).toEqual(true);
  })

  it('should success getWidgets by anonymouse', async () => {
    const result:Response = await request(app.getHttpServer())
    .get('/widgets');
    
    await expect(result.status).toBe(200);
    await expect(result.body.success).toEqual(true);
  });

  it('should success getWidgets Not User Defined by userId', async () => {
    const result:Response = await request(app.getHttpServer())
    .get('/widgets')
    .set('Authorization', 'Bearer ' + user2);

    await expect(result.status).toBe(200);
    await expect(result.body.success).toEqual(true);
  });

  it('should success getWidgets User Defined by userId', async () => {
    const result:Response = await request(app.getHttpServer())
    .get('/widgets')
    .set('Authorization', 'Bearer ' + user1);

    await expect(result.status).toBe(200);
    await expect(result.body.success).toEqual(true);
  })

  it('should success getWidgets All', async () => {
    const result:Response = await request(app.getHttpServer())
    .get('/widgets/all');
    
    await expect(result.status).toBe(200);
    await expect(result.body.success).toEqual(true);
  });

  it('Fail updateWidgets, anonymouse', async () => {
    const body: UpdateWidgetDtos = {
      data: [
        {
          widgetId: 1,
          order: 1,
          setting: []
        }
      ]
    }
    const result:Response = await request(app.getHttpServer())
    .patch('/widgets')
    .set('Authorization', 'Bearer ')
    .send(body);

    await expect(result.status).toBe(401);
  })

  it('success updateWidgets not setting by userId', async () => {
    const body = {
      data: [
        {
          widgetId: 1,
          order: 1
        }
      ]
    }

    const result:Response = await request(app.getHttpServer())
    .patch('/widgets')
    .set('Authorization', 'Bearer ' + user2)
    .send(body);

    await expect(result.status).toBe(200);
    await expect(result.body.success).toEqual(true);
  });

  afterAll(async () => {
    await app.close();
  })

});

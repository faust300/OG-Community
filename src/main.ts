import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { OGExceptionFilter } from './extensions/exception/exception.filter';
import { OGValidationPipe } from './extensions/pipes/og-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // use Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  //use cors
  app.enableCors({
    origin: process.env.CORS_SITES?.split(','),
    optionsSuccessStatus: 200,
  });

  //  use exception filter
  app.useGlobalFilters(new OGExceptionFilter());

  //use validator
  app.useGlobalPipes(new OGValidationPipe());

  await app.listen(process.env.PORT);
}

bootstrap();
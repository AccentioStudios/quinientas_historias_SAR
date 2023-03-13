import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { SharedService } from '@app/shared';

import { RetosModule } from './retos.module';

async function bootstrap() {
  const app = await NestFactory.create(RetosModule);

  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);

  const queue = configService.get('RABBITMQ_RETOS_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices();
}
bootstrap();

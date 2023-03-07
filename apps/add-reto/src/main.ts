import { NestFactory } from '@nestjs/core';
import { AddRetoModule } from './add-reto.module';

async function bootstrap() {
  const app = await NestFactory.create(AddRetoModule);
  await app.listen(3000);
}
bootstrap();

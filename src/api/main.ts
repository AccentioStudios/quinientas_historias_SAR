import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { RpcExceptionFilter } from 'src/shared/filters/error.filters'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  })
  app.useGlobalFilters(new RpcExceptionFilter())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
    })
  )

  await app.listen(process.env.PORT || 4022)
}
bootstrap()

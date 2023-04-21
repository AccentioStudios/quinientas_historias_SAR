import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { RpcExceptionFilter } from 'src/shared/filters/error.filters'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useGlobalFilters(new RpcExceptionFilter())
  app.use(helmet())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
    })
  )

  await app.listen(5000)
}
bootstrap()

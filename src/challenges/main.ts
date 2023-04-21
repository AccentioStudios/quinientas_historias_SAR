import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { SharedService } from 'src/shared'

import { ChallengesModule } from './challenges.module'

async function bootstrap() {
  const app = await NestFactory.create(ChallengesModule)

  const configService = app.get(ConfigService)
  const sharedService = app.get(SharedService)

  const queue = configService.get('RABBITMQ_RETOS_QUEUE')

  app.connectMicroservice(sharedService.getRmqOptions(queue))
  app.startAllMicroservices()
}
bootstrap()

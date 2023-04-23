import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ClientProxy,
  RmqContext,
  RmqOptions,
  RpcException,
  Transport,
} from '@nestjs/microservices'

import { SharedServiceInterface } from '../interfaces/shared-service.interface'
import { firstValueFrom, map } from 'rxjs'
import { HttpService } from '@nestjs/axios'

@Injectable()
export class SharedService implements SharedServiceInterface {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  getRmqOptions(queue: string): RmqOptions {
    const USER = this.configService.get('RABBITMQ_USER')
    const PASSWORD = this.configService.get('RABBITMQ_PASS')
    const HOST = this.configService.get('RABBITMQ_HOST')

    return {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${USER}:${PASSWORD}@${HOST}`],
        noAck: false,
        queue,
        queueOptions: {
          durable: true,
        },
      },
    }
  }

  acknowledgeMessage(context: RmqContext) {
    const channel = context.getChannelRef()
    const message = context.getMessage()
    channel.ack(message)
  }
}

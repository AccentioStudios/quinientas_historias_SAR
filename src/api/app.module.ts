import { SharedModule } from 'src/shared'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { RolesGuard } from '../shared/guards/roles.guard'
import { SecretKeyInterceptor } from '../shared/interceptors/secret-key.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),

    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq('RETOS_SERVICE', process.env.RABBITMQ_RETOS_QUEUE),

    /*     SharedModule.registerRmq(
      'PRESENCE_SERVICE',
      process.env.RABBITMQ_PRESENCE_QUEUE,
    ), */
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecretKeyInterceptor,
    },
  ],
})
export class AppModule {}

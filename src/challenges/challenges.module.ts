import type { RedisClientOptions } from 'redis'
import * as redisStore from 'cache-manager-redis-store'
import { CacheModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MysqlDBModule, SharedModule, SharedService } from 'src/shared'
import { AssignedChallengesEntity } from 'src/shared/entities/assigned-challenges.entity'
import { ChallengeEntity } from 'src/shared/entities/challenge.entity'
import { AssignedChallengesRepository } from 'src/shared/repositories/retos-Asignados.repository'
import { ChallengesRepository } from 'src/shared/repositories/challenges.repository'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChallengesController } from './challenges.controller'
import { ChallengesService } from './challenges.service'
import { HttpModule } from '@nestjs/axios'
import { APP_GUARD } from '@nestjs/core'
import { RolesGuard } from '../shared/guards/roles.guard'
import { QuinientasHApiModule } from '../shared/modules/500h-api.module'

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          store: redisStore,
          ttl: config.get('REDIS_TTL'),
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
          no_ready_check: true,
        }
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    SharedModule,
    QuinientasHApiModule,
    MysqlDBModule,
    TypeOrmModule.forFeature([ChallengeEntity, AssignedChallengesEntity]),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [ChallengesController],
  providers: [
    ChallengesService,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'RetosServiceInterface',
      useClass: ChallengesService,
    },
    {
      provide: 'RetoRepositoryInterface',
      useClass: ChallengesRepository,
    },
    {
      provide: 'RetoAsingadosInterface',
      useClass: AssignedChallengesRepository,
    },
  ],
})
export class ChallengesModule {}

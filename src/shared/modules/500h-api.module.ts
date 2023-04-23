import { CacheModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { redisStore } from 'cache-manager-redis-yet'

import { RedisService } from '../services/redis.service'
import { QuinientasHApiService } from '../services/500h-api.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    HttpModule,
  ],
  providers: [QuinientasHApiService],
  exports: [QuinientasHApiService],
})
export class QuinientasHApiModule {}

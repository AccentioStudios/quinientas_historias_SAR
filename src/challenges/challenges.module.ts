import { MysqlDBModule, SharedModule, SharedService } from 'src/shared'
import { AssignedChallengesEntity } from 'src/shared/entities/assigned-challenges.entity'
import { ChallengeEntity } from 'src/shared/entities/challenge.entity'
import { AssignedChallengesRepository } from 'src/shared/repositories/retos-Asignados.repository'
import { ChallengesRepository } from 'src/shared/repositories/challenges.repository'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChallengesController } from './challenges.controller'
import { ChallengesService } from './challenges.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    HttpModule,
    SharedModule,
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

import {
  CacheInterceptor,
  Controller,
  Inject,
  UseInterceptors,
} from '@nestjs/common'
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices'

import { SharedService } from 'src/shared'
import { ChallengesService } from './challenges.service'
import { PayloadNewChallengeDto, NewChallengeDto } from './dto/new-reto.dto'
import { FinishChallengeResponseDto } from './dto/finish-challenge-response.dto'
import { SecretKeyProtected } from '../shared/decorators/roles.decorators'

@Controller()
export class ChallengesController {
  constructor(
    @Inject('RetosServiceInterface')
    private readonly challengesService: ChallengesService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService
  ) {}

  @MessagePattern({ cmd: 'listener-event' })
  async listenerEvent(@Ctx() context: RmqContext, @Payload() event: any) {
    this.sharedService.acknowledgeMessage(context)
    return this.challengesService.listenerEvent(event)
  }

  @MessagePattern({ cmd: 'newChallenge' })
  async newChallenge(
    @Ctx() context: RmqContext,
    @Payload() { dto, user }: any
  ) {
    this.sharedService.acknowledgeMessage(context)
    return this.challengesService.newChallenge(dto, user)
  }

  @MessagePattern({ cmd: 'get-retos' })
  async getRetos(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context)
    return this.challengesService.getReto()
  }

  @MessagePattern({ cmd: 'get-asignados-retos' })
  async asignadosGetRetos(@Ctx() context: RmqContext, @Payload() reto: any) {
    this.sharedService.acknowledgeMessage(context)
    return this.challengesService.asignadosGetRetos(reto)
  }

  @MessagePattern({ cmd: 'endChallenge' })
  async endChallenge(
    @Ctx() context: RmqContext,
    @Payload() { dto, user, secretKey }: any
  ) {
    this.sharedService.acknowledgeMessage(context)
    return this.challengesService.endChallenge(dto, user, secretKey)
  }
  @MessagePattern({ cmd: 'addStep' })
  async addStep(
    @Ctx() context: RmqContext,
    @Payload() { challengeId, user }: any
  ) {
    this.sharedService.acknowledgeMessage(context)
    return this.challengesService.addStep(challengeId, user)
  }
}

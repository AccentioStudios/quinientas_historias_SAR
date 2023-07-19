import { HttpService } from '@nestjs/axios'
import {
  Injectable,
  Inject,
  CACHE_MANAGER,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'

import { Cache } from 'cache-manager'
import { firstValueFrom, map } from 'rxjs'
import { AssignPointsSarDto } from '../../challenges/dto/assign-points-sar.dto'
import { NotificationDto } from '../dto/notification.dto'
import { ChallengeEntity } from '../entities/challenge.entity'
import { ChallengeSarEventDto } from '../dto/challenge-sar-event.dto'

@Injectable()
export class QuinientasHApiService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async assignPointsToUser(dto: AssignPointsSarDto) {
    const assignPointsRequest = await firstValueFrom(
      this.httpService
        .request({
          method: 'POST',
          url: `${process.env.APIURL}/v2/sar/add-points`,
          data: dto,
          headers: {
            'Content-Type': 'application/json',
            sar_access_token: process.env.SAR_ACCESS_TOKEN,
          },
        })
        .pipe(
          map((res) => {
            if (res?.data) return res.data
            return null
          })
        )
    ).catch((err) => {
      console.error(err)
      throw new RpcException(err)
    })

    return assignPointsRequest
  }
  async getUserRole(userId: number) {
    const datosUsuario500h = await firstValueFrom(
      this.httpService
        .request({
          method: 'GET',
          url: `${process.env.APIURL}/v2/user/role/${userId}`,
          headers: {
            'Content-Type': 'application/json',
            sar_access_token: process.env.SAR_ACCESS_TOKEN,
          },
        })
        .pipe(
          map((res) => {
            if (res?.data) return res.data
            return null
          })
        )
    ).catch((err) => {
      console.error(err)
      throw new RpcException(
        new InternalServerErrorException(
          'getUserRole: No se pudo enviar la peticion al servidor'
        )
      )
    })

    return datosUsuario500h
  }

  async sendNewChallengeNotification(
    event: ChallengeSarEventDto,
    challenge: ChallengeEntity
  ) {
    const sendNotification: NotificationDto = {
      title: 'Has desbloqueado un nuevo reto',
      body: 'Click aqui para saber más',
      data: {
        args: {
          id: challenge.id,
          userId: event.userId,
          storyId: event.storyId,
          url: challenge.url,
          description: challenge.description,
          name: challenge.name,
          type: challenge.type,
          required: challenge.required,
          tournament: challenge.tournaments.split(',').map(Number),
        },
        route: '/challenge',
      },
    }
    return await firstValueFrom(
      this.httpService
        .request({
          method: 'POST',
          url: `${process.env.APIURL}/v2/user/send-notification/${event.userId}`,
          data: sendNotification,
          headers: {
            'Content-Type': 'application/json',
            sar_access_token: process.env.SAR_ACCESS_TOKEN,
          },
        })
        .pipe(
          map((res) => {
            if (res?.data != null) return res.data
            return null
          })
        )
    ).catch((err) => {
      console.error(err)
      throw new RpcException(
        new InternalServerErrorException(
          'sendNewChallengeNotification: No se pudo enviar la peticion al servidor'
        )
      )
    })
  }
}

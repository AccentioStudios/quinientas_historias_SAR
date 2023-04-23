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

@Injectable()
export class QuinientasHApiService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async assignPointsToUser(dto: AssignPointsSarDto) {
    return this.axiosGetObservable(
      `${process.env.APIURL}/challenge-sar/add-points`,
      'POST',
      dto
    )
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
          'No se pudo enviar la peticion al servidor'
        )
      )
    })

    return datosUsuario500h
  }

  async sendNewChallengeNotification(
    userId: number,
    challenge: ChallengeEntity
  ) {
    const sendNotification: NotificationDto = {
      title: 'Has desbloqueado un nuevo reto',
      body: 'Click aqui para saber más',
      data: {
        args: {
          id: userId,
          url: 'https://game.accentio.app/',
          description: 'una descripcion chimba',
          name: challenge.name,
          type: challenge.type,
          required: challenge.required,
          tournament: challenge.tournaments.split(',').map(Number),
        },
        route: '/challenges',
      },
    }
    return await firstValueFrom(
      this.httpService
        .request({
          method: 'POST',
          url: `${process.env.APIURL}/v2/user/send-notification/${userId}`,
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
          'No se pudo enviar la peticion al servidor'
        )
      )
    })
  }

  async sendNotification(dto: NotificationDto) {
    const notification = await this.axiosGetObservable(
      `${process.env.APIURL}/v2/user/send-notification/1`,
      'POST',
      dto
    )
    return notification
  }

  async axiosGetObservable(
    ruta: string,
    method: string,
    datos?: any
  ): Promise<any> {
    return await firstValueFrom(
      this.httpService
        .request({
          method: method,
          url: ruta,
          data: datos,
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
          'No se pudo enviar la peticion al servidor'
        )
      )
    })
  }
}

import { AssignedChallengesRepositoryInterface } from 'src/shared/interfaces/assigned-challenges-repository.interface'
import { ChallengesRepositoryInterface } from 'src/shared/interfaces/challenges-repository.interface'
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { ChallengesServiceInterface } from './interfaces/challenges-service.interface'
import { HttpService } from '@nestjs/axios'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { dataRetoNew } from './dto/new-reto.dto'
import { AsignarRetoDto } from '../shared/dto/asignar-reto.dto'
import { Like } from 'typeorm'
import { NotificationDto } from './dto/notification.dto'
import {
  AddStepResponseDto,
  FinishChallengeResponseDto,
} from './dto/finish-challenge-response.dto'
import { AssignPointsSarDto } from './dto/assign-points-sar.dto'
import { firstValueFrom, map } from 'rxjs'

@Injectable()
export class ChallengesService implements ChallengesServiceInterface {
  constructor(
    private readonly httpService: HttpService,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('RetoRepositoryInterface')
    private readonly retosRepository: ChallengesRepositoryInterface,
    @Inject('RetoAsingadosInterface')
    private readonly retosAsingadosRepository: AssignedChallengesRepositoryInterface
  ) {}
  async addReto(newReto: dataRetoNew): Promise<any> {
    if (newReto.req.role !== 'admin')
      throw new RpcException(
        new UnauthorizedException(
          'No tienes permisos para realizar esta accion'
        )
      )
    let probabilidades = []
    const {
        name,
        url,
        probability,
        required,
        puntos_asignados,
        steps,
        steps_total,
      } = newReto.body,
      tournaments = newReto.body.tournaments.toString(),
      params = newReto.body.params.toString(),
      triggers = newReto.body.triggers.toString()
    let dataRetos = (await this.retosRepository.findAll({
      order: { probability: 'ASC' },
      where: { active: true },
    })) as any
    dataRetos.push({
      name,
      url,
      probability,
      required,
      active: true,
      tournaments,
      params,
      triggers,
      puntos_asignados,
      steps,
      steps_total,
      added_by: newReto.req.id,
    })
    dataRetos.map((e) => {
      probabilidades.push(e.probability)
    })
    let ratio = Math.max.apply(Math, probabilidades) / 100
    dataRetos.map((item) => {
      item.weight = item.probability / ratio
    })

    this.retosRepository.upsert(dataRetos as any)
    return dataRetos
  }

  async getReto(): Promise<any> {
    let data = await this.retosRepository.findAll()
    return data
  }

  /**
   * this function assigns a random challenge to a user based on certain triggers, while ensuring that the user does not already have a challenge assigned.
   * @param asignarReto
   * @returns
   */
  async asignarReto(asignarReto: AsignarRetoDto): Promise<any> {
    const datosUsuario500h = await this.axiosGetObservable(
      `${process.env.APIURL}/v2/user/role/${asignarReto.id_user}`,
      'GET',
      asignarReto,
      null
    )

    let data = await this.retosAsingadosRepository.findByCondition({
      where: { id_user: asignarReto.id_user, active: true },
    })
    if (data) {
      throw new RpcException(
        new BadRequestException('Ya tienes un reto asignado')
      )
    }
    let randomArray = []
    let dataRetos = await this.retosRepository.findAll({
      order: { probability: 'ASC' },
      where: {
        active: true,
        triggers: Like(`%${asignarReto.triggers}%`),
        tournaments: Like(`%${datosUsuario500h.team.tournamentId}%`),
      },
    })
    if (dataRetos.length === 0)
      throw new RpcException(
        new BadRequestException('trigger invalido o no hay retos disponibles')
      )
    dataRetos.map((e, i) => {
      let clone = Array(e.weight[i]).fill(e)
      randomArray.push(...clone)
    })

    const result = randomArray[~~(Math.random() * randomArray.length)]

    let tokenSession = await this.getObservable('sign-token', {
      role: 'sar',
      id_user: asignarReto.id_user,
      storyId: asignarReto.storyId,
      trigger: asignarReto.triggers,
      ...result,
    })

    let dataSaved = this.retosAsingadosRepository.save({
      id_user: asignarReto.id_user,
      id_reto: result.id,
      url: result.url,
      puntos_asignados: result.puntos_asignados,
      trigger: `${asignarReto.triggers}`,
      challenge_type: result.challenge_type,
      steps: result.steps,
      steps_total: result.steps_total,
      token: tokenSession.token,
      storyId: asignarReto.storyId,
      active: true,
      creation_date: new Date(),
    })
    const sendNotification: NotificationDto = {
      title: 'Has desbloqueado un nuevo reto',
      body: 'Click aqui para saber más',
      data: {
        args: {
          id: asignarReto.id_user,
          url: 'https://game.accentio.app/',
          description: 'una descripcion chimba',
          name: result.name,
          type: 'minigame',
          required: result.required,
          tournament: result.tournaments.split(',').map(Number),
          sessionToken: tokenSession.token,
        },
        route: '/challenges',
      },
    }
    const notification = this.axiosGetObservable(
      `${process.env.APIURL}/v2/user/send-notification/1`,
      'POST',
      sendNotification,
      sendNotification.data.args.sessionToken
    )

    return sendNotification
  }
  async asignadosGetRetos(reto): Promise<any> {
    if (reto.query.all) {
      let data = await this.retosAsingadosRepository.findAll({
        where: { id_user: reto.req.id },
        order: { creation_date: 'DESC' },
      })
      return data
    }
    let data = await this.retosAsingadosRepository.findAll({
      where: { id_user: reto.req.id, active: reto.query.active ? true : false },
    })
    return data
  }

  async addstep(reto): Promise<AddStepResponseDto> {
    let descripcion = 'paso completado'

    if (!reto.req.user)
      throw new RpcException(new UnauthorizedException('token incorrecto'))
    let dataRetos = await this.retosAsingadosRepository.findByCondition({
      where: { id_user: reto.req.user.id_user, active: true },
    })
    if (!dataRetos)
      throw new RpcException(
        new BadRequestException('No tienes un reto asignado')
      )
    if (dataRetos.steps_total === 0)
      throw new RpcException(
        new BadRequestException('Este reto no tiene pasos')
      )

    dataRetos.steps++
    if (dataRetos.steps_total === dataRetos.steps) {
      dataRetos.active = false
      const datosUsuario500h = await this.axiosGetObservable(
        `${process.env.APIURL}/v2/user/role/${dataRetos.id_user}`,
        'GET',
        reto,
        null
      )
      if (!datosUsuario500h)
        throw new RpcException(
          new BadRequestException('No se encontro el usuario')
        )
      const points: AssignPointsSarDto = {
        userId: dataRetos.id_user.toString(),
        points: {
          base: dataRetos.puntos_asignados,
          bonus: 0,
        },
        challengeId: reto.req.user.id,
        storyId: null,
        teamId: datosUsuario500h.teamId.toString(),
        tournamentId: datosUsuario500h.team.tournamentId.toString(),
      }
      const pointsResponse = await this.axiosGetObservable(
        `${process.env.APIURL}/challenge-sar/add-points`,
        'POST',
        points,
        null
      )
      descripcion = 'Reto terminado'
    }
    await this.retosAsingadosRepository.save(dataRetos)

    let response: AddStepResponseDto = {
      id: reto.req.user.id,
      description: descripcion,
      puntos_asignados: dataRetos.puntos_asignados,
      challenge_type: dataRetos.challenge_type,
      status: 'finished',
      steps: dataRetos.steps,
      steps_total: dataRetos.steps_total,
    }
    return response
  }
  async finishRetos(reto): Promise<FinishChallengeResponseDto> {
    if (!reto.req.user)
      throw new RpcException(new UnauthorizedException('token incorrecto'))
    let dataRetos = await this.retosAsingadosRepository.findByCondition({
      where: { id_user: reto.req.user.id_user, active: true },
    })
    if (!dataRetos)
      throw new RpcException(
        new BadRequestException('No tienes un reto asignado')
      )
    if (dataRetos.steps_total != 0)
      throw new RpcException(new BadRequestException('Este reto tiene pasos'))

    const datosUsuario500h = await this.axiosGetObservable(
      `${process.env.APIURL}/v2/user/role/${dataRetos.id_user}`,
      'GET',
      reto,
      null
    )
    if (!datosUsuario500h)
      throw new RpcException(
        new BadRequestException('No se encontro el usuario')
      )
    const points: AssignPointsSarDto = {
      userId: dataRetos.id_user.toString(),
      points: {
        base: dataRetos.puntos_asignados,
        bonus: 0,
      },
      challengeId: reto.req.user.id,
      storyId: null,
      teamId: datosUsuario500h.teamId.toString(),
      tournamentId: datosUsuario500h.team.tournamentId.toString(),
    }
    const pointsResponse = await this.axiosGetObservable(
      `${process.env.APIURL}/challenge-sar/add-points`,
      'POST',
      points,
      null
    )

    dataRetos.active = false
    this.retosAsingadosRepository.save(dataRetos)
    let response: FinishChallengeResponseDto = {
      id: reto.req.user.id,
      description: 'Reto terminado',
      puntos_asignados: dataRetos.puntos_asignados,
      challenge_type: dataRetos.challenge_type,
      status: 'finished',
    }

    return response
  }

  async getObservable(ruta: string, datos: object): Promise<any> {
    return await firstValueFrom(
      this.authService.send({ cmd: ruta }, datos)
    ).catch((err) => {
      console.error(err)
      throw new RpcException(
        new InternalServerErrorException(
          'No se pudo enviar la peticion al servidor'
        )
      )
    })
  }

  async axiosGetObservable(
    ruta: string,
    method: string,
    datos: any,
    jwt: string
  ): Promise<any> {
    return await firstValueFrom(
      this.httpService
        .request({
          method: method,
          url: ruta,
          data: datos,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
            sar_access_token: process.env.SAR_ACCESS_TOKEN,
          },
        })
        .pipe(map((res) => res.data))
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

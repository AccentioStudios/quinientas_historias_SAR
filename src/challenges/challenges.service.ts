import { AssignedChallengesRepositoryInterface } from 'src/shared/interfaces/assigned-challenges-repository.interface'
import { ChallengesRepositoryInterface } from 'src/shared/interfaces/challenges-repository.interface'
import {
  CACHE_MANAGER,
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common'
import { ChallengesServiceInterface } from './interfaces/challenges-service.interface'
import { HttpService } from '@nestjs/axios'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { NewChallengeDto } from './dto/new-reto.dto'
import { ChallengeSarEventDto } from '../shared/dto/challenge-sar-event.dto'
import { Like } from 'typeorm'
import {
  AddStepResponseDto,
  FinishChallengeResponseDto,
} from './dto/finish-challenge-response.dto'
import { firstValueFrom, map } from 'rxjs'
import {
  generateRandomHash,
  hashArgonData,
  verifyHashArgonData,
} from '../shared/utils/crypto'
import { ChallengeEntity } from '../shared/entities/challenge.entity'
import { QuinientasHApiService } from '../shared/services/500h-api.service'

@Injectable()
export class ChallengesService implements ChallengesServiceInterface {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
    private readonly quinientasHApiService: QuinientasHApiService,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('RetoRepositoryInterface')
    private readonly challengeRepository: ChallengesRepositoryInterface,
    @Inject('RetoAsingadosInterface')
    private readonly assignedChallengesRepository: AssignedChallengesRepositoryInterface
  ) {}

  async newChallenge(dto: NewChallengeDto, user: any): Promise<any> {
    // Verify if the user is an admin
    if (user.role !== 'admin')
      throw new RpcException(
        new UnauthorizedException(
          'No tienes permisos para realizar esta accion'
        )
      )

    // Generate a secret key for the challenge
    const secretKey = generateRandomHash()
    // New challenge
    let newChallenge = {
      name: dto.name,
      url: dto.url,
      probability: dto.probability >= 1 ? dto.probability : 1,
      weight: 0,
      required: dto.required,
      active: true,
      steps: dto.steps,
      tournaments: dto.tournaments.toString(),
      params: dto.params.toString(),
      triggers: dto.triggers.toString(),
      addedBy: user.id,
      // we save the hash of the secret key
      secretKey: await hashArgonData(secretKey),
    } as ChallengeEntity

    let dbCount = await this.challengeRepository.findAll({
      order: { probability: 'ASC' },
      where: { active: true },
    })

    // Add new challenge to array
    dbCount.push(newChallenge)

    let ratio =
      Math.max.apply(
        Math,
        dbCount.map((e) => e.probability)
      ) / 100

    dbCount.map((item) => {
      item.weight = item.probability / ratio
    })

    const response = await this.challengeRepository.upsert(dbCount as any)
    if (response[0]) {
      return { secretKey: secretKey }
    }
    return new HttpException('Error al crear el reto', 500)
  }

  async getReto(): Promise<any> {
    let data = await this.challengeRepository.findAll()
    return data
  }

  /**
   * this function assigns a random challenge to a user based on certain triggers, while ensuring that the user does not already have a challenge assigned.
   * @param event
   * @returns
   */
  async listenerEvent(event: ChallengeSarEventDto): Promise<any> {
    const user500h = await this.quinientasHApiService.getUserRole(event.userId)

    // let data = await this.assignedChallengesRepository.findByCondition({
    //   where: { userId: event.userId, active: true },
    // })

    if (!user500h) {
      throw new RpcException(
        new BadRequestException('Usuario no existe en 500 Historias')
      )
    }

    // let randomArray = []
    let dataRetos = await this.challengeRepository.findAll({
      order: { probability: 'ASC' },
      where: {
        active: true,
        triggers: Like(`%${event.trigger}%`),
        tournaments: Like(`%${user500h?.team?.tournamentId}%`),
      },
    })
    if (dataRetos.length === 0) {
      return { assigned: false }
    }
    const randomArray: ChallengeEntity[] = dataRetos.flatMap((e, i) =>
      Array(e.weight[i]).fill(e)
    )
    const result = randomArray[~~(Math.random() * randomArray.length)]

    // dataRetos.map((e, i) => {
    //   let clone = Array(e.weight[i]).fill(e)
    //   randomArray.push(...clone)
    // })

    await this.assignChallenge(event, result)

    const sendNotification =
      await this.quinientasHApiService.sendNewChallengeNotification(
        event.userId,
        result
      )

    return true
  }

  async assignChallenge(
    event: ChallengeSarEventDto,
    challenge: ChallengeEntity
  ) {
    let dataSaved = await this.assignedChallengesRepository.save({
      userId: event.userId,
      challengeId: challenge.id,
      storyId: event.storyId,
      active: true,
      createdAt: new Date(),
    })
    return dataSaved
  }

  async asignadosGetRetos(reto): Promise<any> {
    if (reto.query.all) {
      let data = await this.assignedChallengesRepository.findAll({
        where: { userId: reto.req.id },
        order: { createdAt: 'DESC' },
      })
      return data
    }
    let data = await this.assignedChallengesRepository.findAll({
      where: { userId: reto.req.id, active: reto.query.active ? true : false },
    })
    return data
  }

  async addStep(challengeId: number, user: any): Promise<AddStepResponseDto> {
    if (!user)
      throw new RpcException(new UnauthorizedException('token incorrecto'))
    let assignedChallengeData =
      await this.assignedChallengesRepository.findByCondition({
        where: { userId: user.id, challengeId: challengeId, active: true },
        relations: {
          challenge: true,
        },
      })
    if (!assignedChallengeData)
      throw new RpcException(
        new BadRequestException('No tienes un reto asignado')
      )
    if (assignedChallengeData.challenge.steps === 0)
      throw new RpcException(
        new BadRequestException('Este reto no tiene pasos')
      )

    assignedChallengeData.currentStep++
    if (
      assignedChallengeData.challenge.steps ===
      assignedChallengeData.currentStep
    ) {
      // if the challenge steps are completed, we deactivate the challenge and assign the points
      assignedChallengeData.active = false
      const user500h = await this.quinientasHApiService.getUserRole(
        assignedChallengeData.userId
      )
      if (!user500h)
        throw new RpcException(
          new BadRequestException('No se encontro el usuario')
        )
      await this.quinientasHApiService.assignPointsToUser({
        userId: user.id.toString(),
        points: {
          base: assignedChallengeData.points,
          bonus: 0,
        },
        challengeId: challengeId,
        storyId: null, // TODO: Agregar storyId
        teamId: user500h.teamId?.toString(),
        tournamentId: user500h.team.tournamentId?.toString(),
      })
    }
    await this.assignedChallengesRepository.save(assignedChallengeData)

    let response: AddStepResponseDto = {
      id: user.id,
      points: assignedChallengeData.points,
      challengeType: assignedChallengeData.challenge.type,
      success: true,
      steps: assignedChallengeData.currentStep,
      stepsTotal: assignedChallengeData.challenge.steps,
    }
    return response
  }

  async endChallenge(
    dto: FinishChallengeResponseDto,
    user: any,
    secretKey: string
  ): Promise<FinishChallengeResponseDto> {
    // we verify the secret key
    if (!(await this.verifySecretKey(dto.id, secretKey))) {
      throw new RpcException(new UnauthorizedException('token incorrecto'))
    }
    if (!user)
      throw new RpcException(new UnauthorizedException('user requerido'))
    let dataChallenge = await this.assignedChallengesRepository.findByCondition(
      {
        where: { userId: user.id, active: true },
        relations: {
          challenge: true,
        },
      }
    )
    if (!dataChallenge)
      throw new RpcException(
        new BadRequestException('No tienes un reto asignado')
      )

    const datosUsuario500h = await this.quinientasHApiService.getUserRole(
      dataChallenge.userId
    )

    if (!datosUsuario500h)
      throw new RpcException(
        new BadRequestException('No se encontro el usuario')
      )

    // if user finish the challenge successfully we assign the points to the user
    if (dto.success) {
      await this.quinientasHApiService.assignPointsToUser({
        userId: dataChallenge.userId.toString(),
        points: {
          base: dataChallenge.points,
          bonus: 0,
        },
        challengeId: dataChallenge.id,
        storyId: null, // TODO: Agregar storyId
        teamId: datosUsuario500h.teamId.toString(),
        tournamentId: datosUsuario500h.team.tournamentId.toString(),
      })
    }

    dataChallenge.active = false
    this.assignedChallengesRepository.save(dataChallenge)
    let response: FinishChallengeResponseDto = {
      id: dataChallenge.id,
      success: true,
    }

    return response
  }

  async verifySecretKey(challengeId: number, key: string) {
    const data = await this.challengeRepository.findByCondition({
      where: { id: challengeId },
    })
    if (!data) throw new RpcException(new BadRequestException('Reto no existe'))

    return verifyHashArgonData(data.secretKey, key)
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

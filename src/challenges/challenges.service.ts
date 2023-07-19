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
import { Like, MoreThan } from 'typeorm'
import {
  AddStepDto,
  EndChallengeDto,
} from './dto/finish-challenge-response.dto'
import { firstValueFrom, map } from 'rxjs'
import {
  generateRandomHash,
  generateUUID,
  hashArgonData,
  verifyHashArgonData,
} from '../shared/utils/crypto'
import { ChallengeEntity } from '../shared/entities/challenge.entity'
import { QuinientasHApiService } from '../shared/services/500h-api.service'
import { AssignedChallengesEntity } from '../shared/entities/assigned-challenges.entity'
import { dataSource } from './database/data-source'

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

  async getUserData(
    userId: number,
    challengeUUID: string,
    secretKey: string,
    testMode: string
  ) {
    try {
      // If the challenge is in testMode, we do not verify the secret key, and we return a mock object
      if (testMode === 'true') {
        // We also wait 1 seconds to simulate the time it takes to complete the request
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return {
          id: 1,
          firstName: 'Alvaro',
          lastName: 'de Accentio',
          avatarUrl:
            'https://testing.500historias.com/wp-content/plugins/buddyboss-platform/bp-core/images/profile-avatar-buddyboss-50.png',
          role: 'reader',
        } as any
      }

      if (!challengeUUID) {
        throw new RpcException(new BadRequestException('Uuid es requerido'))
      }
      // we verify the secret key
      if (!(await this.verifySecretKey(challengeUUID, secretKey))) {
        throw new RpcException(new UnauthorizedException('token incorrecto'))
      }

      // we get the user data
      return this.quinientasHApiService.getUserRole(userId)
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException(
        'No se pudo enviar la peticion al servidor'
      )
    }
  }

  async newChallenge(dto: NewChallengeDto, user: any): Promise<any> {
    try {
      // Verify if the user is an admin
      if (user.role !== 'admin')
        throw new RpcException(
          new UnauthorizedException(
            'No tienes permisos para realizar esta accion'
          )
        )

      // Generate a secret key for the challenge
      const secretKey = generateRandomHash()
      const uuid = generateUUID()
      // New challenge
      let newChallenge = {
        uuid: uuid,
        name: dto.name,
        description: dto.description,
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
        return {
          uuid: uuid,
          secretKey: secretKey,
        }
      }
      return new HttpException('Error al crear el reto', 500)
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException(
        'No se pudo enviar la peticion al servidor'
      )
    }
  }

  async getChallenge(): Promise<any> {
    let data = await this.challengeRepository.findAll(
      // select all but secretKey
      {
        select: [
          'id',
          'name',
          'description',
          'url',
          'probability',
          'weight',
          'required',
          'active',
          'triggers',
          'params',
          'steps',
          'tournaments',
          'addedBy',
          'type',
        ],
      }
    )
    return data
  }

  async updateChallengeWeight(userChallenge: any): Promise<any> {
    // Define el factor de decremento e incremento
    const decrementFactor = 0.1
    const incrementFactor = 0.05

    // Obtiene todos los retos
    const challenges = await this.challengeRepository.findAll()

    // Actualiza los pesos de los retos
    await this.challengeRepository.transaction(
      async (transactionalEntityManager) => {
        for (const challenge of challenges) {
          if (challenge.uuid === userChallenge.uuid) {
            // Decrementa el peso del reto asignado
            challenge.weight = Math.max(
              challenge.weight * decrementFactor,
              0.01
            )
          } else {
            // Incrementa el peso de los demás retos
            challenge.weight = Math.min(challenge.weight + incrementFactor, 1)
          }

          // Guarda los cambios en la base de datos
          await transactionalEntityManager.save(challenge)
        }
      }
    )

    console.log('Peso actualizado')
  }

  async selectChallengeByWeight(
    trigger: string,
    userId: number
  ): Promise<ChallengeEntity | null> {
    let challenges = await this.challengeRepository.findAll({
      where: {
        triggers: Like(`%${trigger}%`),
        active: true,
      },
      order: {
        weight: 'DESC',
        probability: 'DESC',
      },
    })

    // Calcula la suma total de los pesos de los retos
    const totalWeight = challenges.reduce(
      (sum, challenge) => sum + challenge.weight,
      0
    )

    const random = Math.random()

    // Calcula la probabilidad acumulada de cada reto
    let cumulativeProbability = 0
    const challengesWithCumulativeProbability = challenges.map((challenge) => {
      const randomProbability = challenge.weight / totalWeight
      return { ...challenge, randomProbability }
    })

    // Encuentra un reto aleatorio basado en la probabilidad acumulada
    let selectedChallenge = null
    for (const challenge of challengesWithCumulativeProbability) {
      cumulativeProbability += challenge.randomProbability
      if (cumulativeProbability >= random) {
        selectedChallenge = challenge
        break
      }
    }

    // Devuelve el reto asignado al usuario
    return selectedChallenge
  }

  /**
   * this function assigns a random challenge to a user based on certain triggers, while ensuring that the user does not already have a challenge assigned.
   * @param event
   * @returns
   */
  async listenerEvent(event: ChallengeSarEventDto): Promise<any> {
    try {
      const user500h = await this.quinientasHApiService.getUserRole(
        event.userId
      )

      // generate a random number between 1 and 10 to determine if the user will receive a challenge
      const random = Math.floor(Math.random() * 10) + 1
      // if the random number is greater than the probability of the challenge, we return false
      if (random > 6) {
        return false
      }

      if (!user500h) {
        throw new RpcException(
          new BadRequestException('Usuario no existe en 500 Historias')
        )
      }

      // Seleccionar un reto basado en el peso
      const challenge = await this.selectChallengeByWeight(
        event.trigger,
        event.userId
      )

      if (!challenge) return false

      const userChallenge = await this.assignChallenge(event, challenge)

      if (userChallenge) {
        const sendNotification =
          await this.quinientasHApiService.sendNewChallengeNotification(
            event,
            challenge
          )
        await this.updateChallengeWeight(userChallenge)

        return true
      }

      return false
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException(
        'No se pudo enviar la peticion al servidor'
      )
    }
  }

  async assignChallenge(
    event: ChallengeSarEventDto,
    challenge: ChallengeEntity
  ) {
    console.log('assignChallenge', challenge.id)
    let dataSaved = await this.assignedChallengesRepository.upsert({
      userId: event.userId,
      challengeId: challenge.id,
      uuid: challenge.uuid,
      storyId: event.storyId,
      active: true,
      createdAt: new Date(),
    })
    return dataSaved
  }

  async getAssignedChallenges(reto): Promise<any> {
    if (reto.query.all) {
      let data = await this.assignedChallengesRepository.findAll({
        where: { userId: reto.req.id },
        order: { createdAt: 'DESC' },
      })
      return data
    }
    let data = await this.assignedChallengesRepository.findAll({
      where: { userId: reto.req.id, active: reto.query.active ? true : false },
      relations: {
        challenge: true,
      },
    })
    return data
  }

  async addStep(
    dto: AddStepDto,
    secretKey: string,
    testMode: string
  ): Promise<boolean> {
    try {
      // If the challenge is in testMode, we do not verify the secret key, and we return a mock object
      if (testMode === 'true') {
        // We also wait 2 seconds to simulate the time it takes to complete the request
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return {
          id: 1,
          storyId: 1,
          userId: dto.userId,
          points: dto.success ? 15 : 0,
          challengeId: 1,
          uuid: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
          currentStep: 1,
          active: true,
          createdAt: new Date(),
          challenge: {
            id: 1,
            name: 'Reto de prueba',
            description: 'Reto de prueba',
            url: 'https://www.google.com',
            uuid: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
            type: 'minigame',
          } as any,
        } as any
      }

      // we verify the secret key
      if (!(await this.verifySecretKey(dto.uuid, secretKey))) {
        throw new RpcException(new UnauthorizedException('token incorrecto'))
      }
      if (!dto.userId)
        throw new RpcException(new UnauthorizedException('token incorrecto'))
      let assignedChallengeData =
        await this.assignedChallengesRepository.findByCondition({
          where: {
            userId: dto.userId,
            uuid: dto.uuid,
            active: true,
          },
          relations: {
            challenge: true,
          },
        })
      if (!assignedChallengeData)
        throw new RpcException(
          new BadRequestException('El usuario no tiene un reto asignado')
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
          userId: dto.userId.toString(),
          points: {
            base: assignedChallengeData.points,
            bonus: 0,
          },
          challengeId: assignedChallengeData.challengeId,
          storyId: null, // TODO: Agregar storyId
          teamId: user500h.teamId?.toString(),
          tournamentId: user500h.team.tournamentId?.toString(),
        })
      }
      await this.assignedChallengesRepository.save(assignedChallengeData)
      return true
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException(
        'No se pudo enviar la peticion al servidor'
      )
    }
  }

  async endChallenge(
    dto: EndChallengeDto,
    secretKey: string,
    testMode: string
  ): Promise<AssignedChallengesEntity> {
    try {
      // If the challenge is in testMode, we do not verify the secret key, and we return a mock object
      if (testMode === 'true') {
        // We also wait 2 seconds to simulate the time it takes to complete the request
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return {
          id: 1,
          storyId: 1,
          userId: dto.userId,
          points: dto.success ? 15 : 0,
          challengeId: 1,
          uuid: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
          currentStep: 1,
          active: true,
          createdAt: new Date(),
          challenge: {
            id: 1,
            name: 'Reto de prueba',
            description: 'Reto de prueba',
            url: 'https://www.google.com',
            uuid: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
            type: 'minigame',
          } as any,
        } as any
      }

      // we verify the secret key
      if (!(await this.verifySecretKey(dto.uuid, secretKey))) {
        throw new RpcException(new UnauthorizedException('token incorrecto'))
      }
      if (!dto.userId)
        throw new RpcException(new UnauthorizedException('user requerido'))
      let dataChallenge =
        await this.assignedChallengesRepository.findByCondition({
          where: {
            userId: dto.userId,
            uuid: dto.uuid,
            active: true,
          },
          relations: {
            challenge: true,
          },
        })
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
          userId: dataChallenge?.userId?.toString(),
          points: {
            base: dataChallenge.points,
            bonus: 0,
          },
          challengeId: dataChallenge?.id,
          storyId: null, // TODO: Agregar storyId
          teamId: datosUsuario500h?.teamId?.toString(),
          tournamentId: datosUsuario500h?.team?.tournamentId?.toString(),
        })
      }

      dataChallenge.active = false
      this.assignedChallengesRepository.save(dataChallenge)

      return dataChallenge
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException(
        'No se pudo enviar la peticion al servidor'
      )
    }
  }

  async verifySecretKey(uuid: string, key: string) {
    try {
      const data = await this.challengeRepository.findByCondition({
        where: { uuid: uuid },
      })
      if (!data)
        throw new RpcException(new BadRequestException('Reto no existe'))

      return verifyHashArgonData(data.secretKey, key)
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException(
        'No se pudo enviar la peticion al servidor'
      )
    }
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

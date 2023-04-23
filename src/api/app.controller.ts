import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { AuthGuard, UserInterceptor, UserRequest } from 'src/shared'
import {
  NewChallengeDto,
  PayloadNewChallengeDto,
} from 'src/challenges/dto/new-reto.dto'
import { catchError, throwError } from 'rxjs'
import { ChallengeSarEventDto as ChallengeSarEventDto } from '../shared/dto/challenge-sar-event.dto'
import { FinishChallengeResponseDto } from '../challenges/dto/finish-challenge-response.dto'
import { SecretKeyProtected } from '../shared/decorators/roles.decorators'

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('RETOS_SERVICE') private readonly challengeService: ClientProxy
  ) {}
  //----------------------RETOS----------------------//
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get('get-retos')
  async getRetos() {
    return this.challengeService.send({ cmd: 'get-retos' }, {})
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('v1/challenge')
  async newChallenge(@Body() dto: NewChallengeDto, @Req() req: any) {
    return this.challengeService
      .send({ cmd: 'newChallenge' }, { dto: dto, user: req.user })
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response))
        )
      )
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('v1/event')
  @HttpCode(200)
  async listenerEvent(@Body() body: ChallengeSarEventDto) {
    return this.challengeService
      .send({ cmd: 'listener-event' }, body)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response))
        )
      )
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get('get-asignados-retos')
  async asignadosGetRetos(@Query() query, @Req() req: any) {
    return this.challengeService
      .send({ cmd: 'get-asignados-retos' }, { query: query, req: req.user })
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response))
        )
      )
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @SecretKeyProtected()
  @Post('v1/endChallenge')
  async endChallenge(@Body() dto: FinishChallengeResponseDto, @Req() req: any) {
    return this.challengeService
      .send(
        { cmd: 'endChallenge' },
        { dto: dto, user: req.user, secretKey: req.secretKey }
      )
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response))
        )
      )
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('addStep')
  async addStep(@Body() body: any, @Req() req: any) {
    return this.challengeService
      .send(
        { cmd: 'addStep' },
        { body: body, req: req.user, secretKey: req.secretKey }
      )
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response))
        )
      )
  }

  //----------------------AUTH----------------------//
  @Get('users')
  async getUsers() {
    return this.authService.send({ cmd: 'get-users' }, {})
  }

  /*   @UseGuards(AuthGuard)
  @Get('presence')
  async getPresence() {
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  } */

  @Post('auth/register')
  async register(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
    @Body('password') password: string
  ) {
    return this.authService.send(
      {
        cmd: 'register',
      },
      {
        firstName,
        lastName,
        email,
        password,
      }
    )
  }

  @Post('auth/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string
  ) {
    return this.authService.send(
      {
        cmd: 'login',
      },
      {
        email,
        password,
      }
    )
  }
}

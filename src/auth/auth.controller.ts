import { Controller, UseGuards, Inject } from '@nestjs/common'
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices'

import { SharedService } from 'src/shared'

import { AuthService } from './auth.service'
import { NewUserDto } from './dto/new-user.dto'
import { ExistingUserDto } from './dto/existing-user.dto'
import { JwtGuard } from './jwt.guard'

@Controller()
export class AuthController {
  constructor(
    @Inject('AuthServiceInterface')
    private readonly authService: AuthService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService
  ) {}

  //------------------------------ Usado en el microservicio de Retos --------------------------------------------
  @MessagePattern({ cmd: 'sign-token' })
  async signToken(@Ctx() context: RmqContext, @Payload() payload: any) {
    this.sharedService.acknowledgeMessage(context)

    return this.authService.createJwt(payload)
  }
  //----------------------------------------- to be cleaned ---------------------------------------------------------------------
  @MessagePattern({ cmd: 'get-users' })
  async getUsers(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context)

    return this.authService.getUsers()
  }

  @MessagePattern({ cmd: 'register' })
  async register(@Ctx() context: RmqContext, @Payload() newUser: NewUserDto) {
    this.sharedService.acknowledgeMessage(context)

    return this.authService.register(newUser)
  }

  @MessagePattern({ cmd: 'login' })
  async login(
    @Ctx() context: RmqContext,
    @Payload() existingUser: ExistingUserDto
  ) {
    this.sharedService.acknowledgeMessage(context)

    return this.authService.login(existingUser)
  }

  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtGuard)
  async verifyJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string }
  ) {
    this.sharedService.acknowledgeMessage(context)

    return this.authService.verifyJwt(payload.jwt)
  }

  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string }
  ) {
    this.sharedService.acknowledgeMessage(context)

    return this.authService.getUserFromHeader(payload.jwt)
  }

  @MessagePattern({ cmd: 'add-friend' })
  async addFriend(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: number; friendId: number }
  ) {
    this.sharedService.acknowledgeMessage(context)

    return this.authService.addFriend(payload.userId, payload.friendId)
  }

  @MessagePattern({ cmd: 'get-friends' })
  async getFriends(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: number }
  ) {
    this.sharedService.acknowledgeMessage(context)

    return this.authService.getFriends(payload.userId)
  }
}

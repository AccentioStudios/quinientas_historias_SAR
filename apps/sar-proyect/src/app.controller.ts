import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ClientProxy, RpcException } from '@nestjs/microservices'
import { AuthGuard, UserInterceptor, UserRequest } from '@app/shared'
import { newRetoDTO } from './dto/new-reto.dto'
import { dataRetoNew } from 'apps/retos/src/dto/new-reto.dto'
import { catchError, throwError } from 'rxjs'

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('RETOS_SERVICE') private readonly retosService: ClientProxy // @Inject('PRESENCE_SERVICE') private readonly presenceService: ClientProxy,
  ) {}

  @Get('get-retos')
  async getRetos() {
    return this.retosService.send({ cmd: 'get-retos' },{})
  }
  
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('add-retos')
  async addRetos(@Body() body: dataRetoNew,@Req() req:any) {
    console.log("aaaaa req beta:",req.user)
    return this.retosService.send({ cmd: 'add-retos' }, {body:body,req:req.user})
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('asignar-retos')
  async asignarRetos(@Body() body: dataRetoNew,@Req() req:any) {
    console.log("aaaaa req beta:",req.user)
    return this.retosService.send({ cmd: 'asignar-retos' }, {body:body,req:req.user})
          .pipe(catchError(error => throwError(() => new RpcException(error.response))))

  }
  @Get('users')
  async getUsers() {
    return this.authService.send({ cmd: 'get-users' }, {})
  }

  // Note: This would be done already from the main Facebook App thus simple end point provided to simplify this process.
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('add-friend/:friendId')
  async addFriend(
    @Req() req: UserRequest,
    @Param('friendId') friendId: number
  ) {
    console.log(req.user)
    if (!req?.user) {
      throw new BadRequestException()
    }

    return this.authService.send(
      {
        cmd: 'add-friend',
      },
      {
        userId: req.user.id,
        friendId,
      }
    )
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get('get-friends')
  async getFriends(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new BadRequestException()
    }

    return this.authService.send(
      {
        cmd: 'get-friends',
      },
      {
        userId: req.user.id,
      }
    )
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

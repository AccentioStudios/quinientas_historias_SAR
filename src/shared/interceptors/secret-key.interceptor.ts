import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { ClientProxy } from '@nestjs/microservices'

import { Observable, switchMap, catchError } from 'rxjs'

@Injectable()
export class SecretKeyInterceptor implements NestInterceptor {
  constructor() {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    if (ctx.getType() !== 'http') return next.handle()

    const request = ctx.switchToHttp().getRequest()
    const secretKeyHeader = request.headers['secret_key']

    if (!secretKeyHeader) return next.handle()

    try {
      request.secretKey = secretKeyHeader as string
      return next.handle()
    } catch (error) {
      console.error(error)
      throw new BadRequestException()
    }
  }
}

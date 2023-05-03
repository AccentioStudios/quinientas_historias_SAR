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
    const secretKeyHeader = request.headers['sar-secret-key']
    const challengeUUIDHeader = request.headers['sar-challenge-uuid']
    const testModeHeader = request.headers['sar-test-mode']

    if (!secretKeyHeader) return next.handle()

    try {
      request.secretKey = secretKeyHeader as string
      if (challengeUUIDHeader)
        request.challengeUUID = challengeUUIDHeader as string
      if (testModeHeader) request.testMode = testModeHeader as string
      return next.handle()
    } catch (error) {
      console.error(error)
      throw new BadRequestException()
    }
  }
}

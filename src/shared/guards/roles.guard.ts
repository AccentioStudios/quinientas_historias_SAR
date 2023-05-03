import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const secretKeyProtected = this.reflector.get<string[]>(
      'secretKeyProtected',
      context.getHandler()
    )
    // Verify if the route is guarded by Secret
    if (secretKeyProtected) {
      // verify header if has key 'sar-secret-key'
      const key = context.switchToHttp().getRequest().headers['sar-secret-key']
      if (key) {
        // continue to the route
        return true
      }
      throw new UnauthorizedException('Route is protected by Secret Key')
    }
    return true
  }
}

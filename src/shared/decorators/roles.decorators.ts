import { SetMetadata } from '@nestjs/common'

export const SecretKeyProtected = (...secretKeyProtected: string[]) =>
  SetMetadata('secretKeyProtected', secretKeyProtected)

import { BaseInterfaceRepository } from 'src/shared'

import { UserEntity } from '../entities/user.entity'

export interface UserRepositoryInterface
  extends BaseInterfaceRepository<UserEntity> {}

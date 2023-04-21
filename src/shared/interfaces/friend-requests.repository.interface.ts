import { BaseInterfaceRepository } from 'src/shared'

import { FriendRequestEntity } from '../entities/friend-request.entity'

export interface FriendRequestsRepositoryInterface
  extends BaseInterfaceRepository<FriendRequestEntity> {}

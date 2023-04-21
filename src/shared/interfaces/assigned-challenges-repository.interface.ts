import { BaseInterfaceRepository } from 'src/shared'
import { AssignedChallengesEntity } from '../entities/assigned-challenges.entity'
import { ChallengeEntity } from '../entities/challenge.entity'

export interface AssignedChallengesRepositoryInterface
  extends BaseInterfaceRepository<AssignedChallengesEntity> {}

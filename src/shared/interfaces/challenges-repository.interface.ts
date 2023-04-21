import { BaseInterfaceRepository } from 'src/shared'
import { ChallengeEntity } from '../entities/challenge.entity'

export interface ChallengesRepositoryInterface
  extends BaseInterfaceRepository<ChallengeEntity> {}

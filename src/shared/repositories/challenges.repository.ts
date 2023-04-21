import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseAbstractRepository } from './base/base.abstract.repository'
import { ChallengesRepositoryInterface } from '../interfaces/challenges-repository.interface'
import { ChallengeEntity } from '../entities/challenge.entity'

@Injectable()
export class ChallengesRepository
  extends BaseAbstractRepository<ChallengeEntity>
  implements ChallengesRepositoryInterface
{
  constructor(
    @InjectRepository(ChallengeEntity)
    private readonly UserRepository: Repository<ChallengeEntity>
  ) {
    super(UserRepository)
  }
}

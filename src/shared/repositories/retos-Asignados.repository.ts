import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseAbstractRepository } from './base/base.abstract.repository'
import { AssignedChallengesEntity } from '../entities/assigned-challenges.entity'
import { AssignedChallengesRepositoryInterface } from '../interfaces/assigned-challenges-repository.interface'

@Injectable()
export class AssignedChallengesRepository
  extends BaseAbstractRepository<AssignedChallengesEntity>
  implements AssignedChallengesRepositoryInterface
{
  constructor(
    @InjectRepository(AssignedChallengesEntity)
    private readonly RetosAsignadosRepository: Repository<AssignedChallengesEntity>
  ) {
    super(RetosAsignadosRepository)
  }
}

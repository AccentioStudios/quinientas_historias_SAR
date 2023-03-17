import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { RetosRepositoryInterface } from '../interfaces/retos.repository.interface';
import { RetosEntity } from '../entities/retos.entity';

@Injectable()
export class RetosRepository
  extends BaseAbstractRepository<RetosEntity>
  implements RetosRepositoryInterface
{
  constructor(
    @InjectRepository(RetosEntity)
    private readonly UserRepository: Repository<RetosEntity>,
  ) {
    super(UserRepository);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { Retos_AsignadosEntity } from '../entities/retos-Asignados.entity';
import { RetosAsingadosInterface } from '../interfaces/retos-Asignados.repository.interface';

@Injectable()
export class RetosAsingadosRepository
  extends BaseAbstractRepository<Retos_AsignadosEntity>
  implements RetosAsingadosInterface
{
  constructor(
    @InjectRepository(Retos_AsignadosEntity)
    private readonly RetosAsignadosRepository: Repository<Retos_AsignadosEntity>,
  ) {
    super(RetosAsignadosRepository);
  }
}

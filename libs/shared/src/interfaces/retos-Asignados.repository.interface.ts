import { BaseInterfaceRepository } from '@app/shared';
import { Retos_AsignadosEntity } from '../entities/retos-Asignados.entity';
import { RetosEntity } from '../entities/retos.entity';


export interface RetosAsingadosInterface
  extends BaseInterfaceRepository<Retos_AsignadosEntity> {}

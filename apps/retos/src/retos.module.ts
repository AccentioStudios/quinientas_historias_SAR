import { MysqlDBModule, SharedModule, SharedService } from '@app/shared';
import { Retos_AsignadosEntity } from '@app/shared/entities/retos-Asignados.entity';
import { RetosEntity } from '@app/shared/entities/retos.entity';
import { RetosAsingadosRepository } from '@app/shared/repositories/retos-Asignados.repository';
import { RetosRepository } from '@app/shared/repositories/retos.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetosController } from './retos.controller';
import { RetosService } from './retos.service';

@Module({
  imports: [
    SharedModule,
    MysqlDBModule,
    TypeOrmModule.forFeature([RetosEntity,Retos_AsignadosEntity]),
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),

  ],
  controllers: [RetosController],
  providers: [RetosService,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'RetosServiceInterface',
      useClass: RetosService,
    },
    {
      provide: 'RetoRepositoryInterface',
      useClass: RetosRepository,
    },
  {
    provide:'RetoAsingadosInterface',
    useClass:RetosAsingadosRepository
  },
],
})
export class RetosModule {}

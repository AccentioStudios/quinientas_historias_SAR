import { MysqlDBModule, SharedModule, SharedService } from '@app/shared';
import { RetosEntity } from '@app/shared/entities/retos.entity';
import { RetosRepository } from '@app/shared/repositories/retos.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetosController } from './retos.controller';
import { RetosService } from './retos.service';

@Module({
  imports: [
    SharedModule,
    MysqlDBModule,
    TypeOrmModule.forFeature([RetosEntity]),
  ],
  controllers: [RetosController],
  providers: [RetosService,
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'RetoRepositoryInterface',
      useClass: RetosRepository,
    },],
})
export class RetosModule {}

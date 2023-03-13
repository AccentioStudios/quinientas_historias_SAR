import { SharedModule } from '@app/shared';
import { Module } from '@nestjs/common';
import { RetosController } from './retos.controller';
import { RetosService } from './retos.service';

@Module({
  imports: [SharedModule],
  controllers: [RetosController],
  providers: [RetosService],
})
export class RetosModule {}

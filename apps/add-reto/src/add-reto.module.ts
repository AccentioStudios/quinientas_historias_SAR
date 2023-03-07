import { Module } from '@nestjs/common';
import { AddRetoController } from './add-reto.controller';
import { AddRetoService } from './add-reto.service';

@Module({
  imports: [],
  controllers: [AddRetoController],
  providers: [AddRetoService],
})
export class AddRetoModule {}

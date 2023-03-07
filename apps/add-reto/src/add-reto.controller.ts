import { Controller, Get } from '@nestjs/common';
import { AddRetoService } from './add-reto.service';

@Controller()
export class AddRetoController {
  constructor(private readonly addRetoService: AddRetoService) {}

  @Get()
  getHello(): string {
    return this.addRetoService.getHello();
  }
}

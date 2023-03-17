import { CacheInterceptor, Controller, UseInterceptors } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';

import { SharedService } from '@app/shared';
import { RetosService } from './retos.service';

@Controller()
export class RetosController {
  constructor(
    private readonly retosService: RetosService,
    private readonly sharedService: SharedService,
    ) {}



    @MessagePattern({ cmd: 'add-retos' })
    async getUsers(@Ctx() context: RmqContext) {
      this.sharedService.acknowledgeMessage(context);
      return this.retosService.addReto();
    }
}

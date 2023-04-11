import { CacheInterceptor, Controller, Inject, UseInterceptors } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

import { SharedService } from '@app/shared';
import { RetosService } from './retos.service';
import { dataRetoNew, newRetoDTO } from './dto/new-reto.dto';

@Controller()
export class RetosController {
  constructor(
    @Inject('RetosServiceInterface')
    private readonly retosService: RetosService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService,
    ) {}



    @MessagePattern({ cmd: 'get-retos' })
    async getRetos(@Ctx() context: RmqContext) {
      this.sharedService.acknowledgeMessage(context);
      return this.retosService.getReto();
    }

    @MessagePattern({ cmd: 'get-asignados-retos' })
    async asignadosGetRetos(@Ctx() context: RmqContext, @Payload() reto: any) {
      this.sharedService.acknowledgeMessage(context);
      return this.retosService.asignadosGetRetos(reto);
    }

    @MessagePattern({ cmd: 'add-retos' })
    async addRetos(@Ctx() context: RmqContext, @Payload() newUser: any) {
      this.sharedService.acknowledgeMessage(context);
      return this.retosService.addReto(newUser);
    }

    @MessagePattern({ cmd: 'asignar-retos' })
    async asignarRetos(@Ctx() context: RmqContext, @Payload() reto: any) {
      this.sharedService.acknowledgeMessage(context);
      return this.retosService.asignarReto(reto);
    }
    @MessagePattern({ cmd: 'finish-retos' })
    async finishRetos(@Ctx() context: RmqContext, @Payload() reto: any) {
      this.sharedService.acknowledgeMessage(context);
      return this.retosService.finishRetos(reto);
    }
    @MessagePattern({ cmd: 'add-paso' })
    async addStep(@Ctx() context: RmqContext, @Payload() reto: any) {
      this.sharedService.acknowledgeMessage(context);
      return this.retosService.addstep(reto);
    }


}

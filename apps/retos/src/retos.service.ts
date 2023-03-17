import { RetosRepositoryInterface } from '@app/shared/interfaces/retos.repository.interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RetosService {
  constructor(
    @Inject('RetoRepositoryInterface')
    private readonly retosRepository: RetosRepositoryInterface,
  ){}
  async addReto(): Promise<any> {
    console.log(await this.retosRepository.findAll());
    return {data:'furula el hfe!'};
  }
}

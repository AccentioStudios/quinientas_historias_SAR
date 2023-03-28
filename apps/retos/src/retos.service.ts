import { RetosRepositoryInterface } from '@app/shared/interfaces/retos.repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { dataRetoNew, newRetoDTO } from './dto/new-reto.dto';

@Injectable()
export class RetosService {
  constructor(
    @Inject('RetoRepositoryInterface')
    private readonly retosRepository: RetosRepositoryInterface,
  ){}
  async addReto(newReto:dataRetoNew): Promise<any> {
    const {name,url,probability,required,active } = newReto.body,
    tournaments = newReto.body.tournaments.toString(),
    params = newReto.body.params.toString(),
    triggers = newReto.body.triggers.toString();

  let responsedb = await this.retosRepository.save({
    name,
    url,
    probability,
    required,
    active, 
    tournaments,
    params,
    triggers,
    added_by:newReto.req.id
  })
    console.log(responsedb);
    return responsedb;
  }

  async getReto(): Promise<any> {
    let data = await this.retosRepository.findAll();
    return data;
  }
}

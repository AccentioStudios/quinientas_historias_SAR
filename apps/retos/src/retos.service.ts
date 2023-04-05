import { RetosAsingadosInterface } from '@app/shared/interfaces/retos-Asignados.repository.interface';
import { RetosRepositoryInterface } from '@app/shared/interfaces/retos.repository.interface';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { dataRetoNew, newRetoDTO } from './dto/new-reto.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RetosService {
  constructor(
    @Inject('RetoRepositoryInterface')
    private readonly retosRepository: RetosRepositoryInterface,
    @Inject('RetoAsingadosInterface')
    private readonly retosAsingadosRepository: RetosAsingadosInterface,
  ){}
  async addReto(newReto:dataRetoNew): Promise<any> {
    let probabilidades = [];
    const {name,url,probability,required,active,puntos_asignados,steps,steps_total } = newReto.body,
    tournaments = newReto.body.tournaments.toString(),
    params = newReto.body.params.toString(),
    triggers = newReto.body.triggers.toString();
    let dataRetos = await this.retosRepository.findAll({
      order: { probability: 'ASC' },
    }) as any;
    dataRetos.push({
      name,
      url,
      probability,
      required,
      active,
      tournaments,
      params,
      triggers,
      puntos_asignados,
      steps,
      steps_total,
      added_by: newReto.req.id,
    });
    dataRetos.map((e) => {
      probabilidades.push(e.probability);
    });
    let ratio = Math.max.apply(Math, probabilidades) / 100;
    dataRetos.map((item) => {

      item.weight = (item.probability/ratio);
    });

    this.retosRepository.upsert(dataRetos as any);
    return dataRetos
  }

  async getReto(): Promise<any> {
    let data = await this.retosRepository.findAll();
    return data;
  }

  async  asignarReto(asignarReto:dataRetoNew): Promise<any>{
    let data = await  this.retosAsingadosRepository.findByCondition({
      where: { id_user:asignarReto.req.id,
              active:true },

    });
    if(data){
      throw new RpcException (new BadRequestException('Ya tienes un reto asignado'));
    }
    let randomArray = [];
    let dataRetos = await this.retosRepository.findAll({
      order: { probability: 'ASC' },
    });
    dataRetos.map((e,i) => {
      let clone = Array(e.weight[i]).fill(e);
      randomArray.push(...clone);
   
    });

    const result = randomArray[~~(Math.random() * randomArray.length)]
    await this.retosAsingadosRepository.save({
      id_user:asignarReto.req.id,
      id_reto:result.id,
      url:result.url,
      puntos_asignados:result.puntos_asignados,
      trigger:result.triggers, 
      challenge_type:result.challenge_type,
      steps:result.steps,
      steps_total:result.steps_total,
      active:true,
      creation_date:new Date()
    });
    return result
  }
}


import { RetosAsingadosInterface } from '@app/shared/interfaces/retos-Asignados.repository.interface';
import { RetosRepositoryInterface } from '@app/shared/interfaces/retos.repository.interface';
import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { dataRetoNew, newRetoDTO } from './dto/new-reto.dto';
import { RpcException } from '@nestjs/microservices';
import {Like} from "typeorm";
import { RetosServiceInterface } from './interfaces/retos.service.interface';


@Injectable()
export class RetosService implements RetosServiceInterface {
  constructor(
    @Inject('RetoRepositoryInterface')
    private readonly retosRepository: RetosRepositoryInterface,
    @Inject('RetoAsingadosInterface')
    private readonly retosAsingadosRepository: RetosAsingadosInterface,
  ){}
  async addReto(newReto:dataRetoNew): Promise<any> {
    if(newReto.req.role !== 'admin')throw new RpcException (new UnauthorizedException('No tienes permisos para realizar esta accion'));
    let probabilidades = [];
    const {name,url,probability,required,puntos_asignados,steps,steps_total } = newReto.body,

    tournaments = newReto.body.tournaments.toString(),
    params = newReto.body.params.toString(),
    triggers = newReto.body.triggers.toString();
    let dataRetos = await this.retosRepository.findAll({
      order: { probability: 'ASC' },
      where: { active: true },
    }) as any;
    dataRetos.push({
      name,
      url,
      probability,
      required,
      active:true,
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

/**
 * this function assigns a random challenge to a user based on certain triggers, while ensuring that the user does not already have a challenge assigned.
 * @param asignarReto 
 * @returns 
 */
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
      where: { active: true, triggers: Like(`%${asignarReto.body.triggers}%`) },
    });
    if(dataRetos.length === 0)throw new RpcException (new BadRequestException('trigger invalido o no hay retos disponibles'));
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
      trigger:`${asignarReto.body.triggers}`, 
      challenge_type:result.challenge_type,
      steps:result.steps,
      steps_total:result.steps_total,
      active:true,
      creation_date:new Date()
    });
    return result
  }
  async asignadosGetRetos(reto):Promise<any> {
    if(reto.query.all){
      let data = await  this.retosAsingadosRepository.findAll({
        where: { id_user:reto.req.id},
        order: { creation_date: 'DESC' },
      });
      return data
    }
    let data = await  this.retosAsingadosRepository.findAll({
      where: { id_user:reto.req.id,
              active:reto.query.active? true:false }});
    console.log(reto);
  return data
  }
}




import { RetosAsingadosInterface } from '@app/shared/interfaces/retos-Asignados.repository.interface';
import { RetosRepositoryInterface } from '@app/shared/interfaces/retos.repository.interface';
import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { dataRetoNew, newRetoDTO } from './dto/new-reto.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {Like} from "typeorm";
import { RetosServiceInterface } from './interfaces/retos.service.interface';
import { AuthService } from 'apps/auth/src/auth.service';
import { AsignarRetoDTO } from 'apps/sar-proyect/src/dto/asignar-reto.dto';
import { firstValueFrom, lastValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { NewNotificationDTO } from './dto/send.notification.dto';
import { AddsetpResponseDTO, finishRetosResponseDTO } from './dto/finish.retos.response.dto';


@Injectable()
export class RetosService implements RetosServiceInterface {
  constructor(
    private readonly httpService: HttpService,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
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
async  asignarReto(asignarReto:AsignarRetoDTO): Promise<any>{
  //let sendNotification = new NewNotificationDTO()
  console.log("saaaaaaaw",asignarReto)
    
    let data = await  this.retosAsingadosRepository.findByCondition({
      where: { id_user:asignarReto.id_user,
        active:true },
        
      });
      if(data){
        throw new RpcException (new BadRequestException('Ya tienes un reto asignado'));
      }
      let randomArray = [];
      let dataRetos = await this.retosRepository.findAll({
        order: { probability: 'ASC' },
        where: { active: true, triggers: Like(`%${asignarReto.triggers}%`) },
      });
      if(dataRetos.length === 0)throw new RpcException (new BadRequestException('trigger invalido o no hay retos disponibles'));
      dataRetos.map((e,i) => {
        let clone = Array(e.weight[i]).fill(e);
        randomArray.push(...clone);
        
      });
      
      const result = randomArray[~~(Math.random() * randomArray.length)];

      let tokenSession = await this.getObservable('sign-token',{
        role:'sar',
        id_user: asignarReto.id_user,
        storyId: asignarReto.storyId,
        trigger: asignarReto.triggers,
        ...result
      })

    let dataSaved = await this.retosAsingadosRepository.save({
      id_user:asignarReto.id_user,
      id_reto:result.id,
      url:result.url,
      puntos_asignados:result.puntos_asignados,
      trigger:`${asignarReto.triggers}`, 
      challenge_type:result.challenge_type,
      steps:result.steps,
      steps_total:result.steps_total,
      token:tokenSession.token,
      storyId:asignarReto.storyId,
      active:true,
      creation_date:new Date()
    });
    const sendNotification:NewNotificationDTO ={
      title:'Has desbloqueado un nuevo reto',
      body:'Click aqui para saber más',
      data:{
        args:{
          id:asignarReto.id_user,
          url:'https://game.accentio.app/',
          description:'una descripcion chimba',
          name:result.name,
          type:'minigame',
          required:result.required,
          tournament:result.tournaments.split(',').map(Number),
          sessionToken:tokenSession.token
        },
        route:'/challenges'
    }
    }
    const notification = await this.axiosGetObservable(`${process.env.APIURL}/v2/user/send-notification/1`,sendNotification)



    return sendNotification;
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
  return data
  }

  async addstep(reto):Promise<AddsetpResponseDTO> {
    if(!reto.req.user)throw new RpcException (new UnauthorizedException('token incorrecto'));
    let data = await  this.retosAsingadosRepository.findByCondition({
      where: { id_user:reto.req.user.id_user,
        active:true },
    });
    if(!data)throw new RpcException (new BadRequestException('No tienes un reto asignado'));
    if(data.steps_total===0)throw new RpcException (new BadRequestException('Este reto no tiene pasos'));
    data.steps++;
    if(data.steps_total===data.steps) data.active=false;
      await this.retosAsingadosRepository.save(data);
      
      let response:AddsetpResponseDTO = {
        id:data.id,
        description:'Reto terminado',
        puntos_asignados:data.puntos_asignados,
        challenge_type:data.challenge_type,
        status:'finished',
        steps:data.steps,
        steps_total:data.steps_total
      }
      return response
  
  }
  async finishRetos(reto):Promise<finishRetosResponseDTO> {
    if(!reto.req.user)throw new RpcException (new UnauthorizedException('token incorrecto'));
    let data = await  this.retosAsingadosRepository.findByCondition({
      where: { id_user:reto.req.user.id_user,
              active:true },
    });
    if(!data)throw new RpcException (new BadRequestException('No tienes un reto asignado'));
    if(data.steps_total!=0)throw new RpcException (new BadRequestException('Este reto tiene pasos'));
      data.active=false;
    await this.retosAsingadosRepository.save(data);
    let response:finishRetosResponseDTO = {
      id:data.id,
      description:'Reto terminado',
      puntos_asignados:data.puntos_asignados,
      challenge_type:data.challenge_type,
      status:'finished'
    }
    return response
  }

  async getObservable(ruta:string,datos:object): Promise<any> {
   return await firstValueFrom( this.authService.send({ cmd: ruta }, datos)).catch((err) => console.error(err));
  }

  async axiosGetObservable(ruta:string,datos:NewNotificationDTO): Promise<any> {
    return await firstValueFrom(
      this.httpService.request({
        method:'POST',
        url:ruta,
        data:datos,
        headers:{
          'Content-Type':'application/json',
          'Authorization':`Bearer ${datos.data.args.sessionToken}`,
          'sar_access_token':process.env.SAR_ACCESS_TOKEN

        }
      })
      .pipe(map((res) => res.data)),
    )
      .catch((err) => {
        console.error(err)
        throw new RpcException (new InternalServerErrorException('No se pudo enviar la notificacion'));
      });

  }
}





import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RetosEntity } from './retos.entity';

//import { FriendRequestEntity } from './friend-request.entity';

@Entity('retos_asignados')
export class Retos_AsignadosEntity {
  @PrimaryGeneratedColumn()
  id: number;

/*   @Column()
  id_reto: number; */

  @Column({nullable:true})
  storyId: number;

  @Column()
  id_user: number;

  @Column()
  url: string;

  @Column()
  puntos_asignados: number;

  @Column({default:'minigame'})
  challenge_type: string;

  @Column()
  trigger: string;

  @Column({default:0})
  steps: number;

  @Column({default:0})
  steps_total: number;

  @Column()
  active: Boolean;

  @Column()
  creation_date: Date;

  @Column("text")
  token: string;
  
  @ManyToOne(
    () => RetosEntity,
    (retosEntity) => retosEntity.id,
  )
  id_reto: RetosEntity[]; 


/*   @OneToMany(
    () => FriendRequestEntity,
    (friendRequestEntity) => friendRequestEntity.creator,
  )
  friendRequestCreator: FriendRequestEntity[];

  @OneToMany(
    () => FriendRequestEntity,
    (FriendRequestEntity) => FriendRequestEntity.receiver,
  )
  friendRequestReceiver: FriendRequestEntity[]; */
}

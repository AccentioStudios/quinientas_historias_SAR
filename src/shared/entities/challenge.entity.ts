import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AssignedChallengesEntity } from './assigned-challenges.entity'

//import { FriendRequestEntity } from './friend-request.entity';

@Entity('retos')
export class ChallengeEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  url: string

  @Column()
  probability: number

  @Column()
  weight: number

  @Column()
  required: Boolean

  @Column()
  active: Boolean

  @Column()
  triggers: string

  @Column()
  params: string

  @Column()
  puntos_asignados: number

  @Column({ default: 0 })
  steps: number

  @Column({ default: 0 })
  steps_total: number

  @Column()
  tournaments: string

  @Column()
  added_by: Number

  @OneToMany(
    () => AssignedChallengesEntity,
    (retos_AsignadosEntity) => retos_AsignadosEntity.id_reto
  )
  retos_AsignadosCreator: AssignedChallengesEntity[]

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

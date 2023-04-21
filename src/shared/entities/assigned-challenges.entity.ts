import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ChallengeEntity } from './challenge.entity'

//import { FriendRequestEntity } from './friend-request.entity';

@Entity('retos_asignados')
export class AssignedChallengesEntity {
  @PrimaryGeneratedColumn()
  id: number

  /*   @Column()
  id_reto: number; */

  @Column({ nullable: true })
  storyId: number

  @Column()
  id_user: number

  @Column()
  url: string

  @Column()
  puntos_asignados: number

  @Column({ default: 'minigame' })
  challenge_type: string

  @Column()
  trigger: string

  @Column({ default: 0 })
  steps: number

  @Column({ default: 0 })
  steps_total: number

  @Column()
  active: Boolean

  @Column()
  creation_date: Date

  @Column('text')
  token: string

  @ManyToOne(() => ChallengeEntity, (retosEntity) => retosEntity.id)
  id_reto: ChallengeEntity[]

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

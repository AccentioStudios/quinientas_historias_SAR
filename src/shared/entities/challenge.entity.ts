import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { AssignedChallengesEntity } from './assigned-challenges.entity'

//import { FriendRequestEntity } from './friend-request.entity';

@Entity('retos')
export class ChallengeEntity {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  secretKey: string
  @Column()
  name: string
  @Column()
  url: string
  @Column()
  probability: number
  @Column()
  weight: number
  @Column()
  required: boolean
  @Column()
  active: boolean
  @Column()
  triggers: string
  @Column()
  params: string
  @Column({ default: 0 })
  steps: number
  @Column()
  tournaments: string
  @Column()
  addedBy: number
  @Column({ default: 'minigame' })
  type: string
  @OneToMany(
    () => AssignedChallengesEntity,
    (assignedChallenge) => assignedChallenge.challengeId
  )
  assignedChallenges?: AssignedChallengesEntity[]

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

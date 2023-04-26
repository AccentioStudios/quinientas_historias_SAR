import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ChallengeEntity } from './challenge.entity'
@Entity('retos_asignados')
export class AssignedChallengesEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  storyId: number

  @Column()
  userId: number

  @Column({ default: 15 })
  points: number

  @Column()
  challengeId: number

  @Column({ default: 0 })
  currentStep: number

  @Column()
  active: Boolean

  @Column()
  createdAt: Date

  @ManyToOne(() => ChallengeEntity, (challenge) => challenge.id)
  challenge: ChallengeEntity
}

import { ChallengeSarEventDto } from '../../shared/dto/challenge-sar-event.dto'
import { FinishChallengeResponseDto } from '../dto/finish-challenge-response.dto'
import { NewChallengeDto } from '../dto/new-reto.dto'

export interface ChallengesServiceInterface {
  getReto(): Promise<any>
  newChallenge(dto: NewChallengeDto, req: any): Promise<any>
  listenerEvent(event: ChallengeSarEventDto): Promise<any>
  endChallenge(
    dto: FinishChallengeResponseDto,
    user: any,
    secretKey: string
  ): Promise<any>
  addStep(challengeId: number, user: any): Promise<any>
}

import { ChallengeSarEventDto } from '../../shared/dto/challenge-sar-event.dto'
import {
  AddStepDto,
  EndChallengeDto,
} from '../dto/finish-challenge-response.dto'
import { NewChallengeDto } from '../dto/new-reto.dto'

export interface ChallengesServiceInterface {
  getChallenge(): Promise<any>
  newChallenge(dto: NewChallengeDto, req: any): Promise<any>
  listenerEvent(event: ChallengeSarEventDto): Promise<any>
  endChallenge(
    dto: EndChallengeDto,
    user: any,
    secretKey: string,
    testMode: string
  ): Promise<any>
  addStep(
    dto: AddStepDto,
    secretKey: string,
    testMode: string
  ): Promise<boolean>
}

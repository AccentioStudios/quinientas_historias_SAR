import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
} from 'class-validator'

export class EndChallengeDto {
  @IsNumber()
  @IsNotEmpty()
  declare challengeId: number
  @IsNumber()
  @IsNotEmpty()
  declare userId: number
  @IsBoolean()
  @IsNotEmpty()
  declare success: boolean
}

export class AddStepDto {
  @IsNumber()
  @IsNotEmpty()
  declare challengeId: number
  @IsNumber()
  @IsNotEmpty()
  declare userId: number
  @IsBoolean()
  @IsNotEmpty()
  declare success: boolean
}

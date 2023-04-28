import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsUUID,
} from 'class-validator'

export class EndChallengeDto {
  @IsUUID()
  @IsNotEmpty()
  declare uuid: string
  @IsNumber()
  @IsNotEmpty()
  declare userId: number
  @IsBoolean()
  @IsNotEmpty()
  declare success: boolean
}

export class AddStepDto {
  @IsUUID()
  @IsNotEmpty()
  declare uuid: string
  @IsNumber()
  @IsNotEmpty()
  declare userId: number
  @IsBoolean()
  @IsNotEmpty()
  declare success: boolean
}

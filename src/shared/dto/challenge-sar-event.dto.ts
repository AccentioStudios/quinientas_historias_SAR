import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator'

export class ChallengeSarEventDto {
  @IsNumber()
  @IsNotEmpty()
  declare userId: number
  @IsNumber()
  @IsOptional()
  declare storyId: number
  @IsString()
  @IsNotEmpty()
  declare trigger: string
  @IsString()
  declare now: Date
}

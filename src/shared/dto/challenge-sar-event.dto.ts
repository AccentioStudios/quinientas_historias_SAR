import {
  IsDate,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator'

export class ChallengeSarEventDto {
  @IsNumberString()
  @IsNotEmpty()
  declare userId: number
  @IsNumberString()
  @IsOptional()
  declare storyId: number
  @IsString()
  @IsNotEmpty()
  declare trigger: string
}

import {
  IsNumber,
  IsNumberString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Points } from './points.dto';
import { Type } from 'class-transformer';

export class AssignPointsSarDto {
  @IsNumberString()
  declare userId: string;
  @ValidateNested()
  @Type(() => Points)
  declare points: Points;
  @IsNumberString()
  @IsOptional()
  declare storyId: string;
  @IsNumberString()
  @IsOptional()
  declare teamId: string;
  @IsNumberString()
  @IsOptional()
  declare tournamentId: string;
  @IsNumber()
  challengeId: number;
}

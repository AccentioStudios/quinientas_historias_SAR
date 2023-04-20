import { IsNumber, IsNumberString, IsString, Min } from 'class-validator';

export class Points {
  @IsNumber()
  @Min(15)
  declare base: number;
  @IsNumber()
  declare bonus: number;
}

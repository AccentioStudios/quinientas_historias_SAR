import { IsArray, IsNotEmpty, IsNumberString, IsOptional } from "class-validator";

export class AsignarRetoDTO {
    @IsNumberString()
    @IsNotEmpty()
    declare id_user: number;
    @IsOptional()
    declare storyId: number;
    @IsNotEmpty()
    declare triggers: string;
  }
  

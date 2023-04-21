export class FinishChallengeResponseDto {
  declare id: number
  declare description: string
  declare puntos_asignados: number
  declare challenge_type: string
  declare status: string
}

export class AddStepResponseDto {
  declare id: number
  declare description: string
  declare puntos_asignados: number
  declare challenge_type: string
  declare status: string
  declare steps: number
  declare steps_total: number
}

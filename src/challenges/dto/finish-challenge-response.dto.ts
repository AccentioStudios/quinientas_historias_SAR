export class FinishChallengeResponseDto {
  declare id: number
  declare success: boolean
}

export class AddStepResponseDto {
  declare id: number
  declare points: number
  declare challengeType: string
  declare success: boolean
  declare steps: number
  declare stepsTotal: number
}

export class NewChallengeDto {
  declare name: string
  declare url: string
  declare probability: number
  declare required: boolean
  declare active: boolean
  declare tournaments: number[]
  declare params: string[]
  declare triggers: string[]
  declare steps?: number
  declare steps_total?: number
  declare puntos_asignados: number
}

export class PayloadNewChallengeDto {
  declare body: NewChallengeDto
  declare req: any
}

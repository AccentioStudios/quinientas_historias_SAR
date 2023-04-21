export class NotificationDto {
  declare title: string
  declare body: string
  declare data: datos
}

export interface Args {
  id: number
  url: string
  description: string
  name: string
  type: string
  required: boolean
  tournament: Array<number>
  sessionToken: string
}
export interface datos {
  args: Args
  route: string
}

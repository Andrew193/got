export type LogConfig = {
  damage: number | null,
  newHealth: number | null,
  addDmg?: number,
  battleMode: boolean
}

export interface LogRecord {
  message: string,
  isUser?: boolean,
  info?: boolean,
  imgSrc: string
}

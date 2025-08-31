export interface IdEntity {
  id?: string,

  [key: string]: any
}

export interface LogRecord {
  message: string,
  isUser?: boolean,
  info?: boolean,
  imgSrc: string
}

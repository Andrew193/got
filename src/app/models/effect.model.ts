export interface Effect {
  imgSrc: string,
  type: string,
  duration: number,
  m: number,
  restore?: boolean
  passive?: boolean,
  defBreak?: number
}

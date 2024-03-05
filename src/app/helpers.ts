export function createDeepCopy(object: { [key: string]: any }) {
  return JSON.parse(JSON.stringify(object))
}

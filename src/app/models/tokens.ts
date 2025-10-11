import { InjectionToken, Provider } from '@angular/core';

export const DYNAMIC_COMPONENT_DATA = new InjectionToken<unknown>('DYNAMIC_COMPONENT_DATA');

//Tokens providers
export function provideDynamicData<T>(data: T): Provider {
  return { provide: DYNAMIC_COMPONENT_DATA, useValue: data };
}

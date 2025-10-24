import { InjectionToken, Provider } from '@angular/core';
import { ContentService } from '../services/abstract/content/content-service.service';

export const DYNAMIC_COMPONENT_DATA = new InjectionToken<unknown>('DYNAMIC_COMPONENT_DATA');
export const PAGINATION_SERVICE = new InjectionToken<ContentService>('PAGINATION_SERVICE');

//Tokens providers
export function provideDynamicData<T>(data: T): Provider {
  return { provide: DYNAMIC_COMPONENT_DATA, useValue: data };
}

import { InjectionToken } from '@angular/core';
import { InitStep } from './models/init.model';

export const APP_INIT_STEPS = new InjectionToken<InitStep[]>('APP_INIT_STEPS');

import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  isDevMode,
} from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { loggerInterceptor } from './interceptors/logger/logger.interceptor';
import { authInterceptor } from './interceptors/auth/auth.interceptor';
import { PreloadingStrategyService } from './services/preloading/preloading-strategy.service';
import { APP_INIT_STEPS } from './injection-tokens';
import { LoaderService } from './services/resolver-loader/loader.service';
import { NotificationsService } from './services/notifications/notifications.service';
import { OnlineService } from './services/online/online.service';
import { InitInterface } from './models/interfaces/init.interface';
import { concatAll, firstValueFrom, from } from 'rxjs';
import { STEP_DEFAULT_ORDER } from './constants';
import { MatDialogModule } from '@angular/material/dialog';
import { InitStep } from './models/init.model';
import { paramsCheckerInterceptor } from './interceptors/params-checker/params-checker.interceptor';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { hydrationMeta } from './store/meta/hydration.meta';
import { StoreNames } from './store/store.interfaces';
import { provideEffects } from '@ngrx/effects';
import { AssistantEffects } from './store/effects/assistant.effects';

export const INIT_STEPS_PROVIDERS = [
  {
    provide: APP_INIT_STEPS,
    multi: true,
    deps: [LoaderService],
    useFactory: (s: InitInterface) => ({ name: 'loader', order: 10, task: () => s.init() }),
  },
  {
    provide: APP_INIT_STEPS,
    multi: true,
    deps: [NotificationsService],
    useFactory: (s: InitInterface) => ({ name: 'notifications', order: 20, task: () => s.init() }),
  },
  {
    provide: APP_INIT_STEPS,
    multi: true,
    deps: [OnlineService],
    useFactory: (s: InitInterface) => ({ name: 'online', order: 30, task: () => s.init() }),
  },
];

export function AppInitializerFunction(_steps?: InitStep[]) {
  let steps: InitStep[];

  try {
    steps = inject(APP_INIT_STEPS);
  } catch (error) {
    steps = _steps || [];
  }

  const stepsResults = steps
    .sort((a, b) => (a.order || STEP_DEFAULT_ORDER) - (b.order || STEP_DEFAULT_ORDER))
    .map(step => step.task());

  return firstValueFrom(from(stepsResults).pipe(concatAll()));
}

export const appConfig: ApplicationConfig = {
  providers: [
    INIT_STEPS_PROVIDERS,
    provideAppInitializer(AppInitializerFunction),
    importProvidersFrom(MatDialogModule),
    provideRouter(routes, withPreloading(PreloadingStrategyService)),
    provideHttpClient(
      withInterceptors([paramsCheckerInterceptor, authInterceptor, loggerInterceptor]),
    ),
    provideAnimationsAsync(),
    provideStore(undefined, {
      metaReducers: [hydrationMeta([StoreNames.trainingGround])],
    }),
    provideEffects([AssistantEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideEffects(),
  ],
};

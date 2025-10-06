import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
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

function AppInitializerFunction() {
  const steps = inject(APP_INIT_STEPS);

  const stepsResults = steps
    .sort((a, b) => (a.order || STEP_DEFAULT_ORDER) - (b.order || STEP_DEFAULT_ORDER))
    .map(step => step.task());

  return firstValueFrom(from(stepsResults).pipe(concatAll()));
}

export const appConfig: ApplicationConfig = {
  providers: [
    INIT_STEPS_PROVIDERS,
    provideAppInitializer(AppInitializerFunction),
    provideRouter(routes, withPreloading(PreloadingStrategyService)),
    provideHttpClient(withInterceptors([authInterceptor, loggerInterceptor])),
    provideAnimationsAsync(),
  ],
};

import {ApplicationConfig} from '@angular/core';
import {provideRouter, withPreloading} from '@angular/router';
import {routes} from './app.routes';
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {loggerInterceptor} from "./interceptors/logger/logger.interceptor";
import {authInterceptor} from "./interceptors/auth/auth.interceptor";
import {PreloadingStrategyService} from "./services/preloading/preloading-strategy.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadingStrategyService)),
    provideHttpClient(withInterceptors([authInterceptor, loggerInterceptor])),
    provideAnimationsAsync()
  ],
};

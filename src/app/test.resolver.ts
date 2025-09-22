import { ResolveFn } from '@angular/router';
import { delay, Observable, of } from 'rxjs';

export const TestResolver: ResolveFn<Observable<unknown>> = (route, state) => {
  return of({ test: true }).pipe(delay(100));
};

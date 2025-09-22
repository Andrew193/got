import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { map } from 'rxjs';

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(response => {
      if (response.type === HttpEventType.Response) {
        console.log(
          `The request to ${response.url} has responded with the status code: ${response.status}.`
        );
      }
      return response;
    })
  );
};

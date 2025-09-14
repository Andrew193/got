import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import {catchError, of, switchMap, throwError} from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const handle401Response = (next: HttpHandlerFn, modReq: HttpRequest<any>) => {
    return of('new token').pipe(switchMap((newToken) => {
      return next(modReq.clone({
        setHeaders: {
          Authorization: `Basic ${newToken}`
        }
      }));
    }))
  }

  function setHeaders(req: HttpRequest<unknown>, token: string = 'test token') {
    return req.clone({
      setHeaders: {
        Authorization: `Basic ${token}`,
      }
    })
  }

  const modReq = setHeaders(req);

  return next(modReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Response(next, modReq);
      }

      return throwError(() => new Error(error.message));
    })
  )
};

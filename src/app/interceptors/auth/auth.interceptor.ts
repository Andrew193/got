import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {catchError, Observable, switchMap, throwError} from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const handle401Response = (next: HttpHandlerFn, modReq: HttpRequest<any>) => {
    return new Observable((observer) => {
    }).pipe(switchMap((newToken) => {
      return next(modReq.clone({
        setHeaders: {
          Authorization: `Basic ${newToken}`
        }
      }));
    }))
  }

  const modReq = req.clone({
    setHeaders: {
      Authorization: `Basic ddfs`,
    }
  })
  return next(modReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Response(next, modReq)
      }
      return throwError(error);
    })
  )
};

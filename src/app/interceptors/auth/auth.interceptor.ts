import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const modReq = req.clone({
    setHeaders: {
      Authorization: `Basic `
    }
  })
  return next(modReq);
};

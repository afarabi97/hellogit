import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SnackbarWrapper } from '../classes/snackbar-wrapper';

@Injectable({
  providedIn: 'root'
})
export class UnauthorizedInterceptor implements HttpInterceptor {

  constructor(private snackbar: SnackbarWrapper) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).do(
      (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do stuff with response if you want
        }
      },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          const reload = () => window.location.reload();
          if (err.status === 401) {
            this.snackbar.showSnackBar('Unauthorized Request. Please reload the page to re-login', 10000, 'Reload Page', reload);
          } else if (err.status === 403) {
            this.snackbar.showSnackBar('Forbidden. You do not have permissions for this request', -1, 'Dismiss');
          }
        }
      });
  }
}

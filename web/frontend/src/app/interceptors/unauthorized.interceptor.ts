import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { MatSnackbarConfigurationClass } from '../classes';
import { MatSnackBarService } from '../services/mat-snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class UnauthorizedInterceptor implements HttpInterceptor {

  /**
   * Creates an instance of UnauthorizedInterceptor.
   *
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof UnauthorizedInterceptor
   */
  constructor(private mat_snackbar_service_: MatSnackBarService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(tap(
      (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do stuff with response if you want
        }
      },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          const reload = () => window.location.reload();
          if (err.status === 401) {
            const message: string = 'Unauthorized Request. Please reload the page to re-login';
            const mat_snackbar_configuration: MatSnackbarConfigurationClass = {
              timeInMS: 10000,
              actionLabel: 'Reload Page',
              action: reload
            };
            this.mat_snackbar_service_.displaySnackBar(message, mat_snackbar_configuration);
          } else if (err.status === 403) {
            const message: string = 'Forbidden. You do not have permissions for this request';
            const mat_snackbar_configuration: MatSnackbarConfigurationClass = {
              timeInMS: -1,
              actionLabel: 'Dismiss'
            };
            this.mat_snackbar_service_.displaySnackBar(message, mat_snackbar_configuration);
          }
        }
      }));
  }
}

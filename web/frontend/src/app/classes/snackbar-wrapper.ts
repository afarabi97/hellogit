import { MatSnackBar, MatSnackBarConfig, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';


@Injectable()
export class SnackbarWrapper {
  constructor(private _snackBar: MatSnackBar) { }

  public showSnackBar(message: string, timeInMs?: number, actionLabel?: string, callback?: (value: MatSnackBarDismiss) => void) {
    const config = new MatSnackBarConfig();
    if (timeInMs !== -1) {
      config.duration = timeInMs;
    }
    const toastRef = this._snackBar.open(message, actionLabel, config);

    toastRef.afterDismissed().subscribe(callback);
  }

  /**
    * Handle Http operation that failed.
    * Let the app continue.
    * @param operation - name of the operation that failed
    * @param result - optional value to return as the observable result
  */
  public handleError(operation = 'operation', result?) {
    return (error: any): Observable<any> => {
      console.error(error);

      if (error.error && error.error.post_validation) {
        let full_msg = "";
        for (const msg of error.error.post_validation) {
          full_msg += msg;
        }

        this.showSnackBar(full_msg, -1, 'Dismiss');
      } else if (error.error && error.error.error_message){
        this.showSnackBar(error.error.error_message, -1, 'Dismiss');
      } else {
        this.showSnackBar('An error has occured: ' + error.status + '-' + error.statusText, -1, 'Dismiss');
      }

      // Let the app keep running by returning an empty result.
      return of(result);
    };
  }
}

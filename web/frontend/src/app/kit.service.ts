import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HTTP_OPTIONS } from './globals';
import { SnackbarWrapper } from './classes/snackbar-wrapper';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class KitService {

  constructor(private http: HttpClient, private snackbarWrapper: SnackbarWrapper) { }

  getKitForm(): Observable<Object> {
    const url = '/api/get_kit_form';
    return this.http.get(url).pipe();
  }

  executeKit(kitForm: Object, timeForm: Object) {
    const url = '/api/execute_kit_inventory';
    let payload: Object = { 'kitForm': kitForm, 'timeForm': timeForm };
    return this.http.post(url, payload, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError())
    );
  }

  generateKit(kitForm: Object, timeForm: Object) {
    const url = '/api/generate_kit_inventory';
    let payload: Object = { 'kitForm': kitForm, 'timeForm': timeForm };
    return this.http.post(url, payload, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError())
    );
  }

  executeAddNode(kitForm: Object) {
    const url = '/api/execute_add_node';
    return this.http.post(url, kitForm, HTTP_OPTIONS).pipe(
      catchError(err => this.handleError())
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  public handleError(operation = 'operation', result?) {
    return (error: any): Observable<any> => {
      this.snackbarWrapper.showSnackBar('An error has occured: ' + error.status + '-' + error.statusText, -1, 'Dismiss');
      // Let the app keep running by returning an empty result.
      return of(result);
    };
  }
}

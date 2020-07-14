import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class IndexManagementService {

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  indexManagement(indexManagementOptions: Object): Observable<Object> {
    console.log(indexManagementOptions);
    const url = '/api/index_management';
    return this.http.post(url, indexManagementOptions).pipe(
      catchError(this.handleError)
    );
  }

  get_closed_indices(): Observable<any> {
    const url = '/api/closed_indices';
    return this.http.get(url).pipe();
  }
  get_opened_indices(): Observable<any> {
    const url = '/api/opened_indices';
    return this.http.get(url).pipe();
  }

  displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

}
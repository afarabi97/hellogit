import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  changeKitClock(timeObj: Object) {
    const url = '/api/change_kit_clock';
    return this.http.post(url, timeObj).pipe();
  }

  changeKitPassword(passwordForm: Object, amendedPasswords: Array<Object>){
    const url = '/api/change_kit_password';
    let payload = {passwordForm: passwordForm, amendedPasswords: amendedPasswords}
    return this.http.post(url, payload).pipe();
  }

  uploadDocumentation(space_file: File, space_name): Observable<Object> {
    const url = '/api/update_documentation';
    const formData = new FormData();
    formData.append('upload_file', space_file, space_file.name);
    formData.append('space_name', space_name);
    console.log(space_file.name);
    console.log(formData)
    return this.http.post(url, formData).pipe();
  }

  getspaces(): Observable<Object>{
    const url = '/api/get_spaces';
    return this.http.get(url, {});
  }

  change_state_of_remote_network_device(node: string, device: string, state: string): Observable<Object>{
    const url = `/api/${node}/set_interface_state/${device}/${state}`;
    return this.http.post(url, {});
  }

  get_monitoring_interfaces(): Observable<Object>{
    const url = `/api/monitoring_interfaces`;
    return this.http.get(url);
  }

  displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  configureRepository(repositorySettings: Object): Observable<Object> {
    const url = '/api/snapshot';
    return this.http.post(url, repositorySettings).pipe(
      catchError(this.handleError)
    );
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

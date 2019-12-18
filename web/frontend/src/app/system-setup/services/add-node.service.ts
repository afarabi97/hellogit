import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material';


@Injectable({
  providedIn: 'root'
})
export class AddNodeSrvService {

  constructor(private http: HttpClient,
              private snackBar: MatSnackBar) { }

  getAddNodeWizardState(): Observable<Object> {
    const url = '/api/get_add_node_wizard_state';
    return this.http.get(url).pipe();
  }

  displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }
}
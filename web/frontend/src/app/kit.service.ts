import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HTTP_OPTIONS } from './globals';

@Injectable({
  providedIn: 'root'
})
export class KitService {

  constructor(private http: HttpClient) { }

  getKitForm(): Observable<Object>{
    const url = '/api/get_kit_form';
    return this.http.get(url).pipe();
  }

  executeKit(kitForm: Object, timeForm: Object){
    const url = '/api/execute_kit_inventory';
    let payload: Object = {'kitForm': kitForm, 'timeForm': timeForm};
    return this.http.post(url, payload, HTTP_OPTIONS).pipe();
  }

  generateKit(kitForm: Object, timeForm: Object){
    const url = '/api/generate_kit_inventory';
    let payload: Object = {'kitForm': kitForm, 'timeForm': timeForm};
    return this.http.post(url, payload, HTTP_OPTIONS).pipe();
  }

  executeAddNode(kitForm: Object){
    const url = '/api/execute_add_node';
    return this.http.post(url, kitForm, HTTP_OPTIONS).pipe();
  }
  
}

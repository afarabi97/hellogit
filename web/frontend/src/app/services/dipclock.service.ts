import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class DIPClockService {

  constructor(private http: HttpClient) { }

  getCurrentDIPTime(){
    const url = '/api/get_current_dip_time';
    return this.http.get(url).pipe();
  }
}

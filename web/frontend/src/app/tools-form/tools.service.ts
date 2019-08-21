import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor(private http: HttpClient) { }

  changeKitClock(timeObj: Object) {
    const url = '/api/change_kit_clock';
    return this.http.post(url, timeObj).pipe();
  }
}

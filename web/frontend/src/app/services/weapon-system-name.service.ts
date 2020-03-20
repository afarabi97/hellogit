import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HTTP_OPTIONS } from '../globals';

@Injectable({
  providedIn: 'root'
})
export class WeaponSystemNameService {
  constructor(
    private http: HttpClient) {
  }

  getSystemName() {
    const url = '/api/get_system_name';
    return this.http.get(url);
  };

  setSystemName(system_name: string){
    const url = `/api/set_system_name/${system_name}`;
    return this.http.put(url, null, HTTP_OPTIONS);
  }

}

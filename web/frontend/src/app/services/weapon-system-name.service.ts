import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HTTP_OPTIONS } from '../globals';

@Injectable({
  providedIn: 'root'
})
export class WeaponSystemNameService {
  public system_name;

  constructor(
    private http: HttpClient) {
  }

  setSystemName(system_name) {
    this.system_name = system_name;
  }

  getSystemName() {
    return this.system_name;
  }

  getSystemNameFromApi() {
    const url = '/api/get_system_name';
    return this.http.get(url);
  };

}

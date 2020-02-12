import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

}

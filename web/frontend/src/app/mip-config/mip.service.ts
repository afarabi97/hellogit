import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MIPService {

  constructor(private http: HttpClient) {
  }

  executeMIP(data) {
    const url = '/api/execute_mip_config_inventory';
    return this.http.post(url, data);
  }

  cacheDeviceFacts(data) {
    const url = '/api/cache_mip_device_facts';
    return this.http.post(url, data);
  }

}

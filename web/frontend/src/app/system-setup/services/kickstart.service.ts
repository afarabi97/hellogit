import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HTTP_OPTIONS } from '../../globals';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';


@Injectable({
  providedIn: 'root'
})
export class KickstartService {

  constructor(private http: HttpClient,
              private snackbarWrapper: SnackbarWrapper) { }

  public log(something: any) {
    console.log(something);
    console.log(something.constructor.name);
  }

  getAvailableIPBlocks(): Observable<any> {
    const url = '/api/get_available_ip_blocks';
    return this.http.get(url).pipe();
  }

  getAvailableIPBlocks2(controller_ip: string, netmask: string): Observable<Object> {
      const url = `/api/get_ip_blocks/${controller_ip}/${netmask}`;
      return this.http.get(url).pipe();
  }

  gatherDeviceFacts(management_ip: string): Observable<Object> {
    const url = `/api/gather_device_facts/${management_ip}`;
    return this.http.get(url).pipe();
  }

  generateKickstartInventory(kickStartForm: Object) {
    const url = '/api/kickstart';
    for(let node of kickStartForm['nodes']){
      node["boot_drives"] = node["boot_drives"].split(',')
      node["data_drives"] = node["data_drives"].split(',')
      node["raid_drives"] = node["raid_drives"].split(',')
    }

    delete kickStartForm["re_password"];
    return this.http.post(url, kickStartForm, HTTP_OPTIONS).pipe(
      catchError(this.snackbarWrapper.handleError('generateKickstartInventory'))
    );
  }

  putKickstartNode(node: Object) {
    const url = '/api/kickstart';
    console.log("This Nodes raid_drives is of type:  " + (typeof node["raid_drives"]))

    node["boot_drives"] = node["boot_drives"].split(',')
    node["data_drives"] = node["data_drives"].split(',')
    if (!Array.isArray(node["raid_drives"])) {
      node["raid_drives"] = node["raid_drives"].split(',')
    }

    return this.http.put(url, node, HTTP_OPTIONS).pipe(
      catchError(this.snackbarWrapper.handleError('generateKickstartInventory'))
    );
  }

  generateMIPKickstartInventory(kickStartForm: Object) {
    const url = '/api/mip_kickstart';
    return this.http.post(url, kickStartForm, HTTP_OPTIONS).pipe(
      catchError(this.snackbarWrapper.handleError('generateMIPKickstartInventory'))
    );
  }

  getKickstartForm() {
    const url = '/api/kickstart';
    return this.http.get(url)
      .pipe(
        catchError(this.snackbarWrapper.handleError())
      );
  }

  getMIPKickstartForm() {
    const url = '/api/mip_kickstart';
    return this.http.get(url)
      .pipe(
        catchError(this.snackbarWrapper.handleError())
      );
  }

  getUnusedIPAddresses(mng_ip: string, netmask: string): Observable<Object> {
    const url = `/api/get_unused_ip_addrs/${mng_ip}/${netmask}`;
    return this.http.get(url)
      .pipe(
        catchError(this.snackbarWrapper.handleError())
      );
  }
}

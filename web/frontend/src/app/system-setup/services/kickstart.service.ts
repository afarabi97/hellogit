import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
    const url = '/api/gather_device_facts';
    let post_payload = { "management_ip": management_ip };
    return this.http.post(url, post_payload, HTTP_OPTIONS).pipe(
      catchError(this.handleError())
    );
  }

  generateKickstartInventory(kickStartForm: Object) {
    const url = '/api/generate_kickstart_inventory';

    return this.http.post(url, kickStartForm, HTTP_OPTIONS).pipe(
      catchError(this.handleError('generateKickstartInventory'))
    );
  }

  generateMIPKickstartInventory(kickStartForm: Object) {
    const url = '/api/generate_mip_kickstart_inventory';

    return this.http.post(url, kickStartForm, HTTP_OPTIONS).pipe(
      catchError(this.handleError('generateMIPKickstartInventory'))
    );
  }

  getKickstartForm() {
    const url = '/api/get_kickstart_form';
    return this.http.get(url)
      .pipe(
        catchError(this.handleError())
      );
  }

  getMIPKickstartForm() {
    const url = '/api/get_mip_kickstart_form';
    return this.http.get(url)
      .pipe(
        catchError(this.handleError())
      );
  }

  getUnusedIPAddresses(mng_ip: string, netmask: string): Observable<Object> {
    const url = '/api/get_unused_ip_addrs';
    let post_payload = { 'mng_ip': mng_ip, 'netmask': netmask };
    return this.http.post(url, post_payload, HTTP_OPTIONS)
      .pipe(
        catchError(this.handleError())
      );
  }

  updateKickstartCtrlIP(ip_address: string): Observable<Object> {
    const url = `/api/update_kickstart_ctrl_ip/${ip_address}`;
    return this.http.put(url, null).pipe();
  }

  archiveConfigurationsAndClear(): Observable<Object> {
    const url = '/api/archive_configurations_and_clear';
    return this.http.delete(url).pipe();
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  public handleError(operation = 'operation', result?) {
    return (error: any): Observable<any> => {
      this.snackbarWrapper.showSnackBar('An error has occured: ' + error.status + '-' + error.statusText, -1, 'Dismiss');
      // Let the app keep running by returning an empty result.
      return of(result);
    };
  }
}

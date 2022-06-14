import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { SnackbarWrapper } from '../classes/snackbar-wrapper';

@Injectable({
  providedIn: 'root'
})
export class KitSettingsService {

  constructor(private http: HttpClient,
              private snackbarWrapper: SnackbarWrapper) { }

  getUnusedIPAddresses(mng_ip: string, netmask: string): Observable<Object> {
    const url = `${environment.KICKSTART_SERVICE_GET_UNUSED_IP_ADDRESSES}/${mng_ip}/${netmask}`;
    return this.http.get(url)
      .pipe(
        catchError(this.snackbarWrapper.handleError())
      );
  }

  getUsedIPAddresses(mng_ip: string, netmask: string): Observable<Object> {
    const url = `${environment.KICKSTART_SERVICE_GET_USED_IP_ADDRESSES}/${mng_ip}/${netmask}`;
    return this.http.get(url)
      .pipe(
        catchError(this.snackbarWrapper.handleError())
      );
  }

  getControllerInfo(): Observable<Object> {
    const url = '/api/controller/info';
    return this.http.get(url).pipe();
  }

  getESXiSettings(): Observable<Object> {
    const url = `/api/settings/esxi`;
    return this.http.get(url).pipe();
  }

  testESXiSettings(settingsForm): Observable<Object> {
    const url = `/api/settings/esxi/test`;
    delete settingsForm['re_password'];
    return this.http.post(url, settingsForm).pipe();
  }

  saveESXiSettings(settingsForm): Observable<Object> {
    const url = `/api/settings/esxi`;
    delete settingsForm['re_password'];
    return this.http.post(url, settingsForm).pipe();
  }

  getKitSettings(): Observable<Object> {
    const url = `/api/settings/kit`;
    return this.http.get(url).pipe();
  }

  updateKitSettings(settingsForm): Observable<Object> {
    const url = `/api/settings/kit`;
    delete settingsForm['re_password'];
    delete settingsForm['vcenter'];
    return this.http.post(url, settingsForm).pipe();
  }

  getMipSettings(): Observable<Object> {
    const url = `/api/settings/mip`;
    return this.http.get(url).pipe();
  }

  updateMipSettings(settingsForm): Observable<Object> {
    const url = '/api/settings/mip';
    delete settingsForm['re_password'];
    delete settingsForm['user_re_password'];
    delete settingsForm['luks_re_password'];
    return this.http.post(url, settingsForm).pipe();
  }

  getGeneralSettings(): Observable<Object> {
    const url = `/api/settings/general`;
    return this.http.get(url).pipe();
  }

  updateGeneralSettings(settingsForm): Observable<Object> {
    const url = '/api/settings/general';
    return this.http.post(url, settingsForm).pipe();
  }

  getControlPlane(): Observable<Object> {
    const url = `/api/kit/control-plane`;
    return this.http.get(url).pipe();
  }

  setupControlPlane(): Observable<Object> {
    const url = `/api/kit/control-plane`;
    return this.http.post(url, null).pipe();
  }

  refreshKit(): Observable<Object> {
    const url = `/api/kit/rebuild`;
    return this.http.post(url, null).pipe();
  }

  addNode(payload): Observable<Object> {
    const url = `/api/kit/node`;
    if ('boot_drives' in payload && typeof payload['boot_drives'] === 'string'){
      payload['boot_drives'] = payload['boot_drives'].split(',');
    }
    if ('data_drives' in payload && typeof payload['data_drives'] === 'string'){
      payload['data_drives'] = payload['data_drives'].split(',');
    }
    if ('os_raid' in payload ){
      if (payload['os_raid']){
        if (!Array.isArray(payload['raid_drives'])) {
          payload['raid_drives'] = payload['raid_drives'].split(',');
        }
      }else{
        payload['raid_drives'] = [];
      }
    }

    return this.http.post(url, payload).pipe();
  }

  updateGatherFacts(node: string): Observable<Object> {
    const url = `/api/kit/node/${node}/update`;
    return this.http.put(url, {}).pipe();
  }

  getNodes(): Observable<Object> {
    const url = `/api/kit/nodes`;
    return this.http.get(url).pipe();
  }

  getNode(node: string): Observable<Object> {
    const url = `/api/kit/node/${node}`;
    return this.http.get(url).pipe();
  }

  deleteNode(node: string): Observable<Object> {
    const url = `/api/kit/node/${node}`;
    return this.http.delete(url).pipe();
  }

  addMip(payload): Observable<Object> {
    const url = `/api/kit/mip`;
    return this.http.post(url, payload).pipe();
  }

  getMips(): Observable<Object> {
    const url = `/api/kit/mip`;
    return this.http.get(url).pipe();
  }

  getJobs(): Observable<Object> {
    const url = `/api/jobs`;
    return this.http.get(url).pipe();
  }

  getJob(jobId: string){
    const url = `/api/jobs/${jobId}`;
    return this.http.get(url).pipe();
  }

  deployKit(): Observable<Object> {
    const url = `/api/kit/deploy`;
    return this.http.get(url).pipe();
  }

  getKitStatus(): Observable<Object> {
    const url = `/api/kit/status`;
    return this.http.get(url).pipe();
  }

  getNodeVpnConfig(node: string){
    const url = `/api/kit/node/${node}/generate-vpn`;
    return this.http.get(url, { responseType: 'blob' }).pipe();
  }
}

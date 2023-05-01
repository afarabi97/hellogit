import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { GeneralSettingsClass, GenericJobAndKeyClass, KitSettingsClass, KitStatusClass, MipSettingsClass, NodeClass } from '../classes';
import { EntityConfig, GeneralSettingsInterface, GenericJobAndKeyInterface, KitSettingsInterface, KitStatusInterface, MipSettingsInterface, NodeInterface } from '../interfaces';
import { ApiService } from './abstract/api.service';

const ENTITY_CONFIG: EntityConfig = { entityPart: '', type: 'KitSettingsService' };

@Injectable({
  providedIn: 'root'
})
export class KitSettingsService extends ApiService<any> {

  constructor() {
    super(ENTITY_CONFIG);
  }

  getUnusedIPAddresses(mng_ip: string, netmask: string): Observable<string[]> {
    const url = `${environment.KICKSTART_SERVICE_GET_UNUSED_IP_ADDRESSES}/${mng_ip}/${netmask}`;
    return this.httpClient_.get<string[]>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('get unused ip addresses', error)));
  }

  getUsedIPAddresses(mng_ip: string, netmask: string): Observable<string[]> {
    const url = `${environment.KICKSTART_SERVICE_GET_USED_IP_ADDRESSES}/${mng_ip}/${netmask}`;
    return this.httpClient_.get<string[]>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('get used ip addresses', error)));
  }

  getControllerInfo(): Observable<Object> {
    const url = '/api/controller/info';
    return this.httpClient_.get(url).pipe();
  }

  getESXiSettings(): Observable<Object> {
    const url = `/api/settings/esxi`;
    return this.httpClient_.get(url).pipe();
  }

  testESXiSettings(settingsForm): Observable<Object> {
    const url = `/api/settings/esxi/test`;
    delete settingsForm['re_password'];
    return this.httpClient_.post(url, settingsForm).pipe();
  }

  saveESXiSettings(settingsForm): Observable<Object> {
    const url = `/api/settings/esxi`;
    delete settingsForm['re_password'];
    return this.httpClient_.post(url, settingsForm).pipe();
  }

  getKitSettings(): Observable<KitSettingsClass> {
    const url = `/api/settings/kit`;
    return this.httpClient_.get<KitSettingsInterface>(url)
      .pipe(map((response: KitSettingsInterface) => new KitSettingsClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get kit settings', error)));
  }

  updateKitSettings(settingsForm): Observable<Object> {
    const url = `/api/settings/kit`;
    delete settingsForm['re_password'];
    delete settingsForm['vcenter'];
    return this.httpClient_.post(url, settingsForm).pipe();
  }

  getMipSettings(): Observable<MipSettingsClass> {
    const url = `/api/settings/mip`;
    return this.httpClient_.get(url)
      .pipe(map((response: MipSettingsInterface) => new MipSettingsClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get mip settings', error)));
  }

  updateMipSettings(settingsForm): Observable<Object> {
    const url = '/api/settings/mip';
    delete settingsForm['re_password'];
    delete settingsForm['user_re_password'];
    delete settingsForm['luks_re_password'];
    return this.httpClient_.post(url, settingsForm).pipe();
  }

  getGeneralSettings(): Observable<GeneralSettingsClass> {
    const url = `/api/settings/general`;
    return this.httpClient_.get(url)
      .pipe(map((response: GeneralSettingsInterface) => new GeneralSettingsClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get general settings', error)));
  }

  updateGeneralSettings(settingsForm): Observable<Object> {
    const url = '/api/settings/general';
    return this.httpClient_.post(url, settingsForm).pipe();
  }

  getControlPlane(): Observable<Object> {
    const url = `/api/kit/control-plane`;
    return this.httpClient_.get(url).pipe();
  }

  setupControlPlane(): Observable<Object> {
    const url = `/api/kit/control-plane`;
    return this.httpClient_.post(url, null).pipe();
  }

  refreshKit(): Observable<Object> {
    const url = `/api/kit/rebuild`;
    return this.httpClient_.post(url, null).pipe();
  }

  addNode(payload): Observable<GenericJobAndKeyClass> {
    const url = `/api/kit/node`;

    return this.httpClient_.post<GenericJobAndKeyInterface>(url, payload)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('delete node', error)));
  }

  updateGatherFacts(node: string): Observable<Object> {
    const url = `/api/kit/node/${node}/update`;
    return this.httpClient_.put(url, {}).pipe();
  }

  getNodes(): Observable<NodeClass[]> {
    const url = `/api/kit/nodes`;
    return this.httpClient_.get<NodeInterface[]>(url)
      .pipe(map((response: NodeInterface[]) => response.map((node: NodeInterface) => new NodeClass(node))),
            catchError((error: HttpErrorResponse) => this.handleError('get nodes', error)));
  }

  getNode(node: string): Observable<Object> {
    const url = `/api/kit/node/${node}`;
    return this.httpClient_.get(url).pipe();
  }

  deleteNode(hostname: string): Observable<GenericJobAndKeyClass> {
    const url = `/api/kit/node/${hostname}`;
    return this.httpClient_.delete<GenericJobAndKeyInterface>(url)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('delete node', error)));
  }

  // Need to remeber to test for ValidationError and PostValidation
  addMip(payload): Observable<GenericJobAndKeyClass> {
    const url = `/api/kit/mip`;
    return this.httpClient_.post<GenericJobAndKeyInterface>(url, payload)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('add mip', error)));
  }

  getMips(): Observable<Object> {
    const url = `/api/kit/mip`;
    return this.httpClient_.get(url).pipe();
  }

  deployKit(): Observable<Object> {
    const url = `/api/kit/deploy`;
    return this.httpClient_.get(url).pipe();
  }

  getKitStatus(): Observable<KitStatusClass> {
    const url = `/api/kit/status`;
    return this.httpClient_.get(url)
      .pipe(map((response: KitStatusInterface) => new KitStatusClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get kit status', error)));
  }

  getNodeVpnConfig(node: string){
    const url = `/api/kit/node/${node}/generate-vpn`;
    return this.httpClient_.get(url, { responseType: 'blob' }).pipe();
  }
}

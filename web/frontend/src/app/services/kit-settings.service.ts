import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import {
  ControllerInfoClass,
  GeneralSettingsClass,
  GenericJobAndKeyClass,
  KitSettingsClass,
  KitStatusClass,
  MipSettingsClass,
  NodeClass,
  ObjectUtilitiesClass,
  SuccessMessageClass,
  VMWareDataClass,
  VMWareSettingsClass
} from '../classes';
import {
  ControllerInfoInterface,
  EntityConfig,
  GeneralSettingsInterface,
  GenericJobAndKeyInterface,
  KitSettingsInterface,
  KitStatusInterface,
  MipSettingsInterface,
  NodeInterface,
  SuccessMessageInterface,
  VMWareDataInterface,
  VMWareSettingsInterface
} from '../interfaces';
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

  get_used_ip_addresses(mng_ip: string, netmask: string): Observable<string[]> {
    const url = `${environment.KICKSTART_SERVICE_GET_USED_IP_ADDRESSES}/${mng_ip}/${netmask}`;

    return this.httpClient_.get<string[]>(url)
                           .pipe(catchError((error: HttpErrorResponse) => this.handleError('get used ip addresses', error)));
  }

  get_controller_info(): Observable<ControllerInfoClass> {
    const url = '/api/controller/info';

    return this.httpClient_.get<ControllerInfoInterface>(url)
                           .pipe(map((response: ControllerInfoInterface) => new ControllerInfoClass(response)),
                                 catchError((error: HttpErrorResponse) => this.handleError('get controller info', error)));
  }

  get_vmware_settings(): Observable<VMWareSettingsClass> {
    const url = `/api/settings/esxi`;

    return this.httpClient_.get<VMWareSettingsInterface>(url)
                           .pipe(map((response: VMWareSettingsInterface) => {
                                   if (Object.keys(response).length === 0) {
                                     return response;
                                   } else {
                                     return new VMWareSettingsClass(response);
                                   }
                                 }),
                                 catchError((error: HttpErrorResponse) => this.handleError('get vmware settings', error)));
  }

  save_vmware_settings(vmware_settings: VMWareSettingsInterface): Observable<boolean> {
    const url = `/api/settings/esxi`;
    delete vmware_settings['password_confirm'];

    return this.httpClient_.post<boolean>(url, vmware_settings)
                           .pipe(catchError((error: HttpErrorResponse) => this.handleError('get vmware settings', error)));
  }

  test_vmware_settings(vmware_settings: VMWareSettingsInterface): Observable<VMWareDataClass> {
    const url = `/api/settings/esxi/test`;
    delete vmware_settings['password_confirm'];

    return this.httpClient_.post<VMWareDataInterface>(url, vmware_settings)
                           .pipe(map((response: VMWareDataInterface) => new VMWareDataClass(response)),
                                 catchError((error: HttpErrorResponse) => this.handleError('test vmware settings', error)));
  }

  get_kit_settings(): Observable<KitSettingsClass> {
    const url = `/api/settings/kit`;
    return this.httpClient_.get<KitSettingsInterface>(url)
      .pipe(map((response: KitSettingsInterface) => {
              if (ObjectUtilitiesClass.notUndefNull(response)) {
                return new KitSettingsClass(response);
              } else {
                throwError({ "error_message": "Data has not been setup please update and save kit settings" });
              }
            }),
            catchError((error: HttpErrorResponse) => this.handleError('get kit settings', error)));
  }

  update_kit_settings(kit_settings: KitSettingsClass): Observable<GenericJobAndKeyClass> {
    const url = `/api/settings/kit`;

    return this.httpClient_.post<GenericJobAndKeyInterface>(url, kit_settings)
                           .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
                                 catchError((error: HttpErrorResponse) => this.handleError('update kit settings', error)));
  }

  get_mip_settings(): Observable<MipSettingsClass> {
    const url = `/api/settings/mip`;
    return this.httpClient_.get(url)
      .pipe(map((response: MipSettingsInterface) => {
              if (ObjectUtilitiesClass.notUndefNull(response)) {
                return new MipSettingsClass(response);
              } else {
                throwError({ "error_message": "Data has not been setup please update and save mip settings" });
              }
            }),
            catchError((error: HttpErrorResponse) => this.handleError('get mip settings', error)));
  }

  update_mip_settings(mip_settings: MipSettingsInterface): Observable<SuccessMessageClass> {
    const url = '/api/settings/mip';
    return this.httpClient_.post<SuccessMessageInterface>(url, mip_settings)
                           .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
                                 catchError((error: HttpErrorResponse) => this.handleError('update mip settings', error)));
  }

  get_general_settings(): Observable<GeneralSettingsClass> {
    const url = `/api/settings/general`;
    return this.httpClient_.get(url)
      .pipe(map((response: GeneralSettingsInterface) => {
              if (ObjectUtilitiesClass.notUndefNull(response)) {
                return new GeneralSettingsClass(response);
              } else {
                throwError({ "error_message": "Data has not been setup please update and save general settings" });
              }
            }),
            catchError((error: HttpErrorResponse) => this.handleError('get general settings', error)));
  }

  update_general_settings(general_settings: GeneralSettingsClass): Observable<GenericJobAndKeyClass> {
    const url: string = '/api/settings/general';

    return this.httpClient_.post<GenericJobAndKeyInterface>(url, general_settings)
                           .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
                                 catchError((error: HttpErrorResponse) => this.handleError('refresh kit', error)));
  }

  setup_control_plane(): Observable<GenericJobAndKeyClass> {
    const url = `/api/kit/control-plane`;
    return this.httpClient_.post<GenericJobAndKeyInterface>(url, null)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('refresh kit', error)));
  }

  refresh_kit(): Observable<GenericJobAndKeyClass> {
    const url = `/api/kit/rebuild`;
    return this.httpClient_.post<GenericJobAndKeyInterface>(url, null)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('refresh kit', error)));
  }

  update_device_facts(node: string): Observable<SuccessMessageClass> {
    const url = `/api/kit/node/${node}/update`;
    return this.httpClient_.put<SuccessMessageInterface>(url, {})
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('update device facts', error)));
  }

  add_node(payload): Observable<GenericJobAndKeyClass> {
    const url = `/api/kit/node`;

    return this.httpClient_.post<GenericJobAndKeyInterface>(url, payload)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('delete node', error)));
  }

  get_nodes(): Observable<NodeClass[]> {
    const url = `/api/kit/nodes`;
    return this.httpClient_.get<NodeInterface[]>(url)
      .pipe(map((response: NodeInterface[]) => response.map((node: NodeInterface) => new NodeClass(node))),
            catchError((error: HttpErrorResponse) => this.handleError('get nodes', error)));
  }

  delete_node(hostname: string): Observable<GenericJobAndKeyClass> {
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

  deploy_kit(): Observable<GenericJobAndKeyClass> {
    const url = `/api/kit/deploy`;
    return this.httpClient_.get(url)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('deploy kit', error)));
  }

  get_kit_status(): Observable<KitStatusClass> {
    const url = `/api/kit/status`;
    return this.httpClient_.get(url)
      .pipe(map((response: KitStatusInterface) => new KitStatusClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get kit status', error)));
  }

  get_open_vpn_certs(node_hostname: string): Observable<Blob> {
    const url = `/api/kit/node/${node_hostname}/generate-vpn`;
    return this.httpClient_.get(url, { responseType: 'blob' })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(' get open vpn certs', error)));
  }
}

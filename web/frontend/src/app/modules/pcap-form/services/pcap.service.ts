import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { GenericJobAndKeyClass, SuccessMessageClass } from '../../../classes';
import { EntityConfig, GenericJobAndKeyInterface, SuccessMessageInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { ReplayPCAPInterface } from '../interfaces/replay-pcap.interface';
import { PCAPServiceInterface } from '../interfaces/service-interfaces/pcap-service.interface';

const entityConfig: EntityConfig = { entityPart: '', type: 'PCAPService' };

/**
 * Service used for pcap api calls
 *
 * @export
 * @class PCAPService
 * @extends {ApiService<any>}
 * @implements {PCAPServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class PCAPService extends ApiService<any> implements PCAPServiceInterface {

  /**
   * Creates an instance of PCAPService.
   *
   * @memberof PCAPService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to POST upload pcap
   *
   * @param {FormData} pcap_form_data
   * @return {Observable<SuccessMessageClass>}
   * @memberof PCAPService
   */
  upload_pcap(pcap_form_data: FormData): Observable<SuccessMessageClass> {
    return this.httpClient_.post<SuccessMessageInterface>(environment.PCAP_SERVICE_UPLOAD_PCAP, pcap_form_data)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('upload pcap', error)));
  }

  /**
   * REST call to POST replay pcap
   *
   * @param {ReplayPCAPInterface} replay_pcap
   * @return {Observable<GenericJobAndKeyClass>}
   * @memberof PCAPService
   */
  replay_pcap(replay_pcap: ReplayPCAPInterface): Observable<GenericJobAndKeyClass> {
    return this.httpClient_.post<GenericJobAndKeyInterface>(environment.PCAP_SERVICE_REPLAY_PCAP, replay_pcap)
      .pipe(map((response: GenericJobAndKeyInterface) => new GenericJobAndKeyClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('replay pcap', error)));
  }

  /**
   * REST call to DELETE pcap
   *
   * @param {string} pcap_name
   * @return {Observable<SuccessMessageClass>}
   * @memberof PCAPService
   */
  delete_pcap(pcap_name: string): Observable<SuccessMessageClass> {
    const url = `${environment.PCAP_SERVICE_BASE}${pcap_name}`;

    return this.httpClient_.delete<SuccessMessageInterface>(url)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('delete pcap', error)));
  }
}

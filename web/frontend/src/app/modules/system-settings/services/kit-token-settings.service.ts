import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { KitTokenClass, SuccessMessageClass } from '../../../classes';
import { EntityConfig, KitTokenInterface, SuccessMessageInterface } from '../../../interfaces';
import { ApiService } from '../../../services/abstract/api.service';
import { KitTokenSettingsServiceInterface } from '../interfaces/service-interfaces/kit-token-settings-service.interface';

const ENTITY_CONFIG: EntityConfig = { entityPart: '', type: 'KitTokenSettingsService' };

/**
 * Service used for kit token api calls
 *
 * @export
 * @class KitTokenSettingsService
 * @extends {ApiService<any>}
 * @implements {KitTokenSettingsServiceInterface}
 */
@Injectable({
  providedIn: null
})
export class KitTokenSettingsService extends ApiService<any> implements KitTokenSettingsServiceInterface {

  /**
   * Creates an instance of KitTokenSettingsService.
   *
   * @memberof KitTokenSettingsService
   */
  constructor() {
    super(ENTITY_CONFIG);
  }

  /**
   * REST call to GET kit tokens
   *
   * @return {Observable<KitTokenClass[]>}
   * @memberof KitTokenSettingsService
   */
  get_kit_tokens(): Observable<KitTokenClass[]> {
    return this.httpClient_.get<KitTokenInterface[]>(environment.KIT_TOKENS_SETTINGS_SERVICE)
                           .pipe(map((response: KitTokenInterface[]) => response.map((kit_token: KitTokenInterface) => new KitTokenClass(kit_token))),
                                 catchError((error: HttpErrorResponse) => this.handleError('get kit tokens', error)));
  }

  /**
   * REST call to POST create kit token
   *
   * @param {KitTokenInterface} kit_token
   * @return {Observable<KitTokenClass>}
   * @memberof KitTokenSettingsService
   */
  create_kit_token(kit_token: KitTokenInterface): Observable<KitTokenClass> {
    return this.httpClient_.post<KitTokenInterface>(environment.KIT_TOKENS_SETTINGS_SERVICE, kit_token)
                           .pipe(map((kt: KitTokenInterface) => new KitTokenClass(kt)),
                                 catchError((error: HttpErrorResponse) => this.handleError('create kit_token', error)));
  }

  /**
   * REST call to DELETE kit token
   *
   * @param {string} kit_token_id
   * @return {Observable<SuccessMessageClass>}
   * @memberof KitTokenSettingsService
   */
  delete_kit_token(kit_token_id: string): Observable<SuccessMessageClass> {
    const url: string = `${environment.KIT_TOKENS_SETTINGS_SERVICE}/${kit_token_id}`;

    return this.httpClient_.delete<SuccessMessageInterface>(url)
                           .pipe(map((kt: SuccessMessageInterface) => new SuccessMessageClass(kt)),
                                 catchError((error: HttpErrorResponse) => this.handleError('delete kit_token', error)));
  }
}

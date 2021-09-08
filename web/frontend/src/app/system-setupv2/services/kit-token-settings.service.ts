import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EntityConfig } from '../../interfaces';
import { ApiService } from '../../services/abstract/api.service';
import { KitTokenClass } from '../classes/kit-token.class';
import { KitTokenInterface} from '../interfaces/kit-token.interface';
import { KitTokenSettingsServiceInterface } from '../interfaces/service-interfaces/kit-token-settings-service.interface';

const ENTITY_CONFIG: EntityConfig = { entityPart: '', type: 'KitTokenSettingsService' };

@Injectable({
  providedIn: 'root'
})
export class KitTokenSettingsService extends ApiService<any> implements KitTokenSettingsServiceInterface {

  constructor() {
    super(ENTITY_CONFIG);
  }

  get_kit_tokens(): Observable<Array<KitTokenClass>> {
    return this.httpClient_.get(environment.KIT_TOKENS_SETTINGS_SERVICE).pipe(
      map((kit_tokens: Array<KitTokenInterface>) => {
        const kit_token_list = [];
        for (const kit_token of kit_tokens) {
          kit_token_list.push(new KitTokenClass(kit_token));
        }
        return kit_token_list;
      }),
      catchError((error: HttpErrorResponse) => this.handleError('get kit tokens', error))
    );
  }

  create_kit_token(kit_token: KitTokenInterface): Observable<KitTokenClass> {
    return this.httpClient_.post(environment.KIT_TOKENS_SETTINGS_SERVICE, kit_token).pipe(
      map((kt: KitTokenInterface) => new KitTokenClass(kt)),
      catchError((error: HttpErrorResponse) => this.handleError('create kit_token', error)),
    );
  }

  delete_kit_token(kit_token_id: string): Observable<null> {
    const url = `${environment.KIT_TOKENS_SETTINGS_SERVICE}/${kit_token_id}`;
    return this.httpClient_.delete(url).pipe(catchError((error: HttpErrorResponse) => this.handleError('delete kit_token', error)));
  }

  replace_kit_token(kit_token_id: string, kit_token: KitTokenInterface): Observable<null> {
    const url = `${environment.KIT_TOKENS_SETTINGS_SERVICE}/${kit_token_id}`;
    return this.httpClient_.put(url, kit_token).pipe(catchError((error: HttpErrorResponse) => this.handleError('update kit_token', error)));
  }

  generate_kit_token(ipaddress: string): Observable<string> {
    return this.httpClient_.get(`${environment.GENERATE_TOKEN}/${ipaddress}`).pipe(catchError((error: HttpErrorResponse) => this.handleError('generate token error', error)));
  }

}

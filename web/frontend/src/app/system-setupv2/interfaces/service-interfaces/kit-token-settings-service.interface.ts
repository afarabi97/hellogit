import { Observable } from 'rxjs';
import { KitTokenClass } from '../../classes/kit-token.class';
import { KitTokenInterface } from '../kit-token.interface';

export interface KitTokenSettingsServiceInterface {
  get_kit_tokens(): Observable<Array<KitTokenClass>>;
  create_kit_token(kit_token: KitTokenInterface): Observable<KitTokenClass>;
  delete_kit_token(kit_token_id: string): Observable<null>;
}

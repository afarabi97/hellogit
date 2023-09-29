import { Observable } from 'rxjs';

import { KitTokenClass, SuccessMessageClass } from '../../../../classes';
import { KitTokenInterface } from '../../../../interfaces';

/**
 * Interface defines the Kit Token Settings Service
 *
 * @export
 * @interface KitTokenSettingsServiceInterface
 */
export interface KitTokenSettingsServiceInterface {
  get_kit_tokens(): Observable<KitTokenClass[]>;
  create_kit_token(kit_token: KitTokenInterface): Observable<KitTokenClass>;
  delete_kit_token(kit_token_id: string): Observable<SuccessMessageClass>;
}

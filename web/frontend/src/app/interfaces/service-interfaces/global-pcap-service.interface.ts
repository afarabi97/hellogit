import { Observable } from 'rxjs';

import { PCAPClass } from '../../classes';

/**
 * Interface defines the Global PCAP Service
 *
 * @export
 * @interface GlobalPCAPServiceInterface
 */
export interface GlobalPCAPServiceInterface {
  get_pcaps(): Observable<PCAPClass[]>;
}

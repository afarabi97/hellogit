import { Observable } from 'rxjs';

import { GenericJobAndKeyClass, SuccessMessageClass } from '../../../../classes';
import { ReplayPCAPInterface } from '../replay-pcap.interface';

/**
 * Interface defines the PCAP Service
 *
 * @export
 * @interface PCAPServiceInterface
 */
export interface PCAPServiceInterface {
  upload_pcap(pcap_form_data: FormData): Observable<SuccessMessageClass>;
  replay_pcap(replay_pcap: ReplayPCAPInterface): Observable<GenericJobAndKeyClass>;
  delete_pcap(pcap_name: string): Observable<SuccessMessageClass>;
}

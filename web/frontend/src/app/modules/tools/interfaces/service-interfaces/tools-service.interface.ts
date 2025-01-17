import { Observable } from 'rxjs';

import { SuccessMessageClass } from '../../../../classes';
import { ElasticLicenseClass } from '../../classes/elastic-license.class';
import { InitialDeviceStateClass } from '../../classes/initial-device-state.class';
import { NetworkDeviceStateClass } from '../../classes/network-device-state.class';
import { KitPasswordInterface } from '../kit-password.interface';

/**
 * Interface defines the Tools Service
 *
 * @export
 * @interface ToolsServiceInterface
 */
export interface ToolsServiceInterface {
  change_kit_password(kit_password: KitPasswordInterface): Observable<SuccessMessageClass>;
  change_remote_network_device_state(node: string, device: string, state: string): Observable<NetworkDeviceStateClass>;
  get_initial_device_states(): Observable<InitialDeviceStateClass[]>;
  upload_documentation(form_data: FormData): Observable<SuccessMessageClass>;
  get_elastic_license(): Observable<ElasticLicenseClass>;
  upload_elastic_license(license_data: Object): Observable<SuccessMessageClass>;
}

import { Observable } from 'rxjs';

import { GenericJobAndKeyClass } from '../../../../classes';
import { FilebeatModuleClass } from '../../classes/filebeat-module.class';
import { WinlogbeatConfigurationClass } from '../../classes/winlogbeat-configuration.class';

/**
 * Interface defines the Cold Log Ingest Service
 *
 * @export
 * @interface ColdLogIngestServiceInterface
 */
export interface ColdLogIngestServiceInterface {
  post_cold_log_file(cold_log_file: File, cold_log_form: Object): Observable<GenericJobAndKeyClass>;
  get_winlogbeat_configuration(): Observable<WinlogbeatConfigurationClass>;
  post_winlogbeat(winlogbeat_setup_form: Object): Observable<GenericJobAndKeyClass>;
  get_module_info(): Observable<FilebeatModuleClass[]>;
}

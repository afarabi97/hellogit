import { ValidatorFn, Validators } from '@angular/forms';

import { COMMON_VALIDATORS } from '../../../constants/cvah.constants';
import { validateFromArray } from '../../../validators/generic-validators.validator';

// Used for tab title and dialog titles
export const AGENT_BUILDER_CHOOSER_TITLE: string = 'Windows Agent Deployer';
export const INSTALL_WINDOWS_HOSTS: string = 'Install Windows hosts';
export const UNINSTALL_WINDOWS_HOSTS: string = 'Uninstall Windows hosts';
export const UNINSTALL_WINDOWS_HOST: string = 'Uninstall Windows host';
export const REINSTALL_WINDOWS_HOST: string = 'Reinstall Windows host';
export const DOMAIN_PASSWORD_LABEL: string = 'Domain Password';
export const WINDOWS_AGENT_DETAILS: string = 'Windows Agent Details';
export const WINDOWS_AGENT_INSTALLER: string = 'Windows Agent Installer';
export const WINDOWS_AGENT_TARGET: string = 'Windows Agent Target';

export const AGENT_INSTALLER_CONFIGURATION_MAT_TABLE_COLUMNS: string[] = [ 'select', 'config_name', 'install_custom', 'install_endgame', 'endgame_sensor_name', 'actions' ];
export const IP_TARGET_CONFIGS_MAT_TABLE_COLUMNS: string[] = [ 'select', 'name', 'protocol', 'port', 'domain_name', 'actions' ];
export const HOST_MAT_TABLE_COLUMNS: string[] = [ 'hostname', 'state', 'last_state_change', 'actions' ];

// Used for FormGroup validation
export const VALIDATORS_REQUIRED: ValidatorFn = Validators.compose([Validators.required]);
export const VALIDATORS_REQUIRED_FROM_ARRAY: ValidatorFn = Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]);
export const VALIDATORS_IS_VALID_IP_FROM_ARRAY: ValidatorFn = Validators.compose([validateFromArray(COMMON_VALIDATORS.isValidIP)]);
export const FORM_ELEMENTS: string[] = [ 'textinput', 'checkbox' ];
export const WINRM_PORT = '5985';
export const WINRM_PORT_SSL = '5986';
export const SMB_PORT = '445';

// General
export const DNS_INSTRUCTIONS: string = 'The \'Windows DNS Suffix\' is optional. If you do not include it, you will need to use the IP address of the Windows target(s). ' +
                                        'If you leave out the \'Windows DNS Suffix\' you will need to make sure each host you enter has the appropriate ' +
                                        'fully qualified domain name with the suffix attached (EX: <Windows hostname>.<DNS suffix>).  If you add the Windows DNS suffix, ' +
                                        'you will only need to specifiy the Windows hostnames when filling out the targets for this configuration.';
// Logstash Messages
export const LOGSTASH_NOT_DEPLOYED_STATE_MESSAGE: string = 'Logstash is not in a deployed state. Please check the system health page or try to reinstall Logstash on the catalog page.';
export const LOGSTASH_NO_DATA_MESSAGE: string = 'Before using this page, it is recommended that you install Logstash on your Kubernetes cluster. ' +
                                                'Please go to the Catalog page and install it. Failing to install it will cause Winlogbeats and ' +
                                                'Endgame agent data capture to Elasticsearch to fail.';

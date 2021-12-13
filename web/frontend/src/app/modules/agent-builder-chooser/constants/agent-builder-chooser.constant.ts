import { ValidatorFn, Validators } from '@angular/forms';

import { COMMON_VALIDATORS } from '../../../constants/cvah.constants';
import { validateFromArray } from '../../../validators/generic-validators.validator';

export const DOMAIN_PASSWORD_LABEL: string = 'Domain Password';
export const WINDOWS_AGENT_DETAILS: string = 'Windows Agent Details';
export const WINDOWS_AGENT_INSTALLER: string = 'Windows Agent Installer';
export const WINDOWS_AGENT_TARGET: string = 'Windows Agent Target';

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

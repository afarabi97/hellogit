import { IP_ADDRESS_PATTERN } from '../constants/system-settings.constant';

export const addToken = {
  ip_address: [
    { error_message: 'IP Address is required.', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_ADDRESS_PATTERN) },
             error_message: 'You must enter a valid IP address.',
             validatorFn: 'pattern' }
  ]
};

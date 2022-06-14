import { IP_CONSTRAINT } from '../../../constants/cvah.constants';

export const vmwareSettingsValidators = {
  ip_address: [
    { error_message: 'IP Address is required.', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_CONSTRAINT) },
             error_message: 'You must enter a valid IP address.',
             validatorFn: 'pattern' }
  ],
  username: [
    { error_message: 'Username is required.', validatorFn: 'required' },
  ],
  password: [
    { error_message: 'Password is a required.', validatorFn: 'required' },
  ],
  re_password: [
    { error_message: 'The passwords you entered do not match.  Please retype them carefully.', validatorFn: 'fieldMatch' }
  ]
};

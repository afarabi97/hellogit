import { IP_CONSTRAINT } from '../../../constants/cvah.constants';

export const HIVE_SETTINGS: string = 'HIVE Settings';
export const HIVE_SETTINGS_INSTRUCTIONS: string = `In order to Hive event escalation to work, please copy and paste the admin and org_admin Hive API keys in the previous inputs. The key can be found inside the Hive's applcation settings.`;
export const VMWARE_SETTINGS_VALIDATOR_CONFIGS = {
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
  password_confirm: [
    { error_message: 'Confirm password does not match password.  Please retype them carefully.', validatorFn: 'matching' }
  ]
};

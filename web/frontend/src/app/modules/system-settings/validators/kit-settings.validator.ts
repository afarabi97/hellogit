import { IP_CONSTRAINT } from '../../../constants/cvah.constants';

export const kitSettingsValidators = {
  password: [
    { error_message: 'Password is a required.', validatorFn: 'required' },
    { error_message: 'Root password did not meet the password requirements.', validatorFn: 'password' }
  ],
  re_password: [
    { error_message: 'The passwords you entered do not match.  Please retype them carefully.', validatorFn: 'fieldMatch' }
  ],
  gateway: [
    { error_message: 'Gateway is required', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_CONSTRAINT) },
             error_message: 'You must enter a valid IP address.',
             validatorFn: 'pattern' }
  ],
  netmask: [
    { ops: { pattern: /^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$/},
             error_message: 'Must be a valid subnet mask such as 255.255.255.0',
             validatorFn: 'pattern' },
    { error_message: 'Netmask is required', validatorFn: 'required' }
  ],
  controller_interface: [
    { error_message: 'Controller Interface is required', validatorFn: 'required' }
  ],
  upstream_dns: [
    { ops: { pattern: new RegExp(IP_CONSTRAINT) },
             error_message: 'You must enter a valid IP address.',
             validatorFn: 'pattern' }
  ],
  upstream_ntp: [
    { ops: { pattern: new RegExp(IP_CONSTRAINT) },
             error_message: 'You must enter a valid IP address.',
             validatorFn: 'pattern' }
  ],
  domain: [
    { ops: { pattern: /^[a-z]([a-z0-9-]){2,39}$/ },
             error_message: 'The Domain must be alphanumeric between 3 and 40 characters. Special characters are not allowed except for the minus sign (-) and the period (.). The Domain may not begin or end with either special character.',
             validatorFn: 'pattern' },
    { error_message: 'Domain is required', validatorFn: 'required' }
  ],
  kubernetes_services_cidr: [
    { error_message: 'Kubernetetes Service IP is required', validatorFn: 'required' }
  ]
};

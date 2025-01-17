import { IP_CONSTRAINT } from '../constants/cvah.constants';

export const addNodeValidators = {
  hostname: [
    { error_message: (value) => `Duplicate hostnames found: ${value}. Node must have a unique hostname.`, validatorFn: 'unique' },
    { ops: { pattern: /^[a-z]([a-z0-9-.]){4,39}$/ },
             error_message: 'The Hostname must be alphanumeric between 5 and 40 characters. Special characters are not allowed except for the minus sign (-) and the period (.). The Hostname may not begin or end with either special character.',
             validatorFn: 'pattern' },
    { error_message: 'Hostname is required', validatorFn: 'required' }
  ],
  ip_address: [
    { error_message: (value) => `Used IP Address found: ${value}. Node must have a unique IP Address.`, validatorFn: 'unique' },
    { error_message: 'IP Address is required.', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_CONSTRAINT) },
             error_message: 'You must enter a valid IP address.',
             validatorFn: 'pattern' }
  ],
  mac_address: [
    { error_message: (value) => `Duplicate MAC Address found: ${value}. Node must have a unique MAC Address.`, validatorFn: 'unique' },
    { error_message: 'Mac Address is required', validatorFn: 'required' },
    { ops: { pattern: /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/ },
             error_message: 'You must enter a valid MAC Address.',
             validatorFn: 'pattern' }
  ],
  virtual_cpu: [
    { error_message: 'CPU is required', validatorFn: 'required' },
    { ops: { pattern: /([8-9])|([1-9][0-9]{1,})/ },
             error_message: 'You must enter a valid number for CPU. A minimum of 8 cores is required for each node.',
             validatorFn: 'pattern' }
  ],
  virtual_mem: [
    { error_message: 'Memory is required', validatorFn: 'required' },
    { ops: { pattern: /([8-9])|([1-9][0-9]{1,})/ },
             error_message: 'You must enter a valid number for memory. A minimum of 8 GB of RAM is required.',
             validatorFn: 'pattern' }
  ],
  virtual_os_drive: [
    { error_message: 'OS drive is required', validatorFn: 'required' },
    { ops: { pattern: /([5-9][0-9])|([1-9][0-9]{2,})/ },
             error_message: 'You must enter a valid number for disk. A minimum of 50GB is required.',
             validatorFn: 'pattern' }
  ],
  virtual_data_drive: [
    { error_message: 'Data drive is required', validatorFn: 'required' },
    { ops: { pattern: /([5-9][0-9])|([1-9][0-9]{2,})/ },
             error_message: 'You must enter a valid number for disk. A minimum of 50GB is required.',
             validatorFn: 'pattern' }
  ]
};

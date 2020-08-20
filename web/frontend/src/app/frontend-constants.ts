//Feedback
export const INVALID_FEEDBACK_INTERFACE: string = 'No interfaces found! Are you sure you have a second eligible interface that is not the management interface?';
export const INVALID_FEEDBACK_IP: string = 'You must enter a valid IP address.';
export const CIDR_CONSTRAINT_MSG = 'You must enter a CIDR IP in the x.x.x.x/xx format or use the "any" keyword.';

//Constraints
export const IP_CONSTRAINT: string = "^((2[0-2][0-3])|(1\\d\\d)|([1-9]?\\d))(\\.((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){2}\\.((25[0-4])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))$";
export const HOST_CONSTRAINT = "^[a-zA-Z]([a-zA-Z]|[0-9]|[-])*$"
export const WINDOWS_HOST_CONSTRAINT = "^[a-zA-Z]([a-zA-Z]|[0-9]|[-_.])*$"
export const IP_CONSTRAINT_WITH_SUBNET: string = "((^|\\.)((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){4}$";
export const URL_CONSTRAINT: string = "^(ftp:\\/\\/.|http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?\\.iso$";
export const NON_ISO_URL_CONSTRAINT: string = "^(http(s)?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$"
export const CIDR_CONSTRAINT: string = "any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9])";
export const KUBE_CIDR_CONSTRAINT: string = '^((2[0-2][0-3])|(1\\d\\d)|([1-9]?\\d))(\\.((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){2}\\.((2[0-3]\\d)|(1\\d\\d)|([1-9]?\\d))$';

// MISC
export const KIT_ID = "kit_form";
export const PORTAL_ID = 'portal_links';
export const KICKSTART_ID = "kickstart_form";
export const CTRL_SELECTED = "A controller interface must first be selected.";
export const SENSOR_APPS = ["bro", "suricata", "moloch"];
export const GENERAL_KIT_FAILURE_MSG = 'Kit failed to generate Kit inventory file for an unknown reason. Please check the logs files located in /var/log/tfplenum for more details.';
export const NODE_TYPES = ["Server", "Sensor", "MIP"]; //Added MIP


export const COMMON_VALIDATORS = {
  required: [
    { error_message: 'Required field', validatorFn: 'required' }
  ],
  isValidIP: [
    { error_message: 'Invalid IP Address', validatorFn: 'pattern', ops: { pattern: new RegExp(IP_CONSTRAINT) } },
    { error_message: 'Required field', validatorFn: 'required' }
  ],

  root_password: [
    { ops: { pattern: /^.{6,}$/ }, error_message: 'You must enter a root password with a minimum length of 6 characters.', validatorFn: 'pattern' },
    { error_message: 'Root password is required', validatorFn: 'required' }
  ],
  re_password: [
    { ops: { pattern: /^.{6,}$/ }, error_message: 'You must enter a root password with a minimum length of 6 characters.', validatorFn: 'pattern' },
    { error_message: "The passwords you entered do not match.  Please retype them carefully.", validatorFn: 'fieldMatch' },
    { error_message: 'Retyping Root password is required', validatorFn: 'required' }
  ]
}

export const PXE_TYPES: string[] = ['BIOS', 'UEFI', 'DL160', 'SuperMicro'];
export const MIP_PXE_TYPES: string[] = ['SCSI/SATA/USB', 'NVMe'];

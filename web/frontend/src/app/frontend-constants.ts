//Feedback
export const INVALID_FEEDBACK_INTERFACE = 'No interfaces found! Are you sure you have a second eligible interface that is not the management interface?';
export const INVALID_FEEDBACK_IP = 'You must enter a valid IP address.';
export const CIDR_CONSTRAINT_MSG = 'You must enter a CIDR IP in the x.x.x.x/xx format or use the "any" keyword.';

//Constraints
export const IP_CONSTRAINT =
  "^((2[0-2][0-3])|(1\\d\\d)|([1-9]?\\d))(\\.((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){2}\\.((25[0-4])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))$";
export const HOST_CONSTRAINT =
  "^[a-zA-Z]([a-zA-Z]|[0-9]|[-])*$"
export const WINDOWS_HOST_CONSTRAINT =
  "^[a-zA-Z]([a-zA-Z]|[0-9]|[-_.])*$"
export const IP_CONSTRAINT_WITH_SUBNET =
  "((^|\\.)((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){4}$";
export const URL_CONSTRAINT =
  "^(ftp:\\/\\/.|http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?\\.iso$";
export const NON_ISO_URL_CONSTRAINT =
  "^(http(s)?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$"
export const CIDR_CONSTRAINT =
  "any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9])";
export const KUBE_CIDR_CONSTRAINT =
  '^((2[0-2][0-3])|(1\\d\\d)|([1-9]?\\d))(\\.((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){2}\\.((2[0-3]\\d)|(1\\d\\d)|([1-9]?\\d))$';

// MISC
export const KIT_ID = "kit_form";
export const PORTAL_ID = 'portal_links';
export const KICKSTART_ID = "kickstart_form";
export const CTRL_SELECTED = "A controller interface must first be selected.";
export const SENSOR_APPS = ["bro", "suricata", "arkime"];
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
    { error_message: "Root password did not meet the password requirements.", validatorFn: 'password' }
  ],
  re_password: [
    { error_message: "The passwords you entered do not match.  Please retype them carefully.", validatorFn: 'fieldMatch' }
  ],
};

export const PXE_TYPES: string[] = ['BIOS', 'UEFI'];
export const MIP_PXE_TYPES: string[] = ['SCSI/SATA/USB', 'NVMe'];

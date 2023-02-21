import { HttpHeaders } from '@angular/common/http';

import { MatSnackbarConfigurationClass } from '../classes';
import { MatOptionInterface } from '../interfaces';

// Used for passing button color to button
export const PRIMARY_BUTTON_COLOR: string = 'primary';
export const ACCENT_BUTTON_COLOR: string = 'accent';
export const WARN_BUTTON_COLOR: string = 'warn';

// Used for passing specific dialog width when opening a mat dialog
export const DIALOG_WIDTH_50VW: string = '50vw';
export const DIALOG_WIDTH_80VW: string = '80vw';
export const DIALOG_HEIGHT_90VH: string = '90vh';
export const DIALOG_WIDTH_35PERCENT: string = '35%';
export const DIALOG_WIDTH_50PERCENT: string = '50%';
export const DIALOG_WIDTH_500PX: string = '500px';
export const DIALOG_WIDTH_800PX: string = '800px';
export const DIALOG_WIDTH_1000PX: string = '1000px';
export const DIALOG_MIN_WIDTH_400PX: string = '400px';
export const DIALOG_MAX_HEIGHT_800PX: string = '800px';
export const CONFIRM_DIALOG_OPTION: string = 'Confirm';
export const CONTINUE_DIALOG_OPTION: string = 'Continue';
export const SUBMIT_DIALOG_OPTION: string = 'Submit';
export const SAVE_DIALOG_OPTION: string = 'Save';
export const CANCEL_DIALOG_OPTION: string = 'Cancel';
export const TAKE_ME_BACK_DIALOG_OPTION: string = 'Take Me Back';
export const MAT_SNACKBAR_ACTION_LABEL_CLOSE: string = 'Close';
export const MAT_SNACKBAR_ACTION_LABEL_OK: string = 'OK';
export const MAT_SNACKBAR_ACTION_LABEL_DISMISS: string = 'Dismiss';

// Service Constants
export const HTTP_OPTIONS = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

// MatSnackbar Configuration
export const MAT_SNACKBAR_CONFIGURATION_3000_DUR: MatSnackbarConfigurationClass = {
  timeInMS: 3000,
  actionLabel: MAT_SNACKBAR_ACTION_LABEL_CLOSE
};
export const MAT_SNACKBAR_CONFIGURATION_60000_DUR: MatSnackbarConfigurationClass = {
  timeInMS: 60000,
  actionLabel: MAT_SNACKBAR_ACTION_LABEL_CLOSE
};
export const MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK: MatSnackbarConfigurationClass = {
  timeInMS: 60000,
  actionLabel: MAT_SNACKBAR_ACTION_LABEL_OK
};
export const MAT_SNACKBAR_CONFIGURATION_60000_DUR_DISMISS: MatSnackbarConfigurationClass = {
  timeInMS: 60000,
  actionLabel: MAT_SNACKBAR_ACTION_LABEL_DISMISS
};

// Feedback
export const INVALID_FEEDBACK_INTERFACE: string = 'No interfaces found! Are you sure you have a second eligible interface that is not the management interface?';
export const INVALID_FEEDBACK_IP: string = 'You must enter a valid IP address.';
export const CIDR_CONSTRAINT_MSG: string = 'You must enter a CIDR IP in the x.x.x.x/xx format or use the "any" keyword.';

// Constraints
export const IP_CONSTRAINT: string =
  "^((2[0-2][0-3])|(1\\d\\d)|([1-9]?\\d))(\\.((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){2}\\.((25[0-4])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))$";
export const HOST_CONSTRAINT: string =
  "^[a-zA-Z]([a-zA-Z]|[0-9]|[-])*$";
export const WINDOWS_HOST_CONSTRAINT: string =
  "^[a-zA-Z]([a-zA-Z]|[0-9]|[-_.])*$";
export const IP_CONSTRAINT_WITH_SUBNET: string =
  "((^|\\.)((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){4}$";
export const URL_CONSTRAINT: string =
  "^(ftp:\\/\\/.|http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?\\.iso$";
export const NON_ISO_URL_CONSTRAINT: string =
  "^(http(s)?:\\/\\/)[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$";
export const CIDR_CONSTRAINT: string =
  "any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9])";
export const KUBE_CIDR_CONSTRAINT: string =
  '^((2[0-2][0-3])|(1\\d\\d)|([1-9]?\\d))(\\.((25[0-5])|(2[0-4]\\d)|(1\\d\\d)|([1-9]?\\d))){2}\\.((2[0-3]\\d)|(1\\d\\d)|([1-9]?\\d))$';
export const SPACE_NAME_CONSTRAINT: string = '^[a-zA-Z]{1,50}$';

// MISC
export const KIT_ID: string = 'kit_form';
export const PORTAL_ID: string = 'portal_links';
export const CTRL_SELECTED: string = 'A controller interface must first be selected.';
export const SENSOR_APPS: string[] = ['bro', 'suricata', 'arkime'];
export const GENERAL_KIT_FAILURE_MSG: string = 'Kit failed to generate Kit inventory file for an unknown reason. Please check the logs files located in /var/log/tfplenum for more details.';
export const COMMON_VALIDATORS = {
  required: [
    { error_message: 'Required field', validatorFn: 'required' }
  ],
  isValidIP: [
    { error_message: 'Required field', validatorFn: 'required' },
    { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }
  ],
  root_password: [
    { error_message: 'Required field', validatorFn: 'required' },
    { error_message: 'Root password did not meet the password requirements.', validatorFn: 'password' }
  ],
  re_password: [
    { error_message: 'Required field', validatorFn: 'required' },
    { error_message: 'The passwords you entered do not match.  Please retype them carefully.', validatorFn: 'fieldMatch' }
  ],
  is_valid_space_name: [
    { error_message: 'Required field', validatorFn: 'required' },
    { ops: { pattern: new RegExp(SPACE_NAME_CONSTRAINT) }, error_message: 'Please enter a valid space name of 1-50 uppercase and lowercase letters.', validatorFn: 'pattern' }
  ]
};
export const PXE_TYPES: string[] = ['BIOS', 'UEFI'];
export const MIP_PXE_TYPES: string[] = ['SCSI/SATA/USB', 'NVMe'];

// Websocket
export const WEBSOCKET_MESSAGE_ROLE_CATALOG: string = 'catalog';
export const WEBSOCKET_MESSAGE_ROLE_NODE: string = 'node';
export const WEBSOCKET_MESSAGE_ROLE_RULE_SYNC: string = 'rulesync';
export const WEBSOCKET_MESSAGE_STATUS_STARTED: string = 'STARTED';
export const WEBSOCKET_MESSAGE_STATUS_COMPLETED: string = 'COMPLETED';
export const WEBSOCKET_MESSAGE_STATUS_ERROR: string = 'ERROR';
export const WEBSOCKET_MESSAGE_MESSAGE_REMOVE_NODE: string = 'Remove Node';
export const WEBSOCKET_MESSAGE_MESSAGE_ADD_NODE: string = 'Add Node';
export const WEBSOCKET_MESSAGE_MESSAGE_CREATE_VIRTUAL_MACHINE: string = 'Create Virtual Machine';
export const WEBSOCKET_MESSAGE_MESSAGE_PROVISION_VIRTUAL_MACHINE: string = 'Provision Virtual Machine';

// Boolean as String values
export const TRUE: string = 'true';
export const FALSE: string = 'false';

// Node Deployment Options
export const VIRTUAL: string = 'Virtual';
export const BAREMETAL: string = 'Baremetal';
export const SERVER: string = 'Server';
export const SENSOR: string = 'Sensor';
export const SERVICE: string = 'Service';
export const MIP: string = 'MIP';
export const MINIO: string = 'MinIO';

// Node State
export const ERROR: string = 'Error';
export const COMPLETE: string = 'Complete';
export const IN_PROGRESS: string = 'In Progress';
export const PENDING: string = 'Pending';
export const UNKNOWN: string = 'Unknown';

export const CREATE: string = 'create';
export const DEPLOY: string = 'deploy';
export const CANCEL: string = 'cancel';
export const DEPLOYMENT_OPTIONS: MatOptionInterface[] = [
  { name: BAREMETAL, value: BAREMETAL },
  { name: 'Virtual Machine', value: VIRTUAL }
];
export const NODE_TYPES: string[] = [SERVER, SENSOR, MIP]; //Added MIP

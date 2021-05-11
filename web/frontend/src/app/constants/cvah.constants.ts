import { HttpHeaders } from '@angular/common/http';

import { MatSnackbarConfigurationClass } from '../classes';

export const TIMEZONES2: string[] = [
  'UTC',
  'America/Chicago',
  'America/Denver',
  'America/Detroit',
  'America/Los_Angeles',
  'America/New_York'
];

// Used for passing specific dialog width when opening a mat dialog
export const DIALOG_WIDTH_50PERCENT: string = '50%';
export const DIALOG_WIDTH_500PX: string = '500px';
export const DIALOG_WIDTH_800PX: string = '800px';
export const DIALOG_MAX_HEIGHT_800PX: string = '800px';
export const CONFIRM_DIALOG_OPTION: string = 'Confirm';
export const CANCEL_DIALOG_OPTION: string = 'Cancel';
export const MAT_SNACKBAR_ACTION_LABEL_CLOSE: string = 'Close';

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

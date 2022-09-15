import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION } from '../../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface } from '../../../interfaces';

export const CONFIRM_DIALOG_MAT_DIALOG_DATA_STOP_JOB: ConfirmDialogMatDialogDataInterface = {
  title: 'Stop',
  message: 'Are you sure you want to stop this job?',
  option1: CANCEL_DIALOG_OPTION,
  option2: CONFIRM_DIALOG_OPTION
};
export const CONFIRM_DIALOG_MAT_DIALOG_DATA_RETRY_JOB: ConfirmDialogMatDialogDataInterface = {
  title: 'Retry Job',
  message: 'Are you sure you want to rerun this job?',
  option1: CANCEL_DIALOG_OPTION,
  option2: CONFIRM_DIALOG_OPTION
};

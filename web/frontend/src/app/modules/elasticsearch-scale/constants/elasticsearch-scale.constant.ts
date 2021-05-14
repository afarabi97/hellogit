import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION } from '../../../constants/cvah.constants';
import { ConfirmActionConfigurationInterface, ConfirmDialogMatDialogDataInterface } from '../../../interfaces';

export const SLIDER_PROGRAMMING_ERROR_TITLE: string = 'Unsupported or programming error';
export const WEBSOCKET_STATUS_COMPLETED_ELASTIC_MESSAGE: string = 'Elastic scaling completed successfully.';
export const ELASTICSEARCH_SCALE_TITLE: string = 'ES Scale';
export const ELASTICSEARCH_SCALING: string = 'Elasticsearch Scaling';
export const SAVE_CONFIRM_ACTION_CONFIGURATION: ConfirmActionConfigurationInterface = {
  title: 'Close and save',
  message: 'Are you sure you want to save this configuration? ' +
           'Doing so will update the Elasticsearch configuration ' +
           'and may cause interuption to services for a few minutes.',
  confirmButtonText: 'Save',
  successText: 'Saved Elastic Configuration',
  failText: 'Could not save',
  useGeneralActionFunc: true,
  actionFunc: () => {}
};
export const CLOSE_CONFIRM_ACTION_CONFIGURATION: ConfirmActionConfigurationInterface = {
  title: 'Close without saving',
  message: 'Are you sure you want to close this editor? All changes will be discarded.',
  confirmButtonText: 'Close',
  successText: 'Closed without saving',
  failText: '',
  useGeneralActionFunc: true,
  actionFunc: () => {}
};
export const RUN_CONFIRM_MAT_DIALOG: ConfirmDialogMatDialogDataInterface = {
  paneString: `Are you sure that you want to change the ${ELASTICSEARCH_SCALING} configuration. This will take some time for operation to complete.`,
  paneTitle: ELASTICSEARCH_SCALING,
  option1: CANCEL_DIALOG_OPTION,
  option2: CONFIRM_DIALOG_OPTION
};
export const CANT_RUN_CONFIRM_MAT_DIALOG: ConfirmDialogMatDialogDataInterface = {
  paneString: `${ELASTICSEARCH_SCALING} is currently in progress so you can not change the configuration at this time`,
  paneTitle: ELASTICSEARCH_SCALING,
  option2: CONFIRM_DIALOG_OPTION
};
export const ELASTICSEARCH_SCALE_IN_PROGRESS_CONFIRM_MAT_DIALOG: ConfirmDialogMatDialogDataInterface = {
  paneString: `${ELASTICSEARCH_SCALING} is currently in progress`,
  paneTitle: ELASTICSEARCH_SCALING,
  option2: CONFIRM_DIALOG_OPTION
};
export const ELASTICSEARCH_KIT_DEPLOYED_ERROR_MESSAGE: string = '- You cannot scale Elasticsearch until you have a Kit deployed and Elastic is installed';
export const ELASTICSEARCH_UNKNOWN_ERROR_MESSAGE: string = '- Unknown Elasticsearch Status';

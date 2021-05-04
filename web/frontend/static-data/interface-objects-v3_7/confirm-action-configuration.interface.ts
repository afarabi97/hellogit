import { ConfirmActionConfigurationInterface } from '../../src/app/interfaces/confirm-action-configuration.interface';


export const CONFIRM_ACTION_CONFIGURATION_SAVE_ALT_ACTION_FUNCTION_TRUE_INTERFACE: ConfirmActionConfigurationInterface = {
  title: 'Close and save',
  message: 'Save Message.',
  confirmButtonText: 'Save',
  successText: 'Save Success',
  failText: 'Save Fail',
  useGeneralActionFunc: true,
  actionFunc: () => {}
};
export const CONFIRM_ACTION_CONFIGURATION_CLOSE_ALT_ACTION_FUNCTION_TRUE_INTERFACE: ConfirmActionConfigurationInterface = {
  title: 'Close without saving',
  message: 'Close Message.',
  confirmButtonText: 'Close',
  successText: 'Closed without saving',
  failText: '',
  useGeneralActionFunc: true,
  actionFunc: () => {}
};
export const CONFIRM_ACTION_CONFIGURATION_SAVE_ALT_ACTION_FUNCTION_FALSE_INTERFACE: ConfirmActionConfigurationInterface = {
  title: 'Close and save',
  message: 'Save Message.',
  confirmButtonText: 'Save',
  successText: 'Save Success',
  failText: 'Save Fail',
  useGeneralActionFunc: false,
  actionFunc: () => {}
};
export const CONFIRM_ACTION_CONFIGURATION_CLOSE_ALT_ACTION_FUNCTION_FALSE_INTERFACE: ConfirmActionConfigurationInterface = {
  title: 'Close without saving',
  message: 'Close Message.',
  confirmButtonText: 'Close',
  successText: 'Closed without saving',
  failText: '',
  useGeneralActionFunc: false,
  actionFunc: () => {}
};

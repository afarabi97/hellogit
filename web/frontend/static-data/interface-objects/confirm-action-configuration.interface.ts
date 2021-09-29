import { ConfirmActionConfigurationInterface } from '../../src/app/interfaces/confirm-action-configuration.interface';

export const ConfirmActionConfigurationSaveAltActionFunctionTrueInterface: ConfirmActionConfigurationInterface = {
  title: 'Close and save',
  message: 'Save Message.',
  confirmButtonText: 'Save',
  successText: 'Save Success',
  failText: 'Save Fail',
  useGeneralActionFunc: true,
  actionFunc: () => {}
};

export const ConfirmActionConfigurationCloseAltActionFunctionTrueInterface: ConfirmActionConfigurationInterface = {
  title: 'Close without saving',
  message: 'Close Message.',
  confirmButtonText: 'Close',
  successText: 'Closed without saving',
  failText: '',
  useGeneralActionFunc: true,
  actionFunc: () => {}
};

export const ConfirmActionConfigurationSaveAltActionFunctionFalseInterface: ConfirmActionConfigurationInterface = {
  title: 'Close and save',
  message: 'Save Message.',
  confirmButtonText: 'Save',
  successText: 'Save Success',
  failText: 'Save Fail',
  useGeneralActionFunc: false,
  actionFunc: () => {}
};

export const ConfirmActionConfigurationCloseAltActionFunctionFalseInterface: ConfirmActionConfigurationInterface = {
  title: 'Close without saving',
  message: 'Close Message.',
  confirmButtonText: 'Close',
  successText: 'Closed without saving',
  failText: '',
  useGeneralActionFunc: false,
  actionFunc: () => {}
};

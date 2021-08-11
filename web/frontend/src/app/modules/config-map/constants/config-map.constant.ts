import { ConfirmActionConfigurationInterface } from '../../../interfaces';

export const CONFIG_MAPS_TITLE: string = 'Config Maps';
export const CLOSE_CONFIRM_ACTION_CONFIGURATION: ConfirmActionConfigurationInterface = {
  title: 'Close without saving',
  message: 'Are you sure you want to close this editor? All changes will be discarded.',
  confirmButtonText: 'Close',
  successText: 'Closed without saving',
  failText: '',
  useGeneralActionFunc: true,
  actionFunc: () => {}
};

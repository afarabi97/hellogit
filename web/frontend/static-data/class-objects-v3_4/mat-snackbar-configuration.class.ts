import { MatSnackbarConfigurationClass } from '../../src/app/classes';

const actionMethod = () => {};

export const MockSnackBarConfigurationActionClass: MatSnackbarConfigurationClass = {
  timeInMS: 10000,
  actionLabel: 'Close',
  action: actionMethod,
  panelClass: 'new-css'
};

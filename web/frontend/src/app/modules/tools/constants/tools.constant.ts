import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION } from '../../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface } from '../../../interfaces';

export const TOOLS_FORM_COMPONENT_TITLE: string = 'Tools';
export const PASSWORD_CONFIRM_DIALOG: ConfirmDialogMatDialogDataInterface = {
  title: 'Kit password change',
  message: 'Are you sure you want to change the Kits password? \
            Doing this will change the root password for all servers and sensors in the Kubernetes cluster.',
  option1: CANCEL_DIALOG_OPTION,
  option2: CONFIRM_DIALOG_OPTION
};
export const NODE_MAINTENANCE_TABLE_COLUMNS: string[] = [ 'node', 'interfaces', 'actions' ];
export const UP: string = 'up';
export const DOWN: string = 'down';
export const ACTIVE: string = 'Active';
export const MAINTENANCE: string = 'Maintenance';

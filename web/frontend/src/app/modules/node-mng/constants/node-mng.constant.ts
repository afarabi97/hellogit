import { MatDialogConfig } from '@angular/material/dialog';
import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION, DIALOG_WIDTH_1000PX } from 'src/app/constants/cvah.constants';

export const NODE_MANAGEMENT_TITLE: string = 'Node Management';
export const NODE_TABLE_COLUMNS: string[] = [ 'hostname', 'ip_address', 'node_type', 'deployment_type', 'state', 'actions' ];
export const SETUP_NODE_TABLE_COLUMNS: string[] = [ 'hostname', 'node_type', 'state' ];
export const DOUBLE_CONFIRM_MESSAGE_REFRESH: string = 'REFRESH';
export const DOUBLE_CONFIRM_MESSAGE_REDEPLOY: string = 'REDEPLOY';
export const MAT_DIALOG_CONFIG__REFRESH_KIT: MatDialogConfig = {
  width: DIALOG_WIDTH_1000PX,
  data: {
    message: 'This operation will destroy the control plane nodes and rebuild them.  \
              The Kubernetes cluster will start fresh after this operation is completed. \n\n \
              **All sensors will be removed during this process.** \n\n \
              Are you sure you want to do this? It so, please type REFRESH and then click Confirm to perform this operation',
    title: 'Refresh Kit Operation',
    option1: CANCEL_DIALOG_OPTION,
    option2: CONFIRM_DIALOG_OPTION,
    message_double_confirm: DOUBLE_CONFIRM_MESSAGE_REFRESH
  }
};
export const MAT_DIALOG_CONFIG__REDEPLOY_KIT: MatDialogConfig = {
  width: DIALOG_WIDTH_1000PX,
  data: {
    message: 'This operation will destroy the cluster and rebuild it.  \n\n \
              The cluster will start fresh after this operation is completed. \n\n \
              Are you sure you want to do this? It so, please type REDEPLOY and then click Confirm to perform this operation',
    title: 'Redeploy Kit Operation',
    option1: CANCEL_DIALOG_OPTION,
    option2: CONFIRM_DIALOG_OPTION,
    message_double_confirm: DOUBLE_CONFIRM_MESSAGE_REDEPLOY
  }
};

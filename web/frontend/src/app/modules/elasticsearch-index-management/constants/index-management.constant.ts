import { MatOptionAltInterface } from '../../../interfaces';

// Tab ttitle for component
export const ELASTICSEARCH_INDEX_MANAGEMENT_TITLE: string = 'Index Management';
// Class name used for host binding
export const HOST_BINDING_CLASS: string = 'cvah-index-management';
export const CLOSE_INDICES: string = 'CloseIndices';
export const BACKUP_INDICES: string = 'BackupIndices';
export const DELETE_INDICES: string = 'DeleteIndices';
// Mat Option list for actions
export const MAT_OPTION_ACTIONS: MatOptionAltInterface[] = [
  {
    value: CLOSE_INDICES,
    name: 'Close',
    isDisabled: false
  },
  {
    value: BACKUP_INDICES,
    name: 'Backup and close',
    isDisabled: true
  },
  {
    value: DELETE_INDICES,
    name: 'Delete',
    isDisabled: false
  }
];

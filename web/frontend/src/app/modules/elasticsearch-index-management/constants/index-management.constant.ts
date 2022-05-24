import { MatOptionInterface2 } from '../../../interfaces';

// Tab ttitle for component
export const ELASTICSEARCH_INDEX_MANAGEMENT_TITLE: string = 'Index Management';
// Class name used for host binding
export const HOST_BINDING_CLASS: string = 'cvah-index-management';
// Mat Option list for actions
export const MAT_OPTION_ACTIONS: MatOptionInterface2[] = [
    {
        value: 'CloseIndices',
        name: 'Close',
        isDisabled: false
    },
    {
        value: 'BackupIndices',
        name: 'Backup and close',
        isDisabled: true
    },
    {
        value: 'DeleteIndices',
        name: 'Delete',
        isDisabled: false
    }
];

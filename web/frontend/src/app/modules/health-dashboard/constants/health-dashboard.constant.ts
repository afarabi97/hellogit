import { ConfirmActionConfigurationInterface } from '../../../interfaces';
import { ColumnDefinitionsInterface } from '../interfaces';

export const BYTES_PER_GIB: number = 1024 * 1024 * 1024;
export const COLUMNS_FOR_DATASTORE_TABLE: string[] = [ 'name', 'free', 'capacity', 'percent_full' ];
export const COLUMNS_FOR_SENSOR_TABLE: string[] = [ 'app', 'total_packets', 'total_packets_dropped' ];
export const COLUMNS_FOR_SERVER_TABLE: string[] = [ 'node_name', 'thread_pool_name', 'rejects' ];
export const COLUMNS_FOR_GROUP_HEADER_TABLE: string[] = [ 'node_name', 'group_status' ];
export const COLUMN_DEFINITIONS_NODES: ColumnDefinitionsInterface[] = [
  { def: 'name', remote_access: true },
  { def: 'address', remote_access: true },
  { def: 'ready', remote_access: true },
  { def: 'type', remote_access: true },
  { def: 'storage', remote_access: true },
  { def: 'memory', remote_access: true },
  { def: 'cpu', remote_access: true },
  { def: 'actions', remote_access: false },
  { def: 'expand_col', remote_access: true }
];
export const COLUMN_DEFINITIONS_PODS: ColumnDefinitionsInterface[] = [
  { def: 'namespace', remote_access: true },
  { def: 'name', remote_access: true },
  { def: 'container_states', remote_access: true },
  { def: 'restart_count', remote_access: true },
  { def: 'actions', remote_access: false }
];
export const CHART_TYPE_PIE: string = 'pie';
export const TITLE_FONT_COLOR: string = '#cfcfcf';
export const SUFFIX_SELECTIONS: string[] = [ '', 'KiB', 'MiB', 'GiB', 'TiB' ];
export const UNASSIGNED: string = 'Unassigned';
export const NODE_NAME: string = 'node_name';
export const CLOSE_CONFIRM_ACTION_CONFIGURATION: ConfirmActionConfigurationInterface = {
  title: 'Close',
  message: '',
  confirmButtonText: 'Close',
  successText: '',
  failText: '',
  useGeneralActionFunc: true,
  actionFunc: () => {}
};

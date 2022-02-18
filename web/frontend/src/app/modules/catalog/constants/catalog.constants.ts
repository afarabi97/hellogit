import { ConfirmActionConfigurationInterface } from '../../../interfaces';
import { ColorsDictInterface, ProcessInterface, ShowChartsInterface, SizeInterface } from '../interfaces';

export const CATALOG_TITLE: string = 'Catalog';
export const ROUTER_CATALOG: string = '/catalog';
export const DEFAULT_SHOW_CHART: ShowChartsInterface = {
  pmo: true,
  community: false
};
export const SHOW_CHART_COOKIE_NAME: string = 'show_chart';
export const HOST_BINDING_CLASS_CHART_LIST_COMPONENT: string = 'cvah-chart-list';
export const HOST_BINDING_CLASS_CATALOG_PAGE_COMPONENT: string = 'cvah-catalog-page';
export const DEFAULT_NODE_BACKGROUND_SIZE: SizeInterface = { height: '118px', width: '143px' };
export const HOVER_COLOR: string = '#222222';
export const WHITE: string = '#FFFFFF';
export const RED: string = '#FF4949';
export const GREEN: string = '#1EB980';
export const YELLOW: string = '#FFD966';
export const COLORS_DICT: ColorsDictInterface = {
  deployed: GREEN,
  'pending install': YELLOW,
  uninstalling: YELLOW,
  uninstalled: RED,
  failed: RED
};
export const COMPLETED: string = 'COMPLETED';
export const DEPLOYED = 'DEPLOYED';
export const FAILED = 'failed';
export const UNKNOWN = 'UNKNOWN';
export const INSTALL = 'install';
export const REINSTALL = 'reinstall';
export const UNINSTALL = 'uninstall';
export const SERVER_ANY_VALUE: string = 'Server - Any';
export const SERVER_VALUE: string = 'Server';
export const SERVICE_VALUE: string = 'Service';
export const SENSOR_VALUE: string = 'Sensor';
export const NODE_TYPE_CONTROL_PLANE: string = 'Control-Plane';
export const ROUTE_REGEX_END: string = '([^\/]+$)';
const INSTALL_PROCESS: ProcessInterface = {
  process: INSTALL,
  name: 'Install',
  children: []
};
const REINSTALL_PROCESS: ProcessInterface = {
  process: REINSTALL,
  name: 'Reinstall',
  children: []
};
const UNINSTALL_PROCESS: ProcessInterface = {
  process: UNINSTALL,
  name: 'Uninstall',
  children: []
};
export const PROCESS_LIST = [ INSTALL_PROCESS, REINSTALL_PROCESS, UNINSTALL_PROCESS ];
export const UPDATE_CONFIRM_ACTION_CONFIGURATION: ConfirmActionConfigurationInterface = {
  title: 'Close and update',
  message: 'Are you sure you want to update this configuration? ' +
           'Doing so will update the application configuration.',
  confirmButtonText: 'Update',
  successText: 'Updated Applcation Configuration',
  failText: 'Could not update',
  useGeneralActionFunc: true,
  actionFunc: () => {}
};
export const CLOSE_CONFIRM_ACTION_CONFIGURATION: ConfirmActionConfigurationInterface = {
  title: 'Close without updating',
  message: 'Are you sure you want to close this editor? All changes will be discarded.',
  confirmButtonText: 'Close',
  successText: 'Closed without updating',
  failText: '',
  useGeneralActionFunc: true,
  actionFunc: () => {}
};

import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION } from 'src/app/constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface } from 'src/app/interfaces';
import { NotificationButtonInterface } from '../interface/notification-button.interface';

// Used for displaying notification sent through websocket and tied to a button for quick access
export const NOTIFICATION_BUTTON_LIST: NotificationButtonInterface[] = [
  { name: 'All', selected: true, title: 'All Messages',role: 'all', notifications: [], icon: 'dashboard' },
  { name: 'Catalog', selected: false, title: 'Catalog Messages',role: 'catalog', notifications: [], icon: 'apps' },
  { name: 'Settings', selected: false, title: 'Settings Messages',role: 'settings', notifications: [], icon: 'layers' },
  { name: 'Nodes', selected: false, title: 'Nodes Messages', role: 'nodes', notifications: [], icon: 'storage' },
  { name: 'RuleSync', selected: false, title: 'RuleSync Messages', role: 'rulesync', notifications: [], icon: 'swap_horiz' },
  { name: 'ES-Scale', selected: false, title: 'ES-Scale Messages', role: 'scale', notifications: [], icon: 'tune' },
  { name: 'Agent', selected: false, title: 'Agent Messages', role: 'agent', notifications: [], icon: 'desktop_windows' },
  { name: 'PCAP', selected: false, title: 'PCAP Replay', role: 'pcap', notifications: [], icon: 'network_check' },
  { name: 'Cold Log Ingest', selected: false, title: 'Cold Log Ingest', role: 'process_logs', notifications: [], icon: 'archive' },
  { name: 'Tools', selected: false, title: 'Tools Messages', role: 'tools', notifications: [], icon: 'build' },
  { name: 'Index Management', selected: false, title: 'Index Management Messages', role: 'curator', notifications: [], icon: 'timeline' }
];
// Used as the default selected button when first opening notification dialog window
export const DEFAULT_SELECTED_NOTIFICATION_BUTTON: NotificationButtonInterface = { name: 'All', selected: true, title: 'All Messages', role: 'all', notifications: [], icon: 'dashboard' };
// Used for notifications dialog window
export const NOTIFICATION_DIALOG_TITLE: string = 'Notifications';
export const DIALOG_MAX_HEIGHT_762PX: string = '762px';
export const DELETE_ALL_NOTIFICATIONS_CONFIRM_DIALOG: ConfirmDialogMatDialogDataInterface = {
  title: 'Delete All Notifications',
  message: 'Are you sure you want to delete all notifications?',
  option1: CANCEL_DIALOG_OPTION,
  option2: CONFIRM_DIALOG_OPTION
};

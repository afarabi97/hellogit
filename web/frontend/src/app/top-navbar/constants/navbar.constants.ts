import { NavGroupInterface } from '../interfaces';

export const allSections: NavGroupInterface[] = [
  { id: 'general', label: '', children: [] },
  { id: 'system_setup', label: 'System Setup', children: [] },
  { id: 'kubernetes', label: 'Kubernetes', children: [] },
  { id: 'policy_mgmt', label: 'Policy Management', children: [] },
  { id: 'Elastic', label: 'Elastic', children: [] },
  { id: 'tools', label: 'Tools', children: [] },
  { id: 'confluence', label: 'Confluence', children: [] },
  { id: 'support', label: 'Support', children: [] }
];
export const WEBSOCKET_MESSAGE_ROLE_DOCUMENNTATION_UPLOAD: string = 'documentation upload';

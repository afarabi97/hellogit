import { NavGroupInterface } from '../interfaces';

export const SYSTEM_NAME_DIP = 'DIP';
export const SYSTEM_NAME_MIP = 'MIP';
export const SYSTEM_NAME_GIP = 'GIP';
export const SYSTEM_NAMES_DIP: string[] = [ SYSTEM_NAME_DIP ];
export const SYSTEM_NAMES_MIP: string[] = [ SYSTEM_NAME_MIP ];
export const SYSTEM_NAMES_DIP_GIP: string[] = [ SYSTEM_NAME_DIP, SYSTEM_NAME_GIP ];
export const SYSTEM_NAMES_ALL: string[] = [ SYSTEM_NAME_DIP, SYSTEM_NAME_MIP, SYSTEM_NAME_GIP ];

export const allSections: NavGroupInterface[] = [
  { id: 'general', label: '', system: SYSTEM_NAMES_ALL, children: [] },
  { id: 'system_setup', label: 'System Setup', system: SYSTEM_NAMES_ALL, children: [] },
  { id: 'kubernetes', label: 'Kubernetes', system: SYSTEM_NAMES_DIP_GIP, children: [] },
  { id: 'policy_mgmt', label: 'Policy Management', system: SYSTEM_NAMES_DIP, children: [] },
  { id: 'Elastic', label: 'Elastic', system: SYSTEM_NAMES_DIP, children: [] },
  { id: 'tools', label: 'Tools', system: SYSTEM_NAMES_ALL, children: [] },
  { id: 'confluence', label: 'Confluence', system: SYSTEM_NAMES_ALL, children: [] },
  { id: 'support', label: 'Support', system: SYSTEM_NAMES_ALL, children: [] }
];

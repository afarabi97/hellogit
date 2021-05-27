import { MatOptionInterface } from '../../../interfaces';

export const RULE_SETS_TITLE: string = 'Rule Sets';
export const ADD_RULE_SET_TITLE: string = 'Add Rule Set';
export const EDIT_RULE_SET_TITLE: string = 'Edit Rule Set';
export const ADD: string = 'add';
export const EDIT: string = 'edit';
export const CLEARANCE_LEVELS: MatOptionInterface[] = [
  { value: 'Unclassified' },
  { value: 'Confidential' },
  { value: 'Secret' },
  { value: 'Top Secret' }
 ];
export const RULE_TYPES: MatOptionInterface[] = [
  { value: 'Suricata' },
  { value: 'Zeek Scripts' },
  { value: 'Zeek Intel' },
  { value: 'Zeek Signatures' },
 ];
export const SURICATA: string = 'suricata';
export const SURICATA_CAP_FIRST: string = 'Suricata';
export const ZEEK: string = 'zeek';
export const ZEEK_CAP_FIRST: string = 'Zeek';
export const ZEEK_SCRIPTS: string = 'Zeek Scripts';
export const ZEEK_INTEL: string = 'Zeek Intel';
export const ZEEK_SIGNATURES: string = 'Zeek Signatures';
export const CATALOG_STATUS_STATUS: string = 'DEPLOYED';

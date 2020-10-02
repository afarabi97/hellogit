import { ProcessInterface } from '../interface';

export const DEPLOYED = 'DEPLOYED';
export const UNKNOWN = 'UNKNOWN';
export const INSTALL = 'install';
export const REINSTALL = 'reinstall';
export const UNINSTALL = 'uninstall';
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

import {
    FilebeatModuleInterface
} from '../../src/app/modules/elasticsearch-cold-log-ingest/interfaces/filebeat-module.interface';
import {
    MockFileSetInterfaceAccessLogs,
    MockFileSetInterfaceAuditdLogs,
    MockFileSetInterfaceErrorLogs
} from './file-set.interface';

export const MockFilebeatModuleInterfaceApache: FilebeatModuleInterface = {
  name: 'Apache',
  value: 'apache',
  filesets: [
    MockFileSetInterfaceErrorLogs,
    MockFileSetInterfaceAccessLogs
  ]
};

export const MockFilebeatModuleInterfaceAuditd: FilebeatModuleInterface = {
  name: 'Auditd',
  value: 'auditd',
  filesets: [
    MockFileSetInterfaceAuditdLogs
  ]
};

export const MockFilebeatModuleInterfaceWindowsEventLogs: FilebeatModuleInterface = {
  name: 'Windows event logs',
  value: 'windows',
  filesets: []
};

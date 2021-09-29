import { FilebeatModuleClass } from '../../src/app/modules/elasticsearch-cold-log-ingest/classes/filebeat-module.class';
import {
    MockFilebeatModuleInterfaceApache,
    MockFilebeatModuleInterfaceAuditd,
    MockFilebeatModuleInterfaceWindowsEventLogs
} from '../interface-objects';

export const MockFilebeatModuleClassApache: FilebeatModuleClass = new FilebeatModuleClass(MockFilebeatModuleInterfaceApache);
export const MockFilebeatModuleClassAuditd: FilebeatModuleClass = new FilebeatModuleClass(MockFilebeatModuleInterfaceAuditd);
export const MockFilebeatModuleClassWindowsEventLogs: FilebeatModuleClass = new FilebeatModuleClass(MockFilebeatModuleInterfaceWindowsEventLogs);

import { StatusClass } from '../../src/app/classes';
import { StatusInterface } from '../../src/app/interfaces';
import {
  MockStatusInterfaceArkimeViewer,
  MockStatusInterfaceArkimeViewerDeployed,
  MockStatusInterfaceArkimeViewerFailed,
  MockStatusInterfaceArkimeViewerPendingInstall,
  MockStatusInterfaceArkimeViewerUninstalled,
  MockStatusInterfaceArkimeViewerUninstalling,
  MockStatusInterfaceLogstashDeployed,
  MockStatusInterfaceLogstashDeployedError,
  MockStatusInterfaceSuricataDeployed
} from '../interface-objects';

export const MockStatusClassLogstashDeployed: StatusClass = new StatusClass(MockStatusInterfaceLogstashDeployed);
export const MockStatusClassLogstashDeployedError: StatusClass = new StatusClass(MockStatusInterfaceLogstashDeployedError);
export const MockStatusClassArkimeViewerDeployed: StatusClass = new StatusClass(MockStatusInterfaceArkimeViewerDeployed);
export const MockStatusClassArkimeViewerPendingInstall: StatusClass = new StatusClass(MockStatusInterfaceArkimeViewerPendingInstall);
export const MockStatusClassArkimeViewerUninstalling: StatusClass = new StatusClass(MockStatusInterfaceArkimeViewerUninstalling);
export const MockStatusClassArkimeViewerUninstalled: StatusClass = new StatusClass(MockStatusInterfaceArkimeViewerUninstalled);
export const MockStatusClassArkimeViewerFailed: StatusClass = new StatusClass(MockStatusInterfaceArkimeViewerFailed);
export const MockStatusClassSuricataDeployed: StatusClass = new StatusClass(MockStatusInterfaceSuricataDeployed);
export const MockStatusClassArkimeViewer: StatusClass[] = MockStatusInterfaceArkimeViewer.map((s: StatusInterface) => new StatusClass(s));

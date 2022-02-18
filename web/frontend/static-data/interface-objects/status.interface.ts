import { StatusInterface } from '../../src/app/interfaces';

export const MockStatusInterfaceArkimeViewer: StatusInterface[] = [
  {
    application: 'arkime-viewer',
    appVersion: '3.1.0',
    status: 'DEPLOYED',
    deployment_name: 'arkime-viewer',
    hostname: 'server',
    node_type: null
  }
];
export const MockStatusInterfaceArkimeViewerDeployed: StatusInterface = {
  application: 'arkime-viewer',
  appVersion: '3.1.0',
  status: 'DEPLOYED',
  deployment_name: 'arkime-viewer',
  hostname: 'server',
  node_type: null
};
export const MockStatusInterfaceArkimeViewerPendingInstall: StatusInterface = {
  application: 'arkime-viewer',
  appVersion: '3.1.0',
  status: 'PENDING INSTALL',
  deployment_name: 'arkime-viewer',
  hostname: 'server',
  node_type: null
};
export const MockStatusInterfaceArkimeViewerUninstalling: StatusInterface = {
  application: 'arkime-viewer',
  appVersion: '3.1.0',
  status: 'UNINSTALLING',
  deployment_name: 'arkime-viewer',
  hostname: 'server',
  node_type: null
};
export const MockStatusInterfaceArkimeViewerUninstalled: StatusInterface = {
  application: 'arkime-viewer',
  appVersion: '3.1.0',
  status: 'UNINSTALLED',
  deployment_name: 'arkime-viewer',
  hostname: 'server',
  node_type: null
};
export const MockStatusInterfaceArkimeViewerFailed: StatusInterface = {
  application: 'arkime-viewer',
  appVersion: '3.1.0',
  status: 'FAILED',
  deployment_name: 'arkime-viewer',
  hostname: 'server',
  node_type: null
};
export const MockStatusInterfaceLogstashDeployed: StatusInterface = {
  appVersion: '4.0.3',
  application: 'logstash',
  deployment_name: 'fake-sensor3-logstash',
  hostname: 'fake-sensor3.fake',
  node_type: 'Sensor',
  status: 'DEPLOYED'
};
export const MockStatusInterfaceLogstashDeployedError: StatusInterface = {
  appVersion: '4.0.3',
  application: 'logstash',
  deployment_name: 'fake-sensor3-logstash',
  hostname: 'fake-sensor3.fake',
  node_type: 'Sensor',
  status: ''
};
export const MockStatusInterfaceSuricataDeployed: StatusInterface = {
  appVersion: '6.0.0',
  application: 'suricata',
  deployment_name: 'fake-sensor3-suricata',
  hostname: 'fake-sensor3.fake',
  node_type: 'Sensor',
  status: 'DEPLOYED',
};


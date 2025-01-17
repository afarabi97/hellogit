import { ChartInterface } from '../../src/app/interfaces';

export const MockChartInterfaceArkime: ChartInterface = {
  application: 'arkime',
  version: '1.0.2',
  appVersion: '3.1.0',
  description: 'Large scale, open source, indexed packet capture and search.',
  pmoSupported: true,
  isSensorApp: true,
  nodes: [
    {
      application: 'arkime',
      appVersion: '3.1.0',
      status: 'DEPLOYED',
      deployment_name: 'fake-sensor3-arkime',
      hostname: 'fake-sensor3.fake',
      node_type: 'Sensor'
    }
  ]
};
export const MockChartInterfaceArkimeViewer: ChartInterface = {
  application: 'arkime-viewer',
  version: '1.0.2',
  appVersion: '3.1.0',
  description: 'Large scale, open source, indexed packet capture and search.',
  pmoSupported: true,
  isSensorApp: false,
  nodes: [
    {
      application: 'arkime-viewer',
      appVersion: '3.1.0',
      status: 'DEPLOYED',
      deployment_name: 'arkime-viewer',
      hostname: 'server',
      node_type: null
    }
  ]
};
export const MockChartInterfaceCortex: ChartInterface = {
  application: 'cortex',
  version: '1.0.3',
  appVersion: '3.1.1-1',
  description: 'Cortex is a Powerful Observable Analysis and Active Response Engine.',
  pmoSupported: true,
  isSensorApp: false,
  nodes: [
    {
      application: 'cortex',
      appVersion: '3.1.1-1',
      status: 'DEPLOYED',
      deployment_name: 'cortex',
      hostname: 'server',
      node_type: null
    }
  ]
};
export const MockChartInterfaceHive: ChartInterface = {
  application: 'hive',
  version: '1.0.5',
  appVersion: '4.1.9-1',
  description: 'TheHive is a scalable 4-in-1 open source and free Security Incident Response Platform.',
  pmoSupported: true,
  isSensorApp: false,
  nodes: [
    {
      application: 'hive',
      appVersion: '4.1.9-1',
      status: 'DEPLOYED',
      deployment_name: 'hive',
      hostname: 'server',
      node_type: null
    }
  ]
};
export const MockChartInterfaceLogstash: ChartInterface = {
  application: 'logstash',
  version: '1.0.2',
  appVersion: '7.16.2',
  description: 'Logstash is an open source, server-side data processing pipeline that ingests data from a multitude of sources simultaneously, transforms it, and then sends it to your favorite stash.',
  pmoSupported: true,
  isSensorApp: false,
  nodes: [
    {
      application: 'logstash',
      appVersion: '7.16.2',
      status: 'DEPLOYED',
      deployment_name: 'logstash',
      hostname: 'server',
      node_type: null
    }
  ]
};
export const MockChartInterfaceMattermost: ChartInterface = {
  application: 'mattermost',
  version: '1.0.3',
  appVersion: '5.38.0',
  description: 'Mattermost is a chat and file sharing platform',
  pmoSupported: false,
  isSensorApp: false,
  nodes: []
};
export const MockChartInterfaceMisp: ChartInterface = {
  application: 'misp',
  version: '1.0.3',
  appVersion: '2.4.148',
  description: 'MISP is a malware information sharing platform',
  pmoSupported: true,
  isSensorApp: false,
  nodes: [
    {
      application: 'misp',
      appVersion: '2.4.148',
      status: 'DEPLOYED',
      deployment_name: 'misp',
      hostname: 'server',
      node_type: null
    }
  ]
};
export const MockChartInterfaceNetflowFilebeat: ChartInterface = {
  application: 'netflow-filebeat',
  version: '1.0.0',
  appVersion: '7.13.1',
  description: 'Using the Netflow module, Filebeat can ingest Netflow data from Routers/Firewalls and export it to Elasticearch in ECS format.  This Data is compatable with the Elastic SIEM.',
  pmoSupported: false,
  isSensorApp: false,
  nodes: []
};
export const MockChartInterfaceNIFI: ChartInterface = {
  application: 'nifi',
  version: '1.0.3',
  appVersion: '1.12.1',
  description: 'Easy to use, powerful, and reliable system to process and distribute data',
  pmoSupported: false,
  isSensorApp: false,
  nodes: []
};
export const MockChartInterfaceRedmine: ChartInterface = {
  application: 'redmine',
  version: '1.0.4',
  appVersion: '4.2.1',
  description: 'Redmine is a flexible project management web application.  Written using the Ruby on Rails framework, it is cross platform and cross-database.',
  pmoSupported: false,
  isSensorApp: false,
  nodes: []
};
export const MockChartInterfaceRemoteHealthAgent: ChartInterface = {
  application: 'remote-health-agent',
  version: '1.0.0',
  appVersion: '3.9.0',
  description: 'Remote health agent pushes health data to central controller',
  pmoSupported: true,
  isSensorApp: false,
  nodes: []
};
export const MockChartInterfaceRocketchat: ChartInterface = {
  application: 'rocketchat',
  version: '1.1.17',
  appVersion: '4.0.1',
  description: 'Prepare to take off with the ultimate chat platform, experience the next level of team communications',
  pmoSupported: true,
  isSensorApp: false,
  nodes: [
    {
      application: 'rocketchat',
      appVersion: '4.0.1',
      status: 'DEPLOYED',
      deployment_name: 'rocketchat',
      hostname: 'server',
      node_type: null
    }
  ]
};
export const MockChartInterfaceSuricata: ChartInterface = {
  application: 'suricata',
  version: '1.0.1',
  appVersion: '6.0.0',
  description: 'Suricata is a free and open source, mature, fast and robust network threat detection engine.',
  pmoSupported: true,
  isSensorApp: true,
  nodes: [
    {
      application: 'suricata',
      appVersion: '6.0.0',
      status: 'DEPLOYED',
      deployment_name: 'fake-sensor3-suricata',
      hostname: 'fake-sensor3.fake',
      node_type: 'Sensor'
    }
  ]
};
export const MockChartInterfaceWikiJs: ChartInterface = {
  application: 'wikijs',
  version: '1.0.3',
  appVersion: '2.5.201',
  description: 'Modern Wiki based on NodeJS',
  pmoSupported: true,
  isSensorApp: false,
  nodes: [
    {
      application: 'wikijs',
      appVersion: '2.5.201',
      status: 'DEPLOYED',
      deployment_name: 'wikijs',
      hostname: 'server',
      node_type: null
    }
  ]
};
export const MockChartInterfaceZeek: ChartInterface = {
  application: 'zeek',
  version: '1.1.5',
  appVersion: '4.0.5',
  description: 'Zeek 4.0.5 with Filebeat (formerly known as Bro) is a powerful network analysis framework that is much different from the typical IDS you may know.',
  pmoSupported: true,
  isSensorApp: true,
  nodes: [
    {
      application: 'zeek',
      appVersion: '4.0.5',
      status: 'DEPLOYED',
      deployment_name: 'fake-sensor3-zeek',
      hostname: 'fake-sensor3.fake',
      node_type: 'Sensor'
    }
  ]
};
export const MockChartInterfaceZeekFailed: ChartInterface = {
  application: 'zeek',
  version: '1.1.5',
  appVersion: '4.0.5',
  description: 'Zeek 4.0.5 with Filebeat (formerly known as Bro) is a powerful network analysis framework that is much different from the typical IDS you may know.',
  pmoSupported: true,
  isSensorApp: true,
  nodes: [
    {
      application: 'zeek',
      appVersion: '4.0.5',
      status: 'failed',
      deployment_name: 'fake-sensor3-zeek',
      hostname: 'fake-sensor3.fake',
      node_type: 'Sensor'
    }
  ]
};
export const MockChartInterfaceZeekUninstalling: ChartInterface = {
  application: 'zeek',
  version: '1.1.5',
  appVersion: '4.0.5',
  description: 'Zeek 4.0.5 with Filebeat (formerly known as Bro) is a powerful network analysis framework that is much different from the typical IDS you may know.',
  pmoSupported: true,
  isSensorApp: true,
  nodes: [
    {
      application: 'zeek',
      appVersion: '4.0.5',
      status: 'uninstalling',
      deployment_name: 'fake-sensor3-zeek',
      hostname: 'fake-sensor3.fake',
      node_type: 'Sensor'
    }
  ]
};
export const MockChartInterfaceArray: ChartInterface[] = [
    MockChartInterfaceArkime,
    MockChartInterfaceArkimeViewer,
    MockChartInterfaceCortex,
    MockChartInterfaceHive,
    MockChartInterfaceLogstash,
    MockChartInterfaceMattermost,
    MockChartInterfaceMisp,
    MockChartInterfaceNetflowFilebeat,
    MockChartInterfaceNIFI,
    MockChartInterfaceRedmine,
    MockChartInterfaceRemoteHealthAgent,
    MockChartInterfaceRocketchat,
    MockChartInterfaceSuricata,
    MockChartInterfaceWikiJs,
    MockChartInterfaceZeek
];

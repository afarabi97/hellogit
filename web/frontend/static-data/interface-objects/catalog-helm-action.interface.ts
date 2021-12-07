import { CatalogHelmActionInterface } from '../../src/app/interfaces';
import { MockRoleProcessInterfaceSensor, MockRoleProcessInterfaceServer } from './role-process.interface';

export const MockCatalogHelmActionInterfaceSensorInstallandReinstall: CatalogHelmActionInterface = {
  ...MockRoleProcessInterfaceSensor,
  values: [
    {
      'fake-sensor3-arkime': {
        image: 'tfplenum/arkime',
        port: 8005,
        domain: 'fake',
        dir: '/opt/tfplenum/arkime',
        path: '/data/moloch',
        config_path: '/opt/tfplenum/arkime/etc',
        pcap_path: '/data/moloch/raw',
        fpc_path: '/data/pcap',
        version: '3.1.0',
        elastic_ingest_nodes: [
          'https://tfplenum-es-data-0.tfplenum-es-data.default.svc.cluster.local:9200',
          'https://tfplenum-es-data-1.tfplenum-es-data.default.svc.cluster.local:9200',
          'https://tfplenum-es-data-2.tfplenum-es-data.default.svc.cluster.local:9200',
          'https://tfplenum-es-data-3.tfplenum-es-data.default.svc.cluster.local:9200'
        ],
        elastic_fqdn: 'elasticsearch.default.svc.cluster.local',
        cpu_request: 100,
        affinity_hostname: 'fake-sensor3.fake',
        mem_limit: '20Gi',
        elastic_port: 9200,
        interfaces: [
          'ens224'
        ],
        bpf: '',
        dontSaveBPFs: '',
        maxFileSizeG: 25,
        freespaceG: '25%',
        spiDataMaxIndices: 5,
        packetThreads:3,
        pcapWriteMethod: 'simple',
        pcapWriteSize: 2560000,
        dbBulkSize: 400000,
        maxESConns: 60,
        maxESRequests: 500,
        packetsPerPoll: 500000,
        magicMode: 'basic',
        tpacketv3BlockSize: 8388608,
        tpacketv3NumThreads: 2,
        maxPacketsInQueue: 400000,
        es_user: 'arkime',
        es_password: 'password',
        rotateIndex: 'hourly6',
        node_hostname: 'fake-sensor3.fake',
        deployment_name: 'fake-sensor3-arkime'
      }
    }
  ]
};
export const MockCatalogHelmActionInterfaceServerInstallandReinstall: CatalogHelmActionInterface = {
  ...MockRoleProcessInterfaceServer,
  values: [
    {
      cortex: {
        elastic_image: 'elasticsearch/elasticsearch:7.15.1',
        cortex_image: 'tfplenum/cortex:3.1.1-1',
        python_image: 'tfplenum/python:3.9.0',
        cortex_port: 9001,
        nginx_image: 'nginx:1.20.1',
        elastic_port: 9200,
        superadmin_username: 'cortex_admin',
        superadmin_password: 'Password!123456',
        org_name: 'thehive',
        org_admin_username: 'admin_thehive',
        org_admin_password: 'Password!123456',
        org_user_username: 'user_thehive',
        misp_user: 'user_misp',
        domain: 'fake',
        auth_base: 'https://controller.fake/auth/realms/CVAH-SSO',
        serviceNode: true,
        node_hostname: 'server',
        deployment_name: 'cortex'
      }
    }
  ]
};
export const MockCatalogHelmActionInterfaceSensorUninstall: CatalogHelmActionInterface = {
  ...MockRoleProcessInterfaceSensor
};
export const MockCatalogHelmActionInterfaceServerIninstall: CatalogHelmActionInterface = {
  ...MockRoleProcessInterfaceServer
};

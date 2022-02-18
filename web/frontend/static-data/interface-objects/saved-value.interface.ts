import { SavedValueInterface } from '../../src/app/interfaces';

export const MockSavedValueInterfaceArkime: SavedValueInterface[] = [
  {
    _id: '61be79ae0d915a1a974cf511',
    application: 'arkime',
    deployment_name: 'fake-sensor3-arkime',
    values: {
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
      cpu_request: 1000,
      affinity_hostname: 'fake-sensor3.fake',
      mem_limit: '7Gi',
      elastic_port: 9200,
      interfaces: [
        'ens224'
      ],
      bpf: '',
      dontSaveBPFs: '',
      maxFileSizeG: 25,
      freespaceG: '25%',
      spiDataMaxIndices: 5,
      packetThreads: 3,
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
];
export const MockSavedValueInterfaceArkimeViewer: SavedValueInterface[] = [
  {
    _id: '62049f0d3f30b99b368cac45',
    application: 'arkime-viewer',
    deployment_name: 'arkime-viewer',
    values: {
        image: 'tfplenum/arkime',
        port: '8005',
        domain: 'fake',
        auth_base: 'https://controller.fake/auth/realms/CVAH-SSO',
        username: 'assessor',
        password: 'Password!123456',
        dir: '/opt/tfplenum/arkime',
        path: '/data/moloch',
        config_path: '/opt/tfplenum/arkime/etc',
        elastic_data_nodes: [
            'https://tfplenum-es-data-0.tfplenum-es-data.default.svc.cluster.local:9200',
            'https://tfplenum-es-data-1.tfplenum-es-data.default.svc.cluster.local:9200',
            'https://tfplenum-es-data-2.tfplenum-es-data.default.svc.cluster.local:9200',
            'https://tfplenum-es-data-3.tfplenum-es-data.default.svc.cluster.local:9200'
        ],
        version: '3.1.0',
        cpu_request: 1000,
        elastic_port: 9200,
        maxESConns: '30',
        maxESRequests: '500',
        packetsPerPoll: '500000',
        maxPacketsInQueue: '400000',
        es_user: 'arkime',
        es_password: 'password',
        proxy: {
            image: 'tfplenum/shibboleth_proxy',
            version: '3.0.4'
        },
        serviceNode: true,
        node_hostname: 'server',
        deployment_name: 'arkime-viewer'
    }
  }
];
export const MockSavedValueInterfaceSuricata: SavedValueInterface[] = [
  {
      _id: '620be71c3f30b97dc4f07eb1',
      application: 'suricata',
      deployment_name: 'fake-sensor3-suricata',
      values: {
          kibana_fqdn: 'kibana.default.svc.cluster.local',
          kibana_port: 443,
          elastic_ingest_nodes: [
              'https://tfplenum-es-data-0.tfplenum-es-data.default.svc.cluster.local:9200',
              'https://tfplenum-es-data-1.tfplenum-es-data.default.svc.cluster.local:9200',
              'https://tfplenum-es-data-2.tfplenum-es-data.default.svc.cluster.local:9200',
              'https://tfplenum-es-data-3.tfplenum-es-data.default.svc.cluster.local:9200'
          ],
          logstash_nodes: [],
          suricata_directory: '/opt/tfplenum/suricata',
          suricata_threads: '8',
          home_net: [
              '192.168.0.0/24'
          ],
          external_net: '',
          interfaces: [
              'ens224'
          ],
          image_name: 'tfplenum/suricata',
          image_tag: '6.0.0',
          cpu_request: 1000,
          affinity_hostname: 'fake-sensor3.fake',
          suricata_log_path: '/data/suricata',
          filebeat_image_name: 'beats/filebeat',
          filebeat_image_tag: '7.15.1',
          pcapEnabled: false,
          fpc_path: '/data/pcap',
          flow: false,
          shards: 4,
          hard_disk_drive: true,
          use_logstash: false,
          log_types: [
              'alert',
              'http',
              'dns',
              'tls',
              'flow',
              'other'
          ],
          node_hostname: 'fake-sensor3.fake',
          deployment_name: 'fake-sensor3-suricata'
      }
  }
];

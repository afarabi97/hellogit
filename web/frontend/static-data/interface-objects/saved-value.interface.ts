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

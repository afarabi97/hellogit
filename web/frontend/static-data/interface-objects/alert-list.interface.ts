import { AlertListInterface } from '../../src/app/modules/security-alerts/interfaces';

export const MockAlertListInterfaceZeek: AlertListInterface = {
  took: 4,
  timed_out: false,
  _shards: {
    total: 9,
    successful: 9,
    skipped: 0,
    failed: 0
  },
  hits: {
    total: {
      value: 1,
      relation: 'eq'
    },
    max_score: 7.2962856,
    hits: [
      {
        _index: 'filebeat-zeek-2022.09.20-000001',
        _type: '_doc',
        _id: 'UspXWYMBVQ14yCflYk8E',
        _score: 7.2962856,
        _source: {
          agent: {
            hostname: 'philpot-sensor3-zeek-filebeat-74f586fbbc-qr7q6',
            name: 'philpot-sensor3-zeek',
            id: '8066cc3b-9f14-4e5a-af96-334025b08f91',
            type: 'filebeat',
            ephemeral_id: 'af5dd52f-85b7-4895-b30d-a5e8f954591d',
            version: '7.16.2'
          },
          log: {
            file: {
              path: '/var/log/bro/current/weird.log'
            },
            offset: 0
          },
          destination: {
            address: '192.168.0.2',
            port: 445,
            ip: '192.168.0.2'
          },
          rule: {
            name: 'active_connection_reuse'
          },
          zeek: {
            weird: {
              peer: 'worker-0-5',
              name: 'active_connection_reuse',
              source: 'TCP',
              notice: false
            },
            session_id: 'Cbp56d27iubMu36dEh'
          },
          source: {
            address: '192.168.0.1',
            port: 53235,
            ip: '192.168.0.1'
          },
          fileset: {
            name: 'weird'
          },
          tags: [
            'forwarded'
          ],
          input: {
            type: 'log'
          },
          observer: {
            hostname: 'philpot-sensor3.philpot'
          },
          '@timestamp': '2022-09-20T05:05:20.098Z',
          ecs: {
            version: '1.12.0'
          },
          related: {
            ip: [
              '192.168.0.1',
              '192.168.0.2'
            ]
          },
          service: {
            type: 'zeek'
          },
          'network.direction': 'internal',
          event: {
            ingested: '2022-09-20T05: 20: 42.496192363Z',
            kind: 'alert',
            created: '2022-09-20T05: 20: 32.466Z',
            module: 'zeek',
            id: 'Cbp56d27iubMu36dEh',
            type: [
              'info'
            ],
            category: [
              'network'
            ],
            dataset: 'zeek.weird'
          }
        }
      }
    ]
  }
};
export const MockAlertListInterfaceSuricata: AlertListInterface = {
  took: 8,
  timed_out: false,
  _shards: {
    total: 9,
    successful: 9,
    skipped: 0,
    failed: 0
  },
  hits: {
    total: {
      value: 50,
      relation: 'eq'
    },
    max_score: 6.560818,
    hits: [
      {
        _index: 'filebeat-suricata-2022.09.20-000001',
        _type: '_doc',
        _id: 'EMtUWYMBSLSXJ9s4fedn',
        _score: 6.560818,
        _source: {
          agent: {
            hostname: 'philpot-sensor3-suricata-filebeat-7566879bb-lz5zh',
            name: 'philpot-sensor3-suricata-alert',
            id: '3ceb525f-34d8-473c-a38d-0b3f409172fe',
            ephemeral_id: '90caf684-e7be-4b7a-9b15-42a78aa5bf93',
            type: 'filebeat',
            version: '7.16.2'
          },
          log: {
            file: {
              path: '/data/suricata/eve-alerts-2022-09-20-05-05.json'
            },
            offset: 0
          },
          destination: {
            address: '192.168.116.172',
            port: 445,
            bytes: 2335,
            ip: '192.168.116.172',
            packets: 29
          },
          rule: {
            name: 'ET EXPLOIT ETERNALBLUE Exploit M2 MS17-010',
            id: '2024297',
            category: 'Attempted Administrator Privilege Gain'
          },
          source: {
            address: '192.168.116.149',
            port: 50742,
            bytes: 71169,
            ip: '192.168.116.149',
            packets: 58
          },
          fileset: {
            name: 'eve'
          },
          message: 'Attempted Administrator Privilege Gain',
          tags: [
            'forwarded'
          ],
          network: {
            community_id: '1:4ni/9yksdaozjyi5OSBdHnZUgfg=',
            protocol: 'smb',
            bytes: 73504,
            transport: 'tcp',
            packets: 87
          },
          observer: {
            hostname: 'philpot-sensor3.philpot'
          },
          input: {
            type: 'log'
          },
          '@timestamp': '2022-09-20T05:05:20.098Z',
          ecs: {
            version: '1.12.0'
          },
          related: {
            ip: [
              '192.168.116.149',
              '192.168.116.172'
            ]
          },
          service: {
            type: 'suricata'
          },
          suricata: {
            eve: {
              in_iface: 'ens224',
              community_id: '1:4ni/9yksdaozjyi5OSBdHnZUgfg=',
              event_type: 'alert',
              alert: {
                rev: 2,
                metadata: {
                  performance_impact: [
                    'Low'
                  ],
                  affected_product: [
                    'Windows_XP_Vista_7_8_10_Server_32_64_Bit'
                  ],
                  former_category: [
                    'CURRENT_EVENTS'
                  ],
                  signature_severity: [
                    'Major'
                  ],
                  deployment: [
                    'Perimeter'
                  ]
                },
                signature_id: 2024297,
                gid: 1,
                attack_target: [
                  'Client_Endpoint'
                ],
                updated_at: '2017-07-06T00:00:00.000Z',
                signature: 'ET EXPLOIT ETERNALBLUE Exploit M2 MS17-010',
                created_at: '2017-05-16T00:00:00.000Z',
                category: 'Attempted Administrator Privilege Gain'
              },
              flow_id: '1947148269736306',
              flow: {}
            }
          },
          event: {
            severity: 1,
            ingested: '2022-09-20T05:17:32.786574060Z',
            original: '{}',
            created: '2022-09-20T05:16:58.281Z',
            kind: 'alert',
            module: 'suricata',
            start: '2022-09-20T05:00:33.282Z',
            category: [
              'network',
              'intrusion_detection'
            ],
            type: [
              'allowed'
            ],
            dataset: 'suricata.eve'
          },
          'network.direction': 'internal'
        }
      }
    ]
  }
};
export const MockAlertListInterfaceSignal: AlertListInterface = {
  took: 6,
  timed_out: false,
  _shards: {
    total: 1,
    successful: 1,
    skipped: 0,
    failed: 0
  },
  hits: {
    total: {
      value: 24,
      relation: 'eq'
    },
    max_score: 1.7239166,
    hits: [
      {
        _index: '.siem-signals-default-000001',
        _type: '_doc',
        _id: '9d57dff2fe6c00030c3ae5f8e24522b7a23e835d3a172d4bdc7fd7a6857b011d',
        _score: 1.7239166,
        _source: {
          '@timestamp': '2022-10-12T14:23:53.548Z',
          signal: {
            rule: {
              name: 'Sudoers File Modification'
            }
          },
          event: {
            kind: 'signal',
            module: 'auditd'
          }
        }
      }
    ]
  }
};
export const MockAlertListInterfaceEndgame: AlertListInterface = {
  took: 6,
  timed_out: false,
  _shards: {
    total: 1,
    successful: 1,
    skipped: 0,
    failed: 0
  },
  hits: {
    total: {
      value: 24,
      relation: 'eq'
    },
    max_score: 1.7239166,
    hits: [
      {
        _index: '.siem-signals-default-000001',
        _type: '_doc',
        _id: '9d57dff2fe6c00030c3ae5f8e24522b7a23e835d3a172d4bdc7fd7a6857b011d',
        _score: 1.7239166,
        _source: {
          '@timestamp': '2022-10-12T14:23:53.548Z',
          event: {
            kind: 'alert',
            module: 'endgame'
          }
        }
      }
    ]
  }
};

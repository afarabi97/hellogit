import { ChartInfoInterface } from '../../src/app/interfaces';

export const MockChartInfoInterfaceArkime: ChartInfoInterface = {
  id: 'arkime',
  version: '1.0.2',
  description: 'Large scale, open source, indexed packet capture and search.',
  appVersion: '3.1.0',
  formControls: [
    {
      type: 'checkbox',
      default_value: 'simple',
      description: 'Enable writing PCAPs (do not enable this and Suricata PCAP at the same time)',
      trueValue: 'simple',
      falseValue: 'disablepcap',
      name: 'pcapWriteMethod'
    },
    {
      type: 'textinput',
      default_value: '',
      description: 'Enter BPF (packet filter applied to all traffic)',
      required: false,
      regexp: '',
      name: 'bpf'
    },
    {
      type: 'textinput',
      default_value: '',
      description: 'Enter dontSaveBPFs (bpf filter to NOT save to disk)',
      required: false,
      regexp: '',
      name: 'dontSaveBPFs'
    },
    {
      type: 'textinput',
      default_value: '25%',
      description: 'Enter freespaceG (can be number of Gigs to keep free, or a percentage of disk)',
      required: false,
      regexp: '^(\\d+|\\d{1,2}%)$',
      name: 'freespaceG',
      error_message: 'Enter a number or a percentage'
    },
    {
      type: 'textinput',
      default_value: '25',
      description: 'Enter maxFileSizeG (max size per PCAP)',
      required: false,
      regexp: '^\\d+$',
      name: 'maxFileSizeG',
      error_message: 'Enter a number'
    },
    {
      type: 'textinput',
      default_value: 'basic',
      description: 'Enter magicMode',
      required: false,
      regexp: '^(libmagic|libmagicnotext|molochmagic|both|basic|none)$',
      name: 'magicMode',
      error_message: 'Enter a valid setting'
    },
    {
      type: 'textinput',
      default_value: '20Gi',
      description: 'Enter Arkime memory limit',
      required: false,
      regexp: '^(\\d?[1-9]|[1-9]0)Gi$',
      name: 'mem_limit',
      error_message: 'Enter a valid setting'
    },
    {
      type: 'textinput',
      default_value: '3',
      description: 'Enter number of threads to use to process packets.',
      required: false,
      regexp: '^\\d+$',
      name: 'packetThreads',
      error_message: 'Enter a number'
    },
    {
      type: 'textinput',
      default_value: '2',
      description: 'Enter number of threads used to read packets from each interface.',
      required: false,
      regexp: '^\\d+$',
      name: 'tpacketv3NumThreads',
      error_message: 'Enter a number'
    },
    {
      type: 'textinput',
      default_value: '400000',
      description: 'Enter number of packets per packet thread that can be waiting to be processed.',
      required: false,
      regexp: '^\\d+$',
      name: 'maxPacketsInQueue',
      error_message: 'Enter a number'
    },
    {
      type: 'interface',
      default_value: '',
      description: 'Select your network interfaces',
      required: true,
      name: 'interfaces'
    },
    {
      type: 'invisible',
      name: 'affinity_hostname'
    },
    {
      type: 'invisible',
      name: 'node_hostname'
    }
  ],
  type: 'chart',
  node_affinity: 'Sensor',
  devDependent: 'arkime-viewer'
};
export const MockChartInfoInterfaceArkimeViewerReinstallorUninstall: ChartInfoInterface = {
  id: 'arkime-viewer',
  version: '1.0.3',
  description: 'Large scale, open source, indexed packet capture and search.',
  appVersion: '3.1.0',
  formControls: [
      {
          type: 'service-node-checkbox',
          default_value: false,
          description: 'Install App on Service Node',
          trueValue: true,
          falseValue: false,
          name: 'serviceNode'
      },
      {
          type: 'textinput',
          default_value: 'assessor',
          description: 'Enter arkime user name',
          required: true,
          regexp: '',
          name: 'username',
          error_message: 'Enter a value'
      },
      {
          type: 'textinput',
          description: 'Enter arkime password',
          required: true,
          name: 'password',
          default_value: 'Password!123456',
          regexp: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()<>.?])[A-Za-z\\d!@#$%^&*()<>.?]{15,}$',
          error_message: 'Please enter a vaild password it must have a minimum of fifteen characters, at least one uppercase letter, one lowercase letter, one number and one special character.  Valid special characters !@#$%^&*()<>.?).\n'
      },
      {
          type: 'invisible',
          name: 'node_hostname'
      }
  ],
  type: 'chart',
  node_affinity: 'Server - Any',
  devDependent: null
};
export const MockChartInfoInterfaceMisp: ChartInfoInterface = {
  id: 'misp',
  version: '1.0.4',
  description: 'MISP is a malware information sharing platform',
  appVersion: '2.4.148',
  formControls: [
      {
          type: 'service-node-checkbox',
          default_value: false,
          description: 'Install App on Service Node',
          trueValue: true,
          falseValue: false,
          name: 'serviceNode'
      },
      {
          type: 'textinput',
          description: 'Enter admin password.',
          required: true,
          name: 'admin_pass',
          default_value: 'Password!123456',
          regexp: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()<>.?])[A-Za-z\\d!@#$%^&*()<>.?]{15,}$',
          error_message: 'Please enter a vaild password it must have a minimum of fifteen characters, at least one uppercase letter, one lowercase letter, one number and one special character.  Valid special characters !@#$%^&*()<>.?).\n'
      },
      {
          type: 'textinput',
          default_value: 'CPT HUNT',
          description: 'Enter Default Organization Name. Recommend making it unique if connected to a GIP or other DIPs\n',
          required: true,
          regexp: '',
          name: 'org_name',
          error_message: 'Enter a value'
      },
      {
          type: 'checkbox',
          default_value: true,
          description: 'Integrate with Cortex (Requires Cortex to be installed first, verify Cortex is up and running before continuing)\n',
          trueValue: true,
          falseValue: false,
          name: 'cortexIntegration',
          dependent_app: 'cortex'
      },
      {
          type: 'invisible',
          name: 'node_hostname'
      }
  ],
  type: 'chart',
  node_affinity:' Server - Any',
  devDependent: null
};
export const MockChartInfoInterfaceSuricata: ChartInfoInterface = {
  id: 'suricata',
  version: '1.0.2',
  description: 'Suricata is a free and open source, mature, fast and robust network threat detection engine.',
  appVersion: '6.0.0',
  formControls: [
      {
          type: 'checkbox',
          default_value: false,
          description: 'Enable writing PCAPs (do not enable this and Arkime PCAP at the same time)',
          trueValue: true,
          falseValue: false,
          name: 'pcapEnabled'
      },
      {
          type: 'checkbox',
          default_value: false,
          description: 'Send to logstash instead of directly to Elasticsearch (Requires Logstash to be installed first, verify Logstash is up and running before continuing)\n',
          trueValue: true,
          falseValue: false,
          name: 'use_logstash',
          dependent_app: 'logstash'
      },
      {
          type: 'textinputlist',
          default_value: '[\'192.168.0.0/24\]',
          description: 'Enter your home/defended network in this format [\'home network IP 1\',\' home network IP 2\'] or [\'any\']',
          required: true,
          regexp: '^\\[\\s*(\'(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))\'\\s*,\\s*)*(\'(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))\')\\s*\\]$',
          name: 'home_net',
          error_message: 'Enter a valid IP in a bracket array (EX: [\'192.168.0.0/24\'] or [\'any\']) with the brackets.'
      },
      {
          type: 'textinputlist',
          default_value: '',
          description: 'Enter your external/untrusted network (defaults to !home_net) [\'external network IP 1\', \' external network IP 2\'] or [\'any\']\n',
          required: false,
          regexp: '^(\\s*|\\[\\s*(\'(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))\'\\s*,\\s*)*(\'(any|(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/(3[0-2]|[1-2]?[1-9]))\')\\s*\\])$',
          name: 'external_net',
          error_message: 'Enter a valid IP in a bracket array (EX: [\'192.168.0.0/24\'] or [\'any\']) with the brackets.'
      },
      {
          type: 'interface',
          default_value: '',
          description: 'Select the interfaces to listen on',
          required: true,
          regexp: '',
          name: 'interfaces',
          error_message: 'Select one or more interfaces'
      },
      {
          type: 'textinput',
          default_value: '8',
          description: 'Enter the number of Suricata threads per interface',
          required: true,
          regexp: '^\\d+$',
          name: 'suricata_threads',
          error_message: 'Enter a valid number'
      },
      {
          type: 'invisible',
          name: 'affinity_hostname'
      },
      {
          type: 'invisible',
          name: 'node_hostname'
      },
      {
          type: 'suricata-list',
          default_value: [
              'alert',
              'http',
              'dns',
              'tls',
              'flow',
              'other'
          ],
          description: 'List of Suricata log types. Uncheck any that are not needed.',
          required: true,
          regexp: '',
          name: 'log_types',
          error_message: 'Please select a log type'
      }
  ],
  type: 'chart',
  node_affinity: 'Sensor',
  devDependent: null
};

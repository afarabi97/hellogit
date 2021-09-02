import {
    WinlogbeatConfigurationInterface
} from '../../src/app/modules/elasticsearch-cold-log-ingest/interfaces/winlogbeat-configuration.interface';

export const MockWinlogbeatConfigurationInterface: WinlogbeatConfigurationInterface = {
  windows_host: '192.168.0.1',
  username: 'admin',
  password: 'password',
  winrm_port: 5985,
  winrm_scheme: 'https',
  winrm_transport: 'ntlm'
};

export const MockWinlogbeatConfigurationInterfaceDefault: WinlogbeatConfigurationInterface = {
  windows_host: '',
  username: '',
  password: '',
  winrm_port: 0,
  winrm_scheme: '',
  winrm_transport: ''
};

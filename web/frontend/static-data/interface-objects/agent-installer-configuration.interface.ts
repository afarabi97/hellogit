import { AgentInstallerConfigurationInterface } from '../../src/app/modules/agent-builder-chooser/interfaces';
import {
  MockElementSpecInterface1,
  MockElementSpecInterface2,
  MockElementSpecInterface3,
  MockElementSpecInterface4
} from './element-spec.interface';

export const MockAgentInstallerConfigurationInterface1: AgentInstallerConfigurationInterface = {
  _id: '1',
  config_name: 'Fake Config 1',
  install_endgame: true,
  endgame_sensor_id: '1',
  endgame_sensor_name: 'sensor 1',
  endgame_server_ip: '1',
  endgame_port: '443',
  endgame_user_name: 'Test',
  endgame_password: 'Password',
  customPackages: {
    'App Config 1': {
      username: MockElementSpecInterface1,
      password: MockElementSpecInterface2
    },
    'App Config 2': {
      description: MockElementSpecInterface3,
      is_admin: MockElementSpecInterface4
    }
  }
};
export const MockAgentInstallerConfigurationInterface2: AgentInstallerConfigurationInterface = {
  _id: '2',
  config_name: 'Fake Config 2',
  install_endgame: true,
  endgame_sensor_id: '2',
  endgame_sensor_name: 'sensor 2',
  endgame_server_ip: '2',
  endgame_port: '443',
  endgame_user_name: 'Test',
  endgame_password: 'Password',
  customPackages: null
};
export const MockAgentInstallerConfigurationInterface3: AgentInstallerConfigurationInterface = {
  _id: '3',
  config_name: 'Fake Config 3',
  install_endgame: false,
  endgame_sensor_id: '3',
  endgame_sensor_name: 'sensor 3',
  endgame_server_ip: '3',
  endgame_port: '443',
  endgame_user_name: 'Test',
  endgame_password: 'Password',
  customPackages: {
    'App Config 2': {
      description: MockElementSpecInterface3,
      is_admin: MockElementSpecInterface4
    }
  }
};
export const MockAgentInstallerConfigurationInterface4: AgentInstallerConfigurationInterface = {
  _id: '4',
  config_name: 'Fake Config 4',
  install_endgame: true,
  endgame_sensor_id: '4',
  endgame_sensor_name: 'sensor 4',
  endgame_server_ip: '4',
  endgame_port: '443',
  endgame_user_name: 'Test',
  endgame_password: 'Password',
  customPackages: null
};
export const MockAgentInstallerConfigurationInterfacesArray: AgentInstallerConfigurationInterface[] = [
  MockAgentInstallerConfigurationInterface1,
  MockAgentInstallerConfigurationInterface2,
  MockAgentInstallerConfigurationInterface3,
  MockAgentInstallerConfigurationInterface4
];

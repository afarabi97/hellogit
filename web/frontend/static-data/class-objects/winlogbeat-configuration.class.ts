import {
    WinlogbeatConfigurationClass,
} from '../../src/app/modules/elasticsearch-cold-log-ingest/classes/winlogbeat-configuration.class';
import { MockWinlogbeatConfigurationInterface, MockWinlogbeatConfigurationInterfaceDefault } from '../interface-objects';

export const MockWinlogbeatConfigurationClass: WinlogbeatConfigurationClass = new WinlogbeatConfigurationClass(MockWinlogbeatConfigurationInterface);

export const MockWinlogbeatConfigurationClassDefault: WinlogbeatConfigurationClass = new WinlogbeatConfigurationClass(MockWinlogbeatConfigurationInterfaceDefault);

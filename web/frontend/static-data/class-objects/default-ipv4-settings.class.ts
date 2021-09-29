import { DefaultIPV4SettingsClass } from '../../src/app/classes';
import { MockDefaultIPV4SettingsSensorInterface, MockDefaultIPV4SettingsServerInterface } from '../interface-objects';

export const MockDefaultIPV4SettingsServerClass: DefaultIPV4SettingsClass = new DefaultIPV4SettingsClass(MockDefaultIPV4SettingsServerInterface);
export const MockDefaultIPV4SettingsSensorClass: DefaultIPV4SettingsClass = new DefaultIPV4SettingsClass(MockDefaultIPV4SettingsSensorInterface);

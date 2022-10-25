import { HiveSettingsClass } from '../../src/app/classes';
import {
  MockHiveSettingsInterface,
  MockHiveSettingsInterfaceAdminApiKeyDefaultText,
  MockHiveSettingsInterfaceAdminApiKeyEmpty
} from '../interface-objects';

export const MockHiveSettingsClass: HiveSettingsClass = new HiveSettingsClass(MockHiveSettingsInterface);
export const MockHiveSettingsClassAdminApiKeyEmpty: HiveSettingsClass = new HiveSettingsClass(MockHiveSettingsInterfaceAdminApiKeyEmpty);
export const MockHiveSettingsClassAdminApiKeyDefaultText: HiveSettingsClass = new HiveSettingsClass(MockHiveSettingsInterfaceAdminApiKeyDefaultText);

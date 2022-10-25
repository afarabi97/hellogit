import { HiveSettingsInterface } from '../../src/app/interfaces';

export const MockHiveSettingsInterface: HiveSettingsInterface = {
  admin_api_key: 'NiyCtg8cRn+37mP3MtCAuTWBOpOQ0COy',
  org_admin_api_key: 'szf7j42ACKZ08OD14QXGlW4Jvjy/7GQn'
};
export const MockHiveSettingsInterfaceAdminApiKeyEmpty: HiveSettingsInterface = {
  admin_api_key: '',
  org_admin_api_key: ''
};
export const MockHiveSettingsInterfaceAdminApiKeyDefaultText: HiveSettingsInterface = {
  admin_api_key: 'org_admin_api_key',
  org_admin_api_key: 'org_admin_api_key'
};

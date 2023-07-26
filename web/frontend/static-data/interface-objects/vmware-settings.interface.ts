import { VMWareSettingsInterface } from '../../src/app/interfaces';

export const MockVMWareSettingsInterface: VMWareSettingsInterface = {
  "_id": "esxi_settings_form",
  "ip_address": "10.10.200.200",
  "username": "test.gitlab@test.lab",
  "password": "1qaz2wsx!QAZ@WSX",
  "datastore": "DEV-vSAN",
  "vcenter": true,
  "folder": "Test",
  "datacenter": "DEV_Datacenter",
  "portgroup": "31-Dev21-Test",
  "cluster": "DEV_Cluster"
};

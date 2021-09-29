import { RuleSetInterface } from '../../src/app/interfaces';
import { MockHostInfoInterface } from './host-info.interface';
import { MockRuleForDeleteInterface } from './rule.interface';

export const MockRuleSetInterface: RuleSetInterface = {
  _id: 1,
  rules: [],
  appType: 'Suricata',
  clearance: 'Unclassified',
  name: 'MockRuleSet',
  sensors: [
    {
      hostname: 'test-sensor1.lan',
      mac: '00:50:56:9d:79:28',
      management_ip: '172.16.83.67'
    }],
  state: 'Created',
  createdDate: '2020-02-27 00:08:58',
  lastModifiedDate: '2020-02-27 00:08:58',
  isEnabled: true
};

export const MockRuleSetDisabledInterface: RuleSetInterface = {
  _id: 1,
  rules: [],
  appType: 'Suricata',
  clearance: 'Unclassified',
  name: 'MockRuleSet',
  sensors: [
    {
      hostname: 'test-sensor1.lan',
      mac: '00:50:56:9d:79:28',
      management_ip: '172.16.83.67'
    }],
  state: 'Created',
  createdDate: '2020-02-27 00:08:58',
  lastModifiedDate: '2020-02-27 00:08:58',
  isEnabled: false
};

export const MockRuleSetForDeleteInterface: RuleSetInterface = {
  _id: 1321,
  rules: [
    MockRuleForDeleteInterface
  ],
  appType: 'Suricata',
  clearance: 'Unclassified',
  name: 'MockRuleSet',
  sensors: [
    MockHostInfoInterface
  ],
  state: 'Created',
  createdDate: '2020-02-27 00:08:58',
  lastModifiedDate: '2020-02-27 00:08:58',
  isEnabled: true
};

export const MockArrayRuleSetInterface: RuleSetInterface[] = [
  {
    _id: 73334,
    rules: [],
    appType: 'Suricata',
    clearance: 'Unclassified',
    createdDate: '2020-02-06 05:32:53',
    isEnabled: false,
    lastModifiedDate: '2020-02-27 00:11:41',
    name: 'Emerging Threats',
    sensors: [],
    state: 'Dirty'
  },
  {
    _id: 73337,
    rules: [],
    appType: 'Suricata',
    clearance: 'Secret',
    createdDate: '2020-02-26 14:31:18',
    isEnabled: false,
    lastModifiedDate: '2020-02-26 23:49:30',
    name: 'test',
    sensors: [
      MockHostInfoInterface
    ],
    state: 'Dirty'
  },
  {
    _id: 73340,
    rules: [],
    appType: 'Suricata',
    clearance: 'Unclassified',
    createdDate: '2020-02-27 00:08:58',
    isEnabled: true,
    lastModifiedDate: '2020-02-27 00:08:58',
    name: 'test1',
    sensors: [
      MockHostInfoInterface
    ],
    state: 'Created'
  },
  MockRuleSetInterface,
  MockRuleSetForDeleteInterface
];

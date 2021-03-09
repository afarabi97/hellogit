import { RuleSetClass } from '../../src/app/classes';
import { MockHostInfoClass } from './host-info.class';
import { MockRuleClass, MockRuleForDeleteClass } from './rule.class';

export const MockRuleSetClass: RuleSetClass = {
  _id: 1,
  rules: [
    MockRuleClass
  ],
  appType: 'Suricata',
  clearance: 'Unclassified',
  name: 'MockRuleSet',
  sensors: [
    {
      hostname: 'test-sensor1.lan',
      mac: '00:50:56:9d:79:28',
      management_ip: '172.16.83.67'
    }
  ],
  state: 'Created',
  createdDate: '2020-02-27 00:08:58',
  lastModifiedDate: '2020-02-27 00:08:58',
  isEnabled: true
};

export const MockRuleSetForDeleteClass: RuleSetClass = {
  _id: 1321,
  rules: [
    MockRuleForDeleteClass
  ],
  appType: 'Suricata',
  clearance: 'Unclassified',
  name: 'MockRuleSet',
  sensors: [
    MockHostInfoClass
  ],
  state: 'Created',
  createdDate: '2020-02-27 00:08:58',
  lastModifiedDate: '2020-02-27 00:08:58',
  isEnabled: true
};

export const MockArrayRuleSetClass: RuleSetClass[] = [
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
      MockHostInfoClass
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
      MockHostInfoClass
    ],
    state: 'Created'
  },
  MockRuleSetClass,
  MockRuleSetForDeleteClass
];

import { RuleClass } from '../../src/app/classes';

export const MockRuleClass: RuleClass = {
  _id: 100,
  ruleName: 'FakeRuleName',
  rule: 'FakeRule',
  createdDate: '2020-02-27 00:08:58',
  lastModifiedDate: '2020-02-27 00:08:58',
  isEnabled: true,
  byPassValidation: false,
  rule_set_id: 1
};

export const MockRuleForToggleClass: RuleClass = {
  _id: 10,
  ruleName: 'FakeRuleNameToggle',
  rule: 'FakeRule',
  createdDate: '2020-02-27 00:08:58',
  lastModifiedDate: '2020-02-27 00:08:58',
  isEnabled: true,
  byPassValidation: false,
  rule_set_id: 0
};

export const MockRuleForToggleDisabledClass: RuleClass = {
  _id: 10,
  ruleName: 'FakeRuleNameToggle',
  rule: 'FakeRule',
  createdDate: '2020-02-27 00:08:58',
  lastModifiedDate: '2020-02-27 00:08:58',
  isEnabled: false,
  byPassValidation: false,
  rule_set_id: 0
};

export const MockRuleForDeleteClass: RuleClass = {
  _id: 10,
  ruleName: 'FakeRuleNameDelete',
  rule: 'FakeRule',
  createdDate: '2020-02-27 00:08:58',
  lastModifiedDate: '2020-02-27 00:08:58',
  isEnabled: true,
  byPassValidation: false,
  rule_set_id: 0
};

import { RuleSetClass } from '../../src/app/classes';
import {
  MockArrayRuleSetInterface,
  MockRuleSetDisabledInterface,
  MockRuleSetForDeleteInterface,
  MockRuleSetInterface
} from '../interface-objects-v3_6';

export const MockRuleSetClass: RuleSetClass = new RuleSetClass(MockRuleSetInterface);
export const MockRuleSetForDeleteClass: RuleSetClass = new RuleSetClass(MockRuleSetForDeleteInterface);
export const MockRuleSetDisabledClass: RuleSetClass = new RuleSetClass(MockRuleSetDisabledInterface);
export const MockArrayRuleSetClass: RuleSetClass[] = [
  new RuleSetClass(MockArrayRuleSetInterface[0]),
  new RuleSetClass(MockArrayRuleSetInterface[1]),
  new RuleSetClass(MockArrayRuleSetInterface[2]),
  new RuleSetClass(MockArrayRuleSetInterface[3]),
  new RuleSetClass(MockArrayRuleSetInterface[4])
];

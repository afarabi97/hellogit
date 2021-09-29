import { RuleClass } from '../../src/app/classes';
import {
  MockRuleForDeleteInterface,
  MockRuleForToggleDisabledInterface,
  MockRuleForToggleInterface,
  MockRuleInterface
} from '../interface-objects';

export const MockRuleClass: RuleClass = new RuleClass(MockRuleInterface);
export const MockRuleForToggleClass: RuleClass = new RuleClass(MockRuleForToggleInterface);
export const MockRuleForToggleDisabledClass: RuleClass = new RuleClass(MockRuleForToggleDisabledInterface);
export const MockRuleForDeleteClass: RuleClass = new RuleClass(MockRuleForDeleteInterface);

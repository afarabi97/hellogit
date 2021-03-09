import { RuleInterface } from '../interfaces';

/**
 * Class defines the RuleClass
 *
 * @export
 * @class Rule
 * @implements {RuleInterface}
 */
export class RuleClass implements RuleInterface {
  _id: number;
  ruleName: string;
  rule: string;
  createdDate: string;
  lastModifiedDate: string;
  isEnabled: boolean;
  byPassValidation: boolean;
  rule_set_id: number;

  /**
   * Creates an instance of RuleClass.
   *
   * @param {RuleInterface} rule_interface
   * @memberof RuleClass
   */
  constructor(rule_interface: RuleInterface) {
    this._id = rule_interface._id;
    this.ruleName = rule_interface.ruleName;
    this.rule = rule_interface.rule;
    this.createdDate = rule_interface.createdDate;
    this.lastModifiedDate = rule_interface.lastModifiedDate;
    this.isEnabled = rule_interface.isEnabled;
    this.byPassValidation = rule_interface.byPassValidation;
    this.rule_set_id = rule_interface.rule_set_id;
  }
}

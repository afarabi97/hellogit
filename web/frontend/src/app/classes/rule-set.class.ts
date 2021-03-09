import { HostInfoInterface, RuleInterface, RuleSetInterface } from '../interfaces';
import { HostInfoClass } from './host-info.class';
import { ObjectUtilitiesClass } from './object-utilities.class';
import { RuleClass } from './rule.class';

/**
 * Class defines the RuleSetClass
 *
 * @export
 * @class RuleSetClass
 * @implements {RuleSetInterface}
 */
export class RuleSetClass implements RuleSetInterface {
  _id: number;
  rules: RuleClass[];
  appType: string;
  clearance: string;
  name: string;
  sensors: HostInfoClass[];
  state: string;
  createdDate: string;
  lastModifiedDate: string;
  isEnabled: boolean;

  /**
   * Creates an instance of RuleSetClass.
   *
   * @param {RuleSetInterface} rule_set_interface
   * @memberof RuleSetClass
   */
  constructor(rule_set_interface: RuleSetInterface) {
    this._id = rule_set_interface._id;
    this.appType = rule_set_interface.appType;
    this.clearance = rule_set_interface.clearance;
    this.name = rule_set_interface.name;
    this.state = rule_set_interface.state;
    this.createdDate = rule_set_interface.createdDate;
    this.lastModifiedDate = rule_set_interface.lastModifiedDate;
    this.isEnabled = rule_set_interface.isEnabled;
    if (ObjectUtilitiesClass.notUndefNull(rule_set_interface.rules)) {
      this.rules = rule_set_interface.rules.map((r: RuleInterface) => new RuleClass(r));
    } else {
      this.rules = [];
    }
    if (ObjectUtilitiesClass.notUndefNull(rule_set_interface.sensors)) {
      this.sensors = rule_set_interface.sensors.map((s: HostInfoInterface) => new HostInfoClass(s));
    } else {
      this.sensors = [];
    }
  }
}

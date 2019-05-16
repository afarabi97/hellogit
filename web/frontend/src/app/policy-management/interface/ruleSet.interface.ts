import { Rule, IHostInfo } from "./rule.interface";

export interface IRuleSet {
  _id: number;
  rules: Array<Rule>;
  appType: string;
  clearance: string;
  name: string;
  sensors: Array<IHostInfo>;
  state: string;
  createdDate: string;
  lastModifiedDate: string;
  groupName: string;
  isEnabled: boolean;
}

export class RuleSet {
  _id: number;
  rules: Array<Rule>;
  appType: string;
  clearance: string;
  name: string;
  sensors: Array<IHostInfo>;
  state: string;
  createdDate: string;
  lastModifiedDate: string;
  groupName: string;
  isEnabled: boolean;

  constructor(ruleset: IRuleSet) {
    this._id = ruleset._id;
    this.rules = ruleset.rules;
    this.appType = ruleset.appType;
    this.clearance = ruleset.clearance;
    this.name = ruleset.name;
    this.sensors = ruleset.sensors;
    this.state = ruleset.state;
    this.createdDate = ruleset.createdDate;
    this.lastModifiedDate = ruleset.lastModifiedDate;
    this.groupName = ruleset.groupName;
    this.isEnabled = ruleset.isEnabled;
  }
}

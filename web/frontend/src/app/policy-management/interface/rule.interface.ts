export interface IRule {
  _id: number;
  ruleName: string;
  rule: string;
  createdDate: string;
  lastModifiedDate: string;
  isEnabled: boolean;
  byPassValidation: boolean;
  rule_set_id: number;
}

export class Rule implements IRule {
  _id: number;
  ruleName: string;
  rule: string;
  createdDate: string;
  lastModifiedDate: string;
  isEnabled: boolean;
  byPassValidation: boolean;
  rule_set_id: number;

  constructor(rule: IRule) {
    this._id = rule._id;
    this.ruleName = rule.ruleName;
    this.rule = rule.rule;
    this.createdDate = rule.createdDate;
    this.lastModifiedDate = rule.lastModifiedDate;
    this.isEnabled = rule.isEnabled;
    this.byPassValidation = rule.byPassValidation;
    this.rule_set_id = rule.rule_set_id;
  }
}

export interface IError {
  error_message: string;
}

export interface ISuccess {
  success_message: string;
}

export class ErrorMessage implements IError {
  error_message: string;

  constructor(error: IError){
    this.error_message = error.error_message;
  }
}

export class SuccessMessage implements ISuccess {
  success_message: string;

  constructor(msg: ISuccess){
    this.success_message = msg.success_message;
  }
}

export interface IHostInfo {
  hostname: string;
  management_ip: string;
  mac: string;
};

export class HostInfo implements IHostInfo {
  hostname: string;
  management_ip: string;
  mac: string;

  constructor(info: IHostInfo){
    this.hostname = info.hostname;
    this.mac = info.mac;
    this.management_ip = info.management_ip;
  }
}

export interface Notification {
  role: string;
  message_type: string;
  action: string;
  application: string;
  timestamp: string;
  exception: string;
  message: string;
  status: string;
}

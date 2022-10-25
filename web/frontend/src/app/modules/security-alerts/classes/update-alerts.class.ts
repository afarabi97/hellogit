import { ObjectUtilitiesClass, PortalLinkClass } from '../../../classes';
import { UpdateAlertsInterface, AlertFormInterface } from '../interfaces';

/**
 * Class defines the Update Alerts
 *
 * @export
 * @class UpdateAlertsClass
 * @implements {UpdateAlertsInterface}
 */
export class UpdateAlertsClass implements UpdateAlertsInterface {
  count: number;
  'event.module': string;
  'event.kind': string;
  'rule.name': string;
  'source.address'?: string;
  'source.ip'?: string;
  'source.port'?: string;
  'destination.port'?: string;
  'destination.address'?: string;
  'destination.ip'?: string;
  form?: AlertFormInterface;
  links?: PortalLinkClass[];
  'event.escalated'?: boolean;

  /**
   * Creates an instance of UpdateAlertsClass.
   *
   * @param {UpdateAlertsInterface} update_alerts_interface
   * @memberof UpdateAlertsClass
   */
  constructor(update_alerts_interface: UpdateAlertsInterface) {
    this.count = update_alerts_interface.count;
    this['event.module'] = update_alerts_interface['event.module'];
    this['event.kind'] = update_alerts_interface['event.kind'];
    this['rule.name'] = update_alerts_interface['rule.name'];
    if (ObjectUtilitiesClass.notUndefNull(update_alerts_interface['source.address'])) {
      this['source.address'] = update_alerts_interface['source.address'];
    }
    if (ObjectUtilitiesClass.notUndefNull(update_alerts_interface['source.ip'])) {
      this['source.ip'] = update_alerts_interface['source.ip'];
    }
    if (ObjectUtilitiesClass.notUndefNull(update_alerts_interface['source.port'])) {
      this['source.port'] = update_alerts_interface['source.port'];
    }
    if (ObjectUtilitiesClass.notUndefNull(update_alerts_interface['destination.port'])) {
      this['destination.port'] = update_alerts_interface['destination.port'];
    }
    if (ObjectUtilitiesClass.notUndefNull(update_alerts_interface['destination.address'])) {
      this['destination.address'] = update_alerts_interface['destination.address'];
    }
    if (ObjectUtilitiesClass.notUndefNull(update_alerts_interface['source.address'])) {
      this['destination.ip'] = update_alerts_interface['destination.ip'];
    }
  }
}

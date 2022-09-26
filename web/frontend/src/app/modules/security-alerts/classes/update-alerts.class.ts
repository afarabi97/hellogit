import { ObjectUtilitiesClass, PortalLinkClass } from '../../../classes';
import { PortalLinkInterface } from '../../../interfaces';
import { UpdateAlertsInterface } from '../interfaces';
import { AlertFormClass } from './alert-form.class';

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
  form?: AlertFormClass;
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
    if (ObjectUtilitiesClass.notUndefNull(update_alerts_interface.form)) {
      this.form = new AlertFormClass(update_alerts_interface.form);
    }
    if (ObjectUtilitiesClass.notUndefNull(update_alerts_interface.links)) {
      this.links = update_alerts_interface.links.map((link: PortalLinkInterface) => new PortalLinkClass(link));
    }
    if (ObjectUtilitiesClass.notUndefNull(update_alerts_interface['event.escalated'])) {
      this['event.escalated'] = update_alerts_interface['event.escalated'];
    }
  }
}

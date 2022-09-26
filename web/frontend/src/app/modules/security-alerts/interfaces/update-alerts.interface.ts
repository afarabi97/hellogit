import { PortalLinkInterface } from '../../../interfaces';
import { AlertFormInterface } from './alert-form.interface';

/**
 * Interface defines the Update Alerts
 *
 * @export
 * @interface UpdateAlertsInterface
 */
export interface UpdateAlertsInterface {
  count: number;
  'event.module': string;
  'event.kind': string;
  'rule.name': string;
  form?: AlertFormInterface;
  links?: PortalLinkInterface[];
  'event.escalated'?: boolean;
}

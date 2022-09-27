import { ObjectUtilitiesClass } from '../../../classes';
import { AlertFormInterface } from '../interfaces';
import { HiveFormClass } from './hive-form.class';

/**
 * Class defines the Alert Form
 *
 * @export
 * @interface AlertFormClass
 */
export class AlertFormClass implements AlertFormInterface {
  acknowledged: boolean;
  escalated: boolean;
  showClosed: boolean;
  timeInterval: string;
  timeAmount: number;
  performEscalation: boolean;
  hiveForm: HiveFormClass;
  startDatetime?: Date;
  endDatetime?: Date;

  /**
   * Creates an instance of AlertFormClass.
   *
   * @param {AlertFormInterface} alert_form_interface
   * @memberof AlertFormClass
   */
  constructor(alert_form_interface: AlertFormInterface) {
    this.acknowledged = alert_form_interface.acknowledged;
    this.escalated = alert_form_interface.escalated;
    this.showClosed = alert_form_interface.showClosed;
    this.timeInterval = alert_form_interface.timeInterval;
    this.timeAmount = alert_form_interface.timeAmount;
    this.performEscalation = alert_form_interface.performEscalation;
    this.hiveForm = new HiveFormClass(alert_form_interface.hiveForm);
    if (ObjectUtilitiesClass.notUndefNull(alert_form_interface.startDatetime)) {
      this.startDatetime = alert_form_interface.startDatetime;
    }
    if (ObjectUtilitiesClass.notUndefNull(alert_form_interface.endDatetime)) {
      this.endDatetime = alert_form_interface.endDatetime;
    }
  }
}

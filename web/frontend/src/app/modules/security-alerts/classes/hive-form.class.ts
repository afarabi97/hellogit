import { HiveFormInterface } from '../interfaces';

/**
 * Class defines the Hive Form
 *
 * @export
 * @class HiveFormClass
 * @implements {HiveFormInterface}
 */
export class HiveFormClass implements HiveFormInterface {
  event_title: string;
  event_tags: string;
  event_severity: string;
  event_description: string;

  /**
   * Creates an instance of HiveFormClass.
   *
   * @param {HiveFormInterface} hive_form_interface
   * @memberof HiveFormClass
   */
  constructor(hive_form_interface: HiveFormInterface) {
    this.event_title = hive_form_interface.event_title;
    this.event_tags = hive_form_interface.event_tags;
    this.event_severity = hive_form_interface.event_severity;
    this.event_description = hive_form_interface.event_description;
  }
}

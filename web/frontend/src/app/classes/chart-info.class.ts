import { ChartInfoInterface, FormControlInterface } from '../interfaces';
import { FormControlClass } from './form-control.class';
import { ObjectUtilitiesClass } from './object-utilities.class';

/**
 * Class defines the Chart Info
 *
 * @export
 * @class ChartInfoClass
 * @implements {ChartInfoInterface}
 */
export class ChartInfoClass implements ChartInfoInterface {
  appVersion: string;
  description: string;
  formControls: FormControlClass[];
  id: string;
  node_affinity: string;
  type: string;
  version: string;
  devDependent?: string;

  /**
   * Creates an instance of ChartInfoClass.
   *
   * @param {ChartInfoInterface} chart_info_interface
   * @memberof ChartInfoClass
   */
  constructor(chart_info_interface: ChartInfoInterface) {
    this.appVersion = chart_info_interface.appVersion;
    this.description = chart_info_interface.description;
    this.formControls = chart_info_interface.formControls.map((fc: FormControlInterface) => new FormControlClass(fc));
    this.id = chart_info_interface.id;
    this.node_affinity = chart_info_interface.node_affinity;
    this.type = chart_info_interface.type;
    this.version = chart_info_interface.version;
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(chart_info_interface.devDependent)) {
      this.devDependent = chart_info_interface.devDependent;
    }
  }
}

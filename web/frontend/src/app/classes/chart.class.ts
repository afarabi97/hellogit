import { ChartInterface, StatusInterface } from '../interfaces';
import { ObjectUtilitiesClass } from './object-utilities.class';
import { StatusClass } from './status.class';

/**
 * Class defines the Chart
 *
 * @export
 * @class ChartClass
 * @implements {ChartInterface}
 */
export class ChartClass implements ChartInterface {
  appVersion: string;
  version: string;
  application: string;
  description: string;
  pmoSupported: boolean;
  isSensorApp: boolean;
  nodes?: StatusClass[];

  /**
   * Creates an instance of ChartClass.
   *
   * @param {ChartInterface} chart_interface
   * @memberof ChartClass
   */
  constructor(chart_interface: ChartInterface) {
    this.appVersion = chart_interface.appVersion;
    this.version = chart_interface.version;
    this.application = chart_interface.application;
    this.description = chart_interface.description;
    this.pmoSupported = chart_interface.pmoSupported;
    this.isSensorApp = chart_interface.isSensorApp;
    if (ObjectUtilitiesClass.notUndefNull(chart_interface.nodes)) {
      this.nodes = chart_interface.nodes.map((s: StatusInterface) => new StatusClass(s));
    } else {
      this.nodes = [];
    }
  }
}

import { StatusInterface } from './status.interface';

/**
 * Interface defines the Chart
 *
 * @export
 * @interface ChartInterface
 */
export interface ChartInterface {
  appVersion: string;
  version: string;
  application: string;
  description: string;
  pmoSupported: boolean;
  isSensorApp: boolean;
  nodes?: StatusInterface[];
}

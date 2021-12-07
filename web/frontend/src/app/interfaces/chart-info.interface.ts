import { FormControlInterface } from './form-control.interface';

/**
 * Interface defines the Chart Info
 *
 * @export
 * @interface ChartInfoInterface
 */
export interface ChartInfoInterface {
  appVersion: string;
  description: string;
  formControls: FormControlInterface[];
  id: string;
  type: string;
  version: string;
  node_affinity: string;
  devDependent?: string;
}

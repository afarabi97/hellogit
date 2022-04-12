import { HostInfoInterface } from './host-info.interface';
import { RuleInterface } from './rule.interface';
import { SensorStateInterface } from './sensor-state.interface';

/**
 * Interface defines the RuleSet
 *
 * @export
 * @interface RuleSetInterface
 */
export interface RuleSetInterface {
  _id: number;
  rules: RuleInterface[];
  appType: string;
  clearance: string;
  name: string;
  sensors: HostInfoInterface[];
  state: string;
  sensor_states: SensorStateInterface[];
  createdDate: string;
  lastModifiedDate: string;
  isEnabled: boolean;
}

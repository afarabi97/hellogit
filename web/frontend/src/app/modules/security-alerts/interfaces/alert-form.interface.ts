import { HiveFormInterface } from './hive-form.interface';

/**
 * Interface defines the Alert Form
 *
 * @export
 * @interface AlertFormInterface
 */
export interface AlertFormInterface {
  acknowledged: boolean;
  escalated: boolean;
  showClosed: boolean;
  timeInterval: string;
  timeAmount: number;
  performEscalation: boolean;
  hiveForm: HiveFormInterface;
  startDatetime?: Date;
  endDatetime?: Date;
}

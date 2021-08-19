import { RuleClass, RuleSetClass } from '../../../classes';

/**
 * Interface defines the Dialog Data
 *
 * @export
 * @interface DialogDataInterface
 */
export interface DialogDataInterface {
  rule_set?: RuleSetClass;
  rule?: RuleClass;
  action?: string;
}

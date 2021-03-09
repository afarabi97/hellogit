/**
 * Interface defines the RuleInterface
 *
 * @export
 * @interface RuleInterface
 */
export interface RuleInterface {
  _id: number;
  ruleName: string;
  rule: string;
  createdDate: string;
  lastModifiedDate: string;
  isEnabled: boolean;
  byPassValidation: boolean;
  rule_set_id: number;
}

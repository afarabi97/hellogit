import { Observable } from 'rxjs';

import { RuleClass, RuleSetClass, RuleSyncClass, SuccessMessageClass } from '../../classes';
import { RulePCAPTestInterface } from '../rule-pcap-test.interface';
import { RuleSetInterface } from '../rule-set.interface';
import { RuleInterface } from '../rule.interface';

/**
 * Interface defines the RulesService
 *
 * @export
 * @interface RulesServiceInterface
 */
export interface RulesServiceInterface {
  get_rule_sets(): Observable<RuleSetClass[]>;
  create_rule_set(rule_set: RuleSetInterface): Observable<RuleSetClass>;
  update_rule_set(rule_set: RuleSetInterface): Observable<RuleSetClass>;
  delete_rule_set(rule_set_id: number): Observable<SuccessMessageClass>;
  sync_rule_sets(): Observable<RuleSyncClass>;
  get_rules(rule_set_id: number): Observable<RuleClass[]>;
  create_rule(rule: RuleInterface): Observable<RuleClass>;
  update_rule(rule: RuleInterface): Observable<RuleClass>;
  delete_rule(rule_id: number): Observable<SuccessMessageClass>;
  upload_rule_file(form_data: FormData): Observable<RuleClass | RuleClass[]>;
  get_rule_content(rule_id: number): Observable<RuleClass>;
  validate_rule(rule: RuleInterface): Observable<SuccessMessageClass>;
  test_rule_against_pcap(payload: RulePCAPTestInterface): Observable<Blob>;
  toggle_rule(rule_id: number): Observable<RuleClass>;
}

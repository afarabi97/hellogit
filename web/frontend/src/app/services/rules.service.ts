import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { RuleClass, RuleSetClass, RuleSyncClass, SuccessMessageClass } from '../classes';
import { HTTP_OPTIONS } from '../constants/cvah.constants';
import {
  EntityConfig,
  RuleInterface,
  RulePCAPTestInterface,
  RuleSetInterface,
  RulesServiceInterface,
  RuleSyncInterface,
  SuccessMessageInterface
} from '../interfaces';
import { ApiService } from './abstract/api.service';

const entityConfig: EntityConfig = { entityPart: '', type: 'RulesService' };

/**
 * Service used for
 * - API call to for rules and rule sets
 *
 * @export
 * @class RulesService
 */
@Injectable({
  providedIn: 'root'
})
export class RulesService extends ApiService<any> implements RulesServiceInterface {

  /**
   * Creates an instance of RulesService.
   *
   * @memberof RulesService
   */
  constructor() {
    super(entityConfig);
  }

  /**
   * REST call to GET rule sets
   *
   * @returns {Observable<RuleSetClass[]>}
   * @memberof RulesService
   */
  get_rule_sets(): Observable<RuleSetClass[]> {
    return this.httpClient_.get<RuleSetInterface[]>(environment.RULES_SERVICE_RULE_SETS)
      .pipe(map((response: RuleSetInterface[]) => response.map((rule_set: RuleSetInterface) => new RuleSetClass(rule_set))),
            catchError((error: HttpErrorResponse) => this.handleError('get rule sets', error)));
  }

  /**
   * REST call to POST rule set
   *
   * @param {RuleSetInterface} rule_set
   * @returns {Observable<RuleSetClass>}
   * @memberof RulesService
   */
  create_rule_set(rule_set: RuleSetInterface): Observable<RuleSetClass> {
    return this.httpClient_.post<RuleSetInterface>(environment.RULES_SERVICE_RULE_SETS, rule_set, HTTP_OPTIONS)
      .pipe(map((response: RuleSetInterface) => new RuleSetClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('create rule set', error)));
  }

  /**
   * REST call to PUT rule set
   *
   * @param {RuleSetInterface} rule_set
   * @returns {(Observable<RuleSetClass>)}
   * @memberof RulesService
   */
  update_rule_set(rule_set: RuleSetInterface): Observable<RuleSetClass> {
    return this.httpClient_.put<RuleSetInterface>(environment.RULES_SERVICE_RULE_SETS, rule_set)
      .pipe(map((response: RuleSetInterface) => new RuleSetClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('update rule set', error)));
  }

  /**
   * REST call to DELETE rule set
   *
   * @param {number} rule_set_id
   * @returns {(Observable<SuccessMessageClass>)}
   * @memberof RulesService
   */
  delete_rule_set(rule_set_id: number): Observable<SuccessMessageClass> {
    const url = `${environment.RULES_SERVICE_RULE_SETS}/${rule_set_id}`;

    return this.httpClient_.delete<SuccessMessageInterface>(url)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('delete rule set', error)));
  }

  /**
   * REST call to GET sync rule sets
   *
   * @returns {Observable<RuleSyncClass>}
   * @memberof RulesService
   */
  sync_rule_sets(): Observable<RuleSyncClass> {
    return this.httpClient_.get<RuleSyncInterface>(environment.RULES_SERVICE_RULE_SETS_SYNC)
      .pipe(map((response: RuleSyncInterface) => new RuleSyncClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('sync rule sets', error)));
  }

  /**
   * REST call to GET rules
   *
   * @param {number} rule_set_id
   * @returns {Observable<RuleClass[]>}
   * @memberof RulesService
   */
  get_rules(rule_set_id: number): Observable<RuleClass[]> {
    const url = `${environment.RULES_SERVICE_RULES}/${rule_set_id}`;

    return this.httpClient_.get<RuleInterface[]>(url)
      .pipe(map((response: RuleInterface[]) => response.map((rule: RuleInterface) => new RuleClass(rule))),
            catchError((error: HttpErrorResponse) => this.handleError('get rules', error)));
  }

  /**
   * REST call to POST rule
   *
   * @param {RuleInterface} rule
   * @returns {(Observable<RuleClass>)}
   * @memberof RulesService
   */
  create_rule(rule: RuleInterface): Observable<RuleClass> {
    return this.httpClient_.post<RuleInterface>(environment.RULES_SERVICE_RULE, rule, HTTP_OPTIONS)
      .pipe(map((response: RuleInterface) => new RuleClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('create rule', error)));
  }

  /**
   * REST call to PUT rule
   *
   * @param {RuleInterface} rule
   * @returns {(Observable<RuleClass>)}
   * @memberof RulesService
   */
  update_rule(rule: RuleInterface): Observable<RuleClass> {
    return this.httpClient_.put<RuleInterface>(environment.RULES_SERVICE_RULE, rule, HTTP_OPTIONS)
      .pipe(map((response: RuleInterface) =>  new RuleClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('update rule', error)));
  }

  /**
   * REST call to DELETE rule
   *
   * @param {number} rule_id
   * @returns {(Observable<SuccessMessageClass>)}
   * @memberof RulesService
   */
  delete_rule(rule_id: number): Observable<SuccessMessageClass> {
    const url = `${environment.RULES_SERVICE_RULE}/${rule_id}`;

    return this.httpClient_.delete<SuccessMessageInterface>(url)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('delete rule', error)));
  }

  /**
   * REST call to POST rule file
   *
   * @param {FormData} form_data
   * @returns {(Observable<RuleClass | RuleClass[]>)}
   * @memberof RulesService
   */
  upload_rule_file(form_data: FormData): Observable<RuleClass | RuleClass[]> {
    return this.httpClient_.post<Object>(environment.RULES_SERVICE_UPLOAD_RULE_FILE, form_data)
      .pipe(map((response: Object) => this.map_rule_list_or_rule_(response)),
            catchError((error: HttpErrorResponse) => this.handleError('upload rule file', error)));
  }

  /**
   * REST call to GET rule content
   *
   * @param {number} rule_id
   * @returns {(Observable<RuleClass>)}
   * @memberof RulesService
   */
  get_rule_content(rule_id: number): Observable<RuleClass> {
    const url = `${environment.RULES_SERVICE_RULE}/${rule_id}/content`;

    return this.httpClient_.get<RuleInterface>(url)
      .pipe(map((response: RuleInterface) => new RuleClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('get rule content', error)));
  }

  /**
   * REST call to POST validate rule
   *
   * @param {RuleInterface} rule
   * @returns {(Observable<SuccessMessageClass>)}
   * @memberof RulesService
   */
  validate_rule(rule: RuleInterface): Observable<SuccessMessageClass> {
    return this.httpClient_.post<SuccessMessageInterface>(environment.RULES_SERVICE_RULE_VALIDATE, rule, HTTP_OPTIONS)
      .pipe(map((response: SuccessMessageInterface) => new SuccessMessageClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('validate rule', error)));
  }

  /**
   * REST call to POST test rule against pcap
   *
   * @param {RulePCAPTestInterface} payload
   * @returns {Observable<Blob>}
   * @memberof RulesService
   */
  test_rule_against_pcap(payload: RulePCAPTestInterface): Observable<Blob> {
    return this.httpClient_.post(environment.RULES_SERVICE_TEST_RULE_AGAINST_PCAP, payload, { responseType: 'blob' })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError('test rule against pcap', error)));
  }

  /**
   * REST call to PUT toggle rule
   *
   * @param {number} rule_id
   * @returns {(Observable<RuleClass>)}
   * @memberof RulesService
   */
  toggle_rule(rule_id: number): Observable<RuleClass> {
    const url = `${environment.RULES_SERVICE_RULE}/${rule_id}/toggle`;

    return this.httpClient_.put<RuleInterface>(url, HTTP_OPTIONS)
      .pipe(map((response: RuleInterface) => new RuleClass(response)),
            catchError((error: HttpErrorResponse) => this.handleError('toggle rule', error)));
  }

  /**
   * Used to return rule, rule[]
   *
   * @private
   * @param {Object} response
   * @returns {(RuleClass | RuleClass[])}
   * @memberof RulesService
   */
  private map_rule_list_or_rule_(response: Object): RuleClass | RuleClass[] {
    if (response instanceof Array) {
      return response.map((r: RuleInterface) => new RuleClass(r));
    } else {
      return new RuleClass(response as RuleInterface);
    }
  }
}

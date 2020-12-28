import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IRuleSet, RuleSet } from '../interface/ruleSet.interface';
import { Rule, IRule, IError, ErrorMessage,
         ISuccess, SuccessMessage,
         IHostInfo, HostInfo } from '../interface/rule.interface';
import { HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

export const HTTP_OPTIONS = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root'
})
export class PolicyManagementService {
    public isUserEditing: boolean = false;
    public activeConfigDataTitle: string;
    public activeConfigData: string;

    public editRuleSet: RuleSet;
    public editRule: Rule;
    public isUserAdding: boolean = false;

    clearanceLevels: any[] = [
        { value: 'Unclassified'},
        { value: 'Confidential'},
        { value: 'Secret'},
        { value: 'Top Secret'}
     ];

     ruleType: any[] = [
        {value: 'Suricata'},
        {value: 'Zeek'},
     ];

    constructor(private http: HttpClient, private snackBar: MatSnackBar) {
        this.activeConfigDataTitle = "";
        this.activeConfigData = "";
    }

    private mapRuleSet(ruleset: any): IRuleSet {
        return new RuleSet(ruleset as IRuleSet);
    }

    private mapRuleSets(rulesets: Array<Object>): Array<IRuleSet> {
        let ruleSetsData = new Array<IRuleSet>();
        for (let ruleset of rulesets as Array<Object>){
          ruleSetsData.push(this.mapRuleSet(ruleset));
        }
        return ruleSetsData;
    }

    private mapHostInfo(hostInfos: Array<Object>): Array<IHostInfo> {
        let hostinfos = new Array<IHostInfo>();
        for (let info of hostInfos as Array<Object>){
            hostinfos.push(new HostInfo(info as IHostInfo));
        }
        return hostinfos;
    }

    private mapRule(rule: Object): IRule {
        return new Rule(rule as IRule);
    }

    private mapRules(rulesData: Array<Object>): Array<IRule> {
        let rules = new Array<IRule>();
        for (let r of rulesData) {
            rules.push(this.mapRule(r));
        }
        return rules;
    }

    private mapRuleOrError(something: Object): IRule | IError {
        if (something["error_message"]){
            return new ErrorMessage(something as IError);
        }
        return this.mapRule(something);
    }

    private mapRuleListOrError(something: Object): IRule | IError | Array<IRule> {
      if (something["error_message"]){
          return new ErrorMessage(something as IError);
      } else if (something instanceof Array){
        let rules = new Array<IRule>();
        for (let r of something) {
          rules.push(this.mapRule(r));
        }
        return rules;
      } else {
        return this.mapRule(something);
      }
  }

    private mapRuleSetOrError(something: Object): IRuleSet | IError {
        if (something["error_message"]){
            return new ErrorMessage(something as IError);
        }
        return this.mapRuleSet(something);
    }

    private mapStrArrayOrError(something: Object): Array<string> | IError {
        if (something["error_message"]){
            return new ErrorMessage(something as IError);
        }
        return something as Array<string>;
    }

    private mapSuccessOrError(something: Object): IError | ISuccess {
        if (something["error_message"]){
            return new ErrorMessage(something as IError);
        }
        return new SuccessMessage(something as ISuccess);
    }

    getSensorHostInfo(): Observable<Array<IHostInfo>> {
        const url = '/api/get_sensor_hostinfo';
        return this.http.get(url).pipe(
            map(data => this.mapHostInfo(data as Array<Object>))
        );
    }

    getRuleSets(): Observable<Array<IRuleSet>> {
        const url = '/api/ruleset';
        return this.http.get(url).pipe(
            map(data => this.mapRuleSets(data as Array<Object>))
        );
    }

    createRuleSet(ruleSet: IRuleSet): Observable<IRuleSet | IError> {
        const url = '/api/ruleset';
        return this.http.post(url, ruleSet, HTTP_OPTIONS).pipe(
            map(data => this.mapRuleSet(data))
        );
    }

    uploadRuleFile(rule_set: File, ruleSet: IRuleSet): Observable<Object> {
      const url = '/api/upload_rule';
      const formData = new FormData();
      formData.append('upload_file', rule_set, rule_set.name);
      formData.append('ruleSetForm', JSON.stringify(ruleSet));
      return this.http.post(url, formData).pipe(
        map(data => this.mapRuleListOrError(data))
      );
    }

    deleteRuleSet(ruleSetID: number): Observable<IError | ISuccess> {
        const url = `/api/ruleset/${ruleSetID}`;
        return this.http.delete(url).pipe(
            map(data => this.mapSuccessOrError(data))
        );
    }

    getRules(rule_set_id: number): Observable<Array<IRule>>{
        const url = `/api/rules/${rule_set_id}`;
        return this.http.get(url).pipe(
            map(data => this.mapRules(data as Array<Object>))
        );
    }

    getRuleContent(rule_id: number): Observable<IRule | IError> {
        const url = `/api/rule/${rule_id}/content`;
        return this.http.get(url).pipe(
            map(data => this.mapRuleOrError(data))
        );
    }

    createRule(ruleSetID: number, newRule :IRule): Observable<IRule | IError> {
        const url = '/api/rule';
        newRule.rule_set_id = ruleSetID;
        return this.http.post(url, newRule, HTTP_OPTIONS).pipe(
            map(data => this.mapRuleOrError(data))
        );
    }

    validateRule(someRule: IRule): Observable<ISuccess | IError> {
        const url = '/api/rule/validate';
        someRule.rule_set_id = this.editRuleSet._id
        // let payload = { ruleToValidate: someRule, ruleType: this.editRuleSet.appType };
        return this.http.post(url, someRule, HTTP_OPTIONS).pipe(
            map(data => this.mapSuccessOrError(data))
        );
    }

    testRuleAgainstPCAP(pcapName: string, ruleContent: string){
        const url = '/api/pcap/rule/test';
        let payload = { pcap_name: pcapName, rule_content: ruleContent, ruleType: this.editRuleSet.appType };
        return this.http.post(url, payload, { responseType: 'blob' }).pipe();
    }

    updateRule(ruleSetID: number, ruleToUpdate: IRule): Observable<IRule | IError> {
        const url = '/api/rule';
        ruleToUpdate.rule_set_id = ruleSetID;
        return this.http.put(url, ruleToUpdate, HTTP_OPTIONS).pipe(
            map(data => this.mapRuleOrError(data))
        );
    }

    toggleRule(ruleID: number): Observable<IRule | IError> {
        const url = `/api/rule/${ruleID}/toggle`;
        return this.http.put(url, HTTP_OPTIONS).pipe(
            map(data => this.mapRuleOrError(data))
        );
    }

    deleteRule(ruleID: number): Observable<ISuccess | IError> {
        const url = `/api/rule/${ruleID}`;
        return this.http.delete(url).pipe(
            map(data => this.mapSuccessOrError(data))
        );
    }

    updateRuleSet(ruleSet: IRuleSet): Observable<IRuleSet | IError> {
        const url = '/api/ruleset';
        return this.http.put(url, ruleSet).pipe(
            map(data => this.mapRuleSetOrError(data))
        );
    }

    syncRuleSets(){
        const url = '/api/rulesets/sync';
        return this.http.get(url).pipe();
    }

    checkCatalogStatus(application: string): Observable<Object> {
      const url = `/api/catalog/chart/${application}/status`;
      return this.http.get(url);
    }

    displaySnackBar(message: string, duration_seconds: number = 60){
      this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IRuleSet, RuleSet } from '../interface/ruleSet.interface';
import { Rule, IRule, IError, ErrorMessage,
         ISuccess, SuccessMessage,
         IHostInfo, HostInfo } from '../interface/rule.interface';
import { HttpHeaders } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material';

export const HTTP_OPTIONS = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class PolicyManagementService {
    public isUserEditing: boolean = false;
    public activeConfigDataTitle: string;
    public activeConfigData: string;
    public ruleSets: any;
    public dataSource = new MatTableDataSource(this.ruleSets);
    public innerRules;
    public innerDataSource = new MatTableDataSource(this.innerRules);
    public editRuleSet: any;
    public editRule: any;
    public isUserAdding: boolean = false;

    clearanceLevels: any[] = [
        { value: 'Unclassified'},
        { value: 'Confidential'},
        { value: 'Secret'}, 
        { value: 'Top Secret'}
     ];
   
     ruleType: any[] = [
        // TODO {value: 'Bro'},
        {value: 'Suricata'}
     ];

    constructor(private http: HttpClient) {
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

    getRuleSets(ruleSetGroupName: string): Observable<Array<IRuleSet>> {
        const url = `/api/get_rulesets/${ruleSetGroupName}`;
        return this.http.get(url).pipe(
            map(data => this.mapRuleSets(data as Array<Object>))
        );
    }

    getDistinctRuleSetGroups(): Observable<Array<string> | IError>{
        const url = '/api/get_ruleset_groups';
        return this.http.get(url).pipe(
            map(data => this.mapStrArrayOrError(data))
        );
    }

    createRuleSet(ruleSet: IRuleSet): Observable<IRuleSet | IError> {
        const url = '/api/create_ruleset';
        return this.http.post(url, ruleSet, HTTP_OPTIONS).pipe(
            map(data => this.mapRuleSetOrError(data))
        );
    }

    deleteRuleSet(ruleSetID: number): Observable<IError | ISuccess> {
        const url = `/api/delete_ruleset/${ruleSetID}`;
        return this.http.delete(url).pipe(
            map(data => this.mapSuccessOrError(data))
        );
    }

    getRules(rule_set_id: number): Observable<Array<IRule>>{
        const url = `/api/get_rules/${rule_set_id}`;
        return this.http.get(url).pipe(
            map(data => this.mapRules(data as Array<Object>))
        );
    }

    getRuleContent(rule_set_id: number, rule_id: number): Observable<IRule | IError> {
        const url = `/api/get_rules_content/${rule_set_id}/${rule_id}`;
        return this.http.get(url).pipe(
            map(data => this.mapRuleOrError(data))
        );
    }

    createRule(ruleSetID: number, newRule :IRule): Observable<IRule | IError> {
        const url = '/api/create_rule';
        let payload = { rulesetID: ruleSetID, ruleToAdd: newRule };
        return this.http.post(url, payload, HTTP_OPTIONS).pipe(
            map(data => this.mapRuleOrError(data))
        );
    }

    validateRule(someRule: IRule): Observable<ISuccess | IError> {
        const url = '/api/validate_rule';
        let payload = { ruleToValidate: someRule };
        return this.http.post(url, payload, HTTP_OPTIONS).pipe(
            map(data => this.mapSuccessOrError(data))
        );
    }

    testRuleAgainstPCAP(pcapName: string, ruleContent: string){
        const url = '/api/test_rule_against_pcap';
        let payload = {pcap_name: pcapName, rule_content: ruleContent};
        return this.http.post(url, payload, { responseType: 'blob' }).pipe();
    }

    updateRule(ruleSetID: number, ruleToUpdate: IRule): Observable<IRule | IError> {
        const url = '/api/update_rule';
        let payload = { rulesetID: ruleSetID, ruleToUpdate: ruleToUpdate };
        return this.http.put(url, payload, HTTP_OPTIONS).pipe(
            map(data => this.mapRuleOrError(data))
        );
    }

    toggleRule(ruleSetID: number, ruleToUpdate: IRule): Observable<IRule | IError> {
        ruleToUpdate.isEnabled = !ruleToUpdate.isEnabled;
        const url = '/api/toggle_rule';
        let payload = { rulesetID: ruleSetID, ruleToUpdate: ruleToUpdate };
        return this.http.put(url, payload, HTTP_OPTIONS).pipe(
            map(data => this.mapRuleOrError(data))
        );
    }

    deleteRule(ruleSetID: number, ruleID: number): Observable<ISuccess | IError> {
        const url = `/api/delete_rule/${ruleSetID}/${ruleID}`;
        return this.http.delete(url).pipe(
            map(data => this.mapSuccessOrError(data))
        );
    }

    updateRuleSet(ruleSet: IRuleSet): Observable<IRuleSet | IError> {
        const url = '/api/update_ruleset';
        return this.http.put(url, ruleSet).pipe(
            map(data => this.mapRuleSetOrError(data))
        );
    }

    syncRuleSets(){
        const url = '/api/sync_rulesets';
        return this.http.get(url).pipe();
    }

    uploadRuleFile(formObj: Object): Observable<IRuleSet | IError> {
        const url = 'api/load_rules_from_file';
        const formData: FormData = new FormData();
        formData.append('file', formObj['file'], formObj['file'].name);
        formData.append('filename', formObj['file'].name)
        formData.append('name', formObj['ruleSetName']);
        formData.append('clearance', formObj['clearance']);
        formData.append('groupname', formObj['groupName']);
        formData.append('appType', formObj['appType']);
        return this.http.post(url, formData).pipe(
            map(data => this.mapRuleSetOrError(data))
        );
    }
}

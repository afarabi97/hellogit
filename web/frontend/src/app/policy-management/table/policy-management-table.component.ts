import { Component, ViewChild, OnInit, AfterViewInit, OnChanges, ChangeDetectorRef} from '@angular/core';
import { IRuleSet, RuleSet } from '../interface/ruleSet.interface';
import { PolicyManagementAddDialog } from '../add-dialog/policy-management-add-dialog.component';
import { PolicyManagementService } from '../services/policy-management.service';
import { MatTableDataSource, MatPaginator, MatSort, MatSelectChange } from '@angular/material';
import { Rule, ErrorMessage, SuccessMessage } from '../interface/rule.interface';
import { MatDialog } from '@angular/material';
import { FormGroup } from '@angular/forms';
import { HtmlModalPopUp, ModalType } from '../../html-elements';

@Component({
  selector: 'policy-management-table',
  styleUrls: ['policy-management-table.component.css'],
  templateUrl: 'policy-management-table.component.html'
})
export class PolicyManagementTable implements OnInit, AfterViewInit, OnChanges {
  columnsToDisplay = ['Enabled', 'name', 'clearance', 'state', 'sensors', 'Actions'];
  innerColumnsToDisplay = ['Enabled', 'ruleName', 'lastModifiedDate', 'Actions'];
  expandedElement: IRuleSet | null;
  objectKeys = Object.keys;
  filterGroup: FormGroup;
  messageModal: HtmlModalPopUp;
  removeRuleModal: HtmlModalPopUp;
  removeRuleSetModal: HtmlModalPopUp;
  isVisibleTest: boolean;
  isRulesVisible: Array<boolean>;
  ruleSetGroups: Array<string>;


  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('paginatorInner') paginatorInner: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor( public _PolicyManagementService: PolicyManagementService,
               private cdr: ChangeDetectorRef,
               public dialog: MatDialog) {
    this.messageModal = new HtmlModalPopUp("msg_modal");
    this.removeRuleModal = new HtmlModalPopUp("remove_rule_modal");
    this.removeRuleSetModal = new HtmlModalPopUp("remove_ruleset_modal");
    this.isVisibleTest = false;
    this.isRulesVisible = new Array();
    this.ruleSetGroups = new Array();
  }

  applyFilter(filterValue: string) {
    this._PolicyManagementService.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private reloadRuleSetTable(ruleSetGroupName: string = "All"){
    this._PolicyManagementService.getRuleSets(ruleSetGroupName).subscribe(ruleSets => {
      this.isRulesVisible =  new Array(ruleSets.length).fill(false);
      this._PolicyManagementService.ruleSets = ruleSets;
      this._PolicyManagementService.dataSource.data = this._PolicyManagementService.ruleSets;
      this.paginator._changePageSize(this.paginator.pageSize);
    });

    this._PolicyManagementService.getDistinctRuleSetGroups().subscribe(data => {
      if (data instanceof ErrorMessage){
        this.messageModal.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
        this.messageModal.openModal();
      } else {
        this.ruleSetGroups = data as Array<string>;
      }
    });
  }

  ngOnInit() {
    this._PolicyManagementService.dataSource.filterPredicate = (data, filter: string)  => {
      const accumulator = (currentTerm, key) => {
        return this.nestedFilterCheck(currentTerm, data, key);
      };
      const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
      // Transform the filter by converting it to lowercase and removing whitespace.
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) !== -1;
    };
    this._PolicyManagementService.dataSource.paginator = this.paginator;
    this._PolicyManagementService.innerDataSource.paginator = this.paginatorInner;
    this._PolicyManagementService.dataSource.sort = this.sort;

    this.reloadRuleSetTable();
  }

  ngAfterViewInit(): void {
    this._PolicyManagementService.dataSource.paginator = this.paginator;
    this._PolicyManagementService.innerDataSource.paginator = this.paginatorInner;
    this._PolicyManagementService.dataSource.sort = this.sort;
    this.cdr.detectChanges();
  }

  ngOnChanges() {
    this._PolicyManagementService.dataSource = new MatTableDataSource(this._PolicyManagementService.ruleSets);
    this._PolicyManagementService.innerDataSource = new MatTableDataSource(this._PolicyManagementService.innerRules);
    this._PolicyManagementService.innerDataSource.paginator = this.paginatorInner;
    this._PolicyManagementService.dataSource.paginator = this.paginator;
    this._PolicyManagementService.dataSource.sort = this.sort;
  }

  nestedFilterCheck(search: any, data: any, key: any) {
    if (typeof data[key] === 'object') {
      for (const k in data[key]) {
        if (data[key][k] !== null) {
          search = this.nestedFilterCheck(search, data[key], k);
        }
      }
    } else {
      search += data[key];
    }
    return search;
  }

  filterByRuleSetGroup(event: MatSelectChange){
    this.reloadRuleSetTable(event.value);
  }

  getRules(ruleset: RuleSet) {
    const index = this._PolicyManagementService.ruleSets.findIndex( i => i._id === ruleset._id);    
    let wereRulesVisible = this.isRulesVisible[index];

    //Make everything invisible
    this.isRulesVisible =  new Array(this._PolicyManagementService.ruleSets.length).fill(false);

    //Clear ruleSetRules
    for (let ruleSet of this._PolicyManagementService.ruleSets){
      ruleSet.rules = null;
    }

    if (!wereRulesVisible) {
      this.isRulesVisible[index] = !this.isRulesVisible[index];
    }

    this._PolicyManagementService.getRules(ruleset._id).subscribe(rules => {
      ruleset.rules = rules;
      this._PolicyManagementService.innerRules = rules;
      this._PolicyManagementService.innerDataSource.data = this._PolicyManagementService.innerRules;
      this._PolicyManagementService.innerDataSource.paginator = this.paginatorInner;
    });
  }

  isRulesVisibleFn(ruleset: RuleSet){
    const index = this._PolicyManagementService.ruleSets.findIndex( i => i._id === ruleset._id);    
    return this.isRulesVisible[index];
  }

  editRule(ruleSet: any, rule: Rule) {
    this._PolicyManagementService.editRule = rule;
    this._PolicyManagementService.editRuleSet = ruleSet;
    this._PolicyManagementService.isUserEditing = true;
    this._PolicyManagementService.isUserAdding = false;

  }

  enableRuleSet(ruleSet: RuleSet) {    
    let ruleSetValue = ruleSet;
    ruleSetValue.isEnabled = !ruleSetValue.isEnabled;
    this._PolicyManagementService.updateRuleSet(ruleSet as IRuleSet).subscribe(data => {
      if (data instanceof RuleSet) {
        const index = this._PolicyManagementService.ruleSets.findIndex( i => i._id === ruleSet._id);
        this._PolicyManagementService.ruleSets[index] = data;
        this._PolicyManagementService.dataSource.data = this._PolicyManagementService.ruleSets;
      } else if (data instanceof ErrorMessage) {
        this.messageModal.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
        this.messageModal.openModal();
      }
    });
  }

  isRuleChecked(rule: Rule): boolean {    
    return rule.isEnabled;
  }

  enableRule(rule: Rule, ruleSet: RuleSet) {    
    this._PolicyManagementService.toggleRule(ruleSet._id, rule).subscribe(data => {
      if (data instanceof ErrorMessage) {
        this.messageModal.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
        this.messageModal.openModal();
      } else if (data instanceof Rule) {
        rule.isEnabled = data.isEnabled;
        ruleSet.state = "Dirty";
      }
    });    
  }

  removeRule() {
    let ruleSet = this.removeRuleModal.cacheData['ruleSet'];
    let rule = this.removeRuleModal.cacheData['rule'];
    const index = ruleSet.rules.findIndex( i => i._id === rule._id);
    this._PolicyManagementService.deleteRule(ruleSet._id, rule._id).subscribe(data => {
      if (data instanceof ErrorMessage){
        this.messageModal.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
        this.messageModal.openModal();
      } else if (data instanceof SuccessMessage){
        this._PolicyManagementService.innerRules.splice(index, 1);
        this._PolicyManagementService.innerDataSource.data = this._PolicyManagementService.innerRules;
        this.messageModal.updateModal("SUCCESS", data.success_message, "Close");
        this.messageModal.openModal();
      }
    });
  }

  openRemoveRuleConfirmModal(rule: Rule, ruleSet: RuleSet){
    this.removeRuleModal.updateModal("WARNING", "Are you sure you want to permanently remove rule: " + rule.ruleName + "?", "Yes", 
                                     "Cancel", undefined, undefined, {rule: rule, ruleSet: ruleSet});
    this.removeRuleModal.openModal();
  }

  removeRuleSet() {
    let ruleSetID = this.removeRuleSetModal.cacheData as number;
    this._PolicyManagementService.deleteRuleSet(ruleSetID).subscribe(data => {
      if (data instanceof ErrorMessage){
        this.messageModal.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
        this.messageModal.openModal();
      } else if (data instanceof SuccessMessage){
        this._PolicyManagementService.ruleSets = this._PolicyManagementService.ruleSets.filter( item => {
          return item._id !== ruleSetID;
        });

        this._PolicyManagementService.dataSource.data = this._PolicyManagementService.ruleSets;
        this.messageModal.updateModal("SUCCESS", data.success_message, "Close");
        this.messageModal.openModal();
      }
    });
  }

  openRemoveRuleSetConfirmModal(ruleSet: RuleSet){
    this.removeRuleSetModal.updateModal("WARNING", "Are you sure you want to permanently remove rule set: " + ruleSet.name + "?", "Yes", 
                                     "Cancel", undefined, undefined, ruleSet._id);
    this.removeRuleSetModal.openModal();
  }

  editRuleSet(ruleSet: RuleSet) {
    this._PolicyManagementService.editRuleSet = ruleSet;
    const dialogRef = this.dialog.open(PolicyManagementAddDialog, {
      width: '250px',
      data: 'edit'
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  addRule(ruleSet: RuleSet) {
    this._PolicyManagementService.editRuleSet = ruleSet;
    this._PolicyManagementService.isUserEditing = true;
    this._PolicyManagementService.isUserAdding = true;
  }

  isInstanceOfArray(someObj: any): boolean {
    if (someObj === undefined || someObj === null){
      return false;
    }
    return someObj instanceof Array;
  }

}

import { Component, ViewChild, OnInit, AfterViewInit, OnChanges, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { IRuleSet, RuleSet } from '../interface/ruleSet.interface';
import { PolicyManagementAddDialog } from '../add-dialog/policy-management-add-dialog.component';
import { PolicyManagementService } from '../services/policy-management.service';
import { MatTableDataSource, MatPaginator, MatSort, MatSelectChange } from '@angular/material';
import { Rule, ErrorMessage, SuccessMessage } from '../interface/rule.interface';
import { MatDialog } from '@angular/material';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import { WebsocketService } from '../../services/websocket.service';
import { PolicyManagementUploadDialog } from '../upload-dialog/policy-mng-upload.component';


@Component({
  selector: 'policy-management-table',
  styleUrls: ['policy-management-table.component.css'],
  templateUrl: 'policy-management-table.component.html'
})
export class PolicyManagementTable implements OnInit, AfterViewInit {
  columnsToDisplay = ['Enabled', 'name', 'appType', 'clearance', 'state', 'sensors', 'Actions'];
  innerColumnsToDisplay = ['Enabled', 'ruleName', 'lastModifiedDate', 'Actions'];

  ruleSetsDataSource: MatTableDataSource<Object>;
  rulesDataSource: MatTableDataSource<Object>;

  expandedElement: IRuleSet | null;
  objectKeys = Object.keys;

  isVisibleTest: boolean;
  isRulesVisible: Array<boolean>;


  @ViewChild('paginator', {static: false}) paginator: MatPaginator;
  @ViewChildren('paginatorInner') paginatorInner: QueryList<MatPaginator>;
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  constructor( public policySrv: PolicyManagementService,
               public dialog: MatDialog,
               private snackBar: MatSnackBar,
               private socketSrv: WebsocketService) {

    this.isVisibleTest = false;
    this.isRulesVisible = new Array();
    this.ruleSetsDataSource = new MatTableDataSource();
    this.rulesDataSource = new MatTableDataSource();
  }

  applyFilter(filterValue: string) {
    this.ruleSetsDataSource.filter = filterValue.trim().toLowerCase();
  }

  private socketRefresh(){
    this.socketSrv.getSocket().on('rulesetchange', (data: any) => {
      this.reloadRuleSetTable();
    });
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  private reloadRuleSetTable(){
    this.policySrv.getRuleSets().subscribe(ruleSets => {
      this.isRulesVisible =  new Array(ruleSets.length).fill(false);
      this.ruleSetsDataSource.data = ruleSets;
    });
  }

  private checkBroSuricataBothInstalled(){
    this.policySrv.checkCatalogStatus("suricata").subscribe(suricata => {
      let suricata_status = suricata as Array<Object>;
      this.policySrv.checkCatalogStatus("zeek").subscribe(zeek => {
        let zeek_status = zeek as Array<Object>;
        if (suricata_status && suricata_status.length == 0){
          if (zeek_status && zeek_status.length == 0){
            this.displaySnackBar("Before using this page, you need to have at least one sensor that has either \
                                  Zeek or Suricata installed. Go to the catalog page and install one or both of those applications.")
          }
        }
      });
    });
  }

  ngOnInit() {
    this.ruleSetsDataSource.filterPredicate = (data, filter: string)  => {
      const accumulator = (currentTerm, key) => {
        return this.nestedFilterCheck(currentTerm, data, key);
      };
      const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
      // Transform the filter by converting it to lowercase and removing whitespace.
      const transformedFilter = filter.trim().toLowerCase();
      return dataStr.indexOf(transformedFilter) !== -1;
    };

    this.ruleSetsDataSource.paginator = this.paginator;
    this.ruleSetsDataSource.sort = this.sort;

    this.reloadRuleSetTable();
    this.checkBroSuricataBothInstalled();
    this.socketRefresh();
  }

  ngAfterViewInit(): void {
    this.ruleSetsDataSource.paginator = this.paginator;
    this.ruleSetsDataSource.sort = this.sort;
  }

  ngOnChanges() {
    console.log("ngOnChanges");
    this.ruleSetsDataSource = new MatTableDataSource(this.ruleSetsDataSource.data);
    this.rulesDataSource = new MatTableDataSource(this.rulesDataSource.data);
    this.ruleSetsDataSource.paginator = this.paginator;
    this.rulesDataSource.sort = this.sort;
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

  getRules(ruleset: RuleSet, dataSourceDataIndex: number) {
    let index = this.getRuleSetIndex(ruleset);
    let ruleSets = this.ruleSetsDataSource.data as Array<RuleSet>;
    let wereRulesVisible = this.isRulesVisible[dataSourceDataIndex];

    //Make everything invisible
    this.isRulesVisible =  new Array(ruleSets.length).fill(false);

    //Clear ruleSetRules
    for (let ruleSet of ruleSets){
      ruleSet.rules = null;
    }

    if (!wereRulesVisible) {
      this.isRulesVisible[dataSourceDataIndex] = !this.isRulesVisible[dataSourceDataIndex];
    }

    this.policySrv.getRules(ruleset._id).subscribe(rules => {
      ruleset.rules = rules;
      this.rulesDataSource.data = rules;
      this.rulesDataSource.paginator = this.paginatorInner.toArray()[dataSourceDataIndex];
    });
  }

  private getRuleSetIndex(ruleSet: RuleSet): number{
    let ruleSets = this.ruleSetsDataSource.data as Array<RuleSet>;
    return ruleSets.findIndex( i => i._id === ruleSet._id);
  }

  isRulesVisibleFn(ruleset: RuleSet){
    return this.isRulesVisible[this.getRuleSetIndex(ruleset)];
  }

  editRule(ruleSet: RuleSet, rule: Rule) {
    this.policySrv.editRule = rule;
    this.policySrv.editRuleSet = ruleSet;
    this.policySrv.isUserEditing = true;
    this.policySrv.isUserAdding = false;

  }

  enableRuleSet(ruleSet: RuleSet) {
    let ruleSetValue = ruleSet;
    ruleSetValue.isEnabled = !ruleSetValue.isEnabled;
    this.policySrv.updateRuleSet(ruleSet as IRuleSet).subscribe(data => {
      if (data instanceof RuleSet) {
        const index = this.getRuleSetIndex(ruleSet);
        this.ruleSetsDataSource.data[index] = data;
      } else if (data instanceof ErrorMessage) {
        this.displaySnackBar(data.error_message);
      }
    });
  }

  isRuleChecked(rule: Rule): boolean {
    return rule.isEnabled;
  }

  enableRule(rule: Rule, ruleSet: RuleSet) {
    this.policySrv.toggleRule(ruleSet._id, rule).subscribe(data => {
      if (data instanceof ErrorMessage) {
        this.displaySnackBar(data.error_message);
      } else if (data instanceof Rule) {
        rule.isEnabled = data.isEnabled;
        ruleSet.state = "Dirty";
      }
    });
  }

  openRemoveRuleConfirmModal(rule: Rule, ruleSet: RuleSet){

    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: "50%",
      data: { "paneString": "Are you sure you want to permanently remove rule: " + rule.ruleName + "?",
              "paneTitle": "Remove Rule", "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        const index = ruleSet.rules.findIndex( i => i._id === rule._id);
        this.policySrv.deleteRule(ruleSet._id, rule._id).subscribe(data => {
          if (data instanceof ErrorMessage){
            this.displaySnackBar(data.error_message);
          } else if (data instanceof SuccessMessage){
            let tmp = this.rulesDataSource.data;
            tmp.splice(index, 1);
            this.rulesDataSource.data = tmp;
            this.displaySnackBar(data.success_message);
          }
        }, err => {
          this.displaySnackBar("Failed to delete rule.");
          console.error("Delete rule error:", err);
        });
      }
    });
  }

  public removeRuleSet(ruleSetID: number) {
    this.policySrv.deleteRuleSet(ruleSetID).subscribe(data => {
      if (data instanceof ErrorMessage){
        this.displaySnackBar(data.error_message);
      } else if (data instanceof SuccessMessage){
        let ruleSets = this.ruleSetsDataSource.data as Array<RuleSet>;
        this.ruleSetsDataSource.data = ruleSets.filter( item => {
          return item._id !== ruleSetID;
        });
        this.displaySnackBar(data.success_message);
      }
    }, err => {
      this.displaySnackBar("Failed to delete rule set.");
      console.error("Delete rule error:", err);
    });
  }

  openRemoveRuleSetConfirmModal(ruleSet: RuleSet){
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: "50%",
      data: { "paneString": "Are you sure you want to permanently remove rule set: " + ruleSet.name + "?",
              "paneTitle": "Remove Rule Set", "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.removeRuleSet(ruleSet._id);
      }
    });
  }

  editRuleSet(ruleSet: RuleSet) {
    this.policySrv.editRuleSet = ruleSet;
    const dialogRef = this.dialog.open(PolicyManagementAddDialog, {
      width: '500px',
      data: 'edit'
    });

    dialogRef.afterClosed().subscribe(result => {
      let ruleSetGroup = result as FormGroup
      if (ruleSetGroup && ruleSetGroup.valid){
        this.policySrv.updateRuleSet(ruleSetGroup.value as IRuleSet).subscribe(data => {
          if (data instanceof RuleSet){
            this.reloadRuleSetTable();
          } else if (data instanceof ErrorMessage) {
            this.displaySnackBar(data.error_message);
          }
        }, err => {
          this.displaySnackBar("Failed to update ruleset for an unknown reason.");
          console.log(err);
        });
      }
    });
  }

  addRule(ruleSet: RuleSet) {
    this.policySrv.editRuleSet = ruleSet;
    this.policySrv.isUserEditing = true;
    this.policySrv.isUserAdding = true;
  }

  isInstanceOfArray(someObj: any): boolean {
    if (someObj === undefined || someObj === null){
      return false;
    }
    return someObj instanceof Array;
  }

  ruleSync() {
    this.policySrv.syncRuleSets().subscribe(data => {
      this.displaySnackBar("Started Rule Sync. Open the notification dialog on the left to see its progress.");
    }, err => {
      this.displaySnackBar("Failed to start the rule sync. Check logs in /var/log/tfplenum/ for more details.");;
    });
  }

  addRuleSet(): void {
    const dialogRef = this.dialog.open(PolicyManagementAddDialog, {
      width: '500px',
      data: 'add'
    });

    dialogRef.afterClosed().subscribe(result => {
      let ruleSetGroup = result as FormGroup;
      if (ruleSetGroup && ruleSetGroup.valid){
        this.policySrv.createRuleSet(ruleSetGroup.value as IRuleSet).subscribe(data => {
          if (data instanceof RuleSet){
            this.ruleSetsDataSource.data.push(data);
            this.reloadRuleSetTable();
            this.displaySnackBar("Successfully added a Ruleset file.");
          } else if (data instanceof ErrorMessage) {
            this.displaySnackBar(data.error_message);
          }
        }, err => {
          this.displaySnackBar("Failed to create ruleset for an unknown reason.");
          console.log(err);
        });
      }
    });
  }

  uploadRulesFile(ruleSet: RuleSet){
    this.policySrv.editRuleSet = ruleSet;
    const dialogRef = this.dialog.open(PolicyManagementUploadDialog, {
      width: '500px',
      data: 'add'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result){
        return;
      }

      let ruleSetGroup = result['formGroup'] as FormGroup;
      if (ruleSetGroup && ruleSetGroup.valid){
        this.displaySnackBar("Uploading rules file. Please wait for a confirmation message.");
        this.policySrv.uploadRuleFile(result["fileToUpload"], ruleSetGroup.value as IRuleSet).subscribe(data => {
          const successMsg = "Successfully uploaded rules file.";
          if (data instanceof Rule){
            let tmp = this.rulesDataSource.data;
            tmp.push(data);
            this.rulesDataSource.data = tmp;
            this.displaySnackBar(successMsg);
          } else if (data instanceof Array) {
            let tmp = this.rulesDataSource.data;
            for (let item of data){
              tmp.push(item);
            }
            this.rulesDataSource.data = tmp;
            this.displaySnackBar(successMsg);
          } else if (data instanceof ErrorMessage) {
            this.displaySnackBar(data.error_message);
          }
        }, err => {
          this.displaySnackBar("Failed to create ruleset for an unknown reason.");
          console.log(err);
        });
      }

    });
  }

}

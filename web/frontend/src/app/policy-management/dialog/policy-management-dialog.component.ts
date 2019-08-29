import { Component, OnInit, Input, ViewChild,
         ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import * as FileSaver from 'file-saver';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import { PolicyManagementService } from '../services/policy-management.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
/* Interfaces */
import { Rule, ErrorMessage, SuccessMessage } from '../interface/rule.interface';
import { PcapService } from 'src/app/pcap-form/pcap.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Food {
  value: string;
  viewValue: string;
}

const DIALOG_WIDTH = "50%";

@Component({
  selector: 'policy-management-dialog',
  styleUrls: ['policy-management-dialog.component.css'],
  templateUrl: 'policy-management-dialog.component.html',
})
export class PolicyManagementDialog implements OnInit {

  @ViewChild('editorCard')
  private editorCard: ElementRef;

  @ViewChild('outerCard')
  private outerCard: ElementRef;

  @Output()
  closeNoSaveEvent: EventEmitter<any> = new EventEmitter();

  @Output()
  closeSaveEvent: EventEmitter<any> = new EventEmitter();

  ruleGroup: FormGroup;
  pcaps: Array<Object>;
  selectedPcap: string;
  numbers: Array<number>;

  constructor(public _PolicyManagementService: PolicyManagementService,
              private formBuilder: FormBuilder,
              private pcapSrv: PcapService,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) {
    this.selectedPcap = "";
    this.numbers = new Array(1000).fill(true);
  }

  /**
  * Triggers when the browser window resizes.
  * @param event
  */
  @HostListener('window:resize', ['$event'])
  onResize(event){
    this.resizeEditor(this.outerCard);
  }

  ngOnInit() {
    this.pcapSrv.getPcaps().subscribe(data => {
      this.pcaps = data as Array<Object>;
    });

    if ( this._PolicyManagementService.isUserAdding === false) {
      this.initializeForm(this._PolicyManagementService.editRule);
    } else {
      this.initializeForm(this.ruleGroup);
    }

    this.resizeEditor(this.outerCard);
  }

  initializeForm(rule) {
    this.ruleGroup = this.formBuilder.group({
      'ruleName': new FormControl(rule ? rule.ruleName : '', Validators.compose([Validators.required])),
      'rule': new FormControl(rule ? rule.rule : '', Validators.compose([Validators.required])),
      'isEnabled': new FormControl(rule ? rule.isEnabled: true),
      '_id': new FormControl(rule ? rule._id : '')
    });

    if (rule !== undefined){
      this._PolicyManagementService.getRuleContent(this._PolicyManagementService.editRuleSet._id, rule._id).subscribe(data => {
        if (data instanceof Rule){
          let len = data.rule.split('\n').length;
          if (len < 1000){
            len = 1000;
          }
          this.numbers = new Array(len).fill(true);
          this.editorCard.nativeElement.style.height = 21 * len + "px";
          this.ruleGroup.get('rule').setValue(data.rule);
        } else if (data instanceof ErrorMessage){
          this.displaySnackBar(data.error_message);
        }
      });
    }
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  private resizeEditor(element: ElementRef) {
    let height: string = "";
    if (window.innerHeight > 400) {
      height = (window.innerHeight - 250) + "px";
    } else {
      height = "100px";
    }
    element.nativeElement.style.maxHeight = height;
    element.nativeElement.style.height = height;
  }

  openCloseDialog() {
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: { "paneString": "Are you sure you want to close this editor? All changes will be discarded.",
              "paneTitle": "Close without saving", "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.closeEditor();
      }
    });
  }

  private closeEditor(){
    this._PolicyManagementService.isUserEditing = false;
  }

  openSaveDialog() {
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: { "paneString": "Are you sure you want to save this Rule file?",
              "paneTitle": "Close and save", "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.closeAndSave();
      }
    });
  }

  private closeAndSave() {
    if ( this._PolicyManagementService.isUserAdding === false) {
      this.editRule();
    } else {
      this.addRule();
    }
  }

  editRule() {
    this._PolicyManagementService.updateRule(this._PolicyManagementService.editRuleSet._id, this.ruleGroup.value).subscribe(data => {
      if (data instanceof Rule){
        this.displaySnackBar("Successfully updated " + data.ruleName + ".");
        this.closeEditor();
      } else if (data instanceof ErrorMessage) {
        this.displaySnackBar(data.error_message);
      }
    });
  }

  addRule() {
    this._PolicyManagementService.createRule(this._PolicyManagementService.editRuleSet._id,
                                             this.ruleGroup.value).subscribe(data => {
      if (data instanceof Rule){
        this.displaySnackBar("Successfully created " + data.ruleName + ".");
        this.closeEditor();
      } else if (data instanceof ErrorMessage) {
        this.displaySnackBar(data.error_message);
      }
    });
  }

  validateRule(){
    this._PolicyManagementService.validateRule(this.ruleGroup.value).subscribe(data => {
      if (data instanceof SuccessMessage){
        this.displaySnackBar(data.success_message);
      } else if (data instanceof ErrorMessage) {
        this.displaySnackBar(data.error_message);
      }
    });
  }

  isRuleEnabled(): boolean{
    return this.ruleGroup.get('isEnabled').value;
  }

  testAgainstPCAP(){
    this._PolicyManagementService.testRuleAgainstPCAP(this.selectedPcap, this.ruleGroup.value["rule"]).subscribe(
      data => {
        if (data["message"]){
          this.displaySnackBar(data["message"]);
          return;
        }

        if (data["type"] === "application/tar+gzip"){
          const json_blob = new Blob([data], { type: 'application/tar+gzip'});
          FileSaver.saveAs(json_blob, 'bro_test_results.tar.gz');
        } else {
          const json_blob = new Blob([data], { type: 'application/json'});
          FileSaver.saveAs(json_blob, 'pcap_test_results.json');
        }
      }, err => {
        if (err.status === 501){
          this.displaySnackBar("Validation failed for testing against PCAP. \
                                Please make sure you have selected a PCAP and your rules validate.");
        } else {
          console.error(err);
          this.displaySnackBar("Failed to test rule against PCAP for an unknown reason.");
        }
      }
    );
  }

  getNumber(num: number){
    return new Array(num);
  }
}

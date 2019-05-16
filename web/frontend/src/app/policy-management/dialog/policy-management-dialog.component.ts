import { Component, OnInit, Input, ViewChild,
         ElementRef, HostListener, EventEmitter, Output } from '@angular/core';
import * as FileSaver from 'file-saver';
import { HtmlModalPopUp, ModalType } from '../../html-elements';
import { PolicyManagementService } from '../services/policy-management.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
/* Interfaces */
import { Rule, ErrorMessage, SuccessMessage } from '../interface/rule.interface';
import { PcapService } from 'src/app/pcap.service';

export interface Food {
  value: string;
  viewValue: string;
}

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

  closeModal: HtmlModalPopUp;
  saveModal: HtmlModalPopUp;
  messageModal: HtmlModalPopUp;
  isValidateOnly: boolean;
  ruleGroup: FormGroup;  
  pcaps: Array<Object>;
  selectedPcap: string;
  numbers: Array<number>;

  constructor(public _PolicyManagementService: PolicyManagementService,
              private formBuilder: FormBuilder,
              private pcapSrv: PcapService) {
    this.closeModal = new HtmlModalPopUp("editor_modal");
    this.saveModal = new HtmlModalPopUp("save_modal");
    this.messageModal = new HtmlModalPopUp("message_modal");
    this.isValidateOnly = false;
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
          this.messageModal.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
          this.messageModal.openModal();
        }
      });
    }
  }

  private resizeEditor(element: ElementRef) {
    let height: string = "";
    if (window.innerHeight > 400) {
      height = (window.innerHeight - 330) + "px";
    } else {
      height = "100px";
    }
    element.nativeElement.style.maxHeight = height;
    element.nativeElement.style.height = height;
  }

  openCloseDialog() {
    this.closeModal.updateModal("Close without saving", "Are you sure you want to close this editor? All changes will be discarded.", "Yes", "Cancel");
    this.closeModal.openModal();
  }

  openSaveDialog() {
    this.saveModal.updateModal("Close and save", "Are you sure you want to save this Rule?", "Save", "Cancel");
    this.saveModal.openModal();
  }

  closeWithoutSaving() {
    this._PolicyManagementService.isUserEditing = false;
  }

  closeAndSave() {
    if ( this._PolicyManagementService.isUserAdding === false) {
      this.editRule();
    } else {
      this.addRule();
    }
  }

  editRule() {
    this._PolicyManagementService.updateRule(this._PolicyManagementService.editRuleSet._id, this.ruleGroup.value).subscribe(data => {
      if (data instanceof Rule){        
        this.messageModal.updateModal("SUCCESS", "Successfully updated " + data.ruleName + ".", "Close");
        this.messageModal.openModal();
      } else if (data instanceof ErrorMessage) {
        this.messageModal.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
        this.messageModal.openModal();
      }
    });
  }

  addRule() {
    this._PolicyManagementService.createRule(this._PolicyManagementService.editRuleSet._id, 
                                             this.ruleGroup.value).subscribe(data => {      
      if (data instanceof Rule){
        this.messageModal.updateModal("SUCCESS", "Successfully created " + data.ruleName + ".", "Close");
        this.messageModal.openModal();
      } else if (data instanceof ErrorMessage) {
        this.messageModal.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
        this.messageModal.openModal();
      }
    });
  }

  validateRule(){
    this.isValidateOnly = true;
    this._PolicyManagementService.validateRule(this.ruleGroup.value).subscribe(data => {
        if (data instanceof SuccessMessage){
          this.messageModal.updateModal("SUCCESS", data.success_message, "Close");
          this.messageModal.openModal();
        } else if (data instanceof ErrorMessage) {
          this.messageModal.updateModal("ERROR", data.error_message, "Close", undefined, ModalType.error);
          this.messageModal.openModal();
        }
      });
  }

  isRuleEnabled(): boolean{
    return this.ruleGroup.get('isEnabled').value;
  }

  testAgainstPCAP(){
    this._PolicyManagementService.testRuleAgainstPCAP(this.selectedPcap, this.ruleGroup.value["rule"]).subscribe(
      data => {
        const json_blob = new Blob([data], { type: 'application/json'});
        FileSaver.saveAs(json_blob, 'pcap_test_results.json');
      }, err => {
        if (err.status === 501){
          this.messageModal.updateModal("ERROR", "Validation failed for testing against PCAP. \
                                                  Please make sure you have selected a PCAP and your rules validate.", 
                                        "Close", undefined, ModalType.error);
        } else {
          console.error(err);
          this.messageModal.updateModal("ERROR", "Failed to test rule against PCAP for an unknown reason.", 
                                        "Close", undefined, ModalType.error);
        }
        this.messageModal.openModal();
      }
    );
  }

  closeEditor() {
    if (this.isValidateOnly){
      this.isValidateOnly = false;
    } else if (this.messageModal.type !== ModalType.error) {
      this._PolicyManagementService.isUserEditing = false;
    }
  }

  getNumber(num: number){
    return new Array(num);
  }
}

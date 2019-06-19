import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IRuleSet, RuleSet } from '../interface/ruleSet.interface';
import { PolicyManagementAddDialog } from '../add-dialog/policy-management-add-dialog.component';
import { PolicyManagementService } from '../services/policy-management.service';
import { MatDialog } from '@angular/material';
import { UploadDialogComponent } from '../upload-dialog/upload-dialog.component';
import { HtmlModalPopUp, ModalType } from 'src/app/html-elements';
import { ErrorMessage } from '../interface/rule.interface';
import { ModalLoadingComponent } from 'src/app/modal-loading/modal-loading.component';

@Component({
  selector: 'app-policy-management',
  templateUrl: './policy-management.component.html',
  styleUrls: ['./policy-management.component.css']
})
export class PolicyManagementComponent implements OnInit {

  messageDialog: HtmlModalPopUp;

  @ViewChild('loadingDialog')
  private loadingDialog: ModalLoadingComponent;

  constructor(private route: ActivatedRoute,
              private title: Title,
              public dialog: MatDialog,
              public _PolicyManagementService: PolicyManagementService,
              private router: Router,
              private cdr: ChangeDetectorRef) {
      this.messageDialog = new HtmlModalPopUp("msgModal2")
  }

  ngOnInit() {
    this.title.setTitle("Rule Sets");
  }

  ruleSync() {
    this._PolicyManagementService.syncRuleSets().subscribe(data => {

    });
  }

  addRuleSet(): void {
    const dialogRef = this.dialog.open(PolicyManagementAddDialog, {
      width: '250px',
      data: 'add'
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  uploadRuleSetFile(): void {
    const dialogRef = this.dialog.open(UploadDialogComponent, {
      width: '300px',
      data: null
    })
    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.loadingDialog.openModal();
        this._PolicyManagementService.uploadRuleFile(data).subscribe(
          resp => {
            if (resp instanceof ErrorMessage){
              this.messageDialog.updateModal("ERROR", resp.error_message, "Close", undefined, ModalType.error);
              this.messageDialog.openModal();
            } else if (resp instanceof RuleSet){
              this._PolicyManagementService.ruleSets.push(resp);
              this.cdr.detectChanges();

              setTimeout(() => {
                this.loadingDialog.hideModal();
                this.messageDialog.updateModal("SUCCESS", ["Successfully uploaded the file!",
                                                           "Rule Set Name: " + resp.name,
                                                           "Group Name: " + resp.groupName], "Close");
                this.messageDialog.openModal();
              }, 1000);
            }
          },
          err => {
            this.messageDialog.updateModal("ERROR", err, "Close", undefined, ModalType.error);
            this.messageDialog.openModal();
          });
      }
    })
  }

  fileChanged(e: Event) {
    var target: HTMLInputElement = e.target as HTMLInputElement;
    for (var i = 0; i < target.files.length; i++) {
      this.upload(target.files[i]);
    }
  }

  upload(file: File) {
    var formData: FormData = new FormData();
    formData.append("file", file, file.name);

    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (ev: ProgressEvent) => {
      console.log("loading");
    });
    xhr.open("PUT", "api/upload", true);
    xhr.send(formData);
  }
}

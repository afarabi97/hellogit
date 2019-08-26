import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PolicyManagementAddDialog } from '../add-dialog/policy-management-add-dialog.component';
import { PolicyManagementService } from '../services/policy-management.service';
import { MatDialog } from '@angular/material';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-policy-management',
  templateUrl: './policy-management.component.html',
  styleUrls: ['./policy-management.component.css']
})
export class PolicyManagementComponent implements OnInit {

  constructor(private title: Title,
              public dialog: MatDialog,
              public _PolicyManagementService: PolicyManagementService,
              private snackBar: MatSnackBar) {
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  ngOnInit() {
    this.title.setTitle("Rule Sets");
  }

  ruleSync() {
    this._PolicyManagementService.syncRuleSets().subscribe(data => {
      this.displaySnackBar("Started Rule Sync. Open the notification dialog on the left to see its progress.");
    }, err => {
      this.displaySnackBar("Failed to start the rule sync. Check logs in /var/log/tfplenum/ for more details.");;
    });
  }

  addRuleSet(): void {
    const dialogRef = this.dialog.open(PolicyManagementAddDialog, {
      width: '250px',
      data: 'add'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

}

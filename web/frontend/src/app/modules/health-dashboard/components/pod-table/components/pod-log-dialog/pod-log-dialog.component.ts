import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';


@Component({
  selector: 'pod-log-dialog',
  templateUrl: './pod-log-dialog.component.html',
  styleUrls: ['./pod-log-dialog.component.scss']
})
export class PodLogModalDialogComponent implements OnInit {
  title: string;
  info: Array<Object>;

  confirmBtnText: string;
  currentTabIndex: number;

  constructor(public dialogRef: MatDialogRef<PodLogModalDialogComponent>,
              @Inject(MAT_DIALOG_DATA)
              public backingObject: { title: string; info: Array<Object>}) {
      this.title = backingObject.title;
      this.info = backingObject.info;
  }

  ngOnInit() {
    this.currentTabIndex = 0;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  changeTab(tab: MatTabChangeEvent){
    this.currentTabIndex = tab.index;
  }
}

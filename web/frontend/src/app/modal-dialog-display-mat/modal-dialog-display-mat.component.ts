import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-modal-dialog-display-mat',
  templateUrl: './modal-dialog-display-mat.component.html',
  styleUrls: ['./modal-dialog-display-mat.component.scss']
})
export class ModalDialogDisplayMatComponent implements OnInit {
  title: string;
  info: string;
  
  confirmBtnText: string;

  constructor(public dialogRef: MatDialogRef<ModalDialogDisplayMatComponent>,
              @Inject(MAT_DIALOG_DATA)
              public backingObject: { title: string, info: string})
  {
      this.title = backingObject.title;
      this.info = backingObject.info;
  }

  ngOnInit() {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

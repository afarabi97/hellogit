import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-modal-table',
  templateUrl: './modal-table.component.html',
  styleUrls: ['./modal-table.component.scss']
})
export class ModalTableComponent implements OnInit {
  title: string;
  pod: Object;  

  constructor(public dialogRef: MatDialogRef<ModalTableComponent>,
              @Inject(MAT_DIALOG_DATA)
              public backingObject: { title: string, pod: Object})
  {
      this.title = backingObject.title;
      this.pod = backingObject.pod;
  }

  ngOnInit() {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  getRequest(container: Object, key: string): string {
    if (container){
      if (container['resources']) {
        if (container['resources']['requests']) {
          if (container['resources']['requests'][key]){
            return container['resources']['requests'][key];
          }
        }
      }
    }
    return "Not Set";
  }

  getLimit(container: Object, key: string): string {
    if (container){
      if (container['resources']) {
        if (container['resources']['limits']) {
          if (container['resources']['limits'][key]){
            return container['resources']['limits'][key];
          }
        }
      }
    }
    return "Not Set";
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import {MatIconModule} from '@angular/material/icon'

@Component({
  selector: 'cert-install-dialog',
  templateUrl: './cert-install-dialog.component.html',
  styleUrls: ['cert-install-dialog.component.css'],
})
export class CertInstallDialogComponent {
  constructor( public dialogRef: MatDialogRef<CertInstallDialogComponent>,
               @Inject(MAT_DIALOG_DATA) public node: any) {}

  onDownloadClick(node: any): void {
    const certurl = document.createElement('a');
    certurl.setAttribute('target', '_blank');
    certurl.setAttribute('href', `assets/${node.hostname}/root/ltac_admin_user.p12`);
    certurl.setAttribute('download', 'ltac_admin_user.p12');
    document.body.appendChild(certurl);
    certurl.click();
    certurl.remove();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

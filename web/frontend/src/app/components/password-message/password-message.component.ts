import { Component } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'cvah-password-message',
  templateUrl: './password-message.component.html'
})
export class PasswordMessageComponent {
  constructor(public dialog: MatDialog) {}

  openDialog() {
    this.dialog.open(PasswordMessageComponent);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HTTP_OPTIONS } from '../globals';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogControlTypes, DialogFormControl } from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { pluck, share, shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WeaponSystemNameService {
  system_name;
  default_system_name = 'DIP';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog) {
  }

  saveSystemName(system_name: string) {    
    const url = '/api/save_system_name';
    return this.http.post(url, {'system_name': system_name});
  }

  getSystemName() {
    const url = '/api/get_system_name';
    return this.http.get(url).pipe(shareReplay());
  };

  selectSystemName() {
    let control = new DialogFormControl('Pick your system', null, Validators.required);
    control.options = ['DIP', 'MIP', 'GIP'];

    control.controlType = DialogControlTypes.dropdown;

    let group = new FormGroup({'dropdown': control});

    const dialogRef = this.dialog.open(ModalDialogMatComponent, {
      width: '400px',
      maxHeight: '400px',
      data: { title: "Select the system type.",
              instructions: "",
              dialogForm: group,
              confirmBtnText: "OK" }
    });

    return dialogRef;

  }

}

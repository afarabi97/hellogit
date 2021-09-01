import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

const IP_ADDRESS_PATTERN = "^(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])\\.(0|[1-9][0-9]?|1[0-9]{2}|2[0-5][0-5])$";

@Component({
  templateUrl: 'add-kit-token.component.html',
  styleUrls: ['./add-kit-token.component.css']
})
export class AddKitToken implements OnInit {
  kit_token_settings: FormGroup;

    constructor(public dialogRef: MatDialogRef<AddKitToken>,
      private fb: FormBuilder) {
        dialogRef.disableClose = true;
    }

    ngOnInit() {
      this.kit_token_settings = this.create_kit_token_settings_form_group();
    }

    create_kit_token_settings_form_group() {
      return this.fb.group({
        ipaddress: [null, [Validators.required, Validators.pattern(IP_ADDRESS_PATTERN)]]
      });
    }

    submit(form: FormGroup) {
      if (form.valid) {
        this.dialogRef.close(this.kit_token_settings.value);
      }
    }
}

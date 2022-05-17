import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { ErrorMessageClass, SuccessMessageClass } from '../../../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { UserService } from '../../../../services/user.service';
import { TopNavbarComponent } from '../../../../top-navbar/top-navbar.component';
import { ToolsService } from '../../services/tools.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-update-docs-form',
  templateUrl: './update-docs.component.html',
  styleUrls: ['./update-docs.component.css']
})
export class UpdateDocsFormComponent implements OnInit {

  zipToUpload: File = null;
  isCardVisible: boolean;
  controllerMaintainer: boolean;
  spaceFormControl: FormControl;
  matcher: MyErrorStateMatcher;
  constructor(private toolSrv: ToolsService,
              private mat_snackbar_service_: MatSnackBarService,
              private userService: UserService,
              private navbar: TopNavbarComponent) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.spaceFormControl = new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z]{1,50}$')
    ]);
    this.matcher = new MyErrorStateMatcher();
  }

  toggleCard() {
    this.isCardVisible = !this.isCardVisible;
  }

  uploadFile() {
    this.mat_snackbar_service_.displaySnackBar('Loading ' + this.zipToUpload.name + '...', MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    const form_data: FormData = new FormData();
    form_data.append('upload_file', this.zipToUpload, this.zipToUpload.name);
    form_data.append('space_name', this.spaceFormControl.value);
    this.toolSrv.upload_documentation(form_data)
      .subscribe(
        (response: SuccessMessageClass) => {
          this.spaceFormControl.reset();
          this.zipToUpload = null;
          this.navbar.buildNavBar();
          this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `uploading documentation`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  handleFileInput(files: FileList) {
    this.zipToUpload = files.item(0);
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { ErrorMessageClass, SuccessMessageClass } from '../../../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { UserService } from '../../../../services/user.service';
import { ElasticLicenseClass } from '../../classes/elastic-license.class';
import { ToolsService } from '../../services/tools.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-update-es-license-form',
  templateUrl: './update-es-license-form.component.html',
  styleUrls: ['./update-es-license-form.component.css']
})
export class UpdateEsLicenseComponent implements OnInit {

  fileToUpload: File = null;
  isCardVisible: boolean;
  controllerMaintainer: boolean;
  matcher: MyErrorStateMatcher;
  currentLicense: Object;
  constructor(private toolSrv: ToolsService,
              private mat_snackbar_service_: MatSnackBarService,
              private userService: UserService) {
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.matcher = new MyErrorStateMatcher();
    this.toolSrv.get_elastic_license()
      .subscribe(
        (response: ElasticLicenseClass) => {
          this.currentLicense = response;
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `retrieving elastic license`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  toggleCard() {
    this.isCardVisible = !this.isCardVisible;
  }

  uploadFile(event: any) {
    event.target.disabled = true;
    this.mat_snackbar_service_.displaySnackBar('Loading ' + this.fileToUpload.name + '...', MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const license: Object = JSON.parse(fileReader.result as string);
      this.toolSrv.upload_elastic_license(license)
        .subscribe(
          (response: SuccessMessageClass) => {
            this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          },
          (error: ErrorMessageClass | HttpErrorResponse) => {
            if (error instanceof ErrorMessageClass) {
              this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else {
              const message: string = `uploading new elastic license`;
              this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          });
    };
    fileReader.readAsText(this.fileToUpload);
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }
}

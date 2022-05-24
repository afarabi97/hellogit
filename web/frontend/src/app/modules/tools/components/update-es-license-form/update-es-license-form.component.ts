import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, SuccessMessageClass } from '../../../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { ElasticLicenseClass } from '../../classes/elastic-license.class';
import { ToolsService } from '../../services/tools.service';

/**
 * Component used for updating the elastic license
 *
 * @export
 * @class UpdateEsLicenseComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-update-es-license-form',
  templateUrl: './update-es-license-form.component.html',
  styleUrls: [
    './update-es-license-form.component.scss'
  ]
})
export class UpdateEsLicenseComponent implements OnInit {
  // Used for storing the selected file
  json_for_upload: File;
  // Used for displaying data within license in html
  elastic_license: ElasticLicenseClass;
  // Used for displaying the name of the file selected within html
  file_name_form_control: FormControl;

  /**
   * Creates an instance of UpdateEsLicenseComponent.
   *
   * @param {ToolsService} tools_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof UpdateEsLicenseComponent
   */
  constructor(private tools_service_: ToolsService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.json_for_upload = null;
  }

  /**
   * Used for initial setup
   *
   * @memberof UpdateEsLicenseComponent
   */
  ngOnInit(): void {
    this.initialize_file_name_form_control_();
    this.api_get_elastic_license_();
  }

  /**
   * Used for linking private api method call to a public
   * method html can interact with
   *
   * @memberof UpdateEsLicenseComponent
   */
  upload_button_click(): void {
    const message: string = `Loading ${this.json_for_upload.name}...`;
    this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    const file_reader: FileReader = new FileReader();
    file_reader.onload = (e: ProgressEvent<FileReader>) => {
      const license: Object = JSON.parse(file_reader.result as string);
      this.api_upload_elastic_license_(license);
    };
    file_reader.readAsText(this.json_for_upload);
  }

  /**
   * Used for handeling the selected file input
   *
   * @param {FileList} files
   * @memberof UpdateEsLicenseComponent
   */
  handle_json_file_input(files: FileList): void {
    this.json_for_upload = files.item(0);
    this.file_name_form_control.setValue(this.json_for_upload.name);
  }

  /**
   * Used for setting up the file name form control
   *
   * @private
   * @memberof UpdateEsLicenseComponent
   */
  private initialize_file_name_form_control_(): void {
    const file_name_form_control: FormControl = new FormControl({ value: '', disabled: true });
    this.set_file_name_form_control_(file_name_form_control);
  }

  /**
   * Used for setting file name form control with passed value
   *
   * @private
   * @param {FormControl} file_name_form_control
   * @memberof UpdateEsLicenseComponent
   */
  private set_file_name_form_control_(file_name_form_control: FormControl): void {
    this.file_name_form_control = file_name_form_control;
  }

  /**
   * Used for making api rest call to get elastic license
   *
   * @private
   * @memberof UpdateEsLicenseComponent
   */
  private api_get_elastic_license_(): void {
    this.tools_service_.get_elastic_license()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: ElasticLicenseClass) => {
          this.elastic_license = response;
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

  /**
   * Used for making api rest call to upload elastic license
   *
   * @private
   * @param {Object} license
   * @memberof UpdateEsLicenseComponent
   */
  private api_upload_elastic_license_(license: Object): void {
    this.tools_service_.upload_elastic_license(license)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.json_for_upload = null;
          this.file_name_form_control.reset();
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
  }
}

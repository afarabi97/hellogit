import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, SuccessMessageClass } from '../../../../classes';
import { COMMON_VALIDATORS, DIALOG_WIDTH_800PX, MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { ToolsService } from '../../services/tools.service';
import { UpdateDocumentationMessageComponent } from './components/update-documentation-message.component';

/**
 * Component used for updating documentation spaces with passed zip file
 *
 * @export
 * @class UpdateDocsFormComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-update-docs-form',
  templateUrl: './update-docs.component.html',
  styleUrls: [
    './update-docs.component.scss'
  ]
})
export class UpdateDocsFormComponent implements OnInit {
  // Used for storing the selected file
  zip_for_upload: File;
  // Used for taking in operator input for later use
  space_name_form_control: FormControl;
  // Used for displaying the name of the file selected within html
  file_name_form_control: FormControl;

  /**
   * Creates an instance of UpdateDocsFormComponent.
   *
   * @param {MatDialog} mat_dialog_
   * @param {ToolsService} tools_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof UpdateDocsFormComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private tools_service_: ToolsService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.zip_for_upload = null;
  }

  /**
   * Used for initial setup
   *
   * @memberof UpdateDocsFormComponent
   */
  ngOnInit(): void {
    this.initialize_space_name_form_control_();
    this.initialize_file_name_form_control_();
  }

  /**
   * Used for opening update documentation message dialog window
   *
   * @memberof UpdateDocsFormComponent
   */
   open_update_documentation_message_dialog(): void {
    this.mat_dialog_.open(UpdateDocumentationMessageComponent, {
      width: DIALOG_WIDTH_800PX
    });
  }

  /**
   * Used for displaying error message for a form field
   *
   * @param {(FormControl | AbstractControl)} form_control
   * @return {string}
   * @memberof UpdateDocsFormComponent
   */
  get_error_message(form_control: FormControl | AbstractControl): string {
    return form_control.errors ? form_control.errors.error_message : '';
  }

  /**
   * Used for linking private api method call to a public
   * method html can interact with
   *
   * @memberof UpdateDocsFormComponent
   */
  upload_button_click(): void {
    const message: string = `Loading ${this.zip_for_upload.name}...`;
    this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    const form_data: FormData = new FormData();
    form_data.append('upload_file', this.zip_for_upload, this.zip_for_upload.name);
    form_data.append('space_name', this.space_name_form_control.value);
    this.api_upload_documentation_(form_data);
  }

  /**
   * Used for handeling the selected file input
   *
   * @param {FileList} files
   * @memberof UpdateDocsFormComponent
   */
  handle_zip_file_input(files: FileList): void {
    this.zip_for_upload = files.item(0);
    this.file_name_form_control.setValue(this.zip_for_upload.name);
  }

  /**
   * Used for setting up the space name form control
   *
   * @private
   * @memberof UpdateDocsFormComponent
   */
  private initialize_space_name_form_control_(): void {
    const space_name_form_control: FormControl = new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.is_valid_space_name)]));
    this.set_space_name_form_control_(space_name_form_control);
  }

  /**
   * Used for setting up the file name form control
   *
   * @private
   * @memberof UpdateDocsFormComponent
   */
  private initialize_file_name_form_control_(): void {
    const file_name_form_control: FormControl = new FormControl({ value: '', disabled: true });
    this.set_file_name_form_control_(file_name_form_control);
  }

  /**
   * Used for setting space name form control with passed value
   *
   * @private
   * @param {FormControl} space_name_form_control
   * @memberof UpdateDocsFormComponent
   */
  private set_space_name_form_control_(space_name_form_control: FormControl): void {
    this.space_name_form_control = space_name_form_control;
  }

  /**
   * Used for setting file name form control with passed value
   *
   * @private
   * @param {FormControl} file_name_form_control
   * @memberof UpdateDocsFormComponent
   */
  private set_file_name_form_control_(file_name_form_control: FormControl): void {
    this.file_name_form_control = file_name_form_control;
  }

  /**
   * Used for making api rest call upload documentation
   *
   * @private
   * @param {FormData} form_data
   * @memberof UpdateDocsFormComponent
   */
  private api_upload_documentation_(form_data: FormData): void {
    this.tools_service_.upload_documentation(form_data)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.zip_for_upload = null;
          this.space_name_form_control.reset();
          this.file_name_form_control.reset();
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
}

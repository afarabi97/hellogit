import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ObjectUtilitiesClass, RuleSetClass } from '../../../../classes';
import { RulesService } from '../../../../services/rules.service';
import { RulesGroupUploadInterface } from '../../interfaces';

/**
 * Used for uploading file for rule set group
 *
 * @export
 * @class PolicyManagementUploadDialogComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'cvah-policy-management-upload-dialog',
  templateUrl: 'policy-management-upload-dialog.component.html',
  styleUrls: [
    'policy-management-upload-dialog.component.scss'
  ]
})
export class PolicyManagementUploadDialogComponent implements OnInit {
  // Used for file name placeholder message
  readonly selection_file_name_placeholder: string = 'File Name';
  readonly no_selection_file_name_placeholder: string = 'Select File For Upload';
  // Used for filling out rule set form
  rule_set_form_group: FormGroup;
  // Used for displaying selected file name
  file_name_form_control: FormControl;
  // Used for saving a selected file for upload
  rules_file_to_upload: File = null;

  /**
   * Creates an instance of PolicyManagementUploadDialogComponent.
   *
   * @param {MatDialogRef<PolicyManagementUploadDialogComponent>} mat_dialog_ref_
   * @param {FormBuilder} form_builder_
   * @param {RulesService} rules_service_
   * @param {string} dialog_data
   * @memberof PolicyManagementUploadDialogComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<PolicyManagementUploadDialogComponent>,
              private form_builder_: FormBuilder,
              private rules_service_: RulesService,
              @Inject(MAT_DIALOG_DATA) public dialog_data: string) {}

  /**
   * Used for initializing data on component creation
   *
   * @memberof PolicyManagementUploadDialogComponent
   */
  ngOnInit(): void {
    const edit_rule_set: RuleSetClass = this.rules_service_.get_edit_rule_set();
    this.initialize_form_(edit_rule_set);
    this.set_file_name_control_(null);
  }

  /**
   * Used for changing the file name form control placeholder based on file selected or not selected
   *
   * @returns {string}
   * @memberof PolicyManagementUploadDialogComponent
   */
  get_file_name_place_holder(): string {
    return ObjectUtilitiesClass.notUndefNull(this.rules_file_to_upload) ?
      this.selection_file_name_placeholder : this.no_selection_file_name_placeholder;
  }

  /**
   * Used for handeling the file selection input
   *
   * @param {FileList} files
   * @memberof PolicyManagementUploadDialogComponent
   */
  handle_file_input(files: FileList): void {
    this.set_rules_file_to_upload_(files.item(0));
  }

  /**
   * Used for uploading selected file through the dialog window
   *
   * @memberof PolicyManagementUploadDialogComponent
   */
  upload(): void {
    const rules_group_upload: RulesGroupUploadInterface = {
      form_group: this.rule_set_form_group,
      file_to_upload: this.rules_file_to_upload
    };
    this.mat_dialog_ref_.close(rules_group_upload);
  }

  /**
   * Used for closing the dialog window
   *
   * @memberof PolicyManagementUploadDialogComponent
   */
  cancel(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for setting the file for upload
   *
   * @private
   * @param {File} file
   * @memberof PolicyManagementUploadDialogComponent
   */
  private set_rules_file_to_upload_(file: File): void {
    this.rules_file_to_upload = file;
    this.set_file_name_control_(file);
  }

  /**
   * Used for initializing the form group
   *
   * @private
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementUploadDialogComponent
   */
  private initialize_form_(rule_set: RuleSetClass): void {
    const rule_set_form_group: FormGroup = this.form_builder_.group({
      _id: new FormControl(rule_set ? rule_set._id : '0'),
      name: new FormControl(rule_set ? rule_set.name : '', Validators.compose([Validators.required]))
    });
    rule_set_form_group.get('name').disable();
    this.set_rule_set_form_group_(rule_set_form_group);
  }

  /**
   * Used for setting the rule set group
   *
   * @private
   * @param {FormGroup} rule_set_form_group
   * @memberof PolicyManagementUploadDialogComponent
   */
  private set_rule_set_form_group_(rule_set_form_group: FormGroup): void {
    this.rule_set_form_group = rule_set_form_group;
  }

  /**
   * Used for setting the selected file name for upload
   *
   * @private
   * @param {File} file
   * @memberof PolicyManagementUploadDialogComponent
   */
  private set_file_name_control_(file: File): void {
    if (ObjectUtilitiesClass.notUndefNull(file)) {
      this.file_name_form_control.setValue(file.name);
    } else {
      this.file_name_form_control = new FormControl('');
    }
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as FileSaver from 'file-saver';
import { Subject } from 'rxjs';

import { ErrorMessageClass, ObjectUtilitiesClass, RuleClass, RuleSetClass, SuccessMessageClass } from '../../../../classes';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import {
  CANCEL_DIALOG_OPTION,
  CONFIRM_DIALOG_OPTION,
  DIALOG_WIDTH_50PERCENT,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../../../constants/cvah.constants';
import { get_form_control_value_from_form_group } from '../../../../functions/cvah.functions';
import {
  BackingObjectInterface,
  ConfirmDialogMatDialogDataInterface,
  RuleInterface,
  RulePCAPTestInterface
} from '../../../../interfaces';
import {
  DialogControlTypes,
  DialogFormControl,
  DialogFormControlConfigClass
} from '../../../../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../../../../modal-dialog-mat/modal-dialog-mat.component';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { PcapService } from '../../../../services/pcap.service';
import { RulesService } from '../../../../services/rules.service';
import { EDIT } from '../../constants/policy-management.constant';
import { DialogDataInterface } from '../../interfaces';

/**
 * Component used for creating and editing a rule
 *
 * @export
 * @class RuleAddEditComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-rule-add-edit',
  templateUrl: 'rule-add-edit.component.html',
  styleUrls: [
    'rule-add-edit.component.scss'
  ]
})
export class RuleAddEditComponent implements OnInit {
  // Used for passing readonly value to text editor
  readonly show_options: boolean = true;
  readonly is_read_only: boolean = false;
  readonly use_language: string = 'txt';
  // Used for passing the rule text to the text editor
  text: string;
  // Used for triggering return text from text editor
  get_return_text$: Subject<void> = new Subject<void>();
  // Used for passing rule form group to html
  rule_form_group: FormGroup;
  // Used for passing list of pcaps to html
  pcaps: Object[];
  // Used for retaining user selected pcap
  selected_pcap: string;

  /**
   * Creates an instance of RuleAddEditComponent.
   *
   * @param {MatDialogRef<RuleAddEditComponent>} mat_dialog_ref_
   * @param {FormBuilder} form_builder_
   * @param {MatDialog} mat_dialog_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {PcapService} pcap_service_
   * @param {RulesService} rules_service_
   * @param {DialogDataInterface} dialog_data
   * @memberof RuleAddEditComponent
   */
  constructor(private mat_dialog_ref_: MatDialogRef<RuleAddEditComponent>,
              private form_builder_: FormBuilder,
              private mat_dialog_: MatDialog,
              private mat_snackbar_service_: MatSnackBarService,
              private pcap_service_: PcapService,
              private rules_service_: RulesService,
              @Inject(MAT_DIALOG_DATA) public dialog_data: DialogDataInterface) {
    this.text = '';
    this.selected_pcap = '';
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof RuleAddEditComponent
   */
  ngOnInit(): void {
    this.set_text_(undefined);
    this.get_is_user_adding_();
    this.api_get_pcaps_();
  }

  /**
   * Used for checking if rule is enabled
   *
   * @returns {boolean}
   * @memberof RuleAddEditComponent
   */
  is_rule_enabled(): boolean {
    return get_form_control_value_from_form_group<boolean>(this.rule_form_group, 'isEnabled');
  }

  /**
   * Used for saving rule
   *
   * @memberof RuleAddEditComponent
   */
  save(): void {
    const bypass_validation: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    bypass_validation.label = 'Bypass Validation';
    bypass_validation.formState = false;
    bypass_validation.controlType = DialogControlTypes.checkbox;
    const bypassForm = this.form_builder_.group({
      byPassValidation: new DialogFormControl(bypass_validation)
    });
    const mat_dialog_data: BackingObjectInterface = {
      title: 'Confirm Rule Submission',
      instructions: `Only check the box below if the suricata rules or zeek scripts in question have validation issues.
                     As an example, this can occur if you are using variables in suricata that are unknown
                     to the validation container performing the syntax check.`,
      dialogForm: bypassForm,
      confirmBtnText: CONFIRM_DIALOG_OPTION
    };
    const mat_dialog_config: MatDialogConfig = {
      width: DIALOG_WIDTH_50PERCENT,
      data: mat_dialog_data
    };
    const mat_dialog_ref: MatDialogRef<ModalDialogMatComponent, any> = this.mat_dialog_.open(ModalDialogMatComponent, mat_dialog_config);

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            this.rule_form_group.get('byPassValidation').setValue(response.value['byPassValidation']);
            this.get_return_text_();
          }
        });
  }

  /**
   * Used for passing text passed form child component text editor
   * to update and save rule
   *
   * @param {string} text
   * @memberof RuleAddEditComponent
   */
  editor_text_save(text: string): void {
    this.set_rule_data_(text);
    this.close_and_save_();
  }

  /**
   * Used for for closing rule editor
   *
   * @memberof RuleAddEditComponent
   */
  close(): void {
    const mat_dialog_data: ConfirmDialogMatDialogDataInterface = {
      title: 'Close without saving',
      message: 'Are you sure you want to close this editor? All changes will be discarded.',
      option1: CANCEL_DIALOG_OPTION,
      option2: CONFIRM_DIALOG_OPTION
    };
    const mat_dialog_config: MatDialogConfig = {
      width: DIALOG_WIDTH_50PERCENT,
      data: mat_dialog_data
    };
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, mat_dialog_config);

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.close_editor_();
          }
        });
  }

  /**
   * Used for setting the rule form control text value
   *
   * @param {string} text
   * @memberof RuleAddEditComponent
   */
  update_form_control_rule_text(text: string): void {
    this.set_rule_data_(text);
  }

  /**
   * Used for checking is a pcap has been selected for test
   *
   * @returns {boolean}
   * @memberof RuleAddEditComponent
   */
  is_pcap_selected(): boolean {
    return (ObjectUtilitiesClass.notUndefNull(this.selected_pcap)) &&
           (this.selected_pcap !== '');
  }

  /**
   * Used for testing a rule
   *
   * @memberof RuleAddEditComponent
   */
  test_rule(): void {
    if (ObjectUtilitiesClass.notUndefNull(this.dialog_data.rule_set)) {
      const edit_rule_set: RuleSetClass = [this.dialog_data.rule_set].map((rs: RuleSetClass) => rs)[0];
      const payload: RulePCAPTestInterface = {
        pcap_name: this.selected_pcap,
        rule_content: this.rule_form_group.value['rule'],
        ruleType: edit_rule_set.appType
      };
      this.api_test_rule_against_pcap_(payload);
    } else {
      const message: string = 'rule set not passed to dialog window';
      this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    }
  }

  /**
   * Used for validating a rule
   *
   * @memberof RuleAddEditComponent
   */
  validate(): void {
    const rule: RuleInterface = this.get_rule_data_();
    this.api_validate_rule_(rule);
  }

  /**
   * Used for triggering text editor to send current text
   *
   * @private
   * @memberof RuleAddEditComponent
   */
  private get_return_text_(): void {
    this.get_return_text$.next();
  }

  /**
   * Used for setting the text editor text start value
   *
   * @private
   * @param {string} rule_content
   * @memberof RuleAddEditComponent
   */
  private set_text_(rule_content: string): void {
    if (ObjectUtilitiesClass.notUndefNull(this.dialog_data.action)) {
      if (this.dialog_data.action === EDIT) {
        this.text = rule_content;
      } else {
        this.text = '';
      }
    } else {
      this.close_editor_();
      const message: string = 'rule action not passed to rule dialog window';
      this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    }
  }

  /**
   * Used for initializing the rule form group
   *
   * @private
   * @param {RuleInterface} rule
   * @memberof RuleAddEditComponent
   */
  private initialize_form_(rule: RuleInterface): void {
    const rule_form_group: FormGroup = this.form_builder_.group({
      ruleName: new FormControl(ObjectUtilitiesClass.notUndefNull(rule) ? rule.ruleName : '', Validators.compose([Validators.required])),
      rule: new FormControl(ObjectUtilitiesClass.notUndefNull(rule) ? rule.rule : '', Validators.compose([Validators.required])),
      isEnabled: new FormControl(ObjectUtilitiesClass.notUndefNull(rule) ? rule.isEnabled: true),
      _id: new FormControl(ObjectUtilitiesClass.notUndefNull(rule) ? rule._id : ''),
      byPassValidation: new FormControl(false),
      rule_set_id: new FormControl()
    });

    this.set_rule_form_group_(rule_form_group);

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(rule)) {
      this.api_get_rule_content_(rule);
    }
  }

  /**
   * Used to set the rule form group
   *
   * @private
   * @param {FormGroup} rule_form_group
   * @memberof RuleAddEditComponent
   */
  private set_rule_form_group_(rule_form_group: FormGroup): void {
    this.rule_form_group = rule_form_group;
  }

  /**
   * Used for deciding to update rule or create rule when closing and saving
   *
   * @private
   * @memberof RuleAddEditComponent
   */
  private close_and_save_(): void {
    if (ObjectUtilitiesClass.notUndefNull(this.dialog_data.action)) {
      const rule: RuleInterface = this.get_rule_data_();
      if (this.dialog_data.action === EDIT) {
        this.api_update_rule_(rule);
      } else {
        this.api_create_rule_(rule);
      }
    } else {
      this.close_editor_();
      const message: string = 'rule action not passed to dialog window';
      this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    }
  }

  /**
   * Used to rule as interface from rule form group
   *
   * @private
   * @returns {RuleInterface}
   * @memberof RuleAddEditComponent
   */
  private get_rule_data_(): RuleInterface {
    if (ObjectUtilitiesClass.notUndefNull(this.dialog_data.rule_set)) {
      const edit_rule_set: RuleSetClass = [this.dialog_data.rule_set].map((rs: RuleSetClass) => rs)[0];
      const rule: RuleInterface = this.rule_form_group.value as RuleInterface;
      rule.rule_set_id = edit_rule_set._id;

      return rule;
    } else {
      this.close_editor_();
      const message: string = 'rule set not passed to dialog window';
      this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    }
  }

  /**
   * Used for setting rule text value from text editor
   *
   * @private
   * @param {string} text
   * @memberof RuleAddEditComponent
   */
  private set_rule_data_(text: string): void {
    this.rule_form_group.controls['rule'].setValue(text);
  }

  /**
   * Used for closing component
   *
   * @private
   * @memberof RuleAddEditComponent
   */
  private close_editor_(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for passing a rule back to parent component
   * on save close text editor
   *
   * @private
   * @param {RuleClass} rule
   * @memberof RuleAddEditComponent
   */
  private save_close_editor_(rule: RuleClass): void {
    this.mat_dialog_ref_.close(rule);
  }

  /**
   * Used for making call to get is user adding
   *
   * @private
   * @memberof RuleAddEditComponent
   */
  private get_is_user_adding_(): void {
    if (ObjectUtilitiesClass.notUndefNull(this.dialog_data.action)) {
      if (this.dialog_data.action === EDIT) {
        if (ObjectUtilitiesClass.notUndefNull(this.dialog_data.rule)) {
          const edit_rule: RuleClass = [this.dialog_data.rule].map((r: RuleClass) => r)[0];
          this.initialize_form_(edit_rule as RuleInterface);
        } else {
          this.close_editor_();
          const message: string = 'rule not passed to dialog window';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        }
      } else {
        if (ObjectUtilitiesClass.notUndefNull(this.rule_form_group)) {
          this.initialize_form_(this.rule_form_group.value as RuleInterface);
        } else {
          this.initialize_form_(null);
        }
      }
    } else {
      this.close_editor_();
      const message: string = 'rule not passed to dialog window';
      this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    }
  }

  /**
   * Used for making api rest call to get pcaps
   *
   * @private
   * @memberof RuleAddEditComponent
   */
  private api_get_pcaps_(): void {
    this.pcap_service_.get_pcaps()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: Object[]) => this.pcaps = response,
        (error: HttpErrorResponse) => {
          const message: string = 'getting pcaps';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get rule content
   *
   * @private
   * @param {RuleInterface} rule
   * @memberof RuleAddEditComponent
   */
  private api_get_rule_content_(rule: RuleInterface): void {
    this.rules_service_.get_rule_content(rule._id)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass) => {
          if (response instanceof RuleClass) {
            this.rule_form_group.get('rule').setValue(response.rule);
            this.set_text_(response.rule);
          } else {
            const message: string = 'to get rule content';
            this.mat_snackbar_service_.generate_return_fail_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'getting rule content';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to update rule
   *
   * @private
   * @param {RuleInterface} rule
   * @memberof RuleAddEditComponent
   */
  private api_update_rule_(rule: RuleInterface): void {
    this.rules_service_.update_rule(rule)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass) => {
          if (response instanceof RuleClass) {
            const message: string = `updated rule ${response.ruleName}`;
            this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            this.save_close_editor_(response);
          } else {
            const message: string = 'to update rule';
            this.mat_snackbar_service_.generate_return_fail_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'updating rule';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to create rule
   *
   * @private
   * @param {RuleInterface} rule
   * @memberof RuleAddEditComponent
   */
  private api_create_rule_(rule: RuleInterface): void {
    this.rules_service_.create_rule(rule)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass) => {
          if (response instanceof RuleClass) {
            const message: string = `created rule ${response.ruleName}`;
            this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            this.save_close_editor_(response);
          } else {
            const message: string = 'to create rule';
            this.mat_snackbar_service_.generate_return_fail_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'creating rule';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to test rule against pcap
   *
   * @private
   * @param {RulePCAPTestInterface} payload
   * @memberof RuleAddEditComponent
   */
  private api_test_rule_against_pcap_(payload: RulePCAPTestInterface): void {
    this.rules_service_.test_rule_against_pcap(payload)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: Blob) => {
          /* istanbul ignore else */
          if (response['message']) {
            this.mat_snackbar_service_.displaySnackBar(response['message'], MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            return;
          }

          if (response['type'] === 'application/tar+gzip') {
            const json_blob = new Blob([response], { type: 'application/tar+gzip' });
            FileSaver.saveAs(json_blob, 'pcap_test_results.tar.gz');
          } else if (response['type'] === 'application/zip') {
            const json_blob = new Blob([response], { type: 'application/zip' });
            FileSaver.saveAs(json_blob, 'pcap_test_results.zip');
          } else {
            const json_blob = new Blob([response], { type: 'application/json' });
            FileSaver.saveAs(json_blob, 'pcap_test_results.json');
          }
        },
        (error: HttpErrorResponse) => {
          if (error.status === 501) {
            const message: string = 'Validation failed for testing against PCAP. \
                                     Please make sure you have selected a PCAP and your rules validate.';
            this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else if (ObjectUtilitiesClass.notUndefNull(error['error']) &&
                     typeof error['error'] === 'string' &&
                     error['error'].length !== 0) {
            this.mat_snackbar_service_.displaySnackBar(error['error'], MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else if (ObjectUtilitiesClass.notUndefNull(error['error']) &&
                     ObjectUtilitiesClass.notUndefNull(error['error']['error_message']) &&
                     typeof error['error']['error_message'] === 'string' &&
                     error['error']['error_message'].length !== 0) {
            this.mat_snackbar_service_.displaySnackBar(error['error']['error_message'], MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'testing rule against PCAP';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to validate rule
   *
   * @private
   * @param {RuleInterface} rule
   * @memberof RuleAddEditComponent
   */
  private api_validate_rule_(rule: RuleInterface): void {
    this.rules_service_.validate_rule(rule)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          if (response instanceof SuccessMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'to validate rule';
            this.mat_snackbar_service_.generate_return_fail_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'validating rule';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}

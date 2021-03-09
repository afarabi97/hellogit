import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as FileSaver from 'file-saver';

import { ErrorMessageClass, ObjectUtilitiesClass, RuleClass, RuleSetClass, SuccessMessageClass } from '../../../../classes';
import { ConfirmDailogComponent } from '../../../../confirm-dailog/confirm-dailog.component';
import {
  CANCEL_DIALOG_OPTION,
  CONFIRM_DIALOG_OPTION,
  DIALOG_WIDTH_50PERCENT,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../../../constants/cvah.constants';
import {
  get_form_control_value_from_form_group
} from '../../../../functions/cvah.functions';
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

/**
 * Component used for creating and editing a rule
 *
 * @export
 * @class PolicyManagementDialogComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-policy-management-dialog',
  templateUrl: 'policy-management-dialog.component.html',
  styleUrls: [
    'policy-management-dialog.component.scss'
  ]
})
export class PolicyManagementDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('editorCard') private editor_card_: ElementRef;
  @ViewChild('outerCard') private outer_card_: ElementRef;
  // Used for passing rule form group to html
  rule_form_group: FormGroup;
  // Used for passing list of pcaps to html
  pcaps: Object[];
  // Used for retaining user selected pcap
  selected_pcap: string;
  numbers: number[];
  // Used for saving the state of user adding a rule
  private user_adding_: boolean;

  /**
   * Creates an instance of PolicyManagementDialogComponent.
   *
   * @param {FormBuilder} form_builder_
   * @param {MatDialog} mat_dialog_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {PcapService} pcap_service_
   * @param {RulesService} rules_service_
   * @memberof PolicyManagementDialogComponent
   */
  constructor(private form_builder_: FormBuilder,
              private mat_dialog_: MatDialog,
              private mat_snackbar_service_: MatSnackBarService,
              private pcap_service_: PcapService,
              private rules_service_: RulesService) {
    this.selected_pcap = '';
    this.numbers = new Array(1000).fill(true);
    this.user_adding_ = false;
  }

  /**
   * Triggers when the browser window resizes.
   *
   * @param {*} event
   * @memberof PolicyManagementDialogComponent
   */
  /* istanbul ignore next */
  @HostListener('window:resize', ['$event'])
  on_resize(event: any): void {
    this.resize_editor_(this.outer_card_);
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof PolicyManagementDialogComponent
   */
  ngOnInit(): void {
    this.get_is_user_adding_();
    this.api_get_pcaps_();
  }

  ngAfterViewInit(): void {
    this.resize_editor_(this.outer_card_);
  }

  /**
   * Triggers a KeyboardEvent when focused on the textarea from the #editorCard View.
   * If the pressed key is a 'Tab', it inserts the tab character at the current cursor position.
   * It does nothing if it is any other key.
   *
   * This was added to properly format Zeek Intel Files (*.dat)
   *
   * @param {KeyboardEvent} keyboard_event
   * @memberof PolicyManagementDialog
   */
  // TODO - Remove when editor replaced
  /* istanbul ignore next */
  handle_tab(keyboard_event: KeyboardEvent): void {
    /* istanbul ignore else */
    if ((keyboard_event.code || keyboard_event.key) === 'Tab') {
      keyboard_event.preventDefault();
      document.execCommand('insertHTML', false, '&#009');
    }
  }

  /**
   * Used for checking if rule is enabled
   *
   * @returns {boolean}
   * @memberof PolicyManagementDialogComponent
   */
  is_rule_enabled(): boolean {
    return get_form_control_value_from_form_group<boolean>(this.rule_form_group, 'isEnabled');
  }

  /**
   * Used for saving rule
   *
   * @memberof PolicyManagementDialogComponent
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
            this.close_and_save_();
          }
        });
  }

  /**
   * Used for for closing rule editor
   *
   * @memberof PolicyManagementDialogComponent
   */
  close(): void {
    const mat_dialog_data: ConfirmDialogMatDialogDataInterface = {
      paneString: 'Are you sure you want to close this editor? All changes will be discarded.',
      paneTitle: 'Close without saving',
      option1: CANCEL_DIALOG_OPTION,
      option2: CONFIRM_DIALOG_OPTION
    };
    const mat_dialog_config: MatDialogConfig = {
      width: DIALOG_WIDTH_50PERCENT,
      data: mat_dialog_data
    };
    const mat_dialog_ref: MatDialogRef<ConfirmDailogComponent, any> = this.mat_dialog_.open(ConfirmDailogComponent, mat_dialog_config);

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
   * Used for testing a rule
   *
   * @memberof PolicyManagementDialogComponent
   */
  test_rule(): void {
    const edit_rule_set: RuleSetClass = this.rules_service_.get_edit_rule_set();
    const payload: RulePCAPTestInterface = {
      pcap_name: this.selected_pcap,
      rule_content: this.rule_form_group.value['rule'],
      ruleType: edit_rule_set.appType
    };
    this.api_test_rule_against_pcap_(payload);
  }

  /**
   * Used for validating a rule
   *
   * @memberof PolicyManagementDialogComponent
   */
  validate(): void {
    const rule: RuleInterface = this.get_rule_data_();
    this.api_validate_rule_(rule);
  }

  /**
   * Used for resizing the editor on browser resize
   *
   * @private
   * @param {ElementRef} element
   * @memberof PolicyManagementDialogComponent
   */
  // TODO - Remove when editor replaced
  /* istanbul ignore next */
  private resize_editor_(element: ElementRef): void {
    /* istanbul ignore else */
    if (element) {
      const height: string = window.innerHeight > 400 ? `${window.innerHeight - 250}px` : '100px';
      element.nativeElement.style.maxHeight = height;
      element.nativeElement.style.height = height;
    }
  }

  /**
   * Used for initializing the rule form group
   *
   * @private
   * @param {RuleInterface} rule
   * @memberof PolicyManagementDialogComponent
   */
  private initialize_form_(rule: RuleInterface): void {
    const rule_form_group: FormGroup = this.form_builder_.group({
      ruleName: new FormControl(rule ? rule.ruleName : '', Validators.compose([Validators.required])),
      rule: new FormControl(rule ? rule.rule : '', Validators.compose([Validators.required])),
      isEnabled: new FormControl(rule ? rule.isEnabled: true),
      _id: new FormControl(rule ? rule._id : ''),
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
   * @memberof PolicyManagementDialogComponent
   */
  private set_rule_form_group_(rule_form_group: FormGroup): void {
    this.rule_form_group = rule_form_group;
  }

  /**
   * Used for deciding to update rule or create rule when closing and saving
   *
   * @private
   * @memberof PolicyManagementDialogComponent
   */
  private close_and_save_(): void {
    const rule: RuleInterface = this.get_rule_data_();
    if (!this.user_adding_) {
      this.api_update_rule_(rule);
    } else {
      this.api_create_rule_(rule);
    }
  }

  /**
   * Used to rule as interface from rule form group
   *
   * @private
   * @returns {RuleInterface}
   * @memberof PolicyManagementDialogComponent
   */
  private get_rule_data_(): RuleInterface {
    const edit_rule_set: RuleSetClass = this.rules_service_.get_edit_rule_set();
    const rule: RuleInterface = this.rule_form_group.value as RuleInterface;
    rule.rule_set_id = edit_rule_set._id;

    return rule;
  }

  /**
   * Used for closing component
   *
   * @private
   * @memberof PolicyManagementDialogComponent
   */
  private close_editor_(): void {
    this.rules_service_.set_is_user_editing(false);
  }

  /**
   * Used for making call to get is user adding
   *
   * @private
   * @memberof PolicyManagementDialogComponent
   */
  private get_is_user_adding_(): void {
    this.rules_service_.get_is_user_adding()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: boolean) => {
          this.user_adding_ = response;
          if (!response) {
            const edit_rule: RuleClass = this.rules_service_.get_edit_rule();
            this.initialize_form_(edit_rule as RuleInterface);
          } else {
            if (ObjectUtilitiesClass.notUndefNull(this.rule_form_group)) {
              this.initialize_form_(this.rule_form_group.value as RuleInterface);
            } else {
              this.initialize_form_(null);
            }
          }
        });
  }

  /**
   * Used for making api rest call to get pcaps
   *
   * @private
   * @memberof PolicyManagementDialogComponent
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
   * @memberof PolicyManagementDialogComponent
   */
  private api_get_rule_content_(rule: RuleInterface): void {
    this.rules_service_.get_rule_content(rule._id)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass) => {
          if (response instanceof RuleClass) {
            let len = response.rule.split('\n').length;
            /* istanbul ignore else */
            if (len < 1000) {
              len = 1000;
            }
            this.numbers = new Array(len).fill(true);
            this.editor_card_.nativeElement.style.height = `${21 * len}px`;
            this.rule_form_group.get('rule').setValue(response.rule);
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
   * @memberof PolicyManagementDialogComponent
   */
  private api_update_rule_(rule: RuleInterface): void {
    this.rules_service_.update_rule(rule)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass) => {
          if (response instanceof RuleClass) {
            const message: string = `updated rule ${response.ruleName}`;
            this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            this.close_editor_();
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
   * @memberof PolicyManagementDialogComponent
   */
  private api_create_rule_(rule: RuleInterface): void {
    this.rules_service_.create_rule(rule)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass) => {
          if (response instanceof RuleClass) {
            const message: string = `created rule ${response.ruleName}`;
            this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            this.close_editor_();
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
   * @memberof PolicyManagementDialogComponent
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
   * @memberof PolicyManagementDialogComponent
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

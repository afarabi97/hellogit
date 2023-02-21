import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnChanges, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import {
  ErrorMessageClass,
  ObjectUtilitiesClass,
  RuleClass,
  RuleSetClass,
  RuleSyncClass,
  SuccessMessageClass
} from '../../classes';
import {
  CANCEL_DIALOG_OPTION,
  CONFIRM_DIALOG_OPTION,
  DIALOG_HEIGHT_90VH,
  DIALOG_WIDTH_500PX,
  DIALOG_WIDTH_50PERCENT,
  DIALOG_WIDTH_80VW,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface, RuleSetInterface } from '../../interfaces';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { RulesService } from '../../services/rules.service';
import { SortingService } from '../../services/sorting.service';
import { WebsocketService } from '../../services/websocket.service';
import { ConfirmDialogComponent } from '../global-components/components/confirm-dialog/confirm-dialog.component';
import { CatalogStatusClass, JobClass } from './classes';
import { RuleAddEditComponent } from './components/rule-add-edit/rule-add-edit.component';
import { RuleSetAddEditComponent } from './components/rule-set-add-edit/rule-set-add-edit.component';
import { RulesUploadComponent } from './components/rules-upload/rules-upload.component';
import { ADD, EDIT, RULE_SETS_TITLE, SURICATA, ZEEK } from './constants/policy-management.constant';
import { DialogDataInterface, NotificationInterface, RulesGroupUploadInterface } from './interfaces';
import { PolicyManagementService } from './services/policy-management.service';

/**
 * Component used for rule sets and rule maintenance
 *
 * @export
 * @class PolicyManagementComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 * @implements {OnChanges}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-policy-management',
  templateUrl: 'policy-management.component.html',
  styleUrls: [
    'policy-management.component.scss'
  ]
})
export class PolicyManagementComponent implements OnInit, AfterViewInit, OnChanges {
  // Used for referencing paginators for tables
  @ViewChild('rule_sets_paginator') rule_sets_paginator: MatPaginator;
  @ViewChildren('rule_paginator') rule_paginator: QueryList<MatPaginator>;
  // Used for referencing mat sort
  @ViewChild(MatSort) sort: MatSort;
  // Used for passing column names to tables
  readonly columns_to_display = [ 'Enabled', 'name', 'appType', 'clearance', 'state', 'sensors', 'sensor_states', 'Actions' ];
  readonly inner_columns_to_display = [ 'Enabled', 'ruleName', 'lastModifiedDate', 'Actions' ];
  // Used for passing data source to tables
  rule_sets_data_source: MatTableDataSource<RuleSetClass>;
  rules_data_source: MatTableDataSource<RuleClass>;
  // Used for indicating if a row is expanded or not
  expanded_row: RuleSetClass | null;
  job_status: boolean;
  rulesetchange: boolean;
  // Used for inidacting if a rule set rules visible
  private rules_visible_: boolean[];

  /**
   * Creates an instance of PolicyManagementComponent.
   *
   * @param {Title} title_
   * @param {MatDialog} mat_dialog_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {RulesService} rules_service_
   * @param {SortingService} sorting_service_
   * @param {WebsocketService} websocket_service_
   * @param {PolicyManagementService} policy_management_service_
   * @memberof PolicyManagementComponent
   */
  constructor(private title_: Title,
              private mat_dialog_: MatDialog,
              private mat_snackbar_service_: MatSnackBarService,
              private rules_service_: RulesService,
              private sorting_service_: SortingService,
              private websocket_service_: WebsocketService,
              private policy_management_service_: PolicyManagementService) {
    this.job_status = false;
    this.rulesetchange = false;
    this.rules_visible_ = [];
    this.rule_sets_data_source = new MatTableDataSource();
    this.rules_data_source = new MatTableDataSource();
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof PolicyManagementComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(RULE_SETS_TITLE);
    this.check_rule_sync_status_();
    this.rule_sets_data_source.filterPredicate = (data: RuleSetClass, filter: string) => {
      const accumulator: any = (currentTerm: string, key: string) => this.nested_filter_check_(currentTerm, data, key);
      const data_str: string = Object.keys(data).reduce(accumulator, '').toLowerCase();
      // Transform the filter by converting it to lowercase and removing whitespace.
      const transformed_filter: string = filter.trim().toLowerCase();

      return data_str.indexOf(transformed_filter) !== -1;
    };
    this.set_table_attributes_();
    this.api_get_rule_sets_();
    this.api_check_catalog_status_suricata_();
    this.socket_refresh_rule_set_change_();
  }

  /**
   * Used for calling methods after view has initialized
   *
   * @memberof PolicyManagementComponent
   */
  ngAfterViewInit(): void {
    this.set_table_attributes_();
  }

  /**
   * Used for setting data sources on changes
   *
   * @memberof PolicyManagementComponent
   */
  ngOnChanges(): void {
    this.rule_sets_data_source = new MatTableDataSource(this.rule_sets_data_source.data);
    this.rules_data_source = new MatTableDataSource(this.rules_data_source.data);
    this.rule_sets_data_source.paginator = this.rule_sets_paginator;
    this.rules_data_source.sort = this.sort;
  }

  /**
   * Used for applying a filter to rule set table
   *
   * @param {string} filter
   * @memberof PolicyManagementComponent
   */
  apply_filter(filter: string): void {
    this.rule_sets_data_source.filter = filter.trim().toLowerCase();
  }

  /**
   * Used for getting rules for a rule set
   *
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementComponent
   */
  get_rules(rule_set: RuleSetClass): void {
    const index: number = this.get_rule_set_index_(rule_set);
    const rule_sets: RuleSetClass[] = this.rule_sets_data_source.data;
    const rules_visible: boolean = this.rules_visible_[index];

    // Make everything invisible
    this.rules_visible_ = new Array(rule_sets.length).fill(false);

    // Clear ruleSetRules
    for (const ruleSet of rule_sets) {
      ruleSet.rules = null;
    }

    /* istanbul ignore else */
    if (!rules_visible) {
      this.rules_visible_[index] = !this.rules_visible_[index];
    }
    this.api_get_rules_(rule_set, index);
  }

  /**
   * Used to turn on / off visibilty of rules
   *
   * @param {RuleSetClass} rule_set
   * @returns {boolean}
   * @memberof PolicyManagementComponent
   */
  rules_visible(rule_set: RuleSetClass): boolean {
    return this.rules_visible_[this.get_rule_set_index_(rule_set)];
  }

  /**
   * Used for editting a rule
   *
   * @param {RuleSetClass} rule_set
   * @param {RuleClass} rule
   * @memberof PolicyManagementComponent
   */
  edit_rule(rule_set: RuleSetClass, rule: RuleClass): void {
    const dialog_data: DialogDataInterface = {
      rule_set: rule_set,
      rule: rule,
      action: EDIT
    };
    const mat_dialog_config: MatDialogConfig = {
      height: DIALOG_HEIGHT_90VH,
      width: DIALOG_WIDTH_80VW,
      disableClose: true,
      data: dialog_data
    };
    const mat_dialog_ref: MatDialogRef<RuleAddEditComponent, any> = this.mat_dialog_.open(RuleAddEditComponent, mat_dialog_config);

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response)) {
            const rule_index: number = this.get_rule_index_(rule);
            this.rules_data_source.data[rule_index] = response;
            this.api_get_rule_sets_();
          }
        });
  }

  /**
   * Used to enable a rule set
   *
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementComponent
   */
  enable_rule_set(rule_set: RuleSetClass): void {
    rule_set.isEnabled = !rule_set.isEnabled;
    this.api_update_rule_set_(rule_set as RuleSetInterface, true);
  }

  /**
   * Used to see if a rule is enabled
   *
   * @param {RuleClass} rule
   * @returns {boolean}
   * @memberof PolicyManagementComponent
   */
  is_rule_enabled(rule: RuleClass): boolean {
    return rule.isEnabled;
  }

  /**
   * Used for enabling a rule
   *
   * @param {RuleClass} rule
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementComponent
   */
  enable_rule(rule: RuleClass, rule_set: RuleSetClass): void {
    this.api_toggle_rule_(rule, rule_set);
  }

  /**
   * Used for calling confirm dialog to delete a rule
   *
   * @param {RuleClass} rule
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementComponent
   */
  delete_rule_confirm_dialog(rule: RuleClass, rule_set: RuleSetClass): void {
    const mat_dialog_data: ConfirmDialogMatDialogDataInterface = {
      message: `Are you sure you want to permanently remove rule: ${rule.ruleName}?`,
      title: 'Remove Rule',
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
            const index: number = rule_set.rules.findIndex((r: RuleClass) => r._id === rule._id);
            this.api_delete_rule_(rule, index);
          }
        });
  }

  /**
   * Used for calling confirm dialog to delete a rule set
   *
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementComponent
   */
  delete_rule_set_confirm_dialog(rule_set: RuleSetClass): void {
    const mat_dialog_data: ConfirmDialogMatDialogDataInterface = {
      title: 'Remove Rule Set',
      message: `Are you sure you want to permanently remove rule set: ${rule_set.name}?`,
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
            this.api_delete_rule_set_(rule_set);
          }
        });
  }

  /**
   * Used for call add / edit dialog component to edit rule set
   *
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementComponent
   */
  edit_rule_set(rule_set: RuleSetClass): void {
    const dialog_data: DialogDataInterface = {
      rule_set: rule_set,
      rule: undefined,
      action: EDIT
    };
    const mat_dialog_config: MatDialogConfig = {
      width: DIALOG_WIDTH_500PX,
      disableClose: true,
      data: dialog_data
    };
    const mat_dialog_ref: MatDialogRef<RuleSetAddEditComponent, any> = this.mat_dialog_.open(RuleSetAddEditComponent, mat_dialog_config);

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            this.api_update_rule_set_(response.value as RuleSetInterface, false);
          }
        });
  }

  /**
   * Used for adding a rule to a rule set
   *
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementComponent
   */
  add_rule(rule_set: RuleSetClass): void {
    const dialog_data: DialogDataInterface = {
      rule_set: rule_set,
      rule: undefined,
      action: ADD
    };
    const mat_dialog_config: MatDialogConfig = {
      height: DIALOG_HEIGHT_90VH,
      width: DIALOG_WIDTH_80VW,
      disableClose: true,
      data: dialog_data
    };
    const mat_dialog_ref: MatDialogRef<RuleAddEditComponent, any> = this.mat_dialog_.open(RuleAddEditComponent, mat_dialog_config);

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response)) {
            this.rules_data_source.data.push(response);
            this.rules_data_source.data = this.rules_data_source.data.sort(this.sorting_service_.rule_alphanum);
          }
        });
  }

  /**
   * Check to see if rule set has any rules
   *
   * @returns {boolean}
   * @memberof PolicyManagementComponent
   */
  does_rule_set_contain_rules(): boolean {
    return this.rules_data_source.data.length > 0;
  }

  /**
   * Used to check and see if instance of object is an array
   *
   * @param {*} some_obj
   * @returns {boolean}
   * @memberof PolicyManagementComponent
   */
  is_array(some_obj: any): boolean {
    if (!ObjectUtilitiesClass.notUndefNull(some_obj) &&
        !(some_obj instanceof Array)) {
      return false;
    } else {
      return some_obj instanceof Array;
    }
  }

  /**
   * Used to sync rule sets
   *
   * @memberof PolicyManagementComponent
   */
  rule_sync(): void {
    this.job_status = true;
    this.rulesetchange = true;
    this.api_sync_rule_sets_();
  }

  /**
   * Used for call add / edit dialog component to add rule set
   *
   * @memberof PolicyManagementComponent
   */
  add_rule_set(): void {
    const dialog_data: DialogDataInterface = {
      rule_set: undefined,
      rule: undefined,
      action: ADD
    };
    const mat_dialog_config: MatDialogConfig = {
      width: DIALOG_WIDTH_500PX,
      data: dialog_data
    };
    const mat_dialog_ref: MatDialogRef<RuleSetAddEditComponent, any> = this.mat_dialog_.open(RuleSetAddEditComponent, mat_dialog_config);

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            this.api_create_rule_set_(response.value as RuleSetInterface);
          }
        });
  }

  /**
   * Used for call upload dialog component to to select file for rules upload
   *
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementComponent
   */
  upload_rules_file(rule_set: RuleSetClass): void {
    const dialog_data: DialogDataInterface = {
      rule_set: rule_set,
      rule: undefined,
      action: ADD
    };
    const mat_dialog_config: MatDialogConfig = {
      width: DIALOG_WIDTH_500PX,
      disableClose: true,
      data: dialog_data
    };
    const mat_dialog_ref: MatDialogRef<RulesUploadComponent, any> = this.mat_dialog_.open(RulesUploadComponent, mat_dialog_config);

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RulesGroupUploadInterface) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) &&
              ObjectUtilitiesClass.notUndefNull(response.form_group) &&
              response.form_group.valid) {
            const message: string = 'Uploading rules file. Please wait for a confirmation message.';
            this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            const form_Data: FormData = new FormData();
            form_Data.append('upload_file', response.file_to_upload, response.file_to_upload.name);
            form_Data.append('ruleSetForm', JSON.stringify(response.form_group.value as RuleSetInterface));
            this.api_upload_rule_file_(form_Data);
          }
        });
  }

  /**
   * Used for setting the rule sets table paginator and sort
   *
   * @private
   * @memberof PolicyManagementComponent
   */
  private set_table_attributes_(): void {
    this.rule_sets_data_source.paginator = this.rule_sets_paginator;
    this.rule_sets_data_source.sort = this.sort;
  }

  /**
   * Used for performing a nested filter check
   *
   * @private
   * @param {*} search
   * @param {RuleSetClass} data
   * @param {string} key
   * @returns {*}
   * @memberof PolicyManagementComponent
   */
  private nested_filter_check_(search: string, rule_set: RuleSetClass, key: string): string {
    if (typeof rule_set[key] === 'object') {
      for (const k in rule_set[key]) {
        /* istanbul ignore else */
        if (ObjectUtilitiesClass.notUndefNull(rule_set[key][k])) {
          search = this.nested_filter_check_(search, rule_set[key], k);
        }
      }
    } else {
      search += rule_set[key];
    }

    return search;
  }

  /**
   * Used for checking rule sync status
   *
   * @private
   * @memberof PolicyManagementComponent
   */
  private check_rule_sync_status_(): void {
    this.job_status = true;
    this.api_get_jobs_();
    this.socket_refresh_broadcast_();
  }

  /**
   * Used for getting socket broadcast
   *
   * @private
   * @memberof PolicyManagementComponent
   */
  // TODO - update testing when service stubbed
  private socket_refresh_broadcast_(): void {
    this.websocket_service_.getSocket()
      .on('broadcast', (notification: NotificationInterface) => {
        /* istanbul ignore else */
        if (notification.role === 'rulesync') {
          /* istanbul ignore else */
          if (notification.status === 'STARTED') {
            this.job_status = true;
          }
          /* istanbul ignore else */
          if (notification.status === 'COMPLETED') {
            this.job_status = false;
          }
          /* istanbul ignore else */
          if (notification.status === 'ERROR') {
            const message: string = 'performing rule sync. Try operation again, and if problem persists notify servicenow.';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            this.job_status = false;
            this.rulesetchange = false;
          }
        }
      });
  }

  /**
   * Used for getting socket rule set change
   *
   * @private
   * @memberof PolicyManagementComponent
   */
  // TODO - update testing when service stubbed
  private socket_refresh_rule_set_change_(): void {
    this.websocket_service_.getSocket()
      .on('rulesetchange', (data: any) => this.api_get_rule_sets_());
  }

  /**
   * Used for getting rule set index from table data source
   *
   * @private
   * @param {RuleSetClass} rule_set
   * @returns {number}
   * @memberof PolicyManagementComponent
   */
  private get_rule_set_index_(rule_set: RuleSetClass): number {
    const rule_sets: RuleSetClass[] = this.rule_sets_data_source.data;

    return rule_sets.findIndex((rs: RuleSetClass) => rs._id === rule_set._id);
  }

  /**
   * Used for getting rule index from table data source
   *
   * @private
   * @param {RuleClass} rule
   * @returns {number}
   * @memberof PolicyManagementComponent
   */
  private get_rule_index_(rule: RuleClass): number {
    const rules: RuleClass[] = this.rules_data_source.data;

    return rules.findIndex((r: RuleClass) => r._id === rule._id);
  }

  /**
   * Used for making api rest call to sync rule sets
   *
   * @private
   * @memberof PolicyManagementComponent
   */
  private api_sync_rule_sets_(): void {
    this.rules_service_.sync_rule_sets()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleSyncClass) => {
          const message: string = 'Started Rule Sync. Open the notification dialog on the left to see its progress.';
          this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'syncing rule sets. Check logs in /var/log/tfplenum/ for more details.';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get rule sets
   *
   * @private
   * @memberof PolicyManagementComponent
   */
  private api_get_rule_sets_(): void {
    this.rules_service_.get_rule_sets()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleSetClass[]) => {
          this.rules_visible_ = new Array(response.length).fill(false);
          this.rule_sets_data_source.data = response.sort(this.sorting_service_.rule_set_alphanum);
          this.rulesetchange = false;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting rule sets';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get rules
   *
   * @private
   * @param {RuleSetClass} rule_set
   * @param {number} index
   * @memberof PolicyManagementComponent
   */
  private api_get_rules_(rule_set: RuleSetClass, index: number): void {
    this.rules_service_.get_rules(rule_set._id)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass[]) => {
          rule_set.rules = response;
          this.rules_data_source.data = response.sort(this.sorting_service_.rule_alphanum);
          this.rules_data_source.paginator = this.rule_paginator.toArray()[index];
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting rule set rules';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to create rule set
   *
   * @private
   * @param {RuleSetInterface} rule_set
   * @memberof PolicyManagementComponent
   */
  private api_create_rule_set_(rule_set: RuleSetInterface): void {
    this.rules_service_.create_rule_set(rule_set)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleSetClass) => {
          this.rule_sets_data_source.data.push(response);
          this.api_get_rule_sets_();
          const message: string = 'added rule set file';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'adding rule set file';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to update rule set
   *
   * @private
   * @param {RuleSetInterface} rule_set
   * @param {boolean} enable
   * @memberof PolicyManagementComponent
   */
  private api_update_rule_set_(rule_set: RuleSetInterface, enabling_rule_set: boolean): void {
    const rule_set_enabled_disabled: string = rule_set.isEnabled ? 'enabled' : 'disabled';
    const rule_set_enabling_disabling: string = rule_set.isEnabled ? 'enabling' : 'disabling';
    this.rules_service_.update_rule_set(rule_set)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleSetClass) => {
          if (response instanceof RuleSetClass) {
            if (enabling_rule_set) {
              const index: number = this.get_rule_set_index_(rule_set);
              this.rule_sets_data_source.data[index] = response;
            } else {
              this.api_get_rule_sets_();
            }
            const message: string = `${enabling_rule_set ? rule_set_enabled_disabled : 'updated'} rule set`;
            this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `${enabling_rule_set ? rule_set_enabling_disabling : 'updating'} rule set`;
            this.mat_snackbar_service_.generate_return_fail_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `${enabling_rule_set ? rule_set_enabling_disabling : 'updating'} rule set`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to upload rule file
   *
   * @private
   * @param {FormData} form_data
   * @memberof PolicyManagementComponent
   */
  private api_upload_rule_file_(form_data: FormData): void {
    this.rules_service_.upload_rule_file(form_data)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass | RuleClass[]) => {
          const successMsg = 'uploaded ruleset file';
          if (response instanceof RuleClass) {
            const rules: RuleClass[] = [...this.rules_data_source.data.map((r: RuleClass) => r), response];
            this.rules_data_source.data = rules;
            this.mat_snackbar_service_.displaySnackBar(successMsg, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else if (response instanceof Array) {
            if (ObjectUtilitiesClass.test_array_values_instanceof<RuleClass>(response, RuleClass)) {
              const rules: RuleClass[] = [...this.rules_data_source.data.map((r: RuleClass) => r), ...response];
              this.rules_data_source.data = rules;
              this.mat_snackbar_service_.displaySnackBar(successMsg, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else {
              const message: string = 'uploading rule set file';
              this.mat_snackbar_service_.generate_return_fail_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          } else {
            const message: string = 'uploading rule set file';
            this.mat_snackbar_service_.generate_return_fail_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'uploading rule set file';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to toggle rule
   *
   * @private
   * @param {RuleClass} rule
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementComponent
   */
  private api_toggle_rule_(rule: RuleClass, rule_set: RuleSetClass): void {
    const rule_enable_disable: string = !rule.isEnabled ? 'enabled' : 'disabled';
    const rule_enabling_disabling: string = !rule.isEnabled ? 'enabling' : 'disabling';
    this.rules_service_.toggle_rule(rule._id)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: RuleClass) => {
          if (response instanceof RuleClass) {
            const rule_index: number = this.get_rule_index_(rule);
            this.rules_data_source.data[rule_index] = response;
            rule_set.state = 'Dirty';
            const rule_set_index: number = this.get_rule_set_index_(rule_set);
            this.rule_sets_data_source.data[rule_set_index] = rule_set;
            const message: string = `${rule_enable_disable} rule`;
            this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `${rule_enabling_disabling} rule`;
            this.mat_snackbar_service_.generate_return_fail_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `${rule_enabling_disabling} rule`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to delete rule
   *
   * @private
   * @param {RuleClass} rule
   * @param {number} index
   * @memberof PolicyManagementComponent
   */
  private api_delete_rule_(rule: RuleClass, index: number): void {
    this.rules_service_.delete_rule(rule._id)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          if (response instanceof SuccessMessageClass) {
            const rules: RuleClass[] = this.rules_data_source.data.map((r: RuleClass) => r);
            rules.splice(index, 1);
            this.rules_data_source.data = rules;
            this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'deleting rule';
            this.mat_snackbar_service_.generate_return_fail_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'deleting rule';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to delete rule set
   *
   * @private
   * @param {RuleSetClass} rule_set
   * @memberof PolicyManagementComponent
   */
  private api_delete_rule_set_(rule_set: RuleSetClass): void {
    this.rules_service_.delete_rule_set(rule_set._id)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          if (response instanceof SuccessMessageClass) {
            const rule_sets: RuleSetClass[] = this.rule_sets_data_source.data.map((rs: RuleSetClass) => rs);
            this.rule_sets_data_source.data = rule_sets.filter((rs: RuleSetClass) => rs._id !== rule_set._id);
            this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'deleting rule set';
            this.mat_snackbar_service_.generate_return_fail_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'deleting rule set';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to check catalog status
   * note: check to see suricata installed
   *
   * @private
   * @memberof PolicyManagementComponent
   */
  private api_check_catalog_status_suricata_(): void {
    this.policy_management_service_.check_catalog_status(SURICATA)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: CatalogStatusClass[]) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.length === 0) {
            this.api_check_catalog_status_zeek_();
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting catalog status for suricata';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to check catalog status
   * note: check to see zeek installed
   *
   * @private
   * @memberof PolicyManagementComponent
   */
  private api_check_catalog_status_zeek_(): void {
    this.policy_management_service_.check_catalog_status(ZEEK)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: CatalogStatusClass[]) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.length === 0) {
            const message: string = 'Before using this page, you need to have at least one sensor that has either \
                                     Zeek or Suricata installed. Go to the catalog page and install one or both of those applications.';
            this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting catalog status for zeek';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get jobs
   *
   * @private
   * @memberof PolicyManagementComponent
   */
  private api_get_jobs_(): void {
    this.policy_management_service_.get_jobs()
      .pipe(untilDestroyed(this))
      .pipe(map((jobs: JobClass[]) => jobs.filter((job: JobClass) => job.description.includes('perform_rulesync'))),
            map((jobs: JobClass[]) => jobs.map((job: JobClass) => job.status)[0]),
            map((status: string) => (status === undefined || status === 'finished') ? false : true))
      .subscribe(
        (job_status: boolean) => this.job_status = job_status,
        (error: HttpErrorResponse) => {
          const message: string = 'getting jobs';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}

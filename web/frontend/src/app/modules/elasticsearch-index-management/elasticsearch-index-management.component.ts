import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from 'src/app/constants/cvah.constants';

import { ErrorMessageClass, SuccessMessageClass } from '../../classes';
import { MatOptionAltInterface } from '../../interfaces';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import {
  BACKUP_INDICES,
  CLOSE_INDICES,
  DELETE_INDICES,
  ELASTICSEARCH_INDEX_MANAGEMENT_TITLE,
  HOST_BINDING_CLASS,
  MAT_OPTION_ACTIONS
} from './constants/index-management.constant';
import { IndexManagementOptionInterface } from './interfaces/index-management-option.interface';
import { IndexManagementService } from './services/index-management.service';

/**
 * Component used for handling index management display and commands
 *
 * @export
 * @class ElasticsearchIndexManagementComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
    selector: 'cvah-index-management',
    templateUrl: './elasticsearch-index-management.component.html'
})
export class ElasticsearchIndexManagementComponent implements OnInit {
  // Used for setting the host binding class
  @HostBinding('class') private index_management_component_class_: string;
  // Used for accessing form group
  @ViewChild('ima_form_directive') private ima_form_directive_: NgForm;
  @ViewChild('iml_form_directive') private iml_form_directive_: NgForm;
  // Used for accessing mat stepper
  @ViewChild('stepper') private mat_stepper_: MatStepper;
  // Used to retain user input for action
  index_management_actions_form_group: FormGroup;
  // Used to retain user input for list
  index_management_list_form_group: FormGroup;
  // Used for passing indices to html
  indices: any[];
  // Used for turning ON / OFF html features
  is_editable: boolean;
  is_loading: boolean;
  // Used for passing list of actions for mat option
  actions: MatOptionAltInterface[];
  // Used for passing instructions to html
  instructions: string;

  /**
   * Creates an instance of ElasticsearchIndexManagementComponent.
   *
   * @param {Title} title_
   * @param {FormBuilder} form_builder_
   * @param {IndexManagementService} index_management_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof ElasticsearchIndexManagementComponent
   */
  constructor(private title_: Title,
              private form_builder_: FormBuilder,
              private index_management_service_: IndexManagementService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.index_management_component_class_ = HOST_BINDING_CLASS;
    this.indices = [];
    this.is_editable = false;
    this.is_loading = false;
    this.actions = MAT_OPTION_ACTIONS;
  }

  /**
   * Used for setting up subscriptions
   *
   * @memberof ElasticsearchIndexManagementComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(ELASTICSEARCH_INDEX_MANAGEMENT_TITLE);
    this.initialize_form_groups_();
    this.set_backup_option_(true, null);
    this.api_minio_check_();
  }

  /**
   * Used for getting value if index list is empty
   *
   * @returns {boolean}
   * @memberof ElasticsearchIndexManagementComponent
   */
  is_index_list_empty(): boolean {
    return this.index_management_list_form_group.value.index_list.length === 0;
  }

  /**
   * Used for checking if stepper changes and to call next() if a condition is met
   *
   * @param {StepperSelectionEvent} event
   * @memberof ElasticsearchIndexManagementComponent
   */
  stepper_change(event: StepperSelectionEvent): void {
    /* istanbul ignore else */
    if (event.selectedIndex === 1) {
      this.next();
    }
  }

  /**
   * Used for forwarding private call to html
   *
   * @memberof ElasticsearchIndexManagementComponent
   */
  back(): void {
    this.reset_form_();
  }

  /**
   * Used to make call to get opened / closed indices
   *
   * @memberof ElasticsearchIndexManagementComponent
   */
  next(): void {
    switch (this.index_management_actions_form_group.value.action) {
      case DELETE_INDICES:
        this.instructions = 'Select one or more Index to delete and click Update.';
        this.is_loading = true;
        this.api_get_closed_indices_();
        break;
      case CLOSE_INDICES:
        this.instructions = 'Select one or more Index to close and click Update.';
        this.is_loading = true;
        this.api_get_all_indices_();
        break;
      case BACKUP_INDICES:
        this.instructions = 'Select one or more Index to backup and click Update.';
        this.is_loading = true;
        this.api_get_all_indices_();
        break;
      default:
        this.reset_form_();
        break;
    }
  }

  /**
   * Used for passing call to api_index_management
   *
   * @memberof ElasticsearchIndexManagementComponent
   */
  update(): void {
    const index_management_option: IndexManagementOptionInterface = {
      action: this.index_management_actions_form_group.value.action,
      index_list: this.index_management_list_form_group.value.index_list
    };
    this.api_index_management_(index_management_option);
  }

  /**
   * Used for setting the backup option for actions
   *
   * @private
   * @param {boolean} is_disabled
   * @memberof ElasticsearchIndexManagementComponent
   */
  private set_backup_option_(is_disabled: boolean, error: ErrorMessageClass): void {
    for (const action of this.actions) {
      /* istanbul ignore else */
      if (action.value === BACKUP_INDICES) {
        action.isDisabled = is_disabled;
        if (error){
          action.toolTip = error.error_message;
        } else{
          action.toolTip = "";
        }
        break;
      }
    }
  }

  /**
   * Used for initializing form groups
   *
   * @private
   * @memberof ElasticsearchIndexManagementComponent
   */
  private initialize_form_groups_(): void {
    const index_management_actions_form_group: FormGroup = this.form_builder_.group({
      action: new FormControl(null, Validators.required)
    });
    const index_management_list_form_group: FormGroup = this.form_builder_.group({
      index_list: new FormControl([], Validators.required)
    });

    this.set_index_management_actions_form_group_(index_management_actions_form_group);
    this.set_index_management_list_form_group_(index_management_list_form_group);
  }

  /**
   * Used for setting the index management actions form group
   *
   * @private
   * @param {FormGroup} index_management_actions_form_group
   * @memberof ElasticsearchIndexManagementComponent
   */
  private set_index_management_actions_form_group_(index_management_actions_form_group: FormGroup): void {
    this.index_management_actions_form_group = index_management_actions_form_group;
  }

  /**
   * Used for setting the index management list form group
   *
   * @private
   * @param {FormGroup} index_management_list_form_group
   * @memberof ElasticsearchIndexManagementComponent
   */
  private set_index_management_list_form_group_(index_management_list_form_group: FormGroup): void {
    this.index_management_list_form_group = index_management_list_form_group;
  }

  /**
   * Used for resetting all data, steps, and forms
   *
   * @private
   * @memberof ElasticsearchIndexManagementComponent
   */
  private reset_form_(): void {
    this.is_loading = false;
    this.indices = [];
    this.mat_stepper_.reset();
    this.initialize_form_groups_();
    this.ima_form_directive_.resetForm();
    this.iml_form_directive_.resetForm([]);
  }

  /**
   * Used to perform set of actions for successful api calls
   * note: api_get_closed_indices_
   *       api_get_all_indices_
   *
   * @private
   * @param {string[]} response
   * @memberof ElasticsearchIndexManagementComponent
   */
  private indices_return_actions_(response: string[]): void {
    this.indices = response;
    this.is_loading = false;
    this.mat_stepper_.next();
  }

  /**
   * Used for making api rest call for index management
   *
   * @private
   * @param {IndexManagementOptionInterface} index_management_option
   * @memberof ElasticsearchIndexManagementComponent
   */
  private api_index_management_(index_management_option: IndexManagementOptionInterface): void {
    this.index_management_service_.index_management(index_management_option)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          /* istanbul ignore else */
          if (response instanceof SuccessMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            this.reset_form_();
          }
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'calling elasticsearch index management';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get closed indices
   *
   * @private
   * @memberof ElasticsearchIndexManagementComponent
   */
  private api_get_closed_indices_(): void {
    this.index_management_service_.get_closed_indices()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string[]) => {
          this.indices_return_actions_(response);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          this.is_loading = false;
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'getting closed indices';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get minio
   *
   * @private
   * @memberof ElasticsearchIndexManagementComponent
   */
  private api_minio_check_(): void {
    this.index_management_service_.minio_check()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.set_backup_option_(false, null);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          this.set_backup_option_(true, error as ErrorMessageClass);
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'checking minio';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get opened indices
   *
   * @private
   * @memberof ElasticsearchIndexManagementComponent
   */
  private api_get_all_indices_(): void {
    this.index_management_service_.get_all_indices()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string[]) => {
          this.indices_return_actions_(response);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          this.is_loading = false;
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'getting indices';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}

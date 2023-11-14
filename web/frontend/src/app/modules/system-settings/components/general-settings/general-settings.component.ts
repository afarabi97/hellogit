import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  BackgroundJobClass,
  ControllerInfoClass,
  ErrorMessageClass,
  GeneralSettingsClass,
  GenericJobAndKeyClass,
  KitStatusClass,
  ObjectUtilitiesClass
} from '../../../../classes';
import {
  DIALOG_HEIGHT_90VH,
  DIALOG_WIDTH_75VW,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../../../constants/cvah.constants';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { GeneralSettingsInterface, KitStatusInterface, ServerStdoutMatDialogDataInterface } from '../../../../interfaces';
import { GlobalJobService } from '../../../../services/global-job.service';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { ServerStdoutComponent } from '../../../server-stdout/server-stdout.component';
import { kitSettingsValidators } from '../../validators/kit-settings.validator';

@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-general-settings',
  templateUrl: './general-settings.component.html'
})
export class GeneralSettingsComponent implements OnInit, OnChanges {
  // Parent passed variables
  @Input() general_settings: Partial<GeneralSettingsClass>;
  @Input() kit_status: Partial<KitStatusClass>;
  @Input() controller_info: Partial<ControllerInfoClass>;
  // Used for updating general settings in parent component
  @Output() update_general_settings = new EventEmitter<any>();

  // Used for accepting user values to save as general settings
  general_settings_form_group: FormGroup;
  // Used for saving the current job id and to hide/show data within html
  job_id: string;
  // Used for hide/show elements in html
  job_running: boolean;
  // Used for dynamically passing the tootip data to html for save button
  button_save_tooltip: string;

  /**
   * Creates an instance of GeneralSettingsComponent.
   *
   * @param {MatDialog} mat_dialog_
   * @param {GlobalJobService} global_job_service_
   * @param {KitSettingsService} kit_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {WebsocketService} websocket_service_
   * @memberof GeneralSettingsComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private global_job_service_: GlobalJobService,
              private kit_settings_service_: KitSettingsService,
              private mat_snackbar_service_: MatSnackBarService,
              private websocket_service_:WebsocketService) {
    this.general_settings = {};
    this.kit_status = {};
    this.controller_info = {};
    this.job_id = null;
    this.job_running = false;
    this.button_save_tooltip = '';
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof GeneralSettingsComponent
   */
  ngOnInit(): void {
    this.websocket_get_socket_on_kit_status_change();
    this.initialize_general_settings_form_group_();
  }

  /**
   * Listens for changes on inputs
   *
   * @param {SimpleChanges} changes
   * @memberof GeneralSettingsComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    const general_settings_changes: SimpleChange = changes['general_settings'];
    const kit_status_changes: SimpleChange = changes['kit_status'];
    const controller_info_changes: SimpleChange = changes['controller_info'];

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(general_settings_changes) &&
        (general_settings_changes.currentValue !== general_settings_changes.previousValue ||
         !ObjectUtilitiesClass.notUndefNull(general_settings_changes.currentValue))) {
      /* istanbul ignore else */
      if (ObjectUtilitiesClass.notUndefNull(this.general_settings?.job_id)) {
        this.job_id = this.general_settings.job_id;
      }
      this.initialize_general_settings_form_group_();
      this.check_job_();
    }

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(kit_status_changes) &&
        this.kit_status.control_plane_deployed) {
      this.general_settings_form_group.get('domain').disable();
    }

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(controller_info_changes) &&
        controller_info_changes.currentValue !== controller_info_changes.previousValue) {
      this.gather_controller_facts_();
    }
  }

  /**
   * Used for retrieving the error message for a form control
   *
   * @param {AbstractControl} control
   * @return {string}
   * @memberof GeneralSettingsComponent
   */
  get_error_message(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  /**
   * Used retrieving a tooltip for a form control
   *
   * @param {string} input_name
   * @return {string}
   * @memberof GeneralSettingsComponent
   */
  get_tooltip(input_name: string): string {
    return COMMON_TOOLTIPS[input_name];
  }

  /**
   * Used for saving the kit settings form group and removing values for save
   *
   * @memberof GeneralSettingsComponent
   */
  click_button_save(): void {
    const general_settings: Object = new Object(this.general_settings_form_group.getRawValue());
    const newGeneralSettings: GeneralSettingsClass = new GeneralSettingsClass(general_settings as GeneralSettingsInterface);
    this.general_settings = newGeneralSettings;

    this.api_update_general_settings_(newGeneralSettings);
  }

  /**
   * Used for passing private method to be called by html
   *
   * @memberof GeneralSettingsComponent
   */
  click_button_open_console(): void {
    this.open_server_stdout_dialog_window_();
  }

  /**
   * Used for opening server stdout dialog window
   *
   * @private
   * @memberof GeneralSettingsComponent
   */
  private open_server_stdout_dialog_window_(): void {
    const server_stdout_mat_dialog_data: ServerStdoutMatDialogDataInterface = {
      job_id: this.job_id
    };

    const mat_dialog_ref: MatDialogRef<ServerStdoutComponent, any> = this.mat_dialog_.open(ServerStdoutComponent,
                                                                                           {
                                                                                             height: DIALOG_HEIGHT_90VH,
                                                                                             width: DIALOG_WIDTH_75VW,
                                                                                             data: server_stdout_mat_dialog_data
                                                                                           });

    const mat_dialog_output_job_deleted_subscription = mat_dialog_ref.componentInstance.job_deleted
                                                                                       .subscribe(() => {
                                                                                         mat_dialog_ref.close();
                                                                                         this.api_job_get_();
                                                                                         this.general_settings_form_group.get('domain').enable();
                                                                                         mat_dialog_output_job_deleted_subscription.unsubscribe();
                                                                                       });
  }

  private initialize_general_settings_form_group_(): void {
    const general_settings_form_group: FormGroup = new FormGroup({
                                                                   'domain': new FormControl(ObjectUtilitiesClass.notUndefNull(this.general_settings?.domain) ? this.general_settings.domain : '',
                                                                                             Validators.compose([validateFromArray(kitSettingsValidators.domain)])),
                                                                   'controller_interface': new FormControl(ObjectUtilitiesClass.notUndefNull(this.general_settings?.controller_interface) ? this.general_settings.controller_interface : ''),
                                                                   'netmask': new FormControl(ObjectUtilitiesClass.notUndefNull(this.general_settings?.netmask) ? this.general_settings.netmask : '255.255.255.0'),
                                                                   'gateway': new FormControl(ObjectUtilitiesClass.notUndefNull(this.general_settings?.gateway) ? this.general_settings.gateway : '')
                                                                 });

    general_settings_form_group.get('controller_interface').disable();
    general_settings_form_group.get('gateway').disable();
    general_settings_form_group.get('netmask').disable();

    this.general_settings_form_group = general_settings_form_group;
  }

  /**
   * Used to see if job_id is defined and then make call to get job
   *
   * @private
   * @memberof GeneralSettingsComponent
   */
  private check_job_(): void {
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.job_id)) {
      this.api_job_get_();
    }
  }

  /**
   * Used for gathering facts from contrller info and then setting kebernetes dhcp ranges
   *
   * @private
   * @memberof GeneralSettingsComponent
   */
  private gather_controller_facts_(): void {
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.controller_info)) {
      this.general_settings_form_group.get('controller_interface').setValue(this.controller_info.ip_address);
      this.general_settings_form_group.get('controller_interface').disable();
      this.general_settings_form_group.get('gateway').setValue(this.controller_info.gateway);
      this.general_settings_form_group.get('gateway').disable();
      this.general_settings_form_group.get('netmask').setValue(this.controller_info.netmask);
      this.general_settings_form_group.get('netmask').disable();
    }
  }

  /**
   * Used for setting up a websocket listener for kit-status changes
   *
   * @private
   * @memberof GeneralSettingsComponent
   */
  private websocket_get_socket_on_kit_status_change(): void {
    this.websocket_service_.getSocket()
                           .on('kit-status-change',
                               (data: KitStatusInterface) => {
                                 this.kit_status = new KitStatusClass(data);
                                 this.check_job_();
                               });
  }

  /**
   * Used for making api rest call to update kit settings
   *
   * @private
   * @param {GeneralSettingsClass} general_settings
   * @memberof KitSettingsComponent
   */
  private api_update_general_settings_ (general_settings: GeneralSettingsClass): void {
    this.kit_settings_service_.update_general_settings(general_settings)
                              .pipe(untilDestroyed(this))
                              .subscribe(
                                (response: GenericJobAndKeyClass) => {
                                  this.job_id = response.job_id;
                                  /* istanbul ignore else */
                                  if (ObjectUtilitiesClass.notUndefNull(this.general_settings)) {
                                    this.general_settings.job_id = this.job_id;
                                  }
                                  this.general_settings_form_group.disable();
                                  this.check_job_();
                                  this.update_general_settings.emit(this.general_settings);
                                },
                                (error: HttpErrorResponse) => {
                                  const message: string = 'updating general settings';
                                  this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                });
  }

  /**
   * Used for making api rest call to get job
   *
   * @private
   * @memberof GeneralSettingsComponent
   */
  private api_job_get_ (): void {
    this.global_job_service_.job_get(this.job_id)
                            .pipe(untilDestroyed(this))
                            .subscribe(
                              (reponse: BackgroundJobClass) => {
                                if (reponse.status === 'started') {
                                  this.job_running = true;
                                  this.button_save_tooltip = 'Job is running...';
                                  this.general_settings_form_group.disable();
                                } else {
                                  this.job_running = false;
                                  this.button_save_tooltip = '';

                                  /* istanbul ignore else */
                                  if (this.kit_status.control_plane_deployed) {
                                    this.general_settings_form_group.get('domain').disable();
                                  }
                                }
                              },
                              (error: ErrorMessageClass | HttpErrorResponse) => {
                                if (error instanceof ErrorMessageClass) {
                                  this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                } else {
                                  const message: string = 'retrieving job get';
                                  this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                }
                              });
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  BackgroundJobClass,
  ControllerInfoClass,
  ErrorMessageClass,
  GeneralSettingsClass,
  GenericJobAndKeyClass,
  IPSetFirstLastClass,
  KitSettingsClass,
  KitStatusClass,
  ObjectUtilitiesClass
} from '../../../../classes';
import {
  COMMON_VALIDATORS,
  DIALOG_HEIGHT_90VH,
  DIALOG_WIDTH_400PX,
  DIALOG_WIDTH_75VW,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../../../constants/cvah.constants';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { KitSettingsInterface, KitStatusInterface, ServerStdoutMatDialogDataInterface } from '../../../../interfaces';
import { GlobalJobService } from '../../../../services/global-job.service';
import { KitSettingsService } from '../../../../services/kit-settings.service';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { WebsocketService } from '../../../../services/websocket.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { PasswordMessageComponent } from '../../../global-components/components/password-message/password-message.component';
import { ServerStdoutComponent } from '../../../server-stdout/server-stdout.component';
import { SUBNET } from '../../constants/system-settings.constant';
import { kitSettingsValidators } from '../../validators/kit-settings.validator';

/**
 * Component used to save kit settings values
 *
 * @export
 * @class KitSettingsComponent
 * @implements {OnInit}
 * @implements {OnChanges}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-kit-settings',
  templateUrl: './kit-settings.component.html',
  styleUrls: ['./kit-settings.component.scss']
})
export class KitSettingsComponent implements OnInit, OnChanges {
  // Parent passed variables
  @Input() general_settings: Partial<GeneralSettingsClass>;
  @Input() kit_status: Partial<KitStatusClass>;
  @Input() controller_info: Partial<ControllerInfoClass>;
  @Input() kit_settings: KitSettingsClass;
  // Used for updating the kit settings in other areas by emitting changes back to parent
  @Output() update_kit_settings: EventEmitter<KitSettingsClass> = new EventEmitter<KitSettingsClass>();
  // Used for disabling button tied to parent component
  @Output() update_disable_buttons: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Used for accepting user values to save as kit settings
  kit_settings_form_group: FormGroup;
  // Used for saving the current job id and to hide / show data within html
  job_id: string;
  // Used for retaining a string of used kubernetes ips to be shown within html
  kube_svc_used_ips: string;
  // Used for holding the current dhcp range
  dhcp_range: string;
  // Used for dynamically passing the tootip data to html for save button
  button_save_tooltip: string;
  // Used for signifing if a job is currently running so that html can disable sections
  kit_job_running: boolean;
  // Used for passing list of selectable options to html
  kubernetes_ip_options: string[];
  // Used for holding a list of unused ips
  private unused_ip_addresses_: string[];
  // Used for hold all cidr ranges of first last
  private cidr_ranges_: Record<string, IPSetFirstLastClass>;

  /**
   * Creates an instance of KitSettingsComponent.
   *
   * @param {MatDialog} mat_dialog_
   * @param {GlobalJobService} global_job_service_
   * @param {KitSettingsService} kit_settings_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {WebsocketService} websocket_service_
   * @memberof KitSettingsComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private global_job_service_: GlobalJobService,
              private kit_settings_service_: KitSettingsService,
              private mat_snackbar_service_: MatSnackBarService,
              private websocket_service_: WebsocketService) {
    this.general_settings = {};
    this.kit_status = {};
    this.controller_info = {};
    this.job_id = null;
    this.kube_svc_used_ips = '';
    this.dhcp_range = '';
    this.button_save_tooltip = '';
    this.kit_job_running = false;
    this.kubernetes_ip_options = [];
    this.unused_ip_addresses_ = [];
    this.cidr_ranges_ = {};
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof KitSettingsComponent
   */
  ngOnInit(): void {
    this.websocket_get_socket_on_kit_status_change();
  }

  /**
   * Listens for changes on inputs
   *
   * @param {SimpleChanges} changes
   * @memberof KitSettingsComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    const kit_settings_changes: SimpleChange = changes['kit_settings'];
    const kit_status_changes: SimpleChange = changes['kit_status'];
    const controller_info_changes: SimpleChange = changes['controller_info'];

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(kit_settings_changes) &&
        (kit_settings_changes.currentValue !== kit_settings_changes.previousValue ||
         !ObjectUtilitiesClass.notUndefNull(kit_settings_changes.currentValue))) {
      this.initialize_kit_settings_form_group_();
      this.check_job_();
    }

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(kit_status_changes) &&
        kit_status_changes.currentValue !== kit_status_changes.previousValue) {
      this.check_job_();
    }

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(controller_info_changes) &&
        controller_info_changes.currentValue !== controller_info_changes.previousValue) {
      this.gather_controller_facts_();
    }
  }

  /**
   * Used for re evaluating password and re password form controls
   *
   * @private
   * @memberof KitSettingsComponent
   */
  re_evaluate(): void {
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.kit_settings_form_group)) {
      this.kit_settings_form_group.get('password').updateValueAndValidity();
      this.kit_settings_form_group.get('re_password').updateValueAndValidity();
    }
  }

  /**
   * Used for retrieving the error message for a form control
   *
   * @param {AbstractControl} control
   * @return {string}
   * @memberof KitSettingsComponent
   */
  get_error_message(control: AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  /**
   * Used retrieving a tooltip for a form control
   *
   * @param {string} input_name
   * @return {string}
   * @memberof KitSettingsComponent
   */
  get_tooltip(input_name: string): string {
    return COMMON_TOOLTIPS[input_name];
  }

  /**
   * Used for displaying text in html showing the user what range is selected
   *
   * @return {string}
   * @memberof KitSettingsComponent
   */
  get_kubernetes_service_range(): string {
    const kubernetes_value: string = this.kit_settings_form_group.get('kubernetes_services_cidr').value;

    return kubernetes_value !== '' &&
           ObjectUtilitiesClass.notUndefNull(this.cidr_ranges_[kubernetes_value])
             ? `Kubernetes services range will be: ${this.cidr_ranges_[kubernetes_value].first} - ${this.cidr_ranges_[kubernetes_value].last}`
             : '';
  }

  /**
   * Used for checking that value is set in kit_settings_form_group before making api call to
   * get api_get_used_ip_addresses_
   *
   * @memberof KitSettingsComponent
   */
  check_kubernetes_service_range(): void {
    /* istanbul ignore else */
    if (this.kit_settings_form_group && this.kit_settings_form_group.get('kubernetes_services_cidr').valid) {
      this.api_get_used_ip_addresses_(this.kit_settings_form_group.get('kubernetes_services_cidr').value);
    }
  }

  /**
   * Used for saving the kit settings form group and removing values for save
   *
   * @memberof KitSettingsComponent
   */
  click_button_save(): void {
    const kit_settings: Object = new Object(this.kit_settings_form_group.getRawValue());
    kit_settings['is_gip'] = kit_settings['is_gip'] === "GIP";
    delete kit_settings['re_password'];
    delete kit_settings['vcenter'];
    this.kit_settings = new KitSettingsClass(kit_settings as KitSettingsInterface);

    this.api_update_kit_settings_(this.kit_settings);
  }

  /**
   * Used for passing private method to be called by html
   *
   * @memberof KitSettingsComponent
   */
  click_button_open_console(): void {
    this.open_server_stdout_dialog_window_();
  }

  /**
   * Used for opening a dialog window that show password rules
   *
   * @memberof KitSettingsComponent
   */
  open_password_dialog_window(): void {
    this.mat_dialog_.open(PasswordMessageComponent,
                          { minWidth: DIALOG_WIDTH_400PX });
  }

  /**
   * Used for opening server stdout dialog window
   *
   * @private
   * @memberof KitSettingsComponent
   */
  private open_server_stdout_dialog_window_(): void {
    const server_stdout_mat_dialog_data: ServerStdoutMatDialogDataInterface = {
      job_id: this.job_id
    };
    this.mat_dialog_.open(ServerStdoutComponent,
                          {
                            height: DIALOG_HEIGHT_90VH,
                            width: DIALOG_WIDTH_75VW,
                            data: server_stdout_mat_dialog_data
                          });
  }

  /**
   * Used for setting up the kit settings form group
   *
   * @private
   * @memberof KitSettingsComponent
   */
  private initialize_kit_settings_form_group_(): void {
    const kit_settings_form_group: FormGroup = new FormGroup({
                                                               'password': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kit_settings) &&
                                                                                           ObjectUtilitiesClass.notUndefNull(this.kit_settings.password) ? this.kit_settings.password : '',
                                                                                           Validators.compose([validateFromArray(kitSettingsValidators.root_password, COMMON_VALIDATORS.required)])),
                                                               'upstream_ntp': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kit_settings) &&
                                                                                               ObjectUtilitiesClass.notUndefNull(this.kit_settings.upstream_ntp) ? this.kit_settings.upstream_ntp : null,
                                                                                               Validators.compose([validateFromArray(kitSettingsValidators.upstream_ntp)])),
                                                               'upstream_dns': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kit_settings) &&
                                                                                               ObjectUtilitiesClass.notUndefNull(this.kit_settings.upstream_dns) ? this.kit_settings.upstream_dns : null,
                                                                                               Validators.compose([validateFromArray(kitSettingsValidators.upstream_dns)])),
                                                               'kubernetes_services_cidr': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kit_settings) &&
                                                                                                           ObjectUtilitiesClass.notUndefNull(this.kit_settings.kubernetes_services_cidr) ? this.kit_settings.kubernetes_services_cidr : '',
                                                                                                           Validators.compose([validateFromArray(kitSettingsValidators.kubernetes_services_cidr)])),
                                                               'is_gip': new FormControl(ObjectUtilitiesClass.notUndefNull(this.kit_settings) &&
                                                                                         ObjectUtilitiesClass.notUndefNull(this.kit_settings.is_gip) &&
                                                                                         (this.kit_settings.is_gip === true) ? "GIP": "DIP")
                                                             });
    kit_settings_form_group.addControl('re_password', new FormControl(ObjectUtilitiesClass.notUndefNull(this.kit_settings) &&
                                                                      ObjectUtilitiesClass.notUndefNull(this.kit_settings.password) ? this.kit_settings.password : '',
                                                                      Validators.compose([validateFromArray(kitSettingsValidators.re_password,
                                                                                                            { parentControl: kit_settings_form_group.get('password') })])));

    this.kit_settings_form_group = kit_settings_form_group;
  }

  /**
   * Used for checking the current job and enabling or disabling features inside application
   *
   * @private
   * @memberof KitSettingsComponent
   */
  private check_job_ (): void {
    this.job_id = ObjectUtilitiesClass.notUndefNull(this.kit_settings) ? this.kit_settings.job_id : null;

    /* istanbul ignore else */
    if (!ObjectUtilitiesClass.notUndefNull(this.kit_settings_form_group)) {
      return;
    }

    if (this.kit_status.general_settings_configured) {
      this.kit_settings_form_group.enable();
      this.update_disable_buttons.emit(false);
      /* istanbul ignore else */
      if (this.job_id) {
        this.api_job_get_();
      }
    } else {
      this.kit_settings_form_group.disable();
      this.update_disable_buttons.emit(true);
    }
  }

  /**
   * Used for gathering facts from contrller info and then setting kebernetes dhcp ranges
   *
   * @private
   * @memberof KitSettingsComponent
   */
  private gather_controller_facts_(): void {
    if (ObjectUtilitiesClass.notUndefNull(this.controller_info) &&
        ObjectUtilitiesClass.notUndefNull(this.controller_info.cidrs)) {
      this.kubernetes_ip_options = this.controller_info.cidrs;
      this.unused_ip_addresses_ = this.controller_info.cidrs;
      this.cidr_ranges_ = this.controller_info.cidr_ranges;
    }

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.general_settings) &&
        ObjectUtilitiesClass.notUndefNull(this.unused_ip_addresses_)) {
      this.set_kubernetes_dhcp_range_(this.general_settings.dhcp_range);
    }
  }

  /**
   * Used for setting the dhcp range for kubernetes
   *
   * @private
   * @param {string} dhcp_range
   * @memberof KitSettingsComponent
   */
  private set_kubernetes_dhcp_range_(dhcp_range: string): void {
    this.kubernetes_ip_options = JSON.parse(JSON.stringify(this.unused_ip_addresses_));
    for (let x = 0; x < this.kubernetes_ip_options.length; x++) {
      /* istanbul ignore else */
      if (this.kubernetes_ip_options[x].endsWith(".32")) {
        this.kubernetes_ip_options.splice(x, 1);
      }
    }
    const index: number = this.kubernetes_ip_options.indexOf(dhcp_range);
    /* istanbul ignore else */
    if (index !== -1) {
      this.kubernetes_ip_options.splice(index, 1);
    }
  }

  /**
   * Used for setting up a websocket listener for kit-status changes
   *
   * @private
   * @memberof KitSettingsComponent
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
   * Used for making api rest call to get used ip addresses
   *
   * @private
   * @param {string} kubernetes_services_cidr
   * @memberof KitSettingsComponent
   */
  private api_get_used_ip_addresses_ (kubernetes_services_cidr: string): void {
    this.kit_settings_service_.get_used_ip_addresses(kubernetes_services_cidr, SUBNET)
                              .pipe(untilDestroyed(this))
                              .subscribe(
                                (response: string[]) => {
                                  let ips: string = response.toString();
                                  ips = ips.split(',').join('\n');
                                  this.kube_svc_used_ips = ips;
                                },
                                (error: ErrorMessageClass | HttpErrorResponse) => {
                                  if (error instanceof ErrorMessageClass) {
                                    this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                  } else {
                                    const message: string = 'retrieving used ip addresses';
                                    this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                  }
                                });
  }

  /**
   * Used for making api rest call to update kit settings
   *
   * @private
   * @param {KitSettingsClass} kit_settings
   * @memberof KitSettingsComponent
   */
  private api_update_kit_settings_ (kit_settings: KitSettingsClass): void {
    this.kit_settings_service_.update_kit_settings(kit_settings)
                              .pipe(untilDestroyed(this))
                              .subscribe(
                                (response: GenericJobAndKeyClass) => {
                                  this.job_id = response.job_id;
                                  this.kit_settings.job_id = this.job_id;
                                  this.kit_settings_form_group.disable();
                                  this.check_job_();
                                },
                                (error: HttpErrorResponse) => {
                                  const message: string = 'updating kit settings';
                                  this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
                                });
  }

  /**
   * Used for making api rest call to get job
   *
   * @private
   * @memberof KitSettingsComponent
   */
  private api_job_get_ (): void {
    this.global_job_service_.job_get(this.job_id)
                            .pipe(untilDestroyed(this))
                            .subscribe(
                              (reponse: BackgroundJobClass) => {
                                if (reponse.status === 'started') {
                                  this.kit_job_running = true;
                                  this.button_save_tooltip = 'Job is running...';
                                  this.kit_settings_form_group.disable();
                                  this.update_disable_buttons.emit(true);
                                } else {
                                  this.job_id = null;
                                  this.kit_job_running = false;
                                  this.button_save_tooltip = '';
                                  this.kit_settings_form_group.enable();
                                  this.update_disable_buttons.emit(false);
                                  this.update_kit_settings.emit(this.kit_settings);

                                  /* istanbul ignore else */
                                  if (this.kit_status.control_plane_deployed) {
                                    this.kit_settings_form_group.get('kubernetes_services_cidr').disable();
                                    this.kit_settings_form_group.get('password').disable();
                                    this.kit_settings_form_group.get('re_password').disable();
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

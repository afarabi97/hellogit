import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, GenericJobAndKeyClass, ObjectUtilitiesClass, StatusClass } from '../../classes';
import {
  DIALOG_WIDTH_800PX,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  SUBMIT_DIALOG_OPTION
} from '../../constants/cvah.constants';
import { BackingObjectInterface } from '../../interfaces';
import {
  DialogControlTypes,
  DialogFormControl,
  DialogFormControlConfigClass
} from '../../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../../modal-dialog-mat/modal-dialog-mat.component';
import { CatalogService } from '../../services/catalog.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { FileSetClass } from './classes/file-set.class';
import { FilebeatModuleClass } from './classes/filebeat-module.class';
import { WinlogbeatConfigurationClass } from './classes/winlogbeat-configuration.class';
import {
  ELASTICSEARCH_COLD_LOG_INGEST_TITLE,
  WINLOGBEAT_DEFAULT_PASSWORD_LABEL
} from './constants/cold-log-ingest.constant';
import { ColdLogIngestService } from './services/cold-log-ingest.service';

/**
 * Component used for hadeling cold log functionality
 *
 * @export
 * @class ColdLogIngestComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-cold-log-ingest',
  templateUrl: './cold-log-ingest.component.html',
  styleUrls: [
    './cold-log-ingest.component.scss'
  ]
})
export class ColdLogIngestComponent implements OnInit {
  // Used for retaining a copy of selected cold log file
  cold_log_file: File;
  // Used for displaying form group for user to save entries for cold log file upload
  cold_log_ingest_form_group: FormGroup;
  // Used for displaying the selected cold log file name
  file_name_form_control: FormControl;
  // Used for displaying file sets for a selected module as mat options
  file_sets: FileSetClass[];
  // Used for displaying modules as mat options
  modules: FilebeatModuleClass[];
  // Used to get coldlog status
  logstash_deployed: Boolean;

  /**
   * Creates an instance of ColdLogIngestComponent.
   *
   * @param {Title} title_
   * @param {FormBuilder} form_builder_
   * @param {MatDialog} mat_dialog_
   * @param {CatalogService} catalog_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {ColdLogIngestService} cold_log_ingest_service_
   * @memberof ColdLogIngestComponent
   */
  constructor(private title_: Title,
              private form_builder_: FormBuilder,
              private mat_dialog_: MatDialog,
              private catalog_service_: CatalogService,
              private mat_snackbar_service_: MatSnackBarService,
              private cold_log_ingest_service_: ColdLogIngestService) {
    this.file_sets = [];
    this.modules = [];
    this.cold_log_ingest_form_group = new FormGroup({});
  }

  /**
   * Used for setting up subscriptions
   *
   * @memberof ColdLogIngestComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(ELASTICSEARCH_COLD_LOG_INGEST_TITLE);
    this.initialize_form_group_();
    this.initialize_form_control_();
    this.api_get_module_info_();
    this.api_check_logstash_installed_();
  }

  /**
   * Used for handeling file input change
   *
   * @param {FileList} file_list
   * @memberof ColdLogIngestComponent
   */
  file_input_change(file_list: FileList): void {
    this.cold_log_file = file_list.item(0);
    this.file_name_form_control.setValue(this.cold_log_file.name);
  }

  /**
   * Used for passing private api call to html
   *
   * @memberof ColdLogIngestComponent
   */
  upload(): void {
    this.api_post_cold_log_file();
  }

  /**
   * Used for checking to see if file sets is empty
   *
   * @returns {boolean}
   * @memberof ColdLogIngestComponent
   */
  is_file_sets_empty(): boolean {
    return this.file_sets.length === 0;
  }

  /**
   * Used for setting file sets from a module upon changing modules
   *
   * @param {MatSelectChange} event
   * @memberof ColdLogIngestComponent
   */
  module_change(event: MatSelectChange): void {
    this.file_sets = this.modules.find((f: FilebeatModuleClass) => f.value === event.value).filesets;
  }

  /**
   * Used for starting the setup winlogbeat chain of events
   *
   * @memberof ColdLogIngestComponent
   */
  setup_winlogbeat(): void {
    this.api_get_winlogbeat_configuration_();
  }

  /**
   * Used for initializing form group
   *
   * @private
   * @memberof ColdLogIngestComponent
   */
  private initialize_form_group_(): void {
    const cold_log_ingest_form_group: FormGroup = this.form_builder_.group({
      module: new FormControl('', Validators.required),
      index_suffix: new FormControl('cold-log', [Validators.maxLength(50), Validators.pattern('^[a-zA-Z0-9\-\_]+$')]),
      send_to_logstash: new FormControl(false),
      fileset: new FormControl('')
    });

    this.set_form_group_(cold_log_ingest_form_group);
  }

  /**
   * Used for setting form group from passed value
   *
   * @private
   * @param {FormGroup} cold_log_ingest_form_group
   * @memberof ColdLogIngestComponent
   */
  private set_form_group_(cold_log_ingest_form_group: FormGroup): void {
    this.cold_log_ingest_form_group = cold_log_ingest_form_group;
  }

  /**
   * Used fort initializing form control value
   *
   * @private
   * @memberof ColdLogIngestComponent
   */
  private initialize_form_control_(): void {
    const file_name_form_control: FormControl = new FormControl('');

    this.set_form_control_(file_name_form_control);
  }

  /**
   * Used for setting form control from passed value
   *
   * @private
   * @param {FormControl} file_name_form_control
   * @memberof ColdLogIngestComponent
   */
  private set_form_control_(file_name_form_control: FormControl): void {
    this.file_name_form_control = file_name_form_control;
  }

  /**
   * Used for opening a dialog window to configur winlogbeat for setup
   *
   * @private
   * @param {WinlogbeatConfigurationClass} winlogbeat_configuration
   * @memberof ColdLogIngestComponent
   */
  private open_winlogbeat_setup_dialog_(winlogbeat_configuration: WinlogbeatConfigurationClass): void {
    const windows_host_form_control_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    windows_host_form_control_config.label = 'Hostname or IP Address';
    windows_host_form_control_config.formState = ObjectUtilitiesClass.notUndefNull(winlogbeat_configuration.windows_host) &&
                                                 winlogbeat_configuration.windows_host !== '' ?
                                                   winlogbeat_configuration.windows_host : '';
    windows_host_form_control_config.validatorOrOpts = [Validators.required];
    const username_form_control_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    username_form_control_config.label = 'Username';
    username_form_control_config.formState = ObjectUtilitiesClass.notUndefNull(winlogbeat_configuration.username) &&
                                             winlogbeat_configuration.username !== '' ?
                                               winlogbeat_configuration.username : '';
    username_form_control_config.validatorOrOpts = [Validators.required];
    const password_form_control_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    password_form_control_config.label = WINLOGBEAT_DEFAULT_PASSWORD_LABEL;
    password_form_control_config.formState = ObjectUtilitiesClass.notUndefNull(winlogbeat_configuration.password) &&
                                             winlogbeat_configuration.password !== '' ?
                                               winlogbeat_configuration.password : '';
    password_form_control_config.validatorOrOpts = [Validators.required];
    password_form_control_config.asyncValidator = undefined;
    password_form_control_config.tooltip = undefined;
    password_form_control_config.controlType = DialogControlTypes.password;
    const winrm_port_form_control_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    winrm_port_form_control_config.label = 'WinRM Port';
    winrm_port_form_control_config.formState = ObjectUtilitiesClass.notUndefNull(winlogbeat_configuration.winrm_port) &&
                                               winlogbeat_configuration.winrm_port !== 0 ?
                                                 winlogbeat_configuration.winrm_port : 5985;
    winrm_port_form_control_config.validatorOrOpts = [Validators.required];
    const winrm_scheme_form_control_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    winrm_scheme_form_control_config.label = 'WinRM Scheme';
    winrm_scheme_form_control_config.formState = ObjectUtilitiesClass.notUndefNull(winlogbeat_configuration.winrm_scheme) &&
                                                 winlogbeat_configuration.winrm_scheme !== '' ?
                                                   winlogbeat_configuration.winrm_scheme : 'http';
    winrm_scheme_form_control_config.validatorOrOpts = [Validators.required];
    winrm_scheme_form_control_config.asyncValidator = undefined;
    winrm_scheme_form_control_config.tooltip = undefined;
    winrm_scheme_form_control_config.controlType = DialogControlTypes.dropdown;
    winrm_scheme_form_control_config.options = ['http', 'https'];
    const winrm_transport_form_control_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    winrm_transport_form_control_config.label = 'WinRM Transport';
    winrm_transport_form_control_config.formState = ObjectUtilitiesClass.notUndefNull(winlogbeat_configuration.winrm_transport) &&
                                                    winlogbeat_configuration.winrm_transport !== '' ?
                                                      winlogbeat_configuration.winrm_transport : 'ntlm';
    winrm_transport_form_control_config.validatorOrOpts = [Validators.required];
    winrm_transport_form_control_config.asyncValidator = undefined;
    winrm_transport_form_control_config.tooltip = undefined;
    winrm_transport_form_control_config.controlType = DialogControlTypes.dropdown;
    winrm_transport_form_control_config.options = ['ntlm', 'basic'];
    const winlogBeatSetupForm = this.form_builder_.group({
      windows_host: new DialogFormControl(windows_host_form_control_config),
      username: new DialogFormControl(username_form_control_config),
      password: new DialogFormControl(password_form_control_config),
      winrm_port: new DialogFormControl(winrm_port_form_control_config),
      winrm_scheme: new DialogFormControl(winrm_scheme_form_control_config),
      winrm_transport: new DialogFormControl(winrm_transport_form_control_config)
    });
    const backing_object_interface: BackingObjectInterface = {
      title: 'Setup Winlog Beat',
      instructions: ObjectUtilitiesClass.notUndefNull(winlogbeat_configuration.windows_host) &&
                    winlogbeat_configuration.windows_host !== '' ?
                      'Winlogbeat is already setup but you may re-run the setup if there is a problem' : 'Please fill out the form',
      dialogForm: winlogBeatSetupForm,
      confirmBtnText: SUBMIT_DIALOG_OPTION
    };
    const mat_dialog_ref: MatDialogRef<ModalDialogMatComponent, any> = this.mat_dialog_.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH_800PX,
      data: backing_object_interface
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            this.api_post_winlogbeat_(response);
          }
        });
  }

  /**
   * Used for making api rest call to post cold log file
   *
   * @private
   * @memberof ColdLogIngestComponent
   */
  private api_post_cold_log_file(): void {
    this.cold_log_ingest_service_.post_cold_log_file(this.cold_log_file, this.cold_log_ingest_form_group.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          const message: string = `uploaded ${this.cold_log_file.name}.
          Open the notification manager to track its progress.`;
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'uploading cold log file';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get winlogbeat configuration
   *
   * @private
   * @memberof ColdLogIngestComponent
   */
  private api_get_winlogbeat_configuration_() {
    this.cold_log_ingest_service_.get_winlogbeat_configuration()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: WinlogbeatConfigurationClass) => {
          this.open_winlogbeat_setup_dialog_(response);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting winlogbeat configuration';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to post winlogbeat
   *
   * @private
   * @param {FormGroup} form_group
   * @memberof ColdLogIngestComponent
   */
  private api_post_winlogbeat_(form_group: FormGroup): void {
    this.cold_log_ingest_service_.post_winlogbeat(form_group.value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          const message: string = `started job Winlogbeat setup for Cold Log Ingest.
          Open the notification manager to track its progress.`;
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'setting up winlogbeat';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get modules info
   *
   * @private
   * @memberof ColdLogIngestComponent
   */
  private api_get_module_info_(): void {
    this.cold_log_ingest_service_.get_module_info()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: FilebeatModuleClass[]) => {
          this.modules = response;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting modules';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used to making api rest call to get check logstash installed
   *
   * @memberof ColdLogIngestComponent
   */
  private api_check_logstash_installed_() : void {
    this.catalog_service_.get_chart_statuses('logstash')
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: StatusClass[]) => {
          this.logstash_deployed = ObjectUtilitiesClass.notUndefNull(response) &&
                                   response.length > 0 &&
                                   (response[0].status === 'DEPLOYED');
        },
        (error: HttpErrorResponse) => {
          const message: string = 'checking logstash installed';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}

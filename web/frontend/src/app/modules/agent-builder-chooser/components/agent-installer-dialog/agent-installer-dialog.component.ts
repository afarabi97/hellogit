import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, ObjectUtilitiesClass } from '../../../../classes';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatOptionInterface } from '../../../../interfaces';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { AgentInstallerConfigurationClass, AppConfigClass, ElementSpecClass, EndgameSensorProfileClass } from '../../classes';
import {
  FORM_ELEMENTS,
  VALIDATORS_IS_VALID_IP_FROM_ARRAY,
  VALIDATORS_REQUIRED_FROM_ARRAY
} from '../../constants/agent-builder-chooser.constant';
import {
  AgentInstallerConfigurationInterface,
  AgentInstallerDialogDataInterface,
  EndgameLoginInterface
} from '../../interfaces';
import { EndgameService } from '../../services/endgame.service';

/**
 * Component used as dialog window for windows agent install
 *
 * @export
 * @class AgentInstallerDialogComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-agent-installer-dialog',
  templateUrl: 'agent-installer-dialog.component.html',
  styleUrls: ['./agent-installer-dialog.component.scss']
})
export class AgentInstallerDialogComponent implements OnInit {
  // Used as html form groups
  agent_installer_configuration_form_group: FormGroup;
  custom_packages_form_group: FormGroup;
  options_form_group: FormGroup;
  // Used for mat options
  endgame_sensor_profile_options: MatOptionInterface[];
  // Used for holding app configs from options form group
  app_configs_from_options: AppConfigClass[];

  /**
   * Creates an instance of AgentInstallerDialogComponent.
   *
   * @param {FormBuilder} form_builder_
   * @param {MatDialogRef<AgentInstallerDialogComponent>} mat_dialog_ref_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {EndgameService} endgame_service_
   * @param {AgentInstallerDialogDataInterface} mat_dialog_data
   * @memberof AgentInstallerDialogComponent
   */
  constructor(private form_builder_: FormBuilder,
              private mat_dialog_ref_: MatDialogRef<AgentInstallerDialogComponent>,
              private mat_snackbar_service_: MatSnackBarService,
              private endgame_service_: EndgameService,
              @Inject(MAT_DIALOG_DATA) public mat_dialog_data: AgentInstallerDialogDataInterface) {
    this.endgame_sensor_profile_options = [];
    this.app_configs_from_options = [];
  }

  /**
   * Used for setting up initializer methods
   *
   * @memberof AgentInstallerDialogComponent
   */
  ngOnInit(): void {
    this.initialize_agent_installer_configuration_form_group_();
    this.initialize_custom_packages_form_group_(this.mat_dialog_data.app_names);
  }

  /**
   * Used for toggling the an endgame validators on/off
   *
   * @param {MatCheckboxChange} event
   * @memberof AgentInstallerDialogComponent
   */
  toggle_endgame_validators(event: MatCheckboxChange): void {
    const endgame_sensor_id: AbstractControl = this.agent_installer_configuration_form_group.get('endgame_sensor_id');
    const endgame_server_ip: AbstractControl = this.agent_installer_configuration_form_group.get('endgame_options.endgame_server_ip');
    const endgame_port: AbstractControl = this.agent_installer_configuration_form_group.get('endgame_options.endgame_port');
    const endgame_user_name: AbstractControl = this.agent_installer_configuration_form_group.get('endgame_options.endgame_user_name');
    const endgame_password: AbstractControl = this.agent_installer_configuration_form_group.get('endgame_options.endgame_password');

    if (event.checked) {
      endgame_sensor_id.setValidators(VALIDATORS_REQUIRED_FROM_ARRAY);
      endgame_server_ip.setValidators(VALIDATORS_IS_VALID_IP_FROM_ARRAY);
      endgame_port.setValidators(VALIDATORS_REQUIRED_FROM_ARRAY);
      endgame_user_name.setValidators(VALIDATORS_REQUIRED_FROM_ARRAY);
      endgame_password.setValidators(VALIDATORS_REQUIRED_FROM_ARRAY);
    } else {
      endgame_sensor_id.setValidators(null);
      endgame_server_ip.setValidators(null);
      endgame_port.setValidators(null);
      endgame_user_name.setValidators(null);
      endgame_password.setValidators(null);
    }

    endgame_sensor_id.updateValueAndValidity();
    endgame_server_ip.updateValueAndValidity();
    endgame_port.updateValueAndValidity();
    endgame_user_name.updateValueAndValidity();
    endgame_password.updateValueAndValidity();
  }

  /**
   * Used to check and see if install endgame checked
   *
   * @returns {boolean}
   * @memberof AgentInstallerDialogComponent
   */
  install_endgame(): boolean {
    return this.agent_installer_configuration_form_group.get('install_endgame').value;
  }

  /**
   * Used for connecting to endgame
   *
   * @param {MatStepper} mat_stepper
   * @memberof AgentInstallerDialogComponent
   */
  connect_endgame(mat_stepper: MatStepper): void {
    const endgame_server_ip = this.agent_installer_configuration_form_group.get('endgame_options.endgame_server_ip');
    const endgame_port = this.agent_installer_configuration_form_group.get('endgame_options.endgame_port');
    const endgame_user_name = this.agent_installer_configuration_form_group.get('endgame_options.endgame_user_name');
    const endgame_password = this.agent_installer_configuration_form_group.get('endgame_options.endgame_password');

    /* istanbul ignore else */
    if (endgame_server_ip.valid && endgame_port.valid &&
        endgame_user_name.valid && endgame_password.valid) {

      const endgame_login: EndgameLoginInterface = {
        endgame_server_ip: endgame_server_ip.value,
        endgame_port: endgame_port.value,
        endgame_user_name: endgame_user_name.value,
        endgame_password: endgame_password.value
      };
      this.api_endgame_sensor_profiles_(mat_stepper, endgame_login);
    }
  }

  /**
   * Used for displaying form control error message within html
   *
   * @param {(FormControl | AbstractControl)} control
   * @returns {string}
   * @memberof AgentInstallerDialogComponent
   */
  get_error_message(control: FormControl | AbstractControl): string {
    return ObjectUtilitiesClass.notUndefNull(control) &&
           ObjectUtilitiesClass.notUndefNull(control.errors) ? control.errors.error_message : '';
  }

  /**
   * Used for setting specific options based on app config changes
   *
   * @param {MatCheckboxChange} event
   * @param {AppConfigClass} app_config
   * @memberof AgentInstallerDialogComponent
   */
  app_config_change(event: MatCheckboxChange, app_config: AppConfigClass): void {
    if (event.checked) {
      const element_spec_form_group: FormGroup = this.initialize_element_spec_form_group_(app_config);

      if (app_config.configLocation) {
        element_spec_form_group.addControl("configLocation", new FormControl(app_config.configLocation));
      }
      if (app_config.hasEditableConfig) {
        element_spec_form_group.addControl("hasEditableConfig", new FormControl(app_config.hasEditableConfig));
      } else {
        element_spec_form_group.addControl("hasEditableConfig", new FormControl(false));
      }

      if (ObjectUtilitiesClass.notUndefNull(this.options_form_group)) {
        this.options_form_group.addControl(app_config.name, element_spec_form_group);
      } else {
        this.options_form_group = new FormGroup({[app_config.name]: element_spec_form_group});
        this.agent_installer_configuration_form_group.addControl('customPackages', this.options_form_group);
      }
    } else {
      /* istanbul ignore else */
      if (ObjectUtilitiesClass.notUndefNull(this.options_form_group)) {
        this.options_form_group.removeControl(app_config.name);
        /* istanbul ignore else */
        if (Object.keys(this.options_form_group.controls).length === 0) {
          this.options_form_group = null;
          this.agent_installer_configuration_form_group.removeControl('customPackages');
        }
      }
    }
    const options_control_keys: string[] = ObjectUtilitiesClass.notUndefNull(this.options_form_group) ? Object.keys(this.options_form_group.controls) : [];
    const app_configs_from_options: AppConfigClass[] =
      ObjectUtilitiesClass.notUndefNull(this.options_form_group) ?
        options_control_keys.map((k: string) => this.mat_dialog_data.app_name_app_config_pair[k]) : [];
    this.set_app_configs_from_options_(app_configs_from_options);
  }

  /**
   * Used for closing dialog window
   *
   * @memberof AgentInstallerDialogComponent
   */
  close(): void {
    this.mat_dialog_ref_.close();
  }

  /**
   * Used for closing the dialog window and submitting agent installer configuration form group
   *
   * @memberof AgentInstallerDialogComponent
   */
  submit(): void {
    if (ObjectUtilitiesClass.notUndefNull(this.agent_installer_configuration_form_group) && this.agent_installer_configuration_form_group.valid) {
      this.agent_installer_configuration_form_group.get('endgame_sensor_name').setValue(this.get_sensor_profile_name_());
      let form_data = this.agent_installer_configuration_form_group.getRawValue();
      const endgame_options = form_data['endgame_options'];
      delete form_data['endgame_options'];
      const scratch = {...form_data, ...endgame_options};
      form_data = scratch;

      this.mat_dialog_ref_.close(new AgentInstallerConfigurationClass(form_data as AgentInstallerConfigurationInterface));
    } else {
      const message: string = `The form contains invalid entries. Please double check values and try again.`;
      this.mat_snackbar_service_.displaySnackBar(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
    }
  }

  /**
   * Used for initializing agent installer configuration form group
   *
   * @private
   * @memberof AgentInstallerDialogComponent
   */
  private initialize_agent_installer_configuration_form_group_(): void {
    const agent_installer_configuration_form_group: FormGroup = this.form_builder_.group(
      {
        config_name: ['', VALIDATORS_REQUIRED_FROM_ARRAY],
        install_endgame: [false],
        endgame_options: this.form_builder_.group({
          endgame_server_ip: [null],
          endgame_user_name: [null],
          endgame_password: [null],
          endgame_port: ['443', VALIDATORS_REQUIRED_FROM_ARRAY]
        }),
        endgame_sensor_id: [null],
        endgame_sensor_name: [null]
      },
      {
        validators: this.form_level_validations_
      }
    );

    this.set_agent_installer_configuration_form_group_(agent_installer_configuration_form_group);
  }

  /**
   * Used for initializing custom packages form group
   *
   * @private
   * @param {string[]} app_names
   * @memberof AgentInstallerDialogComponent
   */
  private initialize_custom_packages_form_group_(app_names: string[]): void {
    const custom_packages_form_group: FormGroup = this.form_builder_.group({});
    app_names.forEach((n: string) => custom_packages_form_group.addControl(n, new FormControl(false)));

    this.set_custom_packages_form_group_(custom_packages_form_group);
  }

  /**
   * Used for initializing element spec form group
   *
   * @private
   * @param {AppConfigClass} app_config
   * @returns {FormGroup}
   * @memberof AgentInstallerDialogComponent
   */
  private initialize_element_spec_form_group_(app_config: AppConfigClass): FormGroup {
      const element_specs: ElementSpecClass[] = app_config.form.filter((es: ElementSpecClass) => FORM_ELEMENTS.includes(es.type));
      const element_spec_form_group: FormGroup = this.form_builder_.group({});
      element_specs.forEach((es: ElementSpecClass) => element_spec_form_group.addControl(es.name, this.get_element_spec_form_control_(es)));

      return element_spec_form_group;
  }

  /**
   * Used for setting agent installer configuration form group value
   *
   * @private
   * @param {FormGroup} agent_installer_configuration_form_group
   * @memberof AgentInstallerDialogComponent
   */
  private set_agent_installer_configuration_form_group_(agent_installer_configuration_form_group: FormGroup): void {
    this.agent_installer_configuration_form_group = agent_installer_configuration_form_group;
  }

  /**
   * Used for setting custom packages form group value
   *
   * @private
   * @param {FormGroup} custom_packages_form_group
   * @memberof AgentInstallerDialogComponent
   */
  private set_custom_packages_form_group_(custom_packages_form_group: FormGroup): void {
    this.custom_packages_form_group = custom_packages_form_group;
  }

  /**
   * Used for setting endgame sensor profile mat option values
   *
   * @private
   * @param {MatOptionInterface[]} endgame_sensor_profile_options
   * @memberof AgentInstallerDialogComponent
   */
  private set_endgame_sensor_profiles_(endgame_sensor_profile_options: MatOptionInterface[]): void {
    this.endgame_sensor_profile_options = endgame_sensor_profile_options;
  }

  /**
   * Used for setting app configs from options values
   *
   * @private
   * @param {AppConfigClass[]} app_configs_from_options
   * @memberof AgentInstallerDialogComponent
   */
  private set_app_configs_from_options_(app_configs_from_options: AppConfigClass[]): void {
    this.app_configs_from_options = app_configs_from_options;
  }

  /**
   * Used for retrieving element spec form control
   *
   * @private
   * @param {ElementSpecClass} element_spec
   * @returns {FormControl}
   * @memberof AgentInstallerDialogComponent
   */
  private get_element_spec_form_control_(element_spec: ElementSpecClass): FormControl {
    let form_control: FormControl;

    switch (element_spec.type) {
      case 'textinput':
        form_control = this.create_element_spec_textinput_form_control_(element_spec);
        break;
      case 'checkbox':
        form_control = this.create_element_spec_checkbox_form_control_(element_spec);
        break;
      default:
        form_control = null;
    }

    return form_control;
  }

  /**
   * Used for creating element spec textinput form control
   *
   * @private
   * @param {ElementSpecClass} element_spec
   * @returns {FormControl}
   * @memberof AgentInstallerDialogComponent
   */
  private create_element_spec_textinput_form_control_(element_spec: ElementSpecClass): FormControl {
    const validators: ValidatorFn[] = [];
    const regexp: string = element_spec.regexp;
    const required: boolean = element_spec.required;
    const default_value: string =
      ObjectUtilitiesClass.notUndefNull(element_spec.default_value) ?
        element_spec.default_value as string : null;

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(regexp)) {
      validators.push(Validators.pattern(regexp));
    }

    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(required)) {
      validators.push(Validators.required);
    }

    return new FormControl(default_value, validators);
  }

  /**
   * Used for creating element spec checkbox form control
   *
   * @private
   * @param {ElementSpecClass} element_spec
   * @returns {FormControl}
   * @memberof AgentInstallerDialogComponent
   */
  private create_element_spec_checkbox_form_control_(element_spec: ElementSpecClass): FormControl {
    const default_value: boolean =
      ObjectUtilitiesClass.notUndefNull(element_spec.default_value) ?
        element_spec.default_value as boolean : null;

    return new FormControl(default_value);
  }

  /**
   * Used for masking sure that at least one application is selected before form vailidates appropriately
   *
   * @private
   * @param {FormGroup} form_group
   * @returns {(ValidationErrors | null)}
   * @memberof AgentInstallerDialogComponent
   */
  private form_level_validations_(form_group: FormGroup): ValidationErrors | null {
    if (form_group.get('install_endgame').value || ObjectUtilitiesClass.notUndefNull(form_group.get('customPackages'))) {
      return null;
    } else {
      return { error_message: 'At least one application needs to be selected' };
    }
  }

  /**
   * Used for returning sensor profile name
   *
   * @private
   * @returns {string}
   * @memberof AgentInstallerDialogComponent
   */
  private get_sensor_profile_name_(): string {
    let profile_name: string = null;
    for (const endgame_sensor_profile_option of this.endgame_sensor_profile_options) {
      /* istanbul ignore else */
      if (endgame_sensor_profile_option.value === this.agent_installer_configuration_form_group.get('endgame_sensor_id').value) {
        profile_name = endgame_sensor_profile_option.name;
      }
    }

    return profile_name;
  }

  /**
   * Used to making api rest call to post endgame sensor profiles
   *
   * @private
   * @param {MatStepper} mat_stepper
   * @param {EndgameLoginInterface} endgame_login
   * @memberof AgentInstallerDialogComponent
   */
  private api_endgame_sensor_profiles_(mat_stepper: MatStepper, endgame_login: EndgameLoginInterface): void {
    this.endgame_service_.endgame_sensor_profiles(endgame_login)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: EndgameSensorProfileClass[]) => {
          const endgame_sensor_profile_options: MatOptionInterface[] = response.map((sp: EndgameSensorProfileClass) => {
            const mat_option: MatOptionInterface = {
              name: sp.name,
              value: sp.id
            };

            return mat_option;
          });
          this.set_endgame_sensor_profiles_(endgame_sensor_profile_options);
          mat_stepper.next();
          const message: string = 'connected to Endgame';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'connecting to endgame';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}

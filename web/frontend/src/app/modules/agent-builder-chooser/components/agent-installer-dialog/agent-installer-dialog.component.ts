import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';

import { ErrorMessageClass, ObjectUtilitiesClass } from '../../../../classes';
import { COMMON_VALIDATORS, MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatOptionInterface } from '../../../../interfaces';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { AppConfigClass, ElementSpecClass, EndgameSensorProfileClass } from '../../classes';
import { EndgameLoginInterface } from '../../interfaces';
import { EndgameService } from '../../services/endgame.service';

@Component({
  selector: 'agent-installer-dialog',
  templateUrl: 'agent-installer-dialog.component.html',
  styleUrls: ['./agent-installer-dialog.component.scss']
})
export class AgentInstallerDialogComponent implements OnInit {
  newHostAgentForm: FormGroup;
  externalIPToolTip: string;
  endgame_server_reachable: boolean;
  sensor_profiles: MatOptionInterface[];
  // Custom packages
  appConfigs: AppConfigClass[];
  appNames: string[];
  configs: {[key: string]: AppConfigClass};
  applicableConfigs: AppConfigClass[];
  applications: FormGroup;
  options: FormGroup;
  formElements = ['textinput', 'checkbox'];

  constructor(private fb: FormBuilder,
              public dialogRef: MatDialogRef<AgentInstallerDialogComponent>,
              private mat_snackbar_service_: MatSnackBarService,
              private endgame_service_: EndgameService,
              private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.endgame_server_reachable = false;
    this.sensor_profiles = [];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    const required = Validators.compose([ validateFromArray(COMMON_VALIDATORS.required)]);

    this.newHostAgentForm = this.fb.group(
      {
        config_name: ['', required],
        install_endgame: [false],
        endgame_options: this.fb.group({
          endgame_server_ip: [null],
          endgame_user_name: [null],
          endgame_password: [null],
          endgame_port: ['443', required]
        }),
        endgame_sensor_id: [null],
        endgame_sensor_name: [null]
      },
      {validators: this.formLevelValidations}
    );

    // Custom packages
    this.appConfigs = this.data;
    const configs = {};

    this.appNames = this.appConfigs.map((appConfig: AppConfigClass) => {
      const name = appConfig.name;
      configs[name] = appConfig;

      return name;
    });

    this.configs = configs;
    this.applicableConfigs = [];
    this.applications = this.createPackageControls(this.appNames);

  }

  toggleEndgameValidators(event: MatCheckboxChange) {
    const sensor_id = this.newHostAgentForm.get('endgame_sensor_id');
    const server_ip = this.newHostAgentForm.get('endgame_options.endgame_server_ip');
    const user_name = this.newHostAgentForm.get('endgame_options.endgame_user_name');
    const password = this.newHostAgentForm.get('endgame_options.endgame_password');
    const port = this.newHostAgentForm.get('endgame_options.endgame_port');

    if (event.checked) {
      sensor_id.setValidators(Validators.compose([ validateFromArray(COMMON_VALIDATORS.required)]));
      server_ip.setValidators(Validators.compose([ validateFromArray(COMMON_VALIDATORS.isValidIP)]));
      user_name.setValidators(Validators.compose([ validateFromArray(COMMON_VALIDATORS.required)]));
      password.setValidators(Validators.compose([ validateFromArray(COMMON_VALIDATORS.required)]));
      port.setValidators(Validators.compose([ validateFromArray(COMMON_VALIDATORS.required)]));
    } else {
      sensor_id.setValidators(null);
      server_ip.setValidators(null);
      user_name.setValidators(null);
      password.setValidators(null);
      port.setValidators(null);
    }

    sensor_id.updateValueAndValidity();
    server_ip.updateValueAndValidity();
    user_name.updateValueAndValidity();
    password.updateValueAndValidity();
    port.updateValueAndValidity();
  }

  isEndgame(): boolean {
    return this.newHostAgentForm.get('install_endgame').value;
  }

  submitAndClose(){
    this.newHostAgentForm.get('endgame_sensor_name').setValue(this.getSensorName());
    this.dialogRef.close(this.newHostAgentForm);
  }

  getEndgameSensorProfiles(stepper: MatStepper) {
    this.endgame_server_reachable = false;

    const password = this.newHostAgentForm.get('endgame_options.endgame_password');
    const server_ip = this.newHostAgentForm.get('endgame_options.endgame_server_ip');
    const user_name = this.newHostAgentForm.get('endgame_options.endgame_user_name');
    const port = this.newHostAgentForm.get('endgame_options.endgame_port');

    if(password.valid &&
       server_ip.valid &&
       user_name.valid &&
       port.valid) {

      const endgame_login: EndgameLoginInterface = {
        endgame_password: password.value,
        endgame_server_ip: server_ip.value,
        endgame_user_name: user_name.value,
        endgame_port: port.value
      };

      this.endgame_service_.endgame_sensor_profiles(endgame_login)
        .subscribe(
          (response: EndgameSensorProfileClass[]) => {
            this.endgame_server_reachable = true;
            this.sensor_profiles = response.map((sp: EndgameSensorProfileClass) => {
              const mat_option: MatOptionInterface = {
                name: sp.name,
                value: sp.id
              };

              return mat_option;
            });
            stepper.next();
            const message: string = 'connected to Endgame';
            this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          },
          (error: ErrorMessageClass | HttpErrorResponse) => {
            this.endgame_server_reachable = false;
            if (error instanceof ErrorMessageClass) {
              this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else {
              const message: string = 'connecting to endgame';
              this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          });
    }
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return ObjectUtilitiesClass.notUndefNull(control) &&
           ObjectUtilitiesClass.notUndefNull(control.errors) ? control.errors.error_message : '';
  }

  onApplicationChange(event: MatCheckboxChange, appConfig: AppConfigClass) {
    const checked = event.checked;
    const name = appConfig.name;

    if (checked) {
      const form = this.createFormGroup(appConfig);

        if (form) {
            if (this.options) {
                this.options.addControl(name, form);
            } else {
                this.options = new FormGroup({[name]: form});
                this.newHostAgentForm.addControl('customPackages', this.options);
            }
        }
    } else {
        if (this.options) {
            this.options.removeControl(name);
            if (Object.keys(this.options.controls).length === 0) {
                this.options = null;
                this.newHostAgentForm.removeControl('customPackages');
            }
        }
    }
    this.applicableConfigs = this.options ? Object.keys(this.options.controls).map((key: string) => this.configs[key]) : [];
  }

  /**
   * Ensures that at least one application is selected before form vailidates appropriatley.
   */
  private formLevelValidations(control: FormGroup): ValidationErrors | null {

    if (control.get('install_endgame').value) {
      return null;
    }

    if (control.get('customPackages')) {
      return null;
    }

    return {"custom_error": "At least one application needs to be selected"};
  }

  private showEndgameSnackBar(err: Object): void{
    if (err['error'] && err['error']['message']){
      this.snackBar.open(err['error']['message'], "Close", { duration: 5000});
    } else {
      this.snackBar.open("Could not reach Endgame server.", "Close", { duration: 5000});
    }
  }

  private getSensorName(): string {
    for (const profile of this.sensor_profiles){
      if (profile.value === this.newHostAgentForm.get('endgame_sensor_id').value){
        return profile.name;
      }
    }
    return null;
  }

  // Custom packages
  private createPackageControls(appNames) {
    const controls = {};
    for (const appName of appNames) {
        controls[appName] = new FormControl(false);
    }

    return new FormGroup(controls);
  }

  private createTextinputControl(spec: ElementSpecClass): FormControl {
    const validators = [];
    const regexp = spec['regexp'];
    const required = spec['required'];
    const default_value = spec['default_value'] || null;

      if (regexp) {
        const patternValidator = Validators.pattern(regexp);
          validators.push(patternValidator);
      }

      if (required) {
        const requiredValidator = Validators.required;
          validators.push(requiredValidator);
      }

      return new FormControl(default_value, validators);
  }

  private createCheckboxControl(spec: ElementSpecClass) {
    const default_value = spec['default_value'] || null;
      return new FormControl(default_value);
  }

  private createControl(spec: ElementSpecClass) {
      let control: FormControl;

      switch(spec.type) {
          case 'textinput':
              control = this.createTextinputControl(spec);
              break;
          case 'checkbox':
              control = this.createCheckboxControl(spec);
              break;
          default:
              control = null;
      }

      return control;
  }

  private getFormSpec(appConfig: AppConfigClass) {
    const formSpec = appConfig['form'];
      return formSpec ? formSpec.filter((elementSpec: ElementSpecClass) => this.formElements.includes(elementSpec.type)) : [];
  }

  private createFormGroup(appConfig: AppConfigClass) {
      // Removes any unknown elements.
      const formSpec = this.getFormSpec(appConfig);

      if (formSpec.length > 0) {
        const controls = {};

          for (const elementSpec of formSpec) {
            const name = elementSpec.name;
            controls[name] = this.createControl(elementSpec);
          }

          return new FormGroup(controls);
      } else {
          return new FormGroup({});
      }
  }
}

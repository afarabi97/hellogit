import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox'
import { FormBuilder, FormControl,
         FormGroup, Validators,
         AbstractControl,
         ValidationErrors} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EndgameService } from './endgame.service'
import { MatStepper } from '@angular/material';
import { COMMON_VALIDATORS } from 'src/app/frontend-constants';
import { validateFromArray } from 'src/app/validators/generic-validators.validator';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppConfig, ElementSpec } from '../agent-builder.service';


@Component({
  selector: 'agent-installer-dialog',
  templateUrl: 'agent-installer-dialog.component.html',
  styleUrls: ['./agent-installer-dialog.component.scss']
})
export class AgentInstallerDialogComponent implements OnInit {
  newHostAgentForm: FormGroup;
  externalIPToolTip: string;
  endgame_server_reachable: boolean;
  sensor_profiles: Array<{name: string, value: string}>

  // Custom packages
  appConfigs: Array<AppConfig>;
  appNames: Array<string>;
  configs: {[key: string]: AppConfig};
  applicableConfigs: Array<AppConfig>;
  applications: FormGroup;
  options: FormGroup;
  formElements = ['textinput', 'checkbox'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AgentInstallerDialogComponent>,
    private endgameSrv: EndgameService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.endgame_server_reachable = false;
    this.sensor_profiles = new Array();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  /**
   * Ensures that at least one application is selected before form vailidates appropriatley.
   */
  private formLevelValidations(control: FormGroup): ValidationErrors | null {

    if (control.get('install_endgame').value) {
      return null;
    }

    if (control.get('customPackages')) {
      return null
    }

    return {"custom_error": "At least one application needs to be selected"};
  }

  ngOnInit() {
    let required = Validators.compose([ validateFromArray(COMMON_VALIDATORS.required)]);

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
    let appNames = [];
    let configs = {};

    for (let config of this.appConfigs) {
        let name = config['name'];
        appNames.push(name);
        configs[name] = config;
    }

    this.appNames = appNames;
    this.configs = configs;
    this.applicableConfigs = [];
    this.applications = this.createPackageControls(appNames);

  }

  toggleEndgameValidators(event: MatCheckboxChange) {
    let sensor_id = this.newHostAgentForm.get('endgame_sensor_id');
    let server_ip = this.newHostAgentForm.get('endgame_options.endgame_server_ip');
    let user_name = this.newHostAgentForm.get('endgame_options.endgame_user_name');
    let password = this.newHostAgentForm.get('endgame_options.endgame_password')
    let port = this.newHostAgentForm.get('endgame_options.endgame_port');

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

  private showEndgameSnackBar(err: Object): void{
    if (err['error'] && err['error']['message']){
      this.snackBar.open(err['error']['message'], "Close", { duration: 5000});
    } else {
      this.snackBar.open("Could not reach Endgame server.", "Close", { duration: 5000});
    }
  }

  private getSensorName(): string {
    for (let profile of this.sensor_profiles){
      if (profile.value === this.newHostAgentForm.get('endgame_sensor_id').value){
        return profile.name;
      }
    }
    return null;
  }

  submitAndClose(){
    this.newHostAgentForm.get('endgame_sensor_name').setValue(this.getSensorName());
    this.dialogRef.close(this.newHostAgentForm);
  }

  getEndgameSensorProfiles(stepper: MatStepper) {
    this.endgame_server_reachable = false;
    if(this.newHostAgentForm.get('endgame_options.endgame_password').valid &&
       this.newHostAgentForm.get('endgame_options.endgame_server_ip').valid &&
       this.newHostAgentForm.get('endgame_options.endgame_user_name').valid &&
       this.newHostAgentForm.get('endgame_options.endgame_port').valid)
    {
      this.endgameSrv.getEndgameSensorProfiles(this.newHostAgentForm.getRawValue()).subscribe(
        profile_data => {
          this.endgame_server_reachable = true;
          this.sensor_profiles = new Array();

          for (let profile of profile_data){
            this.sensor_profiles.push({name: profile['name'], value: profile['id']})
          }
          stepper.next();
          this.snackBar.open("Successfully connected to Endgame.", "Close", { duration: 5000});
        },
        err => {
            this.endgame_server_reachable = false;
            this.showEndgameSnackBar(err.error);
        }
      );
    }
  }

  public getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

  // Custom packages
  private createPackageControls(appNames) {
    let controls = {};
    for (let appName of appNames) {
        controls[appName] = new FormControl(false);
    }

    return new FormGroup(controls);
  }

  private createTextinputControl(spec: ElementSpec) {
      let validators = [];
      let regexp = spec['regexp'];
      let required = spec['required'];
      let default_value = spec['default_value'] || null;

      if (regexp)
      {
          let pattern = Validators.pattern(regexp);
          validators.push(pattern);
      }

      if (required)
      {
          let required = Validators.required;
          validators.push(required);
      }

      let control = new FormControl(default_value, validators);
      return control;
  }

  private createCheckboxControl(spec: ElementSpec) {
      let default_value = spec['default_value'] || null;
      return new FormControl(default_value);
  }

  private createControl(spec: ElementSpec) {
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

  private getFormSpec(appConfig: AppConfig) {
      let formSpec = appConfig['form'];
      return formSpec ? formSpec.filter((elementSpec: ElementSpec) => this.formElements.includes(elementSpec.type)) : [];
  }

  private createFormGroup(appConfig: AppConfig) {
      // Removes any unknown elements.
      let formSpec = this.getFormSpec(appConfig);

      if (formSpec.length > 0) {
          let controls = {};

          for (let elementSpec of formSpec) {
              let name = elementSpec.name
              controls[name] = this.createControl(elementSpec);
          }

          return new FormGroup(controls);
      } else {
          return new FormGroup({});
      }
  }

  onApplicationChange(event: MatCheckboxChange, appConfig: AppConfig) {
    let checked = event.checked;
    let name = appConfig['name'];

    if (checked) {
        let form = this.createFormGroup(appConfig);

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
            this.options.removeControl(name)
            if (Object.keys(this.options.controls).length === 0) {
                this.options = null;
                this.newHostAgentForm.removeControl('customPackages');
            }
        }
    }

    let applicableConfigs = [];
    if(this.options) {
        for (let name in this.options.controls) {
            applicableConfigs.push(this.configs[name]);
        }
    }
    this.applicableConfigs = applicableConfigs;

  }
}

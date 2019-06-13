import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox'
import { FormBuilder, FormControl,
         FormGroup, Validators,
         AbstractControl,
         ValidationErrors} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EndgameService } from './endgame.service'

const TRAFFIC_DEST_DESC: string = "If you have a DIP setup with a PF Sense firewall, please enter the external IP Address of that here. \
                                   If not, please provide the Kuberenetes service IP Address.  When entering the PF sense firewall, keep in mind \
                                   that targets from outside of the DIP must go through this firewall and the administrator of that firewall will \
                                   need to enable port forwarding to the appropriate kubectl services";

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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AgentInstallerDialogComponent>,
    private endgameSrv: EndgameService,
    private snackBar: MatSnackBar
  ) {
    this.externalIPToolTip = TRAFFIC_DEST_DESC;
    this.endgame_server_reachable = false;
    this.sensor_profiles = new Array();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  /**
   * Ensures that at least one application is selected before form vailidates appropriatley.
   */
  private formLevelValidations(control: AbstractControl): ValidationErrors | null {
    if (control){
      let formGroup = control as FormGroup;
      if (!formGroup.get('install_sysmon').value)
        if (!formGroup.get('install_winlogbeat').value)
          if (!formGroup.get('install_endgame').value)
            return {"custom_error": "At least one application needs to be selected"};
    }

    return null;
  }

  ngOnInit() {
    this.newHostAgentForm = this.fb.group({
      config_name: new FormControl('', Validators.compose([Validators.required])),
      system_arch: new FormControl('', Validators.compose([Validators.required])),
      install_sysmon: new FormControl(false),
      install_winlogbeat: new FormControl(false),
      winlog_beat_dest_ip: new FormControl(''),
      winlog_beat_dest_port: new FormControl('5045'),
      install_endgame: new FormControl(false),

      endgame_sensor_id: new FormControl(),
      endgame_sensor_name: new FormControl(),

      endgame_server_ip: new FormControl(),
      endgame_user_name: new FormControl(),
      endgame_password: new FormControl(),
      endgame_port: new FormControl('443')
    });

    this.newHostAgentForm.setValidators(this.formLevelValidations);
  }

  createStepperValidation(...controls: string[]){
    let ret_val = []

    controls.map(control => {
      ret_val.push(this.newHostAgentForm.get(control));
    });

    return this.fb.array(ret_val);
  }

  toggleWinlogBeatValidators(event: MatCheckboxChange) {
    if (event.checked) {
      this.newHostAgentForm.get('winlog_beat_dest_ip').setValidators(Validators.compose([Validators.required]));
      this.newHostAgentForm.get('winlog_beat_dest_port').setValidators(Validators.compose([Validators.required]));
    } else{
      this.newHostAgentForm.get('winlog_beat_dest_ip').setValidators(null);
      this.newHostAgentForm.get('winlog_beat_dest_port').setValidators(null);
    }
  }

  toggleEndgameValidators(event: MatCheckboxChange) {
    if (event.checked) {
      this.newHostAgentForm.get('endgame_sensor_id').setValidators(Validators.compose([Validators.required]));
      this.newHostAgentForm.get('endgame_server_ip').setValidators(Validators.compose([Validators.required]));
      this.newHostAgentForm.get('endgame_user_name').setValidators(Validators.compose([Validators.required]));
      this.newHostAgentForm.get('endgame_password').setValidators(Validators.compose([Validators.required]));
      this.newHostAgentForm.get('endgame_port').setValidators(Validators.compose([Validators.required]));
    } else {
      this.newHostAgentForm.get('endgame_sensor_id').setValidators(null);
      this.newHostAgentForm.get('endgame_server_ip').setValidators(null);
      this.newHostAgentForm.get('endgame_user_name').setValidators(null);
      this.newHostAgentForm.get('endgame_password').setValidators(null);
      this.newHostAgentForm.get('endgame_port').setValidators(null);
    }
  }

  isWinlogBeat(): boolean {
    return this.newHostAgentForm.get('install_winlogbeat').value;
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

  getEndgameSensorProfiles() {
    this.endgame_server_reachable = false;
    if(this.newHostAgentForm.get('endgame_password').valid &&
       this.newHostAgentForm.get('endgame_server_ip').valid &&
       this.newHostAgentForm.get('endgame_user_name').valid &&
       this.newHostAgentForm.get('endgame_port').valid)
    {
      this.endgameSrv.getEndgameSensorProfiles(this.newHostAgentForm.getRawValue()).subscribe(
        profile_data => {
          this.endgame_server_reachable = true;
          this.sensor_profiles = new Array();

          for (let profile of profile_data){
            this.sensor_profiles.push({name: profile['name'], value: profile['id']})
          }
          this.snackBar.open("Successfully connected to Endgame. You can now go to the next step in the process.", "Close", { duration: 5000});
        },
        err => {
            this.endgame_server_reachable = false;
            this.showEndgameSnackBar(err.error);
        }
      );
    }
  }
}

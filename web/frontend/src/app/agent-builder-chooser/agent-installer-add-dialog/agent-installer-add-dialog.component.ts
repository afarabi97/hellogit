import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { EndgameService } from '../../endgame.service'
import { AgentBuilderService } from '../../agent-builder.service'
import { LoginForm } from '../../login-form'
import { AgentInstallerConfig } from '../../agent-builder.service';
import { AgentInstallerAddDialogForm } from './agent-installer-add-dialog-form';

declare var $: any;

@Component({
  selector: 'app-agent-installer-add-dialog',
  templateUrl: './agent-installer-add-dialog.component.html',
  styleUrls: ['./agent-installer-add-dialog.component.css']
})
export class AgentInstallerAddDialogComponent implements OnInit {

    @Output()
    primaryButtonClick: EventEmitter<any> = new EventEmitter();

    private agentBuilderSrv: AgentBuilderService;
    endgame_credentials: LoginForm;
    private savedConfigs: Array<AgentInstallerConfig> 
    dialogForm: AgentInstallerAddDialogForm;      

    constructor( ) {
      this.dialogForm = new AgentInstallerAddDialogForm();
    }

    setConfigs(configs: Array<AgentInstallerConfig>) {
      this.savedConfigs = configs;
      this.dialogForm.saved_configs = configs;
    }

    setEndgameService(egs: EndgameService) {
      this.dialogForm.endgameSrv = egs;
    }

    setAgentBuilderService(abs: AgentBuilderService) {
      this.agentBuilderSrv = abs;
    }

    setCredentialForm(credForm: LoginForm) {
      this.dialogForm.setEndgameCredentials(credForm);
    }

    ngOnInit(){
    }

    
    onSubmit() {
      let payload = this.preparePayload();
      this.agentBuilderSrv.saveConfig(payload).subscribe(
        resp => {
          this.savedConfigs = resp;
        }
      );
      this.hideModal();
      return this.savedConfigs;
    }

  preparePayload(): AgentInstallerConfig {
    let payload = this.dialogForm.getRawValue();
    payload['winlogbeat_port'] = 5045;
    if (payload['endgame_sensors'].length > 0) {
      let name = payload['endgame_sensors'][0];
      let profile = this.dialogForm.endgame_sensor_profiles.find(p => p['name'] === name);
      payload['endgame_sensor_id'] = profile['id'];
      payload['endgame_sensor_name'] = name;
      payload['endgame_port'] = +payload['endgame_port'];
    } else  {
      payload['endgame_sensor_id'] = "";
      payload['endgame_sensor_name'] = "";
      payload['endgame_port'] = "";

    }
    delete payload['endgame_user_name'];
    delete payload['endgame_password'];
    delete payload['endgame_sensors'];

    payload['winlogbeat_arch'] = this.dialogForm.winlogbeat_arch;

    return payload as AgentInstallerConfig;
  }


    openModal() {
      $("#agent_installer_modal").modal({backdrop: 'static', keyboard: false});
    }
  
    hideModal() {
      $("#agent_installer_modal").modal('hide');
      this.primaryButtonClick.emit();
    }
}


import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { AgentBuilderService } from '../agent-builder.service';
import * as FileSaver from 'file-saver'; import { AgentBuilderForm } from './agent-builder-form';
import { KitService } from '../kit.service';
import { HtmlModalPopUp, HtmlCheckBox } from '../html-elements';
import { EndgameService } from '../endgame.service';
import { CardSelectorComponent } from 'src/app/card-selector/card-selector.component'
import { ModalLoadingComponent } from '../modal-loading/modal-loading.component';

@Component({
  selector: 'app-agent-builder',
  templateUrl: './agent-builder.component.html',
  styleUrls: ['./agent-builder.component.css']
})
export class AgentBuilderComponent implements OnInit {
  agentBuilderForm: AgentBuilderForm;
  messageModal: HtmlModalPopUp;

  @ViewChild('endgame_per')
  endgamePerCtrl: CardSelectorComponent;

  @ViewChild('loadingDialog')
  private loadingDialog: ModalLoadingComponent;

  @ViewChild('endgame_vdi')
  endgameVdiCtrl: HtmlCheckBox;

  readonly agents: string[] = ['winlogbeat', 'sysmon'];

  constructor(private agentBuilderSrv: AgentBuilderService,
    private kitSrv: KitService,
    private endgameSrv: EndgameService,
    private cdr: ChangeDetectorRef) {
    this.agentBuilderForm = new AgentBuilderForm(endgameSrv);
    this.messageModal = new HtmlModalPopUp('kit_modal');
  }

  ngOnInit() {
    this.kitSrv.getKitForm().subscribe(data => {
      if (data === undefined || data === null) {
        this.messageModal.updateModal("ERROR", "Building the single executable for the Winlogbeat, Sysmon, \
          etc cannot be done until after you have setup a DIP Kit. Please finished the installation of your DIP by first \
          going to Kickstart and Kit pages.", "Close");
        this.messageModal.openModal();
      }
    });
    this.onChanges();
  }

  onSubmit() {
    let payload = this.agentBuilderForm.getRawValue();
    payload['id'] = "";
    payload['winlogbeat_port']=5045;
    if (payload['endgame_sensors'].length > 0) {
      let name = payload['endgame_sensors'][0];
      let profile = this.agentBuilderForm.endgame_sensor_profiles.find(p => p['name'] === name);
      payload['id'] = profile['id']
    }
    delete payload['endgame_sensors'];
    console.log('Payload', payload);
    this.agentBuilderForm.notification_text = "Building the agent installer..."
    this.loadingDialog.openModal();

    this.agentBuilderSrv.getAgentInstaller(payload).subscribe(
      installer_response => {
        this.agentBuilderForm.notification_text = ""
        const installer_blob =
          new Blob([installer_response], {
            type: 'application/vnd.microsoft.portable-executable'
          });
        FileSaver.saveAs(installer_blob, 'monitor_install.exe');
        setTimeout(() => {
          this.loadingDialog.hideModal();
        }, 1000);
        if(Object.keys(this.agentBuilderForm.endgame_sensors.value).length == 0) {
          setTimeout(() => this.agentBuilderForm.getEndgameSensorProfiles());
          this.cdr.detectChanges();
        }
      },
      err => {
        this.agentBuilderForm.notification_text = 'Could not build agent installer: ' +
          err['statusText'];
        setTimeout(() => {
          this.loadingDialog.hideModal();
          this.messageModal.updateModal("ERROR", this.agentBuilderForm.notification_text, "close");
          this.messageModal.openModal();
        }, 1000);
      });
  }

  onChanges() {
    this.agentBuilderForm.valueChanges.subscribe(val => {
      this.agentBuilderForm.notification_text = ''
    });
  }

  testSelect() {
    let selection = this.agentBuilderForm.endgame_sensors.value;
    if (selection.length > 0) {
      let name = selection[0];
      this.agentBuilderForm.endgame_sensor_name.setValue(name);
      this.agentBuilderForm.endgame_sensor_name.disable();
      //Find sensor data
      let profile = this.agentBuilderForm.endgame_sensor_profiles.find(p => p['name'] === name);

      let persistent = profile['config']['Installation']['install_persistent'];
      this.endgamePerCtrl.setDefaultValues([persistent ? "Persistent" : "Dissolvable"])
      this.agentBuilderForm.endgame_persistence.disable();

      let vdi = profile['base_image']
      this.endgameVdiCtrl.checked = vdi;
      this.agentBuilderForm.endgame_vdi.setValue(vdi);
      this.agentBuilderForm.endgame_vdi.disable();

      this.agentBuilderForm.endgame_sensor_ip.setValue(profile['receiver'])
    } else {
      this.agentBuilderForm.endgame_sensor_name.setValue("");
      this.agentBuilderForm.endgame_sensor_name.enable();
      this.agentBuilderForm.endgame_persistence.enable();
      this.agentBuilderForm.endgame_vdi.enable();
      this.agentBuilderForm.endgame_sensor_ip.setValue(this.agentBuilderForm.endgame_server_ip.value)
    }
  }
}

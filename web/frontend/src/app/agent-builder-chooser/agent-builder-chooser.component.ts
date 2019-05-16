import { Component, OnInit, ViewChild } from '@angular/core';
import { AgentBuilderService, AgentInstallerConfig } from '../agent-builder.service';
import { ModalLoadingComponent } from '../modal-loading/modal-loading.component';
import * as FileSaver from 'file-saver';
import { HtmlModalPopUp, ModalType } from '../html-elements';
import { KitService } from '../kit.service';
import { Title } from '@angular/platform-browser'
import { LoginForm } from '../login-form';
import { AgentInstallerAddDialogComponent } from './agent-installer-add-dialog/agent-installer-add-dialog.component';
import { EndgameService } from '../endgame.service';
import { checkConfigName } from './agent-installer-add-dialog/agent-installer-add-dialog-form';
import { IpTargetListDialogComponent } from './ip-target-list-dialog/ip-target-list-dialog.component';

@Component({
  selector: 'app-agent-builder-chooser',
  templateUrl: './agent-builder-chooser.component.html',
  styleUrls: ['./agent-builder-chooser.component.css']
})
export class AgentBuilderChooserComponent implements OnInit {

  savedConfigs: Array<AgentInstallerConfig>;
  messageModal: HtmlModalPopUp;
  newConfigDialog: HtmlModalPopUp;

  @ViewChild('loadingDialog')
  private loadingDialog: ModalLoadingComponent;

  @ViewChild('addAgentInstaller')
  private addAgentInstallerDialog: AgentInstallerAddDialogComponent;

  @ViewChild('deployAgentInstaller')
  private deployAgentInstallerDialog: IpTargetListDialogComponent;

  deleteConfigurationModal: HtmlModalPopUp;

  constructor(private agentBuilderSvc: AgentBuilderService,
              private kitSrv: KitService,
              private titleSvc: Title,
              private endgameSvc: EndgameService) { 
    this.messageModal = new HtmlModalPopUp('kit_modal');
    this.titleSvc.setTitle('Agent Builder');
    this.deleteConfigurationModal = new HtmlModalPopUp('deleteconfiguration_modal');
  }

  ngOnInit() {
    this.addAgentInstallerDialog.setCredentialForm(this.endgame_credentials);
    this.getSavedConfigs();
    this.kitSrv.getKitForm().subscribe(data => {
      if (data === undefined || data === null) {
        this.messageModal.updateModal("ERROR", "Building the single executable for the Winlogbeat, Sysmon, \
          etc cannot be done until after you have setup a DIP Kit. Please finished the installation of your DIP by first \
          going to Kickstart and Kit pages.", "Close");
        this.messageModal.openModal();
      }
    });
  }

  getSavedConfigs() {
    this.savedConfigs = new Array<AgentInstallerConfig>();
    this.agentBuilderSvc.getSavedConfigs().subscribe(
      configs => {
        this.savedConfigs = configs as Array<AgentInstallerConfig>;
      });
  }

  config_selection: AgentInstallerConfig = null;
  endgame_credentials = new LoginForm({});


  onSelectionChange(value: AgentInstallerConfig) {
    this.config_selection = value as AgentInstallerConfig;
  }

  preparePayload(): AgentInstallerConfig {
    let payload = this.config_selection;
    payload['endgame_credentials'] = { server_ip: this.endgame_credentials.get('server_ip').value,
                                       user_name: this.endgame_credentials.get('user_name').value,
                                       password: this.endgame_credentials.get('password').value };
    return payload;
  }

  downloadInstaller() {
    this.loadingDialog.openModal();
    let payload = this.preparePayload();

    this.agentBuilderSvc.getAgentInstaller(payload).subscribe(
      installer_response => {
        const installer_blob =
          new Blob([installer_response], {
            type: 'application/vnd.microsoft.portable-executable'
          });
        FileSaver.saveAs(installer_blob, 'monitor_install.exe');
        setTimeout(() => {
          this.loadingDialog.hideModal();
        }, 1000);
      },
      err => {
        let notification_text = 'Could not build agent installer: ' +
          err['statusText'];
        setTimeout(() => {
          this.loadingDialog.hideModal();
          this.messageModal.updateModal("ERROR", notification_text, "close");
          this.messageModal.openModal();
        }, 1000);
      });
  }

  gonerConfig: AgentInstallerConfig;

  openConfirmDeleteConfig(config) {
    this.gonerConfig = config;
    this.deleteConfigurationModal.updateModal(
      'Remove configuration "' + config.config_name + '"?',
      'This action cannot be undone.',
      'Delete',
      'Cancel');
    this.deleteConfigurationModal.openModal();
  }

  deleteConfiguration(){
    this.agentBuilderSvc.deleteConfig(this.gonerConfig['_id']).subscribe(
      config_list => {
        this.savedConfigs = config_list;
      }
    )
  }

  addNewConfiguration() {
    this.addAgentInstallerDialog.setConfigs(this.savedConfigs);
    this.addAgentInstallerDialog.setAgentBuilderService(this.agentBuilderSvc);
    this.addAgentInstallerDialog.setEndgameService(this.endgameSvc);
    this.addAgentInstallerDialog.setCredentialForm(this.endgame_credentials);
    this.addAgentInstallerDialog.dialogForm.config_name.setValidators([checkConfigName]);
    this.addAgentInstallerDialog.dialogForm.config_name.setValue('');
    this.addAgentInstallerDialog.openModal();
  }

  deployInstaller() {
    let payload = this.preparePayload();
    console.log("deploying", payload);
    this.deployAgentInstallerDialog.openModal(this.agentBuilderSvc);
  }

}

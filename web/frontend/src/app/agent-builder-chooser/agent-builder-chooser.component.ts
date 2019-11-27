import { Component, OnInit, ViewChild } from '@angular/core';
import { AgentBuilderService, AgentInstallerConfig,
         IpTargetList, Host, ErrorMessage,
         WindowsCreds } from './agent-builder.service';
import * as FileSaver from 'file-saver';
import { Title } from '@angular/platform-browser';
import { AgentInstallerDialogComponent } from './agent-installer-dialog/agent-installer-dialog.component';
import { AgentTargetDialogComponent } from './agent-target-dialog/agent-target-dialog.component';
import { ConfirmDailogComponent } from '../confirm-dailog/confirm-dailog.component';
import { WebsocketService } from '../services/websocket.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { DialogControlTypes, DialogFormControl } from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { validateFromArray } from '../validators/generic-validators.validator';

import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { COMMON_VALIDATORS } from 'src/app/frontend-constants';



const DIALOG_WIDTH = "800px";
const DIALOG_MAX_HEIGHT = "800px";

@Component({
  selector: 'app-agent-builder-chooser',
  templateUrl: './agent-builder-chooser.component.html',
  styleUrls: ['./agent-builder-chooser.component.css']
})
export class AgentBuilderChooserComponent implements OnInit {
  columnsForInstallerConfigs: string[] = ['select', 'config_name', 'winlog_beat_dest_ip',
                                          'install_sysmon',
                                          'install_winlogbeat', 'install_endgame',
                                          'endgame_sensor_name', 'actions'];

  columnsForTargetConfigs: string[] = ['select', 'name', 'protocol', 'port', 'domain_name', 'actions'];
  columnsForHosts: string[] = ['hostname', 'state', 'last_state_change', 'actions'];

  savedConfigs: MatTableDataSource<AgentInstallerConfig>;
  savedTargetConfigs: MatTableDataSource<IpTargetList>;
  hostsToShow: MatTableDataSource<Host>;
  isTargetsVisible: Array<boolean>;

  config_selection: AgentInstallerConfig;
  target_selection: IpTargetList;
  host_to_remove: Host;
  selectedHostIndex: number;
  is_downloading: boolean;
  selectedIndexValue: boolean;

  @ViewChild('installerConfigPaginator')
  installerConfigPaginator: MatPaginator;

  @ViewChild('targetConfigPaginator')
  targetConfigPaginator: MatPaginator;

  @ViewChild('hostConfigPaginator')
  hostConfigPaginator: MatPaginator;

  constructor(private agentBuilderSvc: AgentBuilderService,
              private titleSvc: Title,
              private socketSrv: WebsocketService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private fb: FormBuilder) {

    this.titleSvc.setTitle('Windows Agent Deployer');
    this.savedConfigs = new MatTableDataSource<AgentInstallerConfig>();
    this.savedTargetConfigs = new MatTableDataSource<IpTargetList>();
    this.hostsToShow = new MatTableDataSource<Host>();
    this.isTargetsVisible = new Array();
    this.config_selection = null;
    this.target_selection = null;
    this.host_to_remove = null;
    this.selectedHostIndex = 0;
    this.selectedIndexValue = false;
  }

  ngOnInit() {
    this.getSavedConfigs();
    this.getSavedTargetConfigs();
    this.socketRefresh();

    this.agentBuilderSvc.checkLogStashInstalled().subscribe(data =>{
      let status = data as Array<Object>;
      if (status && status.length > 0){
        if (status[0]["status"] !== "DEPLOYED"){
          this.displaySnackBar("Logstash is not in a deployed state.  Please check the system health page or try to reinstall Logstash on the catalog page.");
        }
      } else {
        this.displaySnackBar("Before using this page, it is recommended that you install Logstash on your Kubernetes cluster. \
          Please go to the Catalog page and install it.  Failing to install it will cause Winlogbeats and Endgame agent data capture to Elasticsearch to fail.")
      }
    });
  }

  private socketRefresh(){
    this.socketSrv.getSocket().on('refresh', (data: any) => {
      this.refreshStateChanges();
    });
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  private setSavedConfigs(configs: Array<AgentInstallerConfig>) {
    this.savedConfigs = new MatTableDataSource<AgentInstallerConfig>(configs);
    this.savedConfigs.paginator = this.installerConfigPaginator;
  }

  private setTargetConfigs(configs: Array<IpTargetList>){
    this.savedTargetConfigs = new MatTableDataSource<IpTargetList>(configs);
    this.savedTargetConfigs.paginator = this.targetConfigPaginator;

    if (this.isTargetsVisible.length !== configs.length){
      this.isTargetsVisible = new Array(configs.length).fill(false);
    }
  }

  private setHostsToShow(targets: Array<Host>){
    this.hostsToShow = new MatTableDataSource<Host>(targets);
    this.hostsToShow.paginator = this.hostConfigPaginator;
  }

  getSavedConfigs() {
    this.agentBuilderSvc.getSavedConfigs().subscribe(
      configs => {
        this.setSavedConfigs(configs);
      });
  }

  getSavedTargetConfigs(){
    this.agentBuilderSvc.getIpTargetList().subscribe(configs => {
      this.setTargetConfigs(configs);
    });
  }

  private _update_targets(target_config: IpTargetList, update_config: IpTargetList){
    for (let target of target_config.targets){
      for (let update of update_config.targets){
        if (target.hostname === update.hostname){
          target.state = update.state;
          target.last_state_change = update.last_state_change;
          break;
        }
      }
    }
  }

  private refreshStateChanges(){
    this.agentBuilderSvc.getIpTargetList().subscribe(data => {
      let configs = data as IpTargetList[];
      for (let target_config of this.savedTargetConfigs.data){
        for (let updated_config of configs){
          if (target_config._id === updated_config._id){
            this._update_targets(target_config, updated_config);
            break;
          }
        }
      }
    });
  }

  onSelectionChange(value: AgentInstallerConfig) {
    this.config_selection = value as AgentInstallerConfig;
  }

  onTargetSelectionChange(value: IpTargetList){
    this.target_selection = value as IpTargetList;
  }

  preparePayload(creds: WindowsCreds=null): {'installer_config': AgentInstallerConfig,
                                             'target_config': IpTargetList,
                                             'windows_domain_creds': WindowsCreds }
  {
    return {'installer_config': this.config_selection, 'target_config': this.target_selection, 'windows_domain_creds': creds};
  }

  downloadInstaller() {
    this.is_downloading = true;
    this.displaySnackBar("Initiated executable download for " +
                         this.config_selection.config_name + ". Please wait until it is completed.")
    let payload = this.preparePayload();
    this.agentBuilderSvc.getAgentInstaller(payload).subscribe(
      installer_response => {
        try {
          const installer_blob =
          new Blob([installer_response], {
            type: 'zip'
          });
          FileSaver.saveAs(installer_blob, 'agents.zip');
          this.displaySnackBar("Download complete. Check your Downloads directory for the file.")
        } finally {
          this.is_downloading = false;
        }
      },
      err => {
        try {
          console.error(err)
          let notification_text = 'Could not build agent installer: ' + err['statusText'];
          this.displaySnackBar(notification_text);
        } finally {
          this.is_downloading = false;
        }
      });
  }

  openDeployInstallerModal(action: string, target: Host=null){
    if (target){
      this.host_to_remove = target;
      for (let target_config of this.savedTargetConfigs.data){
        if(target_config._id === target.target_config_id){
          this.target_selection = target_config;
          break;
        }
      }
    } else {
      this.host_to_remove = target;
    }

    let dialogForm = this.fb.group({
      user_name: new DialogFormControl("Domain username", '',
            Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])),
      password: new DialogFormControl("Domain Password", '',
            Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]),
            undefined, undefined, DialogControlTypes.password)
    });

    let dialogData = { title: action + " Windows hosts",
                       instructions: "Executing this form will attempt to " + action + " the selected executable \
                                      configuration on all Windows hosts within your target configuration. \
                                      Are you sure you want to do this?",
                       dialogForm: dialogForm,
                       confirmBtnText: "Execute" }

    if (action === 'uninstall' && this.host_to_remove !== null){
      dialogData.title = "Uninstall Windows host " + this.host_to_remove.hostname;
      dialogData.instructions = "Executing this form will attempt to uninstall the selected executable \
                                 on " + this.host_to_remove.hostname + ". \
                                 Are you sure you want to do this?"
    } else if (action === 'reinstall' && this.host_to_remove !== null) {
      dialogData.title = "Reinstall Windows host " + this.host_to_remove.hostname;
      dialogData.instructions = "Executing this form will attempt to reinstall the selected executable \
                                 on " + this.host_to_remove.hostname + ". \
                                 Are you sure you want to do this?"
    }

    const dialogRef = this.dialog.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      let form = result as FormGroup;
      if (form && form.valid){
        this.deployInstaller(form.getRawValue(), action);
      }
    });
  }

  private deployInstaller(credsObj: Object, action: string) {
    let creds = new WindowsCreds(credsObj);
    let payload = this.preparePayload(creds);

    this.displaySnackBar("Please wait for the server to initiate your request.");
    if (action === 'uninstall' && this.host_to_remove !== null){
      this.agentBuilderSvc.uninstallAgent(payload, this.host_to_remove).subscribe(data => {
        this.displaySnackBar(data['message']);
      }, err => {
        this.displaySnackBar("Failed to execute uninstall action as this Agent is already uninstalled on target host.")
      });
    } else if (action === 'uninstall'){
      this.agentBuilderSvc.uninstallAgents(payload).subscribe(data => {
        this.displaySnackBar(data['message']);
      }, err => {
        this.displaySnackBar("Failed to execute uninstall action as this Agent is already uninstalled on target hosts.");
      });
    } else if (action === 'reinstall'){
      this.agentBuilderSvc.reinstallAgent(payload, this.host_to_remove).subscribe(data => {
        this.displaySnackBar(data['message']);
      }, error => {
        this.displaySnackBar("Failed initiate reinstall on host for an unknown reason.");
      });
    } else {
      this.agentBuilderSvc.installAgents(payload).subscribe(data => {
        this.displaySnackBar(data['message']);
      }, error => {
        this.displaySnackBar("Failed initiate install task for an unknown reason.");
      });
    }
  }

  openConfirmDeleteConfig(config: any) {
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: { "paneString": "Are you sure you want to delete " + config.config_name + "?",
              "paneTitle": "Remove configuration " + config.config_name + "?", "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.agentBuilderSvc.deleteConfig(config['_id']).subscribe(config_list => {
          this.setSavedConfigs(config_list);
          this.displaySnackBar(config.config_name + " was deleted successfully.");
        },
        err => {
          this.displaySnackBar("Failed to delete configuration.");
          console.error("Delete config error:", err);
        });
      }
    });
  }

  openConfirmDeleteTarget(config: IpTargetList) {
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: { "paneString": 'Before deleting this target configuration, it is strongly advised to first do a "Batch Uninstall". '
            + 'Please make sure all agents have been uninstalled successfully. This action cannot be undone.',
              "paneTitle": 'Remove configuration ' + config.name + '?', "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.agentBuilderSvc.deleteIpTargetList(config.name).subscribe(configs => {
          this.setTargetConfigs(configs);
          this.displaySnackBar(config.name + " was deleted successfully.");
        },
        err => {
          this.displaySnackBar("Failed to delete target.");
          console.error("Dete config error:", err);
        });
      }
    });
  }

  addNewConfiguration(){
    const dialogRef = this.dialog.open(AgentInstallerDialogComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.valid){
        this.agentBuilderSvc.saveConfig(result.getRawValue()).subscribe(
          configs => {
            this.setSavedConfigs(configs);
            this.displaySnackBar("Saved configuration successfully.");
          },
          err => {
            this.displaySnackBar("Failed to save configuration.  " + err.message);
            console.error("Save config error:", err);
          }
        );
      }
    });
  }

  openAddNewTargetConfigModal() {
    const dialogRef = this.dialog.open(AgentTargetDialogComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: { }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){
        let name = (result as IpTargetList).name;
        this.agentBuilderSvc.saveIpTargetList(result as IpTargetList).subscribe(configs => {
          this.setTargetConfigs(configs);
          this.displaySnackBar(name + " was saved successfully.");
        }, err => {
          this.displaySnackBar("Failed to save new configuration.");
          console.error("Save config error:", err);
        });
      }
    });
  }

  getPort(config: IpTargetList): string {
    if (config.protocol === "kerberos"){
      return config.kerberos.port;
    } else if (config.protocol === "smb"){
      return config.smb.port;
    }

    return config.ntlm.port;
  }

  getDomainSuffix(config: IpTargetList): string {
    if (config.protocol === "kerberos"){
      return config.kerberos.domain_name;
    } else if (config.protocol === "smb"){
      return config.smb.domain_name;
    }

    return config.ntlm.domain_name;
  }

  isHostVisible(config: IpTargetList): boolean {
    const index = this.savedTargetConfigs.data.findIndex( i => i._id === config._id);
    return this.isTargetsVisible[index];
  }

  toggleTargetDropDown(config: IpTargetList) {
    const index = this.savedTargetConfigs.data.findIndex( i => i._id === config._id);
    if (index === this.selectedHostIndex){

      if (this.selectedIndexValue){
        //If visible close it.
        this.isTargetsVisible[index] = !this.isTargetsVisible[index];
        return;
      }
    }

    this.selectedHostIndex = index;
    this.isTargetsVisible = new Array(this.savedTargetConfigs.data.length).fill(false);
    this.isTargetsVisible[index] = !this.isTargetsVisible[index];

    this.selectedIndexValue = this.isTargetsVisible[index];
    this.setHostsToShow(config.targets);
  }

  openAddWindowsHostModal(targetConfig: IpTargetList) {
    let dialogForm = this.fb.group({
      hostnames: new DialogFormControl("Windows Hostname", '',
                                       Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]),
                                       undefined,
                                       "The application will attempt to install agents to the Windows machines specified.",
                                       DialogControlTypes.textarea)
    });

    const dialogRef = this.dialog.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: { title: "Add new Windows hosts",
              instructions: "Enter a Windows hostname for each line or copy and paste from a text file.",
              dialogForm: dialogForm,
              confirmBtnText: "Add Windows hosts" }
    });

    dialogRef.afterClosed().subscribe(result => {
      let form = result as FormGroup;
      if (form && form.valid){
        this.agentBuilderSvc.addHostToIPTargetList(targetConfig._id, form.getRawValue() as Host).subscribe(data => {
          if (data instanceof ErrorMessage){
            this.displaySnackBar(data.error_message);
          } else {
            if (!targetConfig.targets){
              targetConfig.targets = new Array<Host>();
            }
            let hosts = data as IpTargetList;
            for (let host of hosts.targets){
              if (!this.isHostInArrayAlready(host, targetConfig)){
                targetConfig.targets.push(host);
              }
            }

            this.setHostsToShow(targetConfig.targets);
            this.displaySnackBar("Windows hosts saved successfully.");
          }
        });
      }
    });
  }

  private isHostInArrayAlready(host: Host, targetConfig: IpTargetList): boolean{
    for (let old_host of targetConfig.targets){
      if (host.hostname.toLowerCase() === old_host.hostname.toLowerCase()){
        return true;
      }
    }
    return false;
  }

  openRemoveHostModal(target_config: IpTargetList, target: Host) {
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: { "paneString": 'Before deleting this ' + target.hostname + ', it is strongly advised to uninstall first. This action cannot be undone.',
              "paneTitle": 'Remove configuration ' + target.hostname + '?', "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.agentBuilderSvc.removeHostFromIpTargetList(target_config._id, target).subscribe(data => {
          if (data instanceof ErrorMessage){
            this.displaySnackBar(data.error_message);
          } else {
            this.displaySnackBar(data.success_message);
            if (target_config.targets){
              let true_index = 0;
              for (let cache of target_config.targets){
                if (cache.hostname === target.hostname){
                  break;
                }
                true_index++;
              }
              target_config.targets.splice(true_index, 1);
              this.setHostsToShow(target_config.targets);
            }
          }
        },
        err => {
          this.displaySnackBar("Failed to delete configuration.");
          console.error("Delete config error:", err);
        });
      }
    });
  }

  getTrafficDest(config: AgentInstallerConfig): string{
    if (config && config.winlog_beat_dest_ip){
      return config.winlog_beat_dest_ip + ":" + config.winlog_beat_dest_port;
    }
    return "";
  }
}

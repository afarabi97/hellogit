import { Component, OnInit, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { AgentBuilderService, AgentInstallerConfig,
         IpTargetList, Host, ErrorMessage,
         WindowsCreds, AppConfig } from './agent-builder.service';
import * as FileSaver from 'file-saver';
import { Title } from '@angular/platform-browser';
import { AgentInstallerDialogComponent } from './agent-installer-dialog/agent-installer-dialog.component';
import { AgentDetailsDialogComponent } from './agent-details-dialog/agent-details-dialog.component';
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
import {MatRadioButton} from '@angular/material/radio'
import {MatTableDataSource, MatTable} from '@angular/material/table';
import { COMMON_VALIDATORS } from 'src/app/frontend-constants';

import { ModalDialogDisplayMatComponent } from '../modal-dialog-display-mat/modal-dialog-display-mat.component';


const DIALOG_WIDTH = "800px";
const DIALOG_MAX_HEIGHT = "800px";

@Component({
  selector: 'app-agent-builder-chooser',
  templateUrl: './agent-builder-chooser.component.html',
  styleUrls: ['./agent-builder-chooser.component.css']
})
export class AgentBuilderChooserComponent implements OnInit {

  // Columns for material tables.
  columnsForInstallerConfigs: string[] = ['select', 'config_name', 'install_custom', 'install_endgame', 'endgame_sensor_name', 'actions'];
  columnsForTargetConfigs: string[] = ['select', 'name', 'protocol', 'port', 'domain_name', 'actions'];
  columnsForHosts: string[] = ['hostname', 'state', 'last_state_change', 'actions'];

  @ViewChild('installerConfigPaginator', {static: false})
  installerConfigPaginator: MatPaginator;

  @ViewChild('targetConfigPaginator', {static: false})
  targetConfigPaginator: MatPaginator;

  @ViewChild('targetTable', {static: false})
  targetTable: MatTable<MatTableDataSource<IpTargetList>>;

  @ViewChildren('hostTable')
  hostTables: QueryList<MatTable<Host>>;

  appConfigs: Array<AppConfig>;

  config_selection: AgentInstallerConfig = null;
  target_selection: IpTargetList = null;

  // Interface
  configs: MatTableDataSource<any>;
  targetConfigs: MatTableDataSource<any>;

  is_downloading: boolean = false;

  constructor(private agentBuilderSvc: AgentBuilderService,
              private titleSvc: Title,
              private socketSrv: WebsocketService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private ref: ChangeDetectorRef) {
    this.titleSvc.setTitle('Windows Agent Deployer');
  }

  ngOnInit() {
    this.agentBuilderSvc.checkLogStashInstalled().subscribe(data =>{
      const status = data as Array<Object>;
      if (status && status.length > 0){
        if (status[0]["status"] !== "DEPLOYED"){
          this.displaySnackBar("Logstash is not in a deployed state.  Please check the system health page or try to reinstall Logstash on the catalog page.");
        }
      } else {
        this.displaySnackBar("Before using this page, it is recommended that you install Logstash on your Kubernetes cluster. \
          Please go to the Catalog page and install it.  Failing to install it will cause Winlogbeats and Endgame agent data capture to Elasticsearch to fail.")
      }
    });

    this.agentBuilderSvc.getAppConfigs().subscribe(appConfigs => {
      this.appConfigs = appConfigs;
    });

    this.getSavedConfigs();
    this.getSavedTargetConfigs();
    this.socketRefresh();
  }

  ngAfterViewInit() {
  }

  updateSelectedConfig(config) {
    this.config_selection = config;
  }

  updateSelectedTarget(target) {
    this.target_selection = target;
  }

  updateHostList(targets, index) {
    this.targetConfigs.data[index]['state']['hostList'].data = targets;
  }

  toggleHostListExpansion(row, dataIndex) {
    let expanded = row['state']['expanded'];
    row['state']['expanded'] = !expanded;
  }

  isHostListExpanded(row, index) {
    let expanded = row['state']['expanded'];
    return expanded;
  }

  getHostList(hostList, paginator) {
    if (hostList.paginator) {
      return hostList
    } else {
      hostList.paginator = paginator
      return hostList;
    }
  }

  showConfig(config) {
    const dialogRef = this.dialog.open(AgentDetailsDialogComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: { appConfigs: this.appConfigs, config: config }
    });
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000})
  }

  private setSavedConfigs(configs: Array<AgentInstallerConfig>) {
      this.configs = new MatTableDataSource<AgentInstallerConfig>(configs);
      this.configs.paginator = this.installerConfigPaginator;
      this.config_selection = null;
      this.ref.detectChanges();
  }


  private setTargetConfigs(configs: Array<IpTargetList>){
    let rows = [];
    for (let config of configs) {
      let targets = config['targets'];
      let hostList = new MatTableDataSource(targets);
      let expanded = false;

      let row = {};
      row['state'] = {};
      row['config'] = config;
      row['state']['hostList'] = hostList;
      row['state']['expanded'] = expanded;

      rows.push(row);
    }

    let targetConfigs = new MatTableDataSource<any>(rows);
    targetConfigs.paginator = this.targetConfigPaginator;

    this.targetConfigs = targetConfigs;
    this.target_selection = null;
    this.ref.detectChanges();
  }

  private socketRefresh(){
    this.socketSrv.getSocket().on('refresh', (data: any) => {
      this.refreshStateChanges();
    });
  }

  private _update_targets(target_config: IpTargetList, index: string, update_config: IpTargetList){
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
      for (let i in this.targetConfigs['data']){
        let target_config = this.targetConfigs['data'][i]['config'];
        for (let updated_config of configs){
          if (target_config._id === updated_config._id){
            this._update_targets(target_config, i, updated_config);
            break;
          }
        }
      }

      this.hostTables.forEach(table => table.renderRows());
    });
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

  downloadInstaller(config) {
    this.is_downloading = true;
    this.displaySnackBar("Initiated executable download for " +
                         config.config_name + ". Please wait until it is completed.")

    let payload = {
      'installer_config': config,
      'target_config': null,
      'windows_domain_creds': null
    }

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

  execute(title, instructions, callback) {
    let username = new DialogFormControl("Domain username", '', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
    let password = new DialogFormControl("Domain Password", '', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]), undefined, undefined, DialogControlTypes.password);

    let controlsConfig = {
      user_name: username,
      password: password
    }

    let dialogForm = this.fb.group(controlsConfig);

    let dialogData = { title: title,
                       instructions: instructions,
                       dialogForm: dialogForm,
                       confirmBtnText: "Execute" }

    const dialogRef = this.dialog.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: dialogData
    });

    let closed = dialogRef.afterClosed();

    closed.subscribe(result => {
      let form = result as FormGroup;

      if (form && form.valid) {
        let rawValue = form.getRawValue();
        let credentials = new WindowsCreds(rawValue)
        return callback(credentials);
      }
    });

  }

  installAgents(config, target) {
    let title = "Install Windows hosts";
    let instructions = "Executing this form will attempt to install the selected executable \
                        configuration on all Windows hosts within your target configuration. \
                        Are you sure you want to do this?";


    this.execute(title, instructions, credentials => {
      let payload = {
        'installer_config': config,
        'target_config': target['config'],
        'windows_domain_creds': credentials
      }

      let response = this.agentBuilderSvc.installAgents(payload)

      response.subscribe(
        data => {
          this.displaySnackBar(data['message']);
        },
        error => {
          this.displaySnackBar("Failed initiate install task for an unknown reason.");
        }
      );
    });
  }

  uninstallAgents(config, target) {
    let title = "Uninstall Windows hosts";
    let instructions = "Executing this form will attempt to uninstall the selected executable \
                        configuration on all Windows hosts within your target configuration. \
                        Are you sure you want to do this?";


    this.execute(title, instructions, credentials => {
      let payload = {
        'installer_config': config,
        'target_config': target['config'],
        'windows_domain_creds': credentials
      }

      let response = this.agentBuilderSvc.uninstallAgents(payload);
      response.subscribe(
        data => {
          this.displaySnackBar(data['message']);
        },
        err => {
          this.displaySnackBar("Failed to execute uninstall action as this Agent is already uninstalled on target hosts.");
        }
      );
    });
  }

  reinstallAgent(config, target, host) {
    let title = "Reinstall Windows host " + host.hostname;
    let instructions = "Executing this form will attempt to reinstall the selected executable \
                        on " + host.hostname + ". \
                        Are you sure you want to do this?";

    this.execute(title, instructions, credentials => {
      let payload = {
        'installer_config': config,
        'target_config': target,
        'windows_domain_creds': credentials
      }

      let response = this.agentBuilderSvc.reinstallAgent(payload, host)

      response.subscribe(
        data => {
          this.displaySnackBar(data['message']);
        },
        error => {
          this.displaySnackBar("Failed initiate reinstall on host for an unknown reason.");
        }
      );
    });
  }

  uninstallAgent(config, target, host) {
    let title = "Uninstall Windows host " + host.hostname;
    let instructions = "Executing this form will attempt to uninstall the selected executable \
                    on " + host.hostname + ". \
                    Are you sure you want to do this?"

    this.execute(title, instructions, credentials => {
      let payload = {
        'installer_config': config,
        'target_config': target,
        'windows_domain_creds': credentials
      }

      let response = this.agentBuilderSvc.uninstallAgent(payload, host);

      response.subscribe(
        data => {
          this.displaySnackBar(data['message']);
        },
        err => {
          this.displaySnackBar("Failed to execute uninstall action as this Agent is already uninstalled on target host.")
        }
      );
    });
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
      maxHeight: DIALOG_MAX_HEIGHT,
      data: this.appConfigs
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.valid){
        let formData = result.getRawValue();
        let endgame = formData['endgame_options']
        delete formData['endgame_options']

        let scratch = {...formData, ...endgame}
        formData = scratch;

        this.agentBuilderSvc.saveConfig(formData).subscribe(
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

  openAddWindowsHostModal(targetConfig: IpTargetList, hostList: MatTableDataSource<Host>) {
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
      if (form && form.valid) {
        let host = form.getRawValue() as Host;
        this.agentBuilderSvc.addHostToIPTargetList(targetConfig._id, host).subscribe(data => {
          if (data instanceof ErrorMessage){
            this.displaySnackBar(data.error_message);
          } else {
            let targets: Array<Host>;
            let additionalTargets = data.targets as Array<Host>;
            let distinct: Array<Host>;

            if (targetConfig.targets) {
              targets = targetConfig.targets;
              distinct = targets.concat(additionalTargets).filter(this.isFirstHost);
              hostList.data = distinct;
              targetConfig.targets = distinct;
            } else {
              targets = new Array<Host>();
              hostList.data = additionalTargets;
              targetConfig.targets = additionalTargets;
            }

            this.displaySnackBar("Windows hosts saved successfully.");
          }
        });
      }
    });
  }

  isFirstHost(host: Host, host_index: number, hosts: Array<Host>) {
    let _host_index = hosts.findIndex(_host => {
      return _host.hostname.toLowerCase() === host.hostname.toLowerCase();
    });
    return _host_index === host_index;
  }

  openRemoveHostModal(target_config: IpTargetList, host_table: MatTable<MatTableDataSource<Host>>, host_list: MatTableDataSource<Host>, host: Host, host_index: number) {
    const option2 = "Confirm";
    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: { "paneString": 'Before deleting this ' + host.hostname + ', it is strongly advised to uninstall first. This action cannot be undone.',
              "paneTitle": 'Remove configuration ' + host.hostname + '?', "option1": "Cancel", "option2": option2 },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.agentBuilderSvc.removeHostFromIpTargetList(target_config._id, host).subscribe(data => {
          if (data instanceof ErrorMessage){
            this.displaySnackBar(data.error_message);
          } else {
            this.displaySnackBar(data.success_message);

            let newHostList = host_list.data.filter((host, index) => {
              return index !== host_index;
            });

            host_list.data = newHostList;
            target_config['targets'] = newHostList;
          }
        },
        err => {
          this.displaySnackBar("Failed to delete configuration.");
          console.error("Delete config error:", err);
        });
      }
    });
  }

}

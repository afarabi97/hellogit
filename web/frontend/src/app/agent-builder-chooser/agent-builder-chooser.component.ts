import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';

import { ConfirmDialogMatDialogDataInterface } from '../interfaces';
import { ObjectUtilitiesClass } from '../classes';
import { ConfirmDialogComponent } from '../components/confirm-dialog/confirm-dialog.component';
import { COMMON_VALIDATORS } from '../frontend-constants';
import {
  DialogControlTypes,
  DialogFormControl,
  DialogFormControlConfigClass
} from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { WebsocketService } from '../services/websocket.service';
import { validateFromArray } from '../validators/generic-validators.validator';
import {
  AgentBuilderService,
  AgentInstallerConfig,
  AppConfig,
  ErrorMessage,
  Host,
  IpTargetList,
  WindowsCreds
} from './agent-builder.service';
import { AgentDetailsDialogComponent } from './agent-details-dialog/agent-details-dialog.component';
import { AgentInstallerDialogComponent } from './agent-installer-dialog/agent-installer-dialog.component';
import { AgentTargetDialogComponent } from './agent-target-dialog/agent-target-dialog.component';
import { DOMAIN_PASSWORD_LABEL } from './constants/agent-builder-chooser.constant';

const DIALOG_WIDTH = "800px";
const DIALOG_MAX_HEIGHT = "800px";

@Component({
  selector: 'app-agent-builder-chooser',
  templateUrl: './agent-builder-chooser.component.html'
})
export class AgentBuilderChooserComponent implements OnInit {

  @ViewChild('installerConfigPaginator') installerConfigPaginator: MatPaginator;
  @ViewChild('targetConfigPaginator') targetConfigPaginator: MatPaginator;
  @ViewChild('targetTable') targetTable: MatTable<MatTableDataSource<IpTargetList>>;
  @ViewChildren('hostTable') hostTables: QueryList<MatTable<Host>>;
  // Columns for material tables.
  columnsForInstallerConfigs: string[] = ['select', 'config_name', 'install_custom', 'install_endgame', 'endgame_sensor_name', 'actions'];
  columnsForTargetConfigs: string[] = ['select', 'name', 'protocol', 'port', 'domain_name', 'actions'];
  columnsForHosts: string[] = ['hostname', 'state', 'last_state_change', 'actions'];
  appConfigs: AppConfig[];
  config_selection: AgentInstallerConfig = null;
  target_selection: IpTargetList = null;
  // Interface
  configs: MatTableDataSource<any>;
  targetConfigs: MatTableDataSource<any>;
  is_downloading: boolean;

  constructor(private agentBuilderSvc: AgentBuilderService,
              private titleSvc: Title,
              private socketSrv: WebsocketService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private fb: FormBuilder,
              private ref: ChangeDetectorRef) {
    this.is_downloading = false;
    this.titleSvc.setTitle('Windows Agent Deployer');
  }

  ngOnInit() {
    this.agentBuilderSvc.checkLogStashInstalled().subscribe(data =>{
      const status = data as Array<Object>;
      if (status && status.length > 0){
        if (status[0]["status"] !== "DEPLOYED"){
          this.displaySnackBar("Logstash is not in a deployed state. Please check the system health page or try to reinstall Logstash on the catalog page.");
        }
      } else {
        const message = "Before using this page, it is recommended that you install Logstash on your Kubernetes cluster. " +
                        "Please go to the Catalog page and install it. Failing to install it will cause Winlogbeats and " +
                        "Endgame agent data capture to Elasticsearch to fail.";
        this.displaySnackBar(message);
      }
    });

    this.agentBuilderSvc.getAppConfigs().subscribe(appConfigs => {
      this.appConfigs = appConfigs;
    });

    this.getSavedConfigs();
    this.getSavedTargetConfigs();
    this.socketRefresh();
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

  toggleHostListExpansion(row) {
    row['state']['expanded'] = !row['state']['expanded'];
  }

  isHostListExpanded(row) {
    return row['state']['expanded'];
  }

  getHostList(hostList, paginator) {
    if (hostList.paginator) {
      return hostList;
    } else {
      hostList.paginator = paginator;
      return hostList;
    }
  }

  showConfig(config) {
    this.dialog.open(AgentDetailsDialogComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: { appConfigs: this.appConfigs, config: config }
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
    this.displaySnackBar(`Initiated executable download for ${config.config_name}. Please wait until it is completed.`);

    const payload = {
      installer_config: config,
      target_config: null,
      windows_domain_creds: null
    };

    this.agentBuilderSvc.getAgentInstaller(payload).subscribe(
      installer_response => {
        try {
          const installer_blob = new Blob([installer_response], { type: 'zip' });
          FileSaver.saveAs(installer_blob, 'agents.zip');
          this.displaySnackBar("Download complete. Check your Downloads directory for the file.");
        } finally {
          this.is_downloading = false;
        }
      },
      err => {
        try {
          console.error(err);
          const notification_text = `Could not build agent installer: ${err['statusText']}`;
          this.displaySnackBar(notification_text);
        } finally {
          this.is_downloading = false;
        }
      });
  }

  execute(title, instructions, callback) {
    const userNameFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    userNameFormControlConfig.label = 'Domain username';
    userNameFormControlConfig.formState = '';
    userNameFormControlConfig.validatorOrOpts = Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]);
    const passwordFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    passwordFormControlConfig.label = DOMAIN_PASSWORD_LABEL;
    passwordFormControlConfig.formState = '';
    passwordFormControlConfig.validatorOrOpts = Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]);
    passwordFormControlConfig.asyncValidator = undefined;
    passwordFormControlConfig.tooltip = undefined;
    passwordFormControlConfig.controlType = DialogControlTypes.password;
    const username = new DialogFormControl(userNameFormControlConfig);
    const password = new DialogFormControl(passwordFormControlConfig);

    const controlsConfig = {
      user_name: username,
      password: password
    };

    const dialogForm = this.fb.group(controlsConfig);
    const dialogData = {
      title: title,
      instructions: instructions,
      dialogForm: dialogForm,
      confirmBtnText: "Execute"
    };
    const dialogRef = this.dialog.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: dialogData
    });
    const closed = dialogRef.afterClosed();

    closed.subscribe(result => {
      const form = result as FormGroup;

      if (form && form.valid) {
        const rawValue = form.getRawValue();
        const credentials = new WindowsCreds(rawValue);
        return callback(credentials);
      } else {
        // void function does nothing only used to handle code smell
        // consistent return only used for if
        return function(): void {};
      }
    });

  }

  installAgents(config, target) {
    const title = "Install Windows hosts";
    const instructions = this.dialogMessage_('install');

    this.execute(title, instructions, credentials => {
      const payload = {
        'installer_config': config,
        'target_config': target['config'],
        'windows_domain_creds': credentials
      };
      const response = this.agentBuilderSvc.installAgents(payload);

      response.subscribe(
        data => {
          this.displaySnackBar(data['message']);
        },
        _error => {
          this.displaySnackBar("Failed initiate install task for an unknown reason.");
        }
      );
    });
  }

  uninstallAgents(config, target) {
    const title = "Uninstall Windows hosts";
    const instructions = this.dialogMessage_('uninstall');

    this.execute(title, instructions, credentials => {
      const payload = {
        installer_config: config,
        target_config: target['config'],
        windows_domain_creds: credentials
      };
      const response = this.agentBuilderSvc.uninstallAgents(payload);

      response.subscribe(
        data => {
          this.displaySnackBar(data['message']);
        },
        _error => {
          this.displaySnackBar("Failed to execute uninstall action as this Agent is already uninstalled on target hosts.");
        }
      );
    });
  }

  reinstallAgent(config, target, host) {
    const title = `Reinstall Windows host ${host.hostname}`;
    const instructions = this.dialogMessage_('reinstall', host.hostname);

    this.execute(title, instructions, credentials => {
      const payload = {
        installer_config: config,
        target_config: target,
        windows_domain_creds: credentials
      };
      const response = this.agentBuilderSvc.reinstallAgent(payload, host);

      response.subscribe(
        data => {
          this.displaySnackBar(data['message']);
        },
        _error => {
          this.displaySnackBar("Failed initiate reinstall on host for an unknown reason.");
        }
      );
    });
  }

  uninstallAgent(config, target, host) {
    const title = `Uninstall Windows host ${host.hostname}`;
    const instructions = this.dialogMessage_('uninstall', host.hostname);

    this.execute(title, instructions, credentials => {
      const payload = {
        installer_config: config,
        target_config: target,
        windows_domain_creds: credentials
      };

      const response = this.agentBuilderSvc.uninstallAgent(payload, host);

      response.subscribe(
        data => {
          this.displaySnackBar(data['message']);
        },
        _error => {
          this.displaySnackBar("Failed to execute uninstall action as this Agent is already uninstalled on target host.");
        }
      );
    });
  }

  openConfirmDeleteConfig(config: any) {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Remove configuration ${config.config_name}?`,
      message: `Are you sure you want to delete ${config.config_name}?`,
      option1: 'Cancel',
      option2: 'Confirm'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: confirm_dialog,
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {
        this.agentBuilderSvc.deleteConfig(config['_id']).subscribe(config_list => {
          this.setSavedConfigs(config_list);
          this.displaySnackBar(`${config.config_name} was deleted successfully.`);
        },
        error => {
          this.displaySnackBar("Failed to delete configuration.");
          console.error("Delete config error:", error);
        });
      }
    });
  }

  openConfirmDeleteTarget(config: IpTargetList) {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Remove configuration ${config.name}?`,
      message: 'Before deleting this target configuration, it is strongly advised to first do a "Batch Uninstall". ' +
      'Please make sure all agents have been uninstalled successfully. This action cannot be undone.',
      option1: 'Cancel',
      option2: 'Confirm'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: confirm_dialog,
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {
        this.agentBuilderSvc.deleteIpTargetList(config.name).subscribe(configs => {
          this.setTargetConfigs(configs);
          this.displaySnackBar(`${config.name} was deleted successfully.`);
        },
        error => {
          this.displaySnackBar("Failed to delete target.");
          console.error("Dete config error:", error);
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
        const endgame = formData['endgame_options'];
        delete formData['endgame_options'];

        const scratch = {...formData, ...endgame};
        formData = scratch;

        this.agentBuilderSvc.saveConfig(formData).subscribe(
          configs => {
            this.setSavedConfigs(configs);
            this.displaySnackBar("Saved configuration successfully.");
          },
          error => {
            this.displaySnackBar(`Failed to save configuration. ${error.message}`);
            console.error("Save config error:", error);
          }
        );
      }
    });
  }

  openAddNewTargetConfigModal() {
    const dialogRef = this.dialog.open(AgentTargetDialogComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: {}
    });

    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          const name = (result as IpTargetList).name;
          this.agentBuilderSvc.saveIpTargetList(result as IpTargetList).subscribe(configs => {
            this.setTargetConfigs(configs);
            this.displaySnackBar(`${name} was saved successfully.`);
      },
      error => {
        this.displaySnackBar("Failed to save new configuration.");
        console.error("Save config error:", error);
      });
      }
    });
  }

  getPort(config: IpTargetList): string {
    if (config.protocol === "kerberos") {
      return config.kerberos.port;
    } else if (config.protocol === "smb") {
      return config.smb.port;
    }

    return config.ntlm.port;
  }

  getDomainSuffix(config: IpTargetList): string {
    if (config.protocol === "kerberos") {
      return config.kerberos.domain_name;
    } else if (config.protocol === "smb") {
      return config.smb.domain_name;
    }

    return config.ntlm.domain_name;
  }

  openAddWindowsHostModal(targetConfig: IpTargetList, hostList: MatTableDataSource<Host>) {
    const hostnamesFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    hostnamesFormControlConfig.label = 'Windows Hostname';
    hostnamesFormControlConfig.formState = '';
    hostnamesFormControlConfig.validatorOrOpts = Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]);
    hostnamesFormControlConfig.asyncValidator = undefined;
    hostnamesFormControlConfig.tooltip = 'The application will attempt to install agents to the Windows machines specified.';
    hostnamesFormControlConfig.controlType = DialogControlTypes.textarea;
    const dialogForm = this.fb.group({
      hostnames: new DialogFormControl(hostnamesFormControlConfig)
    });

    const dialogRef = this.dialog.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: {
        title: "Add new Windows hosts",
        instructions: "Enter a Windows hostname for each line or copy and paste from a text file.",
        dialogForm: dialogForm,
        confirmBtnText: "Add Windows hosts"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const form = result as FormGroup;
      if (form && form.valid) {
        const host = form.getRawValue() as Host;
        this.agentBuilderSvc.addHostToIPTargetList(targetConfig._id, host).subscribe(data => {
          if (data instanceof ErrorMessage){
            this.displaySnackBar(data.error_message);
          } else {
            const additionalTargets: Host[] = data.targets;
            let targets: Host[] = [];
            let distinct: Host[] = [];

            if (targetConfig.targets) {
              targets = targetConfig.targets;
              distinct = targets.concat(additionalTargets).filter(this.isFirstHost);
              hostList.data = distinct;
              targetConfig.targets = distinct;
            } else {
              hostList.data = additionalTargets;
              targetConfig.targets = additionalTargets;
            }

            this.displaySnackBar("Windows hosts saved successfully.");
          }
        });
      }
    });
  }

  isFirstHost(host: Host, hostIndex: number, hosts: Host[]) {
    const hostIndexFromHosts: number = hosts.findIndex((h: Host) => h.hostname.toLowerCase() === host.hostname.toLowerCase());

    return hostIndexFromHosts === hostIndex;
  }

  openRemoveHostModal(target_config: IpTargetList, hostList: MatTableDataSource<Host>, host: Host, hostIndex: number) {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Remove configuration ${host.hostname}?`,
      message: `Before deleting this ${host.hostname}, it is strongly advised to uninstall first. This action cannot be undone.`,
      option1: 'Cancel',
      option2: 'Confirm'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: confirm_dialog,
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {
        this.agentBuilderSvc.removeHostFromIpTargetList(target_config._id, host).subscribe(data => {
          if (data instanceof ErrorMessage){
            this.displaySnackBar(data.error_message);
          } else {
            this.displaySnackBar(data.success_message);

            const newHostList = hostList.data.filter((_host, index) => index !== hostIndex);

            hostList.data = newHostList;
            target_config.targets = newHostList;
          }
        },
        error => {
          this.displaySnackBar("Failed to delete configuration.");
          console.error("Delete config error:", error);
        });
      }
    });
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000});
  }

  private setSavedConfigs(configs: Array<AgentInstallerConfig>) {
    this.configs = new MatTableDataSource<AgentInstallerConfig>(configs);
    this.configs.paginator = this.installerConfigPaginator;
    this.config_selection = null;
    this.ref.detectChanges();
  }


  private setTargetConfigs(configs: Array<IpTargetList>){
    const rows = [];
    for (const config of configs) {
      const targets = config['targets'];
      const row = {};
      row['state'] = {};
      row['config'] = config;
      row['state']['hostList'] = new MatTableDataSource(targets);
      row['state']['expanded'] = false;

      rows.push(row);
    }
    const targetConfigs = new MatTableDataSource<any>(rows);
    targetConfigs.paginator = this.targetConfigPaginator;

    this.targetConfigs = targetConfigs;
    this.target_selection = null;
    this.ref.detectChanges();
  }

  private socketRefresh(){
    this.socketSrv.getSocket().on('refresh', (_data: any) => {
      this.refreshStateChanges();
    });
  }

  private _update_targets(target_config: IpTargetList, update_config: IpTargetList){
    for (const target of target_config.targets){
      for (const update of update_config.targets){
        if (target.hostname === update.hostname){
          target.state = update.state;
          target.last_state_change = update.last_state_change;
          break;
        }
      }
    }
  }

  private refreshStateChanges(){
    this.agentBuilderSvc.getIpTargetList().subscribe((data: IpTargetList[]) => {
      Object.keys(this.targetConfigs.data).forEach((key: string) => {
        const target_config = this.targetConfigs.data[key]['config'];
        for (const updated_config of data) {
          if (target_config._id === updated_config._id) {
            this._update_targets(target_config, updated_config);
            break;
          }
        }
      });

      this.hostTables.forEach(table => table.renderRows());
    });
  }

  /**
   * Used for returning message used for dialog windows
   *
   * @private
   * @param {string} softwareAction
   * @param {string} [hostName]
   * @returns {string}
   * @memberof AgentBuilderChooserComponent
   */
  private dialogMessage_(softwareAction: string, hostName?: string): string {
    const middleMessage: string = !ObjectUtilitiesClass.notUndefNull(hostName) ?
      ' configuration on all Windows hosts within your target configuration. ' : ` on ${hostName}`;

    return `Executing this form will attempt to ${softwareAction} the selected executable
           ${middleMessage}. Are you sure you want to do this?`;
  }
}

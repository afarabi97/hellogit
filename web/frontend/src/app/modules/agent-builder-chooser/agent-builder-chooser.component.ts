import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import * as FileSaver from 'file-saver';

import { ErrorMessageClass, ObjectUtilitiesClass } from '../../classes';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { COMMON_VALIDATORS, MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface } from '../../interfaces';
import {
  DialogControlTypes,
  DialogFormControl,
  DialogFormControlConfigClass
} from '../../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../../modal-dialog-mat/modal-dialog-mat.component';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { WebsocketService } from '../../services/websocket.service';
import { validateFromArray } from '../../validators/generic-validators.validator';
import { CatalogService } from '../catalog/services/catalog.service';
import {
  AgentInstallerConfigurationClass,
  AppConfigClass,
  CustomPackageClass,
  HostClass,
  IPTargetListClass,
  WindowsCredentialsClass
} from './classes';
import { AgentDetailsDialogComponent } from './components/agent-details-dialog/agent-details-dialog.component';
import { AgentInstallerDialogComponent } from './components/agent-installer-dialog/agent-installer-dialog.component';
import { AgentTargetDialogComponent } from './components/agent-target-dialog/agent-target-dialog.component';
import { DOMAIN_PASSWORD_LABEL } from './constants/agent-builder-chooser.constant';
import {
  AgentDetailsDialogDataInterface,
  AgentInstallerConfigurationInterface,
  AgentInstallerDialogDataInterface,
  AppNameAppConfigPairInterface,
  HostInterface,
  IPTargetListInterface
} from './interfaces';
import { AgentBuilderService } from './services/agent-builder.service';

const DIALOG_WIDTH = "800px";
const DIALOG_MAX_HEIGHT = "800px";

@Component({
  selector: 'app-agent-builder-chooser',
  templateUrl: './agent-builder-chooser.component.html'
})
export class AgentBuilderChooserComponent implements OnInit {

  @ViewChild('installerConfigPaginator') installerConfigPaginator: MatPaginator;
  @ViewChild('targetConfigPaginator') targetConfigPaginator: MatPaginator;
  @ViewChild('targetTable') targetTable: MatTable<MatTableDataSource<IPTargetListClass>>;
  @ViewChildren('hostTable') hostTables: QueryList<MatTable<HostClass>>;
  // Columns for material tables.
  columnsForInstallerConfigs: string[] = ['select', 'config_name', 'install_custom', 'install_endgame', 'endgame_sensor_name', 'actions'];
  columnsForTargetConfigs: string[] = ['select', 'name', 'protocol', 'port', 'domain_name', 'actions'];
  columnsForHosts: string[] = ['hostname', 'state', 'last_state_change', 'actions'];
  appConfigs: AppConfigClass[];
  config_selection: AgentInstallerConfigurationClass = null;
  target_selection: IPTargetListClass = null;
  // Interface
  configs: MatTableDataSource<any>;
  targetConfigs: MatTableDataSource<any>;
  is_downloading: boolean;

  constructor(private agentBuilderSvc: AgentBuilderService,
              private catalog_service_: CatalogService,
              private mat_snackbar_service_: MatSnackBarService,
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
    this.catalog_service_.checkLogStashInstalled().subscribe(data =>{
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

    this.agentBuilderSvc.get_app_configs()
      .subscribe(
        (appConfigs: AppConfigClass[]) => {
          this.appConfigs = appConfigs;
        });

    this.getSavedConfigs();
    this.getSavedTargetConfigs();
    this.socketRefresh();
  }

  get_app_configs_with_custom_packages(agent_installer_configuration: AgentInstallerConfigurationClass): AppConfigClass[] {
    const custom_packages: CustomPackageClass =
      ObjectUtilitiesClass.notUndefNull(agent_installer_configuration.customPackages) ?
        agent_installer_configuration.customPackages : {};
    const package_names = Object.keys(custom_packages);

    return this.appConfigs.filter((ac: AppConfigClass) => package_names.includes(ac.name));
  }

  check_custom_packages(agent_installer_configuration: AgentInstallerConfigurationClass): boolean {
    const app_configs: AppConfigClass[] = this.get_app_configs_with_custom_packages(agent_installer_configuration);

    return app_configs.length > 0;
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

  showConfig(agent_installer_configuration: AgentInstallerConfigurationClass) {
    const app_configs: AppConfigClass[] = this.get_app_configs_with_custom_packages(agent_installer_configuration);
    const agent_details_dialog_data: AgentDetailsDialogDataInterface = {
      app_configs: app_configs,
      agent_installer_configuration: agent_installer_configuration
    };
    this.dialog.open(AgentDetailsDialogComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: agent_details_dialog_data
    });
  }

  getSavedConfigs() {
    this.agentBuilderSvc.agent_get_configs().subscribe(
      configs => {
        this.setSavedConfigs(configs);
      });
  }

  getSavedTargetConfigs(){
    this.agentBuilderSvc.agent_get_ip_target_list().subscribe(configs => {
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

    this.agentBuilderSvc.agent_generate(payload).subscribe(
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
        const credentials = new WindowsCredentialsClass(rawValue);
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
      this.agentBuilderSvc.agents_install(payload)
        .subscribe(
          data => {
            this.displaySnackBar(data['success_message']);
          },
          (error: ErrorMessageClass | HttpErrorResponse) => {
            if (error instanceof ErrorMessageClass) {
              this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else {
              const message: string = 'initiating install task for an unknown reason';
              this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          });
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
      this.agentBuilderSvc.agents_uninstall(payload)
        .subscribe(
          data => {
            this.displaySnackBar(data['success_message']);
          },
          (error: ErrorMessageClass | HttpErrorResponse) => {
            if (error instanceof ErrorMessageClass) {
              this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else {
              const message: string = 'executing uninstall action as this Agent is already uninstalled on target host';
              this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          });
    });
  }

  reinstallAgent(config, target, host) {
    const title = `Reinstall Windows host ${host.hostname}`;
    const instructions = this.dialogMessage_('reinstall', host.hostname);

    this.execute(title, instructions, credentials => {
      const payload = {
        installer_config: config,
        target_config: target,
        windows_domain_creds: credentials,
        target: host
      };
      this.agentBuilderSvc.agent_reinstall(payload).subscribe(
        data => {
          this.displaySnackBar(data['success_message']);
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
        windows_domain_creds: credentials,
        target: host
      };

      this.agentBuilderSvc.agent_uninstall(payload)
        .subscribe(
          data => {
            this.displaySnackBar(data['success_message']);
          },
          (error: ErrorMessageClass | HttpErrorResponse) => {
            if (error instanceof ErrorMessageClass) {
              this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else {
              const message: string = 'executing uninstall action as this Agent is already uninstalled on target host';
              this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          });
    });
  }

  openConfirmDeleteConfig(agent_installer_configuration: AgentInstallerConfigurationClass) {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Remove configuration ${agent_installer_configuration.config_name}?`,
      message: `Are you sure you want to delete ${agent_installer_configuration.config_name}?`,
      option1: 'Cancel',
      option2: 'Confirm'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: confirm_dialog,
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {
        this.agentBuilderSvc.agent_delete_config(agent_installer_configuration._id).subscribe(config_list => {
          this.setSavedConfigs(config_list);
          this.displaySnackBar(`${agent_installer_configuration.config_name} was deleted successfully.`);
        },
        error => {
          this.displaySnackBar("Failed to delete configuration.");
          console.error("Delete config error:", error);
        });
      }
    });
  }

  openConfirmDeleteTarget(config: IPTargetListClass) {
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
        this.agentBuilderSvc.agent_delete_ip_target_list(config.name).subscribe(configs => {
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

  addNewConfiguration() {
    const app_name_app_config_pair: AppNameAppConfigPairInterface = new Object() as AppNameAppConfigPairInterface;
    this.appConfigs.forEach((ac: AppConfigClass) => app_name_app_config_pair[ac.name] = ac);
    const agent_installer_dialog_data: AgentInstallerDialogDataInterface = {
      app_configs: this.appConfigs,
      app_names: this.appConfigs.map((ac: AppConfigClass) => ac.name),
      app_name_app_config_pair: app_name_app_config_pair
    };
    const dialogRef = this.dialog.open(AgentInstallerDialogComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: agent_installer_dialog_data
    });
    dialogRef.afterClosed()
      .subscribe(
        (response: FormGroup) => {
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            let formData = response.getRawValue();
            const endgame = formData['endgame_options'];
            delete formData['endgame_options'];
            const scratch = {...formData, ...endgame};
            formData = scratch;
            this.api_agent_save_config_(formData as AgentInstallerConfigurationInterface);
          }
        });
  }

  openAddNewTargetConfigModal() {
    const dialogRef = this.dialog.open(AgentTargetDialogComponent, {
      width: DIALOG_WIDTH,
      maxHeight: DIALOG_MAX_HEIGHT,
      data: {}
    });

    dialogRef.afterClosed()
      .subscribe(
        (response: IPTargetListInterface) => {
          if (ObjectUtilitiesClass.notUndefNull(response)) {
            this.api_agent_ip_target_list_(response);
          }
        });
  }

  getPort(config: IPTargetListClass): string {
    if (config.protocol === "smb") {
      return config.smb.port;
    } else {
      return config.ntlm.port;
    }
  }

  getDomainSuffix(config: IPTargetListClass): string {
    if (config.protocol === "smb") {
      return config.smb.domain_name;
    } else {
      return config.ntlm.domain_name;
    }
  }

  openAddWindowsHostModal(targetConfig: IPTargetListClass, hostList: MatTableDataSource<HostClass>) {
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
        const host: HostInterface = form.getRawValue();
        this.agentBuilderSvc.agent_add_host_to_ip_target_list(targetConfig._id, host)
        .subscribe(
          data => {
            const additionalTargets: HostClass[] = data.targets;
            let targets: HostClass[] = [];
            let distinct: HostClass[] = [];

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
          },
          (error: ErrorMessageClass | HttpErrorResponse) => {
            if (error instanceof ErrorMessageClass) {
              this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else {
              const message: string = 'adding host to ip target list';
              this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          });
      }
    });
  }

  isFirstHost(host: HostClass, hostIndex: number, hosts: HostClass[]) {
    const hostIndexFromHosts: number = hosts.findIndex((h: HostClass) => h.hostname.toLowerCase() === host.hostname.toLowerCase());

    return hostIndexFromHosts === hostIndex;
  }

  openRemoveHostModal(target_config: IPTargetListClass, hostList: MatTableDataSource<HostClass>, host: HostClass, hostIndex: number) {
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
        this.agentBuilderSvc.agent_remove_host_from_ip_target_list(target_config._id, host)
        .subscribe(
          data => {
            this.displaySnackBar(data.success_message);

            const newHostList = hostList.data.filter((_host, index) => index !== hostIndex);

            hostList.data = newHostList;
            target_config.targets = newHostList;
          },
          (error: ErrorMessageClass | HttpErrorResponse) => {
            if (error instanceof ErrorMessageClass) {
              this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            } else {
              const message: string = 'removing host from ip target list';
              this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          });
      }
    });
  }

  private displaySnackBar(message: string, duration_seconds: number = 60){
    this.snackBar.open(message, "Close", { duration: duration_seconds * 1000});
  }

  private setSavedConfigs(configs: AgentInstallerConfigurationClass[]) {
    this.configs = new MatTableDataSource<AgentInstallerConfigurationClass>(configs);
    this.configs.paginator = this.installerConfigPaginator;
    this.config_selection = null;
    this.ref.detectChanges();
  }


  private setTargetConfigs(configs: IPTargetListClass[]){
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

  private _update_targets(target_config: IPTargetListClass, update_config: IPTargetListClass){
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
    this.agentBuilderSvc.agent_get_ip_target_list().subscribe((data: IPTargetListClass[]) => {
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

  private api_agent_save_config_(formData: AgentInstallerConfigurationInterface) {
    this.agentBuilderSvc.agent_save_config(formData)
      .subscribe(
        (response: AgentInstallerConfigurationClass[]) => {
          this.setSavedConfigs(response);
          this.displaySnackBar("Saved configuration successfully.");
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'saving configuration';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  private api_agent_ip_target_list_(ip_target_list: IPTargetListInterface): void {
    this.agentBuilderSvc.agent_save_ip_target_list(ip_target_list)
      .subscribe(
        (response: IPTargetListClass[]) => {
          this.setTargetConfigs(response);
          this.displaySnackBar(`${ip_target_list.name} was saved successfully.`);
        },
        error => {
          this.displaySnackBar("Failed to save new configuration.");
          console.error("Save config error:", error);
        });
  }
}

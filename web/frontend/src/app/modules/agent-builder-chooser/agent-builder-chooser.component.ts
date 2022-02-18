import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as FileSaver from 'file-saver';

import { ErrorMessageClass, ObjectUtilitiesClass, StatusClass, SuccessMessageClass } from '../../classes';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import {
  CANCEL_DIALOG_OPTION,
  COMMON_VALIDATORS,
  CONFIRM_DIALOG_OPTION,
  DIALOG_MAX_HEIGHT_800PX,
  DIALOG_WIDTH_800PX,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR
} from '../../constants/cvah.constants';
import { BackingObjectInterface, ConfirmDialogMatDialogDataInterface } from '../../interfaces';
import {
  DialogControlTypes,
  DialogFormControl,
  DialogFormControlConfigClass
} from '../../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../../modal-dialog-mat/modal-dialog-mat.component';
import { CatalogService } from '../../services/catalog.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { WebsocketService } from '../../services/websocket.service';
import { validateFromArray } from '../../validators/generic-validators.validator';
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
import {
  AGENT_BUILDER_CHOOSER_TITLE,
  AGENT_INSTALLER_CONFIGURATION_MAT_TABLE_COLUMNS,
  DOMAIN_PASSWORD_LABEL,
  HOST_MAT_TABLE_COLUMNS,
  INSTALL,
  INSTALL_WINDOWS_HOSTS,
  IP_TARGET_CONFIGS_MAT_TABLE_COLUMNS,
  LOGSTASH_NO_DATA_MESSAGE,
  LOGSTASH_NOT_DEPLOYED_STATE_MESSAGE,
  REINSTALL,
  REINSTALL_WINDOWS_HOST,
  UNINSTALL,
  UNINSTALL_WINDOWS_HOST,
  UNINSTALL_WINDOWS_HOSTS,
  UNINSTALLS
} from './constants/agent-builder-chooser.constant';
import {
  AgentDetailsDialogDataInterface,
  AgentInstallerConfigurationInterface,
  AgentInstallerDialogDataInterface,
  AgentInterface,
  AgentTargetInterface,
  AppNameAppConfigPairInterface,
  HostInterface,
  IPTargetListInterface,
  MatTableRowIPTargetListInterface
} from './interfaces';
import { AgentBuilderService } from './services/agent-builder.service';

/**
 * Component used for windows agent related functionality
 *
 * @export
 * @class AgentBuilderChooserComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-agent-builder-chooser',
  templateUrl: './agent-builder-chooser.component.html'
})
export class AgentBuilderChooserComponent implements OnInit {
  // Used for getting html defined dom elements
  @ViewChildren('hostTable') private host_tables_: QueryList<MatTable<HostClass>>;
  @ViewChild('installerConfigPaginator') private installer_config_paginator_: MatPaginator;
  @ViewChild('targetConfigPaginator') private target_config_paginator_: MatPaginator;
  // Columns for material tables
  agent_installer_configs_mat_table_columns: string[];
  ip_target_configs_mat_table_columns: string[];
  host_mat_table_columns: string[];
  // Used for linking table data source
  agent_installer_configs_mat_table_data: MatTableDataSource<AgentInstallerConfigurationClass>;
  ip_target_configs_mat_table_data: MatTableDataSource<MatTableRowIPTargetListInterface>;
  // Used for retaining table selection
  agent_installer_configuration_selection: AgentInstallerConfigurationClass;
  ip_target_selection: IPTargetListClass;
  // Used for passing app configs to html
  app_configs: AppConfigClass[];
  // Used for disabling download button after clicking or when no selection made
  is_downloading_agent_installer_configs: boolean;

  /**
   * Creates an instance of AgentBuilderChooserComponent.
   *
   * @param {ChangeDetectorRef} change_detector_ref_
   * @param {FormBuilder} form_builder_
   * @param {MatDialog} mat_dialog_
   * @param {Title} title_
   * @param {AgentBuilderService} agent_builder_service_
   * @param {CatalogService} catalog_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {WebsocketService} websocket_service
   * @memberof AgentBuilderChooserComponent
   */
  constructor(private change_detector_ref_: ChangeDetectorRef,
              private form_builder_: FormBuilder,
              private mat_dialog_: MatDialog,
              private title_: Title,
              private agent_builder_service_: AgentBuilderService,
              private catalog_service_: CatalogService,
              private mat_snackbar_service_: MatSnackBarService,
              private websocket_service: WebsocketService) {
    this.agent_installer_configs_mat_table_columns = AGENT_INSTALLER_CONFIGURATION_MAT_TABLE_COLUMNS;
    this.ip_target_configs_mat_table_columns = IP_TARGET_CONFIGS_MAT_TABLE_COLUMNS;
    this.host_mat_table_columns = HOST_MAT_TABLE_COLUMNS;
    this.is_downloading_agent_installer_configs = false;
  }

  /**
   * Used for setting up subscriptions
   *
   * @memberof AgentBuilderChooserComponent
   */
  ngOnInit(): void {
    this.title_.setTitle(AGENT_BUILDER_CHOOSER_TITLE);
    this.websocket_get_socket_on_refresh();
    this.api_get_chart_status_();
    this.api_agent_get_configs_();
    this.api_agent_get_ip_target_list_();
    this.api_get_app_configs_();
  }

  /**
   * Used to check custom packages and return boolean value
   *
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration
   * @returns {boolean}
   * @memberof AgentBuilderChooserComponent
   */
  check_custom_packages(agent_installer_configuration: AgentInstallerConfigurationClass): boolean {
    const app_configs: AppConfigClass[] = this.get_app_configs_with_custom_packages_(agent_installer_configuration);

    return app_configs.length > 0;
  }

  /**
   * Used for updating the agent installer configuration selection
   *
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration
   * @memberof AgentBuilderChooserComponent
   */
  update_selected_agent_installer_config(agent_installer_configuration: AgentInstallerConfigurationClass): void {
    this.agent_installer_configuration_selection = agent_installer_configuration;
  }

  /**
   * Used for updating the ip target selection
   *
   * @param {MatTableRowIPTargetListInterface} mat_table_row_ip_target_list
   * @memberof AgentBuilderChooserComponent
   */
  update_selected_ip_target(mat_table_row_ip_target_list: MatTableRowIPTargetListInterface): void {
    this.ip_target_selection = mat_table_row_ip_target_list.config;
  }

  /**
   * Used for toggling host list expansion
   *
   * @param {MatTableRowIPTargetListInterface} row
   * @memberof AgentBuilderChooserComponent
   */
  toggle_host_list_expansion(row: MatTableRowIPTargetListInterface): void {
    row.state.expanded = !row.state.expanded;
  }

  /**
   * Used to check if host list is expanded
   *
   * @param {MatTableRowIPTargetListInterface} row
   * @returns {boolean}
   * @memberof AgentBuilderChooserComponent
   */
  is_host_list_expanded(row: MatTableRowIPTargetListInterface): boolean {
    return row.state.expanded;
  }

  /**
   * Used for setting the paginator for host list
   *
   * @param {MatTableDataSource<HostClass>} host_list
   * @param {MatPaginator} paginator
   * @returns {MatTableDataSource<HostClass>}
   * @memberof AgentBuilderChooserComponent
   */
  set_host_list_paginator(host_list: MatTableDataSource<HostClass>, paginator: MatPaginator): MatTableDataSource<HostClass> {
    /* istanbul ignore else */
    if (!ObjectUtilitiesClass.notUndefNull(host_list.paginator)) {
      /* istanbul ignore else */
      if (ObjectUtilitiesClass.notUndefNull(paginator)) {
        host_list.paginator = paginator;
      }
    }

    return host_list;
  }

  /**
   * Used for showing the agent installer configuration
   *
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration
   * @memberof AgentBuilderChooserComponent
   */
  show_agent_installer_configuration(agent_installer_configuration: AgentInstallerConfigurationClass): void {
    const app_configs: AppConfigClass[] = this.get_app_configs_with_custom_packages_(agent_installer_configuration);
    const agent_details_dialog_data: AgentDetailsDialogDataInterface = {
      app_configs: app_configs,
      agent_installer_configuration: agent_installer_configuration
    };
    this.mat_dialog_.open(AgentDetailsDialogComponent, {
      width: DIALOG_WIDTH_800PX,
      maxHeight: DIALOG_MAX_HEIGHT_800PX,
      data: agent_details_dialog_data
    });
  }

  /**
   * Used for downloading the agent installer configuration
   *
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration
   * @memberof AgentBuilderChooserComponent
   */
  download_agent_installer(agent_installer_configuration: AgentInstallerConfigurationClass): void {
    this.is_downloading_agent_installer_configs = true;
    this.mat_snackbar_service_.displaySnackBar(`Initiated executable download for ${agent_installer_configuration.config_name}. Please wait until it is completed.`);

    const agent_interface: AgentInterface = {
      installer_config: agent_installer_configuration,
      target_config: null,
      windows_domain_creds: null
    };
    this.api_agent_generate_(agent_interface);
  }

  /**
   * Used for installing agents
   *
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration_selection
   * @param {IPTargetListClass} ip_target_list_selection
   * @memberof AgentBuilderChooserComponent
   */
  agents_install(agent_installer_configuration_selection: AgentInstallerConfigurationClass, ip_target_list_selection: IPTargetListClass): void {
    const message: string = this.dialog_message_(INSTALL);
    const agent_interface: AgentInterface = {
      installer_config: agent_installer_configuration_selection,
      target_config: ip_target_list_selection,
      windows_domain_creds: undefined
    };

    this.get_credentials_(INSTALL_WINDOWS_HOSTS, message, INSTALL, agent_interface);
  }

  /**
   * Used for uninstalling agents
   *
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration_selection
   * @param {IPTargetListClass} ip_target_list_selection
   * @memberof AgentBuilderChooserComponent
   */
  agents_uninstall(agent_installer_configuration_selection: AgentInstallerConfigurationClass, ip_target_list_selection: IPTargetListClass): void {
    const message: string = this.dialog_message_(UNINSTALLS);
    const agent_interface: AgentInterface = {
      installer_config: agent_installer_configuration_selection,
      target_config: ip_target_list_selection,
      windows_domain_creds: undefined
    };

    this.get_credentials_(UNINSTALL_WINDOWS_HOSTS, message, UNINSTALLS, agent_interface);
  }

  /**
   * Used for uninstalling agent
   *
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration_selection
   * @param {IPTargetListClass} ip_target_list_selection
   * @param {HostClass} host
   * @memberof AgentBuilderChooserComponent
   */
  agent_uninstall(agent_installer_configuration_selection: AgentInstallerConfigurationClass, ip_target_list_selection: IPTargetListClass, host: HostClass): void {
    const title: string = `${UNINSTALL_WINDOWS_HOST} ${host.hostname}`;
    const message: string = this.dialog_message_(UNINSTALL, host.hostname);
    const agent_target: AgentTargetInterface = {
      installer_config: agent_installer_configuration_selection,
      target_config: ip_target_list_selection,
      windows_domain_creds: undefined,
      target: host
    };

    this.get_credentials_(title, message, UNINSTALL, agent_target);
  }

  /**
   * Used for reinstalling agent
   *
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration_selection
   * @param {IPTargetListClass} ip_target_list_selection
   * @param {HostClass} host
   * @memberof AgentBuilderChooserComponent
   */
  agent_reinstall(agent_installer_configuration_selection: AgentInstallerConfigurationClass, ip_target_list_selection: IPTargetListClass, host: HostClass): void {
    const title: string = `${REINSTALL_WINDOWS_HOST} ${host.hostname}`;
    const message: string = this.dialog_message_(REINSTALL, host.hostname);
    const agent_target: AgentTargetInterface = {
      installer_config: agent_installer_configuration_selection,
      target_config: ip_target_list_selection,
      windows_domain_creds: undefined,
      target: host
    };

    this.get_credentials_(title, message, REINSTALL, agent_target);
  }

  /**
   * Used for deleting agent installer configuration
   *
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration
   * @memberof AgentBuilderChooserComponent
   */
  delete_agent_installer_configuration_confirm_dialog(agent_installer_configuration: AgentInstallerConfigurationClass): void {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Remove configuration ${agent_installer_configuration.config_name}?`,
      message: `Are you sure you want to delete ${agent_installer_configuration.config_name}?`,
      option1: CANCEL_DIALOG_OPTION,
      option2: CONFIRM_DIALOG_OPTION
    };
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_800PX,
      data: confirm_dialog,
    });
    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_agent_delete_config_(agent_installer_configuration);
          }
        });
  }

  /**
   *Used for deleting ip target list
   *
   * @param {IPTargetListClass} ip_target_list
   * @memberof AgentBuilderChooserComponent
   */
  delete_ip_target_list_confirm_dialog(ip_target_list: IPTargetListClass): void {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Remove configuration ${ip_target_list.name}?`,
      message: 'Before deleting this target configuration, it is strongly advised to first do a "Batch Uninstall". ' +
      'Please make sure all agents have been uninstalled successfully. This action cannot be undone.',
      option1: CANCEL_DIALOG_OPTION,
      option2: CONFIRM_DIALOG_OPTION
    };
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_800PX,
      data: confirm_dialog,
    });
    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_delete_ip_target_list_(ip_target_list);
          }
        });
  }

  /**
   * Used for creating new agent installer configuration
   *
   * @memberof AgentBuilderChooserComponent
   */
  new_agent_installer_configuration(): void {
    const app_name_app_config_pair: AppNameAppConfigPairInterface = new Object() as AppNameAppConfigPairInterface;
    this.app_configs.forEach((ac: AppConfigClass) => app_name_app_config_pair[ac.name] = ac);
    const agent_installer_dialog_data: AgentInstallerDialogDataInterface = {
      app_configs: this.app_configs,
      app_names: this.app_configs.map((ac: AppConfigClass) => ac.name),
      app_name_app_config_pair: app_name_app_config_pair
    };
    const mat_dialog_ref: MatDialogRef<AgentInstallerDialogComponent, any> = this.mat_dialog_.open(AgentInstallerDialogComponent, {
      width: DIALOG_WIDTH_800PX,
      maxHeight: DIALOG_MAX_HEIGHT_800PX,
      data: agent_installer_dialog_data
    });
    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: AgentInstallerConfigurationClass) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) &&
              response instanceof AgentInstallerConfigurationClass) {
            this.api_agent_save_config_(response);
          }
        });
  }

  /**
   * Used for creating new ip target list
   *
   * @memberof AgentBuilderChooserComponent
   */
  new_ip_target_list(): void {
    const mat_dialog_ref: MatDialogRef<AgentTargetDialogComponent, any> = this.mat_dialog_.open(AgentTargetDialogComponent, {
      width: DIALOG_WIDTH_800PX,
      maxHeight: DIALOG_MAX_HEIGHT_800PX,
      data: {}
    });
    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: IPTargetListClass) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) &&
              response instanceof IPTargetListClass) {
            this.api_agent_save_ip_target_list_(response);
          }
        });
  }

  /**
   * Used for getting the ip target list port
   *
   * @param {IPTargetListClass} ip_target_list
   * @returns {string}
   * @memberof AgentBuilderChooserComponent
   */
  get_ip_target_list_port(ip_target_list: IPTargetListClass): string {
    return ip_target_list.protocol === 'smb' ? ip_target_list.smb.port : ip_target_list.ntlm.port;
  }

  /**
   * Used for getting the ip target list domain name
   *
   * @param {IPTargetListClass} ip_target_list
   * @returns {string}
   * @memberof AgentBuilderChooserComponent
   */
  get_ip_target_list_domain_name(ip_target_list: IPTargetListClass): string {
    return ip_target_list.protocol === 'smb' ? ip_target_list.smb.domain_name : ip_target_list.ntlm.domain_name;
  }

  /**
   * Used for adding host to ip target list
   *
   * @param {IPTargetListClass} ip_target_list
   * @param {MatTableDataSource<HostClass>} host_list
   * @memberof AgentBuilderChooserComponent
   */
  add_hosts_to_ip_target_list(ip_target_list: IPTargetListClass, host_list: MatTableDataSource<HostClass>): void {
    const hostnames_form_control: DialogFormControlConfigClass = new DialogFormControlConfigClass();
    hostnames_form_control.label = 'Windows Hostname';
    hostnames_form_control.formState = '';
    hostnames_form_control.validatorOrOpts = Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]);
    hostnames_form_control.asyncValidator = undefined;
    hostnames_form_control.tooltip = 'The application will attempt to install agents to the Windows machines specified.';
    hostnames_form_control.controlType = DialogControlTypes.textarea;
    const dialog_form_group: FormGroup = this.form_builder_.group({
      hostnames: new DialogFormControl(hostnames_form_control)
    });
    const backing_object: BackingObjectInterface = {
      title: 'Add new Windows hosts',
      instructions: 'Enter a Windows hostname for each line or copy and paste from a text file.',
      dialogForm: dialog_form_group,
      confirmBtnText: 'Add Windows Hosts'
    };
    const mat_dialog_ref: MatDialogRef<ModalDialogMatComponent, any> = this.mat_dialog_.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH_800PX,
      maxHeight: DIALOG_MAX_HEIGHT_800PX,
      data: backing_object
    });
    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            const host: HostInterface = response.getRawValue();
            this.api_agent_add_host_to_ip_target_list_(ip_target_list, host, host_list);
          }
        });
  }

  /**
   * Used for removing host from ip target list
   *
   * @param {IPTargetListClass} ip_target_list
   * @param {MatTableDataSource<HostClass>} host_list
   * @param {HostClass} host
   * @param {number} host_index
   * @memberof AgentBuilderChooserComponent
   */
  remove_hosts_from_ip_target_list(ip_target_list: IPTargetListClass, host_list: MatTableDataSource<HostClass>, host: HostClass, host_index: number): void {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `Remove configuration ${host.hostname}?`,
      message: `Before deleting this ${host.hostname}, it is strongly advised to uninstall first. This action cannot be undone.`,
      option1: CANCEL_DIALOG_OPTION,
      option2: CONFIRM_DIALOG_OPTION
    };
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_800PX,
      data: confirm_dialog,
    });
    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (response === CONFIRM_DIALOG_OPTION) {
            this.api_agent_remove_host_from_ip_target_list(ip_target_list, host, host_list, host_index);
          }
        });
  }

  /**
   * Returns array of app configs that contain custom packages
   *
   * @private
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration
   * @returns {AppConfigClass[]}
   * @memberof AgentBuilderChooserComponent
   */
  private get_app_configs_with_custom_packages_(agent_installer_configuration: AgentInstallerConfigurationClass): AppConfigClass[] {
    const custom_packages: CustomPackageClass =
      ObjectUtilitiesClass.notUndefNull(agent_installer_configuration.customPackages) ?
        agent_installer_configuration.customPackages : {};
    const package_names: string[] = Object.keys(custom_packages);

    return this.app_configs.filter((ac: AppConfigClass) => package_names.includes(ac.name));
  }

  /**
   * Used for returning message used for dialog windows
   *
   * @private
   * @param {string} software_action
   * @param {string} [host_name]
   * @returns {string}
   * @memberof AgentBuilderChooserComponent
   */
  private dialog_message_(software_action: string, host_name?: string): string {
    const middle_message: string = !ObjectUtilitiesClass.notUndefNull(host_name) ?
      ' configuration on all Windows hosts within your target configuration. ' : ` on ${host_name}`;

    return `Executing this form will attempt to ${software_action} the selected executable
           ${middle_message}. Are you sure you want to do this?`;
  }

  /**
   * Used for checking if host index is zero
   *
   * @private
   * @param {HostClass} host
   * @param {number} host_index
   * @param {HostClass[]} hosts
   * @returns {boolean}
   * @memberof AgentBuilderChooserComponent
   */
  private is_host_index_zero_(host: HostClass, host_index: number, hosts: HostClass[]): boolean {
    const index_from_hosts: number = hosts.findIndex((h: HostClass) => {
      if (ObjectUtilitiesClass.notUndefNull(h.hostname) &&
          ObjectUtilitiesClass.notUndefNull(host) &&
          ObjectUtilitiesClass.notUndefNull(host.hostname)) {
        return h.hostname.toLowerCase() === host.hostname.toLowerCase();
      } else {
        return false;
      }
    });

    return index_from_hosts === host_index;
  }

  /**
   * Used for setting the agent installer configuration mat table data
   *
   * @private
   * @param {AgentInstallerConfigurationClass[]} agent_installer_configurations
   * @memberof AgentBuilderChooserComponent
   */
  private set_agent_installer_configuration_mat_table_data_(agent_installer_configurations: AgentInstallerConfigurationClass[]): void {
    this.agent_installer_configs_mat_table_data = new MatTableDataSource<AgentInstallerConfigurationClass>(agent_installer_configurations);
    this.agent_installer_configs_mat_table_data.paginator = this.installer_config_paginator_;
    this.agent_installer_configuration_selection = null;
    this.change_detector_ref_.detectChanges();
  }

  /**
   * Used for setting the ip target list mat table data
   *
   * @private
   * @param {IPTargetListClass[]} ip_target_lists
   * @memberof AgentBuilderChooserComponent
   */
  private set_ip_target_config_mat_table_data_(ip_target_lists: IPTargetListClass[]): void {
    const rows: MatTableRowIPTargetListInterface[] = ip_target_lists.map((i: IPTargetListClass) => {
      const row: MatTableRowIPTargetListInterface = {
        config: i,
        state: {
          host_list: new MatTableDataSource(i.targets),
          expanded: false
        }
      };

      return row;
    });
    const ip_target_configs_mat_table_data = new MatTableDataSource<MatTableRowIPTargetListInterface>(rows);
    ip_target_configs_mat_table_data.paginator = this.target_config_paginator_;

    this.ip_target_configs_mat_table_data = ip_target_configs_mat_table_data;
    this.ip_target_selection = null;
    this.change_detector_ref_.detectChanges();
  }

  /**
   * Used for gathering windows credentials and and setting the data and passing to agent action method
   *
   * @private
   * @param {string} title
   * @param {string} instructions
   * @param {string} action
   * @param {(AgentInterface | AgentTargetInterface)} [agent_api_interface]
   * @memberof AgentBuilderChooserComponent
   */
  private get_credentials_(title: string, instructions: string, action: string, agent_api_interface: AgentInterface | AgentTargetInterface): void {
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
    const dialog_form_group: FormGroup = this.form_builder_.group({
      user_name: new DialogFormControl(userNameFormControlConfig),
      password: new DialogFormControl(passwordFormControlConfig)
    });
    const backing_object: BackingObjectInterface = {
      title: title,
      instructions: instructions,
      dialogForm: dialog_form_group,
      confirmBtnText: 'Execute'
    };
    const mat_dialog_ref: MatDialogRef<ModalDialogMatComponent, any> = this.mat_dialog_.open(ModalDialogMatComponent, {
      width: DIALOG_WIDTH_800PX,
      maxHeight: DIALOG_MAX_HEIGHT_800PX,
      data: backing_object
    });
    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: FormGroup) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            const credentials: WindowsCredentialsClass = new WindowsCredentialsClass(response.getRawValue());
            agent_api_interface.windows_domain_creds = credentials;
            this.perform_agent_action_(action, agent_api_interface);
          }
        });
  }

  /**
   * Used for calling agent actions mapped to an api call
   *
   * @private
   * @param {string} action
   * @param {(AgentInterface | AgentTargetInterface)} [agent_api_interface]
   * @memberof AgentBuilderChooserComponent
   */
  private perform_agent_action_(action: string, agent_api_interface: AgentInterface | AgentTargetInterface):void {
    switch(action) {
      case 'install':
        this.api_agents_install_(agent_api_interface);
        break;
      case 'reinstall':
        this.api_agent_reinstall_(agent_api_interface as AgentTargetInterface);
        break;
      case 'uninstall':
        this.api_agent_uninstall_(agent_api_interface as AgentTargetInterface);
        break;
      case 'uninstalls':
        this.api_agents_uninstall_(agent_api_interface);
        break;
      default:
        break;
    }
  }

  /**
   * Used for updating the targets for an ip target list
   *
   * @private
   * @param {IPTargetListClass} ip_target_list
   * @param {IPTargetListClass} updated_ip_target_list
   * @memberof AgentBuilderChooserComponent
   */
  private update_ip_targets_list_targets_(ip_target_list: IPTargetListClass, updated_ip_target_list: IPTargetListClass): void {
    for (const target of ip_target_list.targets) {
      for (const updated_targets of updated_ip_target_list.targets) {
        /* istanbul ignore else */
        if (target.hostname === updated_targets.hostname) {
          target.state = updated_targets.state;
          target.last_state_change = updated_targets.last_state_change;
          break;
        }
      }
    }
  }

  /**
   * Used for setting websocket on refresh
   * - TODO - rework when websocket testing defined
   *
   * @private
   * @memberof AgentBuilderChooserComponent
   */
  private websocket_get_socket_on_refresh(): void {
    this.websocket_service.getSocket().on('refresh', (_data: any) => this.api_agent_get_ip_target_list_(true));
  }

  /**
   * Used for making api rest call to get chart status
   *
   * @private
   * @memberof AgentBuilderChooserComponent
   */
  private api_get_chart_status_(): void {
    this.catalog_service_.get_chart_statuses('logstash')
      .pipe(untilDestroyed(this))
      .subscribe(
        (reponse: StatusClass[]) => {
          if (ObjectUtilitiesClass.notUndefNull(reponse) && reponse.length > 0) {
            /* istanbul ignore else */
            if (reponse[0].status !== 'DEPLOYED') {
              this.mat_snackbar_service_.displaySnackBar(LOGSTASH_NOT_DEPLOYED_STATE_MESSAGE, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
            }
          } else {
            this.mat_snackbar_service_.displaySnackBar(LOGSTASH_NO_DATA_MESSAGE, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving logstash installation status';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to post generate agent installer configuration
   *
   * @private
   * @param {AgentInterface} agent_interface
   * @memberof AgentBuilderChooserComponent
   */
  private api_agent_generate_(agent_interface: AgentInterface): void {
    this.agent_builder_service_.agent_generate(agent_interface)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: Blob) => {
          const installer_blob = new Blob([response], { type: 'zip' });
          FileSaver.saveAs(installer_blob, 'agents.zip');
          const message: string = 'downloaded agent installer configuration. Check your Downloads directory for the file.';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          this.is_downloading_agent_installer_configs = false;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'downloading or generating agent installer config';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          this.is_downloading_agent_installer_configs = false;
        });
  }

  /**
   * Used for making api rest call to post agent save config
   *
   * @private
   * @param {AgentInstallerConfigurationInterface} agent_installer_configuration
   * @memberof AgentBuilderChooserComponent
   */
  private api_agent_save_config_(agent_installer_configuration: AgentInstallerConfigurationClass): void {
    this.agent_builder_service_.agent_save_config(agent_installer_configuration)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: AgentInstallerConfigurationClass[]) => {
          this.set_agent_installer_configuration_mat_table_data_(response);
          const message: string = 'saved agent installer configuration';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'saving agent installer configuration';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to delete agent config
   *
   * @private
   * @param {AgentInstallerConfigurationClass} agent_installer_configuration
   * @memberof AgentBuilderChooserComponent
   */
  private api_agent_delete_config_(agent_installer_configuration: AgentInstallerConfigurationClass): void {
    this.agent_builder_service_.agent_delete_config(agent_installer_configuration._id)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: AgentInstallerConfigurationClass[]) => {
          this.set_agent_installer_configuration_mat_table_data_(response);
          const message: string = 'deleted agent installer configuration';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'deleting agent installer configuration';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get configs
   *
   * @private
   * @memberof AgentBuilderChooserComponent
   */
  private api_agent_get_configs_(): void {
    this.agent_builder_service_.agent_get_configs()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: AgentInstallerConfigurationClass[]) => {
          this.set_agent_installer_configuration_mat_table_data_(response);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving agent installer configurations';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get ip target list
   *
   * @private
   * @param {boolean} [refresh=false]
   * @memberof AgentBuilderChooserComponent
   */
  private api_agent_get_ip_target_list_(refresh: boolean = false): void {
    this.agent_builder_service_.agent_get_ip_target_list()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: IPTargetListClass[]) => {
          if (refresh &&
              ObjectUtilitiesClass.notUndefNull(this.ip_target_configs_mat_table_data) &&
              ObjectUtilitiesClass.notUndefNull(this.ip_target_configs_mat_table_data.data)) {
            const ip_target_configs_data_keys: string[] = Object.keys(this.ip_target_configs_mat_table_data.data);
            ip_target_configs_data_keys.forEach((k: string) => {
              const ip_target_list: IPTargetListClass = this.ip_target_configs_mat_table_data.data[k]['config'];
              for (const updated_ip_target_list of response) {
                /* istanbul ignore else */
                if (ip_target_list._id === updated_ip_target_list._id) {
                  this.update_ip_targets_list_targets_(ip_target_list, updated_ip_target_list);
                  break;
                }
              }
            });

            this.host_tables_.forEach((table: MatTable<HostClass>) => table.renderRows());
          } else {
            this.set_ip_target_config_mat_table_data_(response);
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving ip target configurations';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to post save ip target list
   *
   * @private
   * @param {IPTargetListInterface} ip_target_list
   * @memberof AgentBuilderChooserComponent
   */
  private api_agent_save_ip_target_list_(ip_target_list: IPTargetListClass): void {
    this.agent_builder_service_.agent_save_ip_target_list(ip_target_list)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: IPTargetListClass[]) => {
          this.set_ip_target_config_mat_table_data_(response);
          const message: string = 'saved ip target configuration';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'saving ip target configuration';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to post add host to ip target list
   *
   * @private
   * @param {IPTargetListClass} ip_target_list
   * @param {HostInterface} host
   * @param {MatTableDataSource<HostClass>} host_list
   * @memberof AgentBuilderChooserComponent
   */
  private api_agent_add_host_to_ip_target_list_(ip_target_list: IPTargetListClass, host: HostInterface, host_list: MatTableDataSource<HostClass>): void {
    this.agent_builder_service_.agent_add_host_to_ip_target_list(ip_target_list._id, host)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: IPTargetListClass) => {
          const response_targets: HostClass[] = response.targets;
          let targets: HostClass[] = [];
          let distinct: HostClass[] = [];

          if (ObjectUtilitiesClass.notUndefNull(ip_target_list.targets)) {
            targets = ip_target_list.targets;
            distinct = targets.concat(response_targets).filter(this.is_host_index_zero_);
            host_list.data = distinct;
            ip_target_list.targets = distinct;
          } else {
            host_list.data = response_targets;
            ip_target_list.targets = response_targets;
          }
          const message: string = 'added host to ip target configuration';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
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

  /**
   * Used for making api rest call to post remove host from ip target list
   *
   * @private
   * @param {IPTargetListClass} ip_target_list
   * @param {HostInterface} host
   * @param {MatTableDataSource<HostClass>} host_list
   * @param {number} host_index
   * @memberof AgentBuilderChooserComponent
   */
  private api_agent_remove_host_from_ip_target_list(ip_target_list: IPTargetListClass, host: HostInterface, host_list: MatTableDataSource<HostClass>, host_index: number): void {
    this.agent_builder_service_.agent_remove_host_from_ip_target_list(ip_target_list._id, host)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          const new_host_list: HostClass[] = host_list.data.filter((_h: HostClass, index: number) => index !== host_index);
          host_list.data = new_host_list;
          ip_target_list.targets = new_host_list;
          this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
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

  /**
   * Used for making api rest call to delet ip target list
   *
   * @private
   * @param {IPTargetListClass} ip_target_list
   * @memberof AgentBuilderChooserComponent
   */
  private api_delete_ip_target_list_(ip_target_list: IPTargetListClass): void {
    this.agent_builder_service_.agent_delete_ip_target_list(ip_target_list.name)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: IPTargetListClass[]) => {
          this.set_ip_target_config_mat_table_data_(response);
          const message: string = 'deleted ip target configuration';
          this.mat_snackbar_service_.generate_return_success_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'deleting ip target configuration';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to post agents install
   *
   * @private
   * @param {AgentInterface} agent_interface
   * @memberof AgentBuilderChooserComponent
   */
  private api_agents_install_(agent_interface: AgentInterface): void {
    this.agent_builder_service_.agents_install(agent_interface)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'initiating install task for an unknown reason';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to post agents uninstall
   *
   * @private
   * @param {AgentInterface} agent_interface
   * @memberof AgentBuilderChooserComponent
   */
  private api_agents_uninstall_(agent_interface: AgentInterface): void {
    this.agent_builder_service_.agents_uninstall(agent_interface)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'executing uninstall action as this Agent is already uninstalled on target host';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to post agent uninstall
   *
   * @private
   * @param {AgentTargetInterface} agent_target
   * @memberof AgentBuilderChooserComponent
   */
  private api_agent_uninstall_(agent_target: AgentTargetInterface): void {
    this.agent_builder_service_.agent_uninstall(agent_target)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'executing uninstall action as this Agent is already uninstalled on target host';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to post agent reinstall
   *
   * @private
   * @param {AgentTargetInterface} agent_target
   * @memberof AgentBuilderChooserComponent
   */
  private api_agent_reinstall_(agent_target: AgentTargetInterface): void {
    this.agent_builder_service_.agent_reinstall(agent_target)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SuccessMessageClass) => {
          this.mat_snackbar_service_.displaySnackBar(response.success_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'initiating reinstall task for an unknown reason';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get app configs
   *
   * @private
   * @memberof AgentBuilderChooserComponent
   */
  private api_get_app_configs_(): void {
    this.agent_builder_service_.get_app_configs()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: AppConfigClass[]) => {
          this.app_configs = response;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving app configs';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}

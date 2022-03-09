import { StepperSelectionEvent } from '@angular/cdk/stepper/stepper';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  CONTINUE_DIALOG_OPTION,
  DIALOG_HEIGHT_90VH,
  DIALOG_WIDTH_35PERCENT,
  DIALOG_WIDTH_80VW,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK,
  TAKE_ME_BACK_DIALOG_OPTION
} from '../../../../../../src/app/constants/cvah.constants';
import {
  NGXMonacoTextEditorComponent,
} from '../../../../../../src/app/modules/ngx-monaco-text-editor/ngx-monaco-text-editor.component';
import { MatSnackBarService } from '../../../../../../src/app/services/mat-snackbar.service';
import {
  ChartClass,
  ChartInfoClass,
  ErrorMessageClass,
  FormControlClass,
  GenericJobAndKeyClass,
  IFACEStateClass,
  NodeClass,
  ObjectUtilitiesClass,
  SavedValueClass,
  StatusClass
} from '../../../../classes';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import {
  CatalogHelmActionInterface,
  ConfirmDialogMatDialogDataInterface,
  GenerateFileInterface,
  ProcessFromFormGroupInterface,
  TextEditorConfigurationInterface
} from '../../../../interfaces';
import { CatalogService } from '../../../../services/catalog.service';
import { SortingService } from '../../../../services/sorting.service';
import { ToolsService } from '../../../../tools-form/services/tools.service';
import {
  CLOSE_CONFIRM_ACTION_CONFIGURATION,
  DEPLOYED,
  HOST_BINDING_CLASS_CATALOG_PAGE_COMPONENT,
  INSTALL,
  PROCESS_LIST,
  REINSTALL,
  ROUTE_REGEX_END,
  ROUTER_CATALOG,
  SENSOR_VALUE,
  SERVER_ANY_VALUE,
  SERVER_VALUE,
  SERVICE_VALUE,
  UNINSTALL,
  UNKNOWN,
  UPDATE_CONFIRM_ACTION_CONFIGURATION
} from '../../constants/catalog.constants';
import { CheckboxDependentApp, FormControlDependentApps, ProcessInterface } from '../../interfaces';

/**
 * Component used for configuring, installing, reinstalling and uninstalling application
 *
 * @export
 * @class CatalogPageComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-catalog-page',
  templateUrl: './catalog-page.component.html',
  styleUrls: [
    './catalog-page.component.scss'
  ],
})
export class CatalogPageComponent implements OnInit {
  // Used for setting the host binding class
  @HostBinding('class') private catalog_page_component_class_: string;
  // Used for specifing that the stepper is to be linear
  is_linear: boolean;
  // used for checking if data matches server any value
  server_any_value: string;
  // Used for gathering user inputs for process
  process_form_group: FormGroup;
  // Used for gathering user inputs for config
  config_form_group: FormGroup;
  // Used for gathering user input for values
  value_form_group: FormGroup;
  // Used for storing current node list
  node_list: NodeClass[];
  // Used for storing the current list of processes and children under each process
  process_list: ProcessInterface[];
  // Used for storing the chart info
  chart_info: ChartInfoClass;
  // Used for storing nodes
  nodes: NodeClass[];
  // Used for storing saved values if already installed
  private saved_values_: SavedValueClass[];
  // Used for storing the statuses of current apps
  private statuses_: StatusClass[];
  // Used for storing current config array
  private config_array_: any[];
  // Used for storing if service node is available
  private service_node_available_: boolean;
  // Used for storing current sensor interface states
  private sensor_interface_states_: Partial<any>;

  /**
   * Creates an instance of CatalogPageComponent.
   *
   * @param {ChangeDetectorRef} change_detector_ref_
   * @param {FormBuilder} form_builder_
   * @param {Router} router_
   * @param {MatDialog} mat_dialog_
   * @param {CatalogService} catalog_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {SortingService} sorting_service_
   * @param {ToolsService} tools_service_
   * @memberof CatalogPageComponent
   */
  constructor(private change_detector_ref_: ChangeDetectorRef,
              private form_builder_: FormBuilder,
              private router_: Router,
              private mat_dialog_: MatDialog,
              private catalog_service_: CatalogService,
              private mat_snackbar_service_: MatSnackBarService,
              private sorting_service_: SortingService,
              private tools_service_: ToolsService) {
    this.catalog_page_component_class_ = HOST_BINDING_CLASS_CATALOG_PAGE_COMPONENT;
    this.is_linear = true;
    this.server_any_value = SERVER_ANY_VALUE;
    this.value_form_group = new FormGroup({});
    this.process_list = PROCESS_LIST.map((process: ProcessInterface) => ObjectUtilitiesClass.create_deep_copy<ProcessInterface>(process));
    this.node_list = [];
    this.config_array_ = [];
    this.service_node_available_ = false;
    this.sensor_interface_states_ = {};
  }

  /**
   * Used for setting up subscriptions
   *
   * @memberof CatalogPageComponent
   */
  ngOnInit(): void {
    const application: string[] = this.router_.url.match(ROUTE_REGEX_END);
    if (!ObjectUtilitiesClass.notUndefNull(application)) {
      this.navigate_to_catalog();
    } else {
      this.api_get_chart_info_(application[0]);
    }
  }

  /**
   * Used for navigating router_ back to catalog application selection
   *
   * @memberof CatalogPageComponent
   */
  navigate_to_catalog(): void {
    this.router_.navigate([ROUTER_CATALOG]);
  }

  /**
   * Used for handeling operation when stpper changes step
   *
   * @param {StepperSelectionEvent} stepper_selection_event
   * @memberof CatalogPageComponent
   */
  selection_change_stepper(stepper_selection_event: StepperSelectionEvent): void {
    if (stepper_selection_event.selectedIndex === 1) { // Configuration Overview
      this.server_any_value_check_();
      /* istanbul ignore else */
      if (this.is_config_ready()) {
        this.initialize_config_form_group_();
      }
    } else if (stepper_selection_event.selectedIndex === 2) { // Values File Overview
      this.get_values_file_();
    } else {
      this.initialize_process_form_group_();
    }
  }

  /**
   * Used for handeling operation when process has changed
   *
   * @memberof CatalogPageComponent
   */
  selection_change_process(): void {
    /* istanbul ignore else */
    if (this.process_form_group.controls['selectedProcess'].valid) {
      this.process_form_group.controls['selectedNodes'].enable();
      /* istanbul ignore else */
      if (this.process_form_group.controls['node_affinity'].value !== this.server_any_value) {
        this.process_form_group.controls['selectedNodes'].setValidators([Validators.required]);
        this.process_form_group.controls['selectedNodes'].updateValueAndValidity();
      }
    }
  }

  /**
   * Used for filtering the nodes based on the process type
   *
   * @param {*} input
   * @returns
   * @memberof CatalogPageComponent
   */
  filter_nodes_by_process(selected_process: string): NodeClass[] {
    this.process_list.forEach((process: ProcessInterface) => {
      /* istanbul ignore else */
      if (process.process === selected_process) {
        this.node_list = process.children;
      }
    });

    return this.node_list;
  }

  /**
   * Used for gathering checkbox value on non checkbox related values
   *
   * @param {NodeClass} node
   * @param {FormControlClass} form_control
   * @return {*}  {boolean}
   * @memberof CatalogPageComponent
   */
  checkbox_value(node: NodeClass, form_control: FormControlClass): boolean {
    const hostname_form_group: FormGroup = this.config_form_group.controls[node.hostname] as FormGroup;
    const control_value: boolean = hostname_form_group.controls[form_control.name].value;

    return control_value === form_control.trueValue;
  }

  /**
   * Used for setting checkbox value on non checkbox related values
   *
   * @param {NodeClass} node
   * @param {FormControlClass} form_control
   * @memberof CatalogPageComponent
   */
  checkbox_set_value(node: NodeClass, form_control: FormControlClass): void {
    const hostname_form_group: FormGroup = this.config_form_group.controls[node.hostname] as FormGroup;
    const control_form_control: AbstractControl = hostname_form_group.controls[form_control.name];

    if (control_form_control.value) {
      control_form_control.setValue(form_control.trueValue);
    } else {
      control_form_control.setValue(form_control.falseValue);
    }
  }

  /**
   * Used to see if form control is invalid
   *
   * @param {*} node
   * @param {*} form_control
   * @returns {boolean}
   * @memberof CatalogPageComponent
   */
  is_form_control_invalid(node: NodeClass, form_control: FormControlClass): boolean {
    const hostname_form_group: FormGroup = this.config_form_group.controls[node.hostname] as FormGroup;

    return hostname_form_group.controls[form_control.name].invalid;
  }

  /**
   * Used to see if config ready can be displayed based on criteria
   *
   * @returns {boolean}
   * @memberof CatalogPageComponent
   */
  is_config_ready(): boolean {
    return (this.process_form_group.getRawValue().selectedProcess === INSTALL || this.process_form_group.getRawValue().selectedProcess === REINSTALL) &&
           (this.process_form_group.getRawValue().selectedNodes.length !== 0 || this.chart_info.node_affinity === this.server_any_value);
  }

  /**
   * Used to check a sensor interface
   *
   * @param {string} hostname
   * @param {string} iface
   * @return {*}  {boolean}
   * @memberof CatalogPageComponent
   */
  check_interface(hostname: string, iface: string): boolean {
    return (hostname in this.sensor_interface_states_) &&
           (!this.sensor_interface_states_[hostname][iface]['link_up']);
  }

  /**
   * Used to check a form group
   *
   * @param {FormGroup} form_group
   * @return {*}  {boolean}
   * @memberof CatalogPageComponent
   */
  check_form_group(form_group: FormGroup): boolean {
    return ObjectUtilitiesClass.notUndefNull(form_group) &&
           Object.keys(form_group.controls).length > 0;
  }

  /**
   * Used to get error message from form control
   *
   * @param {*} form_control
   * @returns {string}
   * @memberof CatalogPageComponent
   */
  get_error_message(form_control: FormControlClass): string {
    return form_control.error_message;
  }

  /**
   * Used to get the iface states
   *
   * @memberof CatalogPageComponent
   */
  get_iface_states(): void {
    this.process_form_group.getRawValue().selectedNodes.forEach((node: NodeClass) => {
      /* istanbul ignore else */
      if (node.node_type === SENSOR_VALUE) {
        this.api_get_iface_states_(node);
      }
    });
  }

  /**
   * Used to get the label or placeholder for a form control
   *
   * @param {string} control_name
   * @return {*}  {string}
   * @memberof CatalogPageComponent
   */
  get_label_or_placeholder(control_name: string): string {
    return control_name.replace(/([a-z](?=[A-Z]))/g, '$1_').toLowerCase().split('_')
                       .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  /**
   * Used to get the value from value_form_group using a deployment_name
   *
   * @param {NodeClass} node
   * @return {*}  {string}
   * @memberof CatalogPageComponent
   */
  get_value_form_group_json_object(node: NodeClass): string {
    return this.value_form_group.controls[node.deployment_name].value;
  }

  /**
   * Used for opening a text editor to manualy change value_form_group value
   *
   * @param {NodeClass} node
   * @memberof CatalogPageComponent
   */
  open_text_editor(node: NodeClass): void {
    const text_editor_configuration: TextEditorConfigurationInterface = {
      show_options: true,
      is_read_only: false,
      title: `Advanced Configuration: ${this.chart_info.id.charAt(0).toUpperCase() + this.chart_info.id.slice(1)}`,
      text: this.get_value_form_group_json_object(node),
      use_language: 'json',
      confirm_save: UPDATE_CONFIRM_ACTION_CONFIGURATION,
      confirm_close: CLOSE_CONFIRM_ACTION_CONFIGURATION
    };
    const mat_dialog_ref: MatDialogRef<NGXMonacoTextEditorComponent, any> = this.mat_dialog_.open(NGXMonacoTextEditorComponent, {
      height: DIALOG_HEIGHT_90VH,
      width: DIALOG_WIDTH_80VW,
      disableClose: true,
      data: text_editor_configuration,
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          /* istanbul ignore else */
          if (ObjectUtilitiesClass.notUndefNull(response)) {
            this.value_form_group.controls[node.deployment_name].setValue(response);
          }
        });
  }

  /**
   * Used for running a chart action
   *
   * @memberof CatalogPageComponent
   */
  run_chart_action(): void {
    const catalog_helm_action: CatalogHelmActionInterface = {
      role: this.chart_info.id,
      process: this.process_form_group.getRawValue() as ProcessFromFormGroupInterface
    };
    switch (this.process_form_group.getRawValue().selectedProcess) {
      case INSTALL:
        catalog_helm_action.values = this.make_values_array_();
        this.api_catalog_install_(catalog_helm_action);
        break;
      case REINSTALL:
        catalog_helm_action.values = this.make_values_array_();
        this.api_catalog_reinstall_(catalog_helm_action);
        break;
      case UNINSTALL:
        this.server_any_value_check_();
        this.set_deployment_name_();
        catalog_helm_action.process = this.process_form_group.getRawValue() as ProcessFromFormGroupInterface;
        this.api_catalog_uninstall_(catalog_helm_action);
        break;
      default:
        this.navigate_to_catalog();
    }
  }

  /**
   * Used to see if the chart is a 'Server - Any' affinity, if it is then the node it will use is master server.
   *
   * @memberof CatalogPageComponent
   */
  private server_any_value_check_(): void {
    /* istanbul ignore else */
    if (this.chart_info.node_affinity === this.server_any_value) {
      const selected_nodes: NodeClass[] = [];
      this.nodes.forEach((nodes: NodeClass) => {
        /* istanbul ignore else */
        if (nodes.node_type === 'Control-Plane') {
          nodes.hostname = SERVER_VALUE.toLowerCase();
          selected_nodes.push(nodes);
          this.process_form_group.controls['selectedNodes'].setValue(selected_nodes);
        }
      });
    }
  }

  /**
   * Used for makeing the value array so it can send it to the backend the way they want it
   *
   * @returns {Array<any>}
   * @memberof CatalogPageComponent
   */
  private make_values_array_(): any[] {
    this.process_form_group.getRawValue().selectedNodes.forEach((node: NodeClass) => {
      this.value_form_group.controls[node.deployment_name].disable();
      const hostname_ctrl: Object = this.value_form_group.controls[node.deployment_name].value;
      this.value_form_group.controls[node.deployment_name].setValue(JSON.parse(hostname_ctrl.toString()));
    });
    const value_form_group_keys: string[] = Object.keys(this.value_form_group.getRawValue());

    return value_form_group_keys.map((key: string) => {
      const deployment_name_object: Object = this.value_form_group.getRawValue()[key];
      const object: Object = {};
      object[key] = deployment_name_object;

      return object;
    });
  }

  /**
   * Used for resetting the config for group
   *
   * @private
   * @memberof CatalogPageComponent
   */
  private reset_config_form_group_(): void {
    if (ObjectUtilitiesClass.notUndefNull(this.config_form_group)) {
      const config_form_group_control_keys: string[] = Object.keys(this.config_form_group.controls);
      config_form_group_control_keys.forEach((key: string) => this.config_form_group.removeControl(key));
      this.config_form_group.markAsPristine();
    } else {
      this.config_form_group = new FormGroup({});
    }
  }

  /**
   * Used for handeling checkbox dependent apps
   *
   * @private
   * @param {string} hostname
   * @param {CheckboxDependentApp} checkbox_dependent_apps
   * @memberof CatalogPageComponent
   */
  private handle_checkbox_dependent_apps_(hostname: string, checkbox_dependent_apps: CheckboxDependentApp): void {
    const hostname_form_group: FormGroup = this.config_form_group.controls[hostname] as FormGroup;
    const control_name_keys: string[] = Object.keys(checkbox_dependent_apps);

    control_name_keys.forEach((key: string) => this.check_chart_dependencies_(key, checkbox_dependent_apps[key], hostname_form_group));
  }

  /**
   * Used for parseing out the domain on the deployment name so that Kubernetes doesnt crash
   *
   * @param {string} application
   * @param {string} node_hostname
   * @returns {string}
   * @memberof CatalogPageComponent
   */
  private get_deployment_name_(application: string, node_hostname: string, value?: Object): string {
    const new_hostname: string = node_hostname.split('.')[0];
    const deployment_name: string = this.chart_info.node_affinity === this.server_any_value ?
                                      application : `${new_hostname}-${application}`;

    return ObjectUtilitiesClass.notUndefNull(value) &&
           ObjectUtilitiesClass.notUndefNull(value['deployment_name']) &&
           value['deployment_name'] !== deployment_name ?
             value['deployment_name'] : deployment_name;
  }

  /**
   * Used for creating the form controls for application
   *
   * @private
   * @param {*} form_control
   * @param {string} hostname
   * @param {FormGroup} [value]
   * @returns {FormControl}
   * @memberof CatalogPageComponent
   */
  private get_form_control_(form_control: FormControlClass, hostname: string, value?: Object): FormControl {
    const valid_control: boolean = ObjectUtilitiesClass.notUndefNull(value) && ObjectUtilitiesClass.notUndefNull(value[form_control.name]);
    switch (form_control.type) {
      case 'textinput':
        return new FormControl(valid_control ? value[form_control.name] : form_control.default_value, this.get_validators_(form_control));
      case 'textbox':
        return new FormControl(valid_control ? value[form_control.name] : form_control.default_value, this.get_validators_(form_control));
      case 'textinputlist':
        if (value === undefined || typeof value[form_control.name] === 'string') {
          return new FormControl(valid_control ? value[form_control.name] : form_control.default_value, this.get_validators_(form_control));
        } else {
          return new FormControl(valid_control ? JSON.stringify(value[form_control.name]) : form_control.default_value, this.get_validators_(form_control));
        }
      case 'invisible':
        return new FormControl(valid_control ? value[form_control.name] : hostname);
      case 'checkbox':
        return new FormControl(valid_control ? value[form_control.name] : form_control.default_value);
      case 'interface':
        return new FormControl(valid_control ? value[form_control.name] : [], this.get_validators_(form_control));
      case 'suricata-list':
        return new FormControl(valid_control ? value[form_control.name] : form_control.default_value, this.get_validators_(form_control));
      case 'zeek-list':
        return new FormControl(valid_control ? value[form_control.name] : form_control.default_value, this.get_validators_(form_control));
      case 'service-node-checkbox':
        return new FormControl({ value: valid_control ? value[form_control.name] : this.service_node_available_, disabled: !this.service_node_available_ }, this.get_validators_(form_control));
      default:
        return new FormControl([]);
    }
  }

  /**
   * Used for getting validators for a form form_control
   *
   * @private
   * @param {*} form_control
   * @returns {ValidatorFn}
   * @memberof CatalogPageComponent
   */
  private get_validators_(form_control: FormControlClass): ValidatorFn {
    return Validators.compose([
      ObjectUtilitiesClass.notUndefNull(form_control.regexp) ? Validators.pattern(form_control.regexp) : Validators.nullValidator,
      ObjectUtilitiesClass.notUndefNull(form_control.required) && form_control.required ? Validators.required : Validators.nullValidator
    ]);
  }

  /**
   * Used to get the values files by sending the info from the first 3 stepper pages.
   *
   * @memberof CatalogPageComponent
   */
  private get_values_file_(): void {
    const config_form_group_keys: string[] = Object.keys(this.config_form_group.getRawValue());
    this.config_array_ = config_form_group_keys.map((key: string) => {
      const object: Object = {};
      object[key] = this.config_form_group.getRawValue()[key];
      /* istanbul ignore else */
      if (ObjectUtilitiesClass.notUndefNull(object[key]['home_net']) &&
          object[key]['home_net'] !== '') {
        object[key]['home_net'] = JSON.parse(object[key]['home_net']);
      }
      /* istanbul ignore else */
      if (ObjectUtilitiesClass.notUndefNull(object[key]['external_net']) &&
          object[key]['external_net'] !== '') {
        object[key]['external_net'] = JSON.parse(object[key]['external_net']);
      }

      return object;
    });
    if (ObjectUtilitiesClass.notUndefNull(this.saved_values_)) {
      this.saved_values_.forEach((saved_value: SavedValueClass) => {
        this.process_form_group.getRawValue().selectedNodes.forEach((node: NodeClass) => {
          if (saved_value.values['node_hostname'] === node.hostname ||
              this.chart_info.node_affinity === this.server_any_value) {
            this.compare_values_();
          } else {
            this.api_generate_values_file_();
          }
        });
      });
    } else {
      this.api_generate_values_file_();
    }
  }

  /**
   * Used for initializing process form group
   *
   * @private
   * @memberof CatalogPageComponent
   */
  private initialize_process_form_group_(): void {
    const process_form_group: FormGroup = this.form_builder_.group({
      'selectedProcess': new FormControl({ value: '', disabled: true }, Validators.required),
      'selectedNodes': new FormControl({ value: [], disabled: true }),
      'node_affinity': new FormControl(this.chart_info.node_affinity)
    });
    this.set_process_form_group_(process_form_group);
  }

  /**
   * Used for initializing config form group
   *
   * @memberof CatalogPageComponent
   */
  private initialize_config_form_group_() {
    let form_control_dependent_apps: FormControlDependentApps;
    this.reset_config_form_group_();
    this.process_form_group.getRawValue().selectedNodes.forEach((node: NodeClass) => {
      this.set_deployment_name_();
      if (ObjectUtilitiesClass.notUndefNull(this.saved_values_)) {
        this.saved_values_.forEach((saved_value: SavedValueClass) => {
          /* istanbul ignore else */
          if (saved_value.values['node_hostname'] === node.hostname) {
            form_control_dependent_apps = this.initialize_config_form_control(node.hostname, saved_value.values);
          }
        });
      } else {
        form_control_dependent_apps = this.initialize_config_form_control(node.hostname);
      }
      this.config_form_group.addControl(node.hostname, form_control_dependent_apps.form_controls_form_group);
      this.handle_checkbox_dependent_apps_(node.hostname, form_control_dependent_apps.checkbox_dependent_apps);
    });
    this.change_detector_ref_.detectChanges();
  }

  /**
   * Used to build the config form form_control from the values received in the get chart_infos
   *
   * @param {string} hostname
   * @param {FormGroup} [value]
   * @returns {FormGroup}
   * @memberof CatalogPageComponent
   */
  private initialize_config_form_control(hostname: string, value?: Object): FormControlDependentApps {
    const checkbox_dependent_app: CheckboxDependentApp = {};
    const form_controls_form_group: FormGroup = this.form_builder_.group({});

      /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(this.chart_info.formControls)) {
      this.chart_info.formControls.forEach((form_control: FormControlClass) => {
        /* istanbul ignore else */
        if (form_control.type === 'checkbox' && ObjectUtilitiesClass.notUndefNull(form_control.dependent_app)) {
          checkbox_dependent_app[form_control.name] = form_control.dependent_app;
        }
        form_controls_form_group.addControl(form_control.name, this.get_form_control_(form_control, hostname, value));
      });
    }
    // Disabled the field because the user does not really need to change this.
    // Allowing them to change it causes breakages in other locations of the code.
    const deployment_name: string = this.get_deployment_name_(this.chart_info.id, hostname, value);
    const deployment_name_form_control: FormControl = new FormControl({ value: deployment_name, disabled: true });
    form_controls_form_group.addControl('deployment_name', deployment_name_form_control);
    const form_control_dependent_apps: FormControlDependentApps = {
      form_controls_form_group: form_controls_form_group,
      checkbox_dependent_apps: checkbox_dependent_app
    };

    return form_control_dependent_apps;
  }

  /**
   * Used for setting the process form group
   *
   * @private
   * @param {FormGroup} process_form_group
   * @memberof CatalogPageComponent
   */
  private set_process_form_group_(process_form_group: FormGroup): void {
    this.process_form_group = process_form_group;
    this.change_detector_ref_.detectChanges();
  }

  /**
   * Used to set the values on the value_form_group
   *
   * @param {*} ob
   * @param {*} nodes
   * @memberof CatalogPageComponent
   */
  private set_value_form_group_(hostname_object: Object, node: NodeClass): void {
    const values: string = JSON.stringify(hostname_object, undefined, 2);
    const deployment_name: string = hostname_object['deployment_name'];
    if (ObjectUtilitiesClass.notUndefNull(this.value_form_group)) {
      const form_control: AbstractControl = this.value_form_group.controls[deployment_name];
      if (!ObjectUtilitiesClass.notUndefNull(form_control)) {
        this.value_form_group.addControl(deployment_name, new FormControl(values));
        this.value_form_group.controls[deployment_name].disable();
      } else {
        form_control.setValue(values);
      }
    } else {
      this.value_form_group = new FormGroup({});
      this.value_form_group.addControl(deployment_name, new FormControl(values));
      this.value_form_group.controls[deployment_name].disable();
    }
    node.deployment_name = deployment_name;
  }

  /**
   * Used to add the deployment name in for the uninstall
   *
   * @memberof CatalogPageComponent
   */
  private set_deployment_name_(): void {
    this.process_form_group.getRawValue().selectedNodes.forEach((node: NodeClass) => {
      this.statuses_.forEach((status: StatusClass) => {
        /* istanbul ignore else */
        if (status.hostname === node.hostname || status.hostname === null) {
          node.deployment_name = status.deployment_name;
        }
      });
    });
  }

  /**
   * Used for setting the process list children
   *
   * @private
   * @param {NodeClass[]} nodes
   * @returns {ProcessInterface[]}
   * @memberof CatalogPageComponent
   */
  private set_process_list_children_(nodes: NodeClass[]): ProcessInterface[] {
    this.nodes = nodes.sort(this.sorting_service_.node_alphanum);
    let child_status: string;
    this.nodes.forEach((node: NodeClass) => {
      node.status = this.statuses_.filter((status: StatusClass) => node.hostname === status.hostname || node.hostname.includes(status.hostname))[0];
      /* istanbul ignore else */
      if (this.chart_info.node_affinity.includes(node.node_type) ||
          (this.chart_info.node_affinity === this.server_any_value &&
           node.node_type === SERVER_VALUE)) {
        child_status = ObjectUtilitiesClass.notUndefNull(node.status) ? node.status.status : UNKNOWN;
        this.set_children_(child_status, node);
      }
      /* istanbul ignore else */
      if (node.node_type === SERVICE_VALUE) {
        this.service_node_available_ = true;
      }
    });

    return this.process_list.filter((process: ProcessInterface) => process.children.length > 0);
  }

  /**
   * Used for setting a node as a child for a matching process
   *
   * @private
   * @param {string} status
   * @param {NodeClass} node
   * @memberof CatalogPageComponent
   */
  private set_children_(status: string, node: NodeClass): void {
    switch(status) {
      case DEPLOYED:
        this.process_list.forEach((process: ProcessInterface) => {
                                    /* istanbul ignore else */
                                    if (process.process !== INSTALL) {
                                      process.children.push(node);
                                      process.children = [...new Map(process.children.map((item: NodeClass) => [item._id, item])).values()];
                                    }
                                    return process;
                                  });
        break;
      case UNKNOWN:
        this.process_list.forEach((process: ProcessInterface) => {
                                    /* istanbul ignore else */
                                    if ((process.process !== REINSTALL) &&
                                        (process.process !== UNINSTALL)) {
                                      process.children.push(node);
                                      process.children = [...new Map(process.children.map((item: NodeClass) => [item._id, item])).values()];
                                    }
                                    return process;
                                  });
        break;
      default:
        this.process_list.forEach((process: ProcessInterface) => {
                                    process.children.push(node);
                                    process.children = [...new Map(process.children.map((item: NodeClass) => [item._id, item])).values()];
                                    return process;
                                  });
        break;
    }
    this.process_form_group.controls['selectedProcess'].enable();
  }

  /**
   * Used for creating object from saved values (reinstall) it will call and get the saved values and compare them to
   * the config_array_ and come out with a new object that is merged
   *
   * @memberof CatalogPageComponent
   */
  private compare_values_(): void {
    this.process_form_group.getRawValue().selectedNodes.forEach((node: NodeClass) => {
      this.saved_values_.forEach((saved_value: SavedValueClass) => {
        this.config_array_.forEach((config: Object) => {
          /* istanbul ignore else */
          if ((config[node.hostname] !== undefined &&
              (config[node.hostname].node_hostname === saved_value.values['node_hostname'] &&
               saved_value.values['node_hostname'] === node.hostname &&
               node.hostname === config[node.hostname].node_hostname )) ||
              (this.chart_info.node_affinity === this.server_any_value)) {
            const values: Object = saved_value.values;
            const config_object: Object = config[node.hostname];
            const value_object: Object = Object.assign({}, values, config_object);
            this.set_value_form_group_(value_object, node);
          }
        });
      });
    });
  }

  /**
   * Used for opening mat dialog to confirm continue or navigate to catalog
   *
   * @private
   * @memberof CatalogPageComponent
   */
  private open_confirm_mat_dialog_(): void {
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: `${this.chart_info.id} is dependent on ${this.chart_info.devDependent}`,
      message: `This chart is dependent on ${this.chart_info.devDependent} and it is not installed, are you sure you want to continue.`,
      option1: TAKE_ME_BACK_DIALOG_OPTION,
      option2: CONTINUE_DIALOG_OPTION
    };
    const mat_dialog_ref: MatDialogRef<ConfirmDialogComponent, any> = this.mat_dialog_.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH_35PERCENT,
      data: confirm_dialog,
    });

    mat_dialog_ref.afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: string) => {
          if (response === TAKE_ME_BACK_DIALOG_OPTION) {
            this.navigate_to_catalog();
          } else {
            this.api_get_chart_statuses_();
          }
        });
  }

  /**
   * Used for making api rest call to get catalog nodes
   *
   * @private
   * @memberof CatalogPageComponent
   */
  private api_get_catalog_nodes_(): void {
    this.catalog_service_.get_catalog_nodes()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: NodeClass[]) => {
          this.process_list = this.set_process_list_children_(response);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting kit nodes';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get chart info
   *
   * @private
   * @param {string} application
   * @memberof CatalogPageComponent
   */
  private api_get_chart_info_(application: string): void {
    this.catalog_service_.get_chart_info(application)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: ChartInfoClass) => {
          this.chart_info = response;
          // checks to see if there is a dependent on the chart_info (ie need another chart_info installed first to work)
          if (ObjectUtilitiesClass.notUndefNull(this.chart_info.devDependent)) {
            this.api_get_chart_statuses_(ObjectUtilitiesClass.notUndefNull(this.chart_info.devDependent));
            this.api_get_chart_statuses_();
          } else {
            this.api_get_chart_statuses_();
          }
          this.initialize_process_form_group_();
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting chart info';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get chart statuses
   *
   * @private
   * @param {boolean} [chart_info_dev_dependent=false]
   * @memberof CatalogPageComponent
   */
  private api_get_chart_statuses_(chart_info_dev_dependent: boolean = false): void {
    const pass_value: string = chart_info_dev_dependent ? this.chart_info.devDependent : this.chart_info.id;
    this.catalog_service_.get_chart_statuses(pass_value)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: StatusClass[]) => {
          if (chart_info_dev_dependent && response.length === 0) {
            this.open_confirm_mat_dialog_();
          } else {
            /* istanbul ignore else */
            if (!chart_info_dev_dependent) {
              this.statuses_ = response;
              this.api_get_catalog_nodes_();
              this.api_get_saved_values_();
            }
          }
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting chart statuses';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

    /**
   * Used for checking chart dependencies using get_all_application_statuses api
   * @private
   * @param {string} [key]
   * @param {string} [checkbox_dependent_app]
   * @param {FormGroup} [hostname_form_group]
   * @memberof CatalogPageComponent
   */
  private check_chart_dependencies_( key: string, checkbox_dependent_app: string, hostname_form_group: FormGroup): void {
      this.catalog_service_.get_all_application_statuses()
      .pipe(untilDestroyed(this))
      .subscribe(values => {
        const appValues = values.filter((value: ChartClass)  => value.application === checkbox_dependent_app).map((node: ChartClass) => node.nodes )[0];
        if(ObjectUtilitiesClass.notUndefNull(appValues) && appValues.length > 0 && appValues[0].status === "DEPLOYED"){
          hostname_form_group.controls[key].enable();
        }
        else {
          hostname_form_group.controls[key].setValue(false);
          hostname_form_group.controls[key].disable();
        }
      });
  }

  /**
   * Used for making api rest call to get saved values
   *
   * @private
   * @memberof CatalogPageComponent
   */
  private api_get_saved_values_(): void {

    this.catalog_service_.get_saved_values(this.chart_info.id)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: SavedValueClass[]) => {
          this.saved_values_ = response.length > 0 ? response : null;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting saved values';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to generate values file
   *
   * @private
   * @memberof CatalogPageComponent
   */
  private api_generate_values_file_(): void {
    const generate_file: GenerateFileInterface = {
      role: this.chart_info.id,
      process: this.process_form_group.getRawValue(),
      configs: this.config_array_
    };
    this.catalog_service_.generate_values_file(generate_file)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: Object[]) => {
          this.process_form_group.getRawValue().selectedNodes.forEach((node: NodeClass) => {
            response.forEach((object: Object) => {
              const hostname_object: Object = ObjectUtilitiesClass.return_object_key_value(object, node.hostname);
              /* istanbul ignore else */
              if (hostname_object !== null) {
                this.set_value_form_group_(hostname_object, node);
              }
            });
          });
        },
        (error: HttpErrorResponse) => {
          const message: string = 'generating values file';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to catalog install
   *
   * @private
   * @param {CatalogHelmActionInterface} catalog_helm_action
   * @memberof CatalogPageComponent
   */
  private api_catalog_install_(catalog_helm_action: CatalogHelmActionInterface): void {
    this.catalog_service_.catalog_install(catalog_helm_action)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          this.mat_snackbar_service_.displaySnackBar(`${this.chart_info.id} Installation Queued`, MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK);
          this.navigate_to_catalog();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `catalog application ${this.chart_info.id} install`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to catalog reinstall
   *
   * @private
   * @param {CatalogHelmActionInterface} catalog_helm_action
   * @memberof CatalogPageComponent
   */
  private api_catalog_reinstall_(catalog_helm_action: CatalogHelmActionInterface): void {
    this.catalog_service_.catalog_reinstall(catalog_helm_action)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          this.mat_snackbar_service_.displaySnackBar(`${this.chart_info.id} Reinstallation Queued`, MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK);
          this.navigate_to_catalog();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `catalog application ${this.chart_info.id} reinstall`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to catalog uninstall
   *
   * @private
   * @param {CatalogHelmActionInterface} catalog_helm_action
   * @memberof CatalogPageComponent
   */
  private api_catalog_uninstall_(catalog_helm_action: CatalogHelmActionInterface): void {
    this.catalog_service_.catalog_uninstall(catalog_helm_action)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: GenericJobAndKeyClass) => {
          this.mat_snackbar_service_.displaySnackBar(`${this.chart_info.id} Uninstall Queued`, MAT_SNACKBAR_CONFIGURATION_60000_DUR_OK);
          this.navigate_to_catalog();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = `catalog application ${this.chart_info.id} uninstall`;
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }

  /**
   * Used for making api rest call to get iface states
   *
   * @private
   * @param {NodeClass} node
   * @memberof CatalogPageComponent
   */
  private api_get_iface_states_(node: NodeClass): void {
    this.tools_service_.get_iface_states(node.hostname)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: IFACEStateClass[]) => {
          const ifaces: Object = {};
          response.forEach((iface_state: IFACEStateClass) => ifaces[iface_state.name] = iface_state);
          this.sensor_interface_states_[node.hostname] = ifaces;
        },
        (error: HttpErrorResponse) => {
          const message: string = 'getting interface states';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}

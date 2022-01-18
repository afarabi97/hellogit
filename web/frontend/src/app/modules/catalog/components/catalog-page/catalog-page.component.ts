import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';

import { ChartInfoClass, NodeClass, ObjectUtilitiesClass, StatusClass } from '../../../../classes';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import {
  CatalogHelmActionInterface,
  ConfirmDialogMatDialogDataInterface,
  GenerateFileInterface,
  ProcessFromFormGroupInterface
} from '../../../../interfaces';
import { CatalogService } from '../../../../services/catalog.service';
import { SortingService } from '../../../../services/sorting.service';
import { ToolsService } from '../../../../tools-form/services/tools.service';
import { DEPLOYED, INSTALL, PROCESS_LIST, REINSTALL, UNINSTALL, UNKNOWN } from '../../constants/catalog.constants';
import { ProcessInterface } from '../../interfaces';

@Component({
  selector: 'app-catalog-page',
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.scss'],
  host: {
    'class': 'app-catalog-page'
  }
})
export class CatalogPageComponent implements OnInit, AfterViewInit {
  readonly serverAnyValue = 'Server - Any';
  readonly serverValue = 'Server';
  readonly route_regex_end = '([^\/]+$)';
  processFormGroup: FormGroup;
  configFormGroup: FormGroup;
  valueFormGroup: FormGroup;
  nodeList: NodeClass[] = [];
  isReady: boolean;
  isLoading: boolean;
  processList: ProcessInterface[];
  chart: ChartInfoClass;
  nodes: NodeClass[];
  isAdvance: boolean;
  content: any;
  savedValues: any;
  statuses: StatusClass[];
  configArray: any[] = [];
  gip_number: string;
  isServiceNodeAvailable: boolean;
  sensorInterfaceStates: Partial<any> = {};

  /**
   *Creates an instance of CatalogPageComponent.
   * @param {MatDialogRef<CatalogPageComponent>} dialogRef
   * @param {Chart} chart
   * @param {FormBuilder} _formBuilder
   * @param {CatalogService} _CatalogService
   * @param {ChangeDetectorRef} cdRef
   * @param {MatSnackBar} snackBar
   * @memberof CatalogPageComponent
   */
  constructor(private _formBuilder: FormBuilder,
              private _CatalogService: CatalogService,
              private cdRef: ChangeDetectorRef,
              private router: Router,
              private snackBar: MatSnackBar,
              public dialog: MatDialog,
              private sortSvc: SortingService,
              private toolsSrv: ToolsService) {
    this.isReady = false;
    this.isLoading = true;
    this.isAdvance = false;
    this.isServiceNodeAvailable = false;
    this.processList = PROCESS_LIST.map((p: ProcessInterface) => {
      p.children = [];
      return p;
    });
    this.configFormGroup = new FormGroup({});
    this.valueFormGroup =  new FormGroup({});
  }

  /**
   * creates the processList, gets the statuses
   *
   * @memberof CatalogPageComponent
   */
  ngOnInit() {
    const application: string[] = this.router.url.match(this.route_regex_end);
    if (application.length === 0) {
      this.navigateToCatalog();
    } else {
      this._CatalogService.get_chart_info(application[0]).subscribe((response: ChartInfoClass) => {
        this.chart = response;
        this.isDevDependent();

        this._CatalogService.get_chart_statuses(this.chart.id).subscribe((statusGroup: StatusClass[]) => {
          this.statuses = statusGroup;
          this.manageState_();
        });

        this._CatalogService.get_saved_values(this.chart.id).subscribe(values => {
          this.savedValues = values.length !== 0 ? values : null;
        });

        if(this.chart.node_affinity === this.serverAnyValue) {
          this.setupServiceNode();
        }
        this.processFormGroup = this._formBuilder.group({
          'selectedProcess': new FormControl('', Validators.required),
          'selectedNodes': new FormControl({value: [], disabled: true}),
          'node_affinity': new FormControl(this.chart.node_affinity)
        });
        this.cdRef.detectChanges();
      });
    }
  }

  /**
   * Used for navigating router back to catalog page
   *
   * @memberof CatalogPageComponent
   */
  navigateToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  /**
   * checks to see if there is a dependent on the chart (ie need another chart installed first to work)
   *
   * @memberof CatalogPageComponent
   */
  isDevDependent() {
    if(this.chart.devDependent) {
      this._CatalogService.get_chart_statuses(this.chart.devDependent).subscribe(status => {
        if(status.length === 0 ) {
          const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
            title: `${this.chart.id} is dependent on ${this.chart.devDependent}`,
            message: `This chart is dependent on ${this.chart.devDependent} and it is not installed, are you sure you want to continue.`,
            option1: 'Take Me Back',
            option2: 'Continue'
          };
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '35%',
            data: confirm_dialog,
          });

          dialogRef.afterClosed().subscribe(result => {
            if( result === confirm_dialog.option1) {
              this.navigateToCatalog();
            }
          });
        }
      });
    }
  }

  /**
   * does a change detection after every viewInit
   *
   * @memberof CatalogPageComponent
   */
  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  /**
   * enables and disables the value configurations text area boxes
   *
   * @param {*} sensor
   * @memberof CatalogPageComponent
   */
  AdvanceConfiguration(sensor) {
    if (this.valueFormGroup.controls[sensor.deployment_name].disabled) {
      this.valueFormGroup.controls[sensor.deployment_name].enable();
    } else {
      this.valueFormGroup.controls[sensor.deployment_name].disable();
    }
  }

  /**
   * filters the nodes based on the process type
   *
   * @param {*} input
   * @returns
   * @memberof CatalogPageComponent
   */
  filterByInput(selectedProcess: string) {
    this.processList.forEach((p: ProcessInterface) => {
      if (p.process === selectedProcess) {
        this.nodeList = p.children;
      }
    });
    return this.nodeList;
  }

  /**
   * tells the stepper to go back
   *
   * @param {MatStepper} stepper
   * @memberof CatalogPageComponent
   */
  goBack(stepper: MatStepper) {
    stepper.previous();
  }

  selectProcessChange() {
    if(this.processFormGroup.get("selectedProcess").valid) {
      this.processFormGroup.get("selectedNodes").enable();
      if (this.processFormGroup.get("node_affinity").value !== this.serverAnyValue) {
        this.processFormGroup.get("selectedNodes").setValidators([Validators.required]);
      }
    }
  }

  /**
   * tells the stepper to go forward
   *
   * @param {MatStepper} stepper
   * @memberof CatalogPageComponent
   */
  goForward(stepper: MatStepper) {
    stepper.next();
  }

  /**
   * tells the stepper to go forward
   *
   * @memberof CatalogPageComponent
   */
  getConfig(stepper: MatStepper) {
    this.serverAny();
    if (this.configReady()) {
      this.makeFormgroup();
      stepper.next();
    }
  }

  /**
   * testing to see if the chart is a "Server - Any" affinity, if it is then the node it will use is master server.
   *
   * @memberof CatalogPageComponent
   */
  serverAny() {
    if(this.chart.node_affinity === this.serverAnyValue) {
      this.nodes.map( node => {
        if (node.node_type === 'Control-Plane') {
          node.hostname = "server";
          this.processFormGroup.get("selectedNodes").setValue([]);
          const selectedNodes = this.processFormGroup.get("selectedNodes").value;
          selectedNodes.push(node);
        }
      });
    }
  }

  /**
   * This is a function called from the html, i slipt the next button
   * is that its easier to manage in the code
   *
   * @param {MatStepper} stepper
   * @memberof CatalogPageComponent
   */
  getValues(stepper: MatStepper) {
    const callBackFunction: () => void = function(): void {
                                          stepper.next();
                                        };
    // TODO - dirty fix, need something better
    setTimeout(callBackFunction, 1000);
  }

  /**
   * gets the values files by sending the info from the first 3 stepper pages.
   *
   * @memberof CatalogPageComponent
   */
  getValuesFile() {
    const configArray = [];
    Object.keys(this.configFormGroup.getRawValue()).map( key => {
      const hostname = this.configFormGroup.getRawValue()[key];
      const object = {};
      object[key] = hostname;
      if(object[key].home_net) {
        object[key].home_net = JSON.parse(object[key].home_net);
      }
      if(object[key].external_net) {
        object[key].external_net = JSON.parse(object[key].external_net);
      }
      configArray.push(object);
    });
    this.configArray = configArray;
    if(this.savedValues !== null) {
      this.savedValues.map( values => {
        this.processFormGroup.getRawValue().selectedNodes.map( nodes => {
          if (values.values.node_hostname === nodes.hostname || this.chart.node_affinity === this.serverAnyValue) {
            this.compareValues();
          } else {
            this.getValuesCall();
          }
        });
      });
    } else {
      this.getValuesCall();
    }

    setTimeout(() => {
      this.isAdvance = true;
    }, 1000);

  }

  /**
   * if there are no saved values (install) it will call and get the values file
   *
   * @memberof CatalogPageComponent
   */
  getValuesCall() {
    const generate_values_file: GenerateFileInterface = {
      role: this.chart.id,
      process: this.processFormGroup.getRawValue(),
      configs: this.configArray
    };
    this._CatalogService.generate_values_file(generate_values_file).subscribe(data => {
      this.content = data;
        this.processFormGroup.getRawValue().selectedNodes.map(nodes => {
          this.content.map( value => {
            const ob = this.getMapValue(value, nodes.hostname);
            if (ob !== null) {
              this.setValues(ob, nodes);
            }
          });
        });
    });
  }

  /**
   * if there is saved values (reinstall) it will call and get the saved values and compare them to the configArray and come out with a new object that is merged
   *
   * @memberof CatalogPageComponent
   */
  compareValues() {
    this.processFormGroup.getRawValue().selectedNodes.map(nodes => {
      this.savedValues.map( deployments => {
        this.configArray.map( configs => {
          if( (configs[nodes.hostname] !== undefined &&
              (configs[nodes.hostname].node_hostname === deployments.values.node_hostname &&
              deployments.values.node_hostname === nodes.hostname &&
              nodes.hostname === configs[nodes.hostname].node_hostname ))
              || this.chart.node_affinity === this.serverAnyValue) {
            const savedObj = deployments.values;
            const configObj = configs[nodes.hostname];
            const ob = Object.assign({}, savedObj, configObj);
            this.setValues(ob, nodes);
          }
        });
      });
    });
  }

  /**
   * sets the values on the valueFormGroup
   *
   * @param {*} ob
   * @param {*} nodes
   * @memberof CatalogPageComponent
   */
  setValues(ob: any, nodes: any) {
    const values = JSON.stringify(ob, undefined, 2);
    const formControl = this.valueFormGroup.get(ob.deployment_name);
    if (!formControl) {
      this.valueFormGroup.addControl(ob.deployment_name, new FormControl(values));
      this.valueFormGroup.controls[ob.deployment_name].disable();
    } else {
      formControl.setValue(values);
    }
    nodes.deployment_name = ob.deployment_name;
  }

  /**
   * gets the values out of an object
   *
   * @param {*} obj
   * @param {*} key
   * @returns
   * @memberof CatalogPageComponent
   */
  getMapValue(obj, key) {
    if (obj.hasOwnProperty(key)) {
       return obj[key];
    } else {
      return null;
    }
  }

  /**
   * makes the formgroup for configFormGroup
   *
   * @memberof CatalogPageComponent
   */
  makeFormgroup() {
    const controlKeys: string[] = Object.keys(this.configFormGroup.controls);
    controlKeys.forEach((k: string) => this.configFormGroup.removeControl(k));
    this.configFormGroup.markAsPristine();
    this.processFormGroup.getRawValue().selectedNodes.map(nodes => {
      let nodeControls;
      this.addDeploymentName();
      if(this.savedValues !== null) {
        let obj;
        this.savedValues.map(value => {
          if( value.values.node_hostname === nodes.hostname) {
            obj = value.values;
          }
        });
          nodeControls = this.initConfigFormControl(nodes.hostname, obj);
      } else {
        nodeControls = this.initConfigFormControl(nodes.hostname);
      }
      this.configFormGroup.addControl(nodes.hostname, nodeControls);
    });
    this.cdRef.detectChanges();
  }

  /**
   * runs the chart
   *
   * @memberof CatalogPageComponent
   */
  runChart() {
    const catalog_helm_action: CatalogHelmActionInterface = new Object() as CatalogHelmActionInterface;
    catalog_helm_action.role = this.chart.id;
    catalog_helm_action.process = this.processFormGroup.getRawValue() as ProcessFromFormGroupInterface;
    switch (this.processFormGroup.getRawValue().selectedProcess) {
      case 'install':
        catalog_helm_action.values = this.makeValueArray();
        this._CatalogService.catalog_install(catalog_helm_action)
          .subscribe(_data => this.snackBar.open(`${this.chart.id} Installation Queued`, 'OK', { duration: 5000 }));
        break;
      case 'uninstall':
        this.serverAny();
        this.addDeploymentName();
        catalog_helm_action.process = this.processFormGroup.getRawValue() as ProcessFromFormGroupInterface;
        this._CatalogService.catalog_uninstall(catalog_helm_action)
          .subscribe(_data => this.snackBar.open(`${this.chart.id} Uninstall Queued`, 'OK', { duration: 5000 }));
        break;
      case 'reinstall':
        catalog_helm_action.values = this.makeValueArray();
        this._CatalogService.catalog_reinstall(catalog_helm_action)
          .subscribe(_data => this.snackBar.open(`${this.chart.id} Reinstallation Queued`, 'OK', { duration: 5000 }));
        break;
      default:
    }
    this.navigateToCatalog();
  }


  /**
   * makes the value array so i can send it to the backend the way they want it
   *
   * @returns {Array<any>}
   * @memberof CatalogPageComponent
   */
  makeValueArray(): Array<any> {
    this.processFormGroup.getRawValue().selectedNodes.map((node: NodeClass) => {
      this.valueFormGroup.controls[node.deployment_name].disable();
      const hostname_ctrl: Object = this.valueFormGroup.controls[node.deployment_name].value;
      this.valueFormGroup.controls[node.deployment_name].setValue(JSON.parse(hostname_ctrl.toString()));
    });

    return Object.keys(this.valueFormGroup.getRawValue()).map( key => {
      const deployment_name = this.valueFormGroup.getRawValue()[key];
      const object = {};
      object[key] = deployment_name;

      return object;
    });
  }


  /**
   * adds the deployment name in for the uninstall
   *
   * @memberof CatalogPageComponent
   */
  addDeploymentName() {
    this.processFormGroup.getRawValue().selectedNodes.map((nodes: NodeClass) => {
      this.statuses.map( value => {
        if(value.hostname === nodes.hostname || value.hostname === null) {
          nodes.deployment_name = value.deployment_name;
        }
      });
    });
  }

  /**
   * builds the config form control from the values received in the get charts
   *
   * @param {string} hostname
   * @param {FormGroup} [value]
   * @returns {FormGroup}
   * @memberof CatalogPageComponent
   */
  initConfigFormControl(hostname: string, value?: FormGroup): FormGroup {
    const nodeControls: FormGroup = this._formBuilder.group({});
    if (this.chart.formControls) {
      this.chart.formControls.map( control => {
        nodeControls.addControl(control.name, this.getFormControl_(control, hostname, value));
      });
    }
    const deploymentName = this.makeRegexGreatAgain(this.chart.id, hostname, value);
    const deployment_ctrl = new FormControl(deploymentName);
    // Disabled the field because the user does not really need to change this.
    // Allowing them to change it causes breakages in other locations of the code.
    deployment_ctrl.disable();
    nodeControls.addControl("deployment_name", deployment_ctrl);

    return nodeControls;
  }

  setupServiceNode() {
    this._CatalogService.get_kit_nodes().subscribe(nodes => {
      this.nodes = nodes;
      this.nodes.map(node => {
          if (node.node_type === "Service") {
            this.isServiceNodeAvailable = true;
          }
      });
    });
  }
  /**
   * parses out the domain on the deployment name so that Kubernetes doesnt crash
   *
   * @param {string} application
   * @param {string} node_hostname
   * @returns {string}
   * @memberof CatalogPageComponent
   */
  makeRegexGreatAgain(application: string, node_hostname: string, value?: any): string {
    const new_hostname = node_hostname.split('.')[0];
    const deployment_name = this.chart.node_affinity === this.serverAnyValue ? application : `${new_hostname}-${application}`;

    return ObjectUtilitiesClass.notUndefNull(value) && value.deployment_name !== deployment_name && value.deployment_name ?
             value.deployment_name : deployment_name;
  }

  /**
   * retuyrns true if we can show the configuration step
   *
   * @returns {boolean}
   * @memberof CatalogPageComponent
   */
  configReady(): boolean {
    this.isReady = (this.processFormGroup.getRawValue().selectedProcess === 'install' || this.processFormGroup.getRawValue().selectedProcess === 'reinstall') &&
                   (this.processFormGroup.getRawValue().selectedNodes.length !== 0 || this.chart.node_affinity === this.serverAnyValue);

    return this.isReady;
  }

  /**
   * Gets the error message of the control
   *
   * @param {*} control
   * @returns {string}
   * @memberof CatalogPageComponent
   */
  getErrorMessage(control): string {
    return control.error_message;
  }

  /**
   * returns a true if the form is invalid
   *
   * @param {*} node
   * @param {*} control
   * @returns {boolean}
   * @memberof CatalogPageComponent
   */
  isInvalidForm(node, control): boolean {
    const hostname_ctrl = this.configFormGroup.controls[node.hostname] as FormGroup;
    return hostname_ctrl.controls[control.name].invalid;
  }

  checkboxValue(node, control) {
    const hostname_ctrl = this.configFormGroup.controls[node.hostname] as FormGroup;
    const controlValue = hostname_ctrl.controls[control.name].value;
    return controlValue === control.trueValue ? true : false;
  }

  checkboxSetValue(node, control) {
    const hostname_ctrl = this.configFormGroup.controls[node.hostname] as FormGroup;
    const controlValue = hostname_ctrl.controls[control.name];

    if( controlValue.value ) {
      controlValue.setValue(control.trueValue);
    }
    if( !controlValue.value ) {
      controlValue.setValue(control.falseValue);
    }
  }

  selectionChange(event) {
    if (event.selectedIndex === 1){ // Configuration Overview
      this.serverAny();
      if (this.configReady()) {
        this.makeFormgroup();
      }
    } else if (event.selectedIndex === 2){ // Values File Overview
      this.getValuesFile();
    }
  }

  getInterfaceDetails(){
    for (const node of this.processFormGroup.getRawValue().selectedNodes){
      if(node["node_type"] === "Sensor"){
        this.toolsSrv.getIfaceStates(node["hostname"]).subscribe((data: any[]) => {
          const ifaces = {};
          for (const iface of data){
            ifaces[iface["name"]] = {"state": iface["state"], "link_up": iface["link_up"]};
          }
          this.sensorInterfaceStates[node['hostname']] = ifaces;
        });
      }
    }
  }

  checkInterface(hostname, iface){
    if (hostname in this.sensorInterfaceStates){
      if (!this.sensorInterfaceStates[hostname][iface]['link_up']) {
        return true;
      }
    }
    return false;
  }

  createInputPlacehoder(control_name: string) {
    const string = control_name.replace(/([a-z](?=[A-Z]))/g, '$1_').toLowerCase().split('_')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return string;
  }

  /**
   * Used for setting the install, reinstall, uninstall capability for an application
   *
   * @private
   * @memberof CatalogPageComponent
   */
  private manageState_(): void {
    this._CatalogService.get_kit_nodes().subscribe((nodes: NodeClass[]) => {
      this.processList = this.setProcessListChildren_(nodes);
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
  private setProcessListChildren_(nodes: NodeClass[]): ProcessInterface[] {
    this.nodes = nodes;
    let status: string;
    this.nodes.sort(this.sortSvc.node_alphanum);
    this.nodes.forEach((node: NodeClass) => {
      node.status = this.statuses.filter((sc: StatusClass) => node.hostname === sc.hostname || node.hostname.includes(sc.hostname))[0];
      if (this.chart.node_affinity.includes(node.node_type) || (this.chart.node_affinity === this.serverAnyValue && node.node_type === this.serverValue)) {
        status = ObjectUtilitiesClass.notUndefNull(node.status) ? node.status.status : UNKNOWN;
        this.setChildren_(status, node);
      }
    });

    return this.processList.filter((p: ProcessInterface) => p.children.length > 0);
  }

  /**
   * Sets a node as a child for a matching process
   *
   * @private
   * @param {string} status
   * @param {NodeClass} node
   * @memberof CatalogPageComponent
   */
  private setChildren_(status: string, node: NodeClass): void {
    switch(status) {
      case DEPLOYED:
        this.processList = this.processList.map((p: ProcessInterface) => {
                                              if (p.process !== INSTALL) {
                                                p.children.push(node);
                                              }
                                              return p;
                                            });
        break;
      case UNKNOWN:
        this.processList = this.processList.map((p: ProcessInterface) => {
                                              if (p.process !== REINSTALL && p.process !== UNINSTALL) {
                                                p.children.push(node);
                                              }
                                              return p;
                                            });
        break;
      default:
        this.processList = this.processList.map((p: ProcessInterface) => {
                                              p.children.push(node);
                                              return p;
                                            });
        break;
    }
  }

  /**
   * Used for creating the form controls for application
   *
   * @private
   * @param {*} control
   * @param {string} hostname
   * @param {FormGroup} [value]
   * @returns {FormControl}
   * @memberof CatalogPageComponent
   */
  private getFormControl_(control, hostname: string, value?: FormGroup): FormControl {
    const valid_control = ObjectUtilitiesClass.notUndefNull(value) && ObjectUtilitiesClass.notUndefNull(value[control.name]);
    switch (control.type) {
      case 'textinput':
        return new FormControl(valid_control ? value[control.name] : control.default_value, this.getValidators_(control));
      case 'textbox':
        return new FormControl(valid_control ? value[control.name] : control.default_value, this.getValidators_(control));
      case 'textinputlist':
        if (value === undefined || typeof value[control.name] === "string") {
          return new FormControl(valid_control ? value[control.name] : control.default_value, this.getValidators_(control));
        } else {
          return new FormControl(valid_control ? JSON.stringify(value[control.name]) : control.default_value, this.getValidators_(control));
        }
      case 'invisible':
        return new FormControl(valid_control ? value[control.name] : hostname);
      case 'checkbox':
        const checkboxformControl = new FormControl(valid_control ? value[control.name] : control.default_value);
        if(ObjectUtilitiesClass.notUndefNull(control.dependent_app)) {
          let appValues;
          this._CatalogService.get_saved_values(control.dependent_app).subscribe(values => {
            appValues = values.length !== 0 ? values : null;
            if(appValues != null) {
              checkboxformControl.enable();
            } else {
              checkboxformControl.setValue(false);
              checkboxformControl.disable();
            }
            return checkboxformControl;
          });
        }
        return checkboxformControl;
      case 'interface':
        const formControl: FormControl = new FormControl([]);
        if (valid_control) {
          formControl.setValue(value[control.name], { onlySelf: true } );
        }
        return formControl;
      case 'suricata-list':
        const suricataControl: FormControl = new FormControl(control.default_value);
        if (valid_control) {
          suricataControl.setValue(value[control.name], { onlySelf: true } );
        }
        return suricataControl;
      case 'zeek-list':
        const zeekControl: FormControl = new FormControl(control.default_value);
        if (valid_control) {
          zeekControl.setValue(value[control.name], { onlySelf: true } );
        }
        return zeekControl;
      case 'service-node-checkbox':
        return new FormControl({ value: this.isServiceNodeAvailable, disabled: !this.isServiceNodeAvailable });
      default:
        return new FormControl([]);
    }
  }

  /**
   * Used for getting validators for a form control
   *
   * @private
   * @param {*} control
   * @returns {ValidatorFn}
   * @memberof CatalogPageComponent
   */
  private getValidators_(control): ValidatorFn {
    return Validators.compose([
      ObjectUtilitiesClass.notUndefNull(control.regexp) ? Validators.pattern(control.regexp) : Validators.nullValidator,
      control.required ? Validators.required : Validators.nullValidator
    ]);
  }
}

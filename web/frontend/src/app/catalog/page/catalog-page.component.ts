import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';

import { NodeClass, ObjectUtilitiesClass, StatusClass } from '../../classes';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import { SortingService } from '../../services/sorting.service';
import { DEPLOYED, INSTALL, PROCESS_LIST, REINSTALL, UNINSTALL, UNKNOWN } from '../constants/catalog.constants';
import { ProcessInterface } from '../interface';
import { ChartInfo } from '../interface/chart.interface';
import { CatalogService } from '../services/catalog.service';

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
  processFormGroup: FormGroup;
  configFormGroup: FormGroup;
  valueFormGroup: FormGroup;
  nodeList: NodeClass[] = [];
  isReady: boolean;
  isLoading: boolean;
  processList: ProcessInterface[];
  chart: ChartInfo;
  nodes: NodeClass[];
  isAdvance: boolean;
  content: any;
  savedValues: any;
  statuses: StatusClass[];
  configArray: any[] = [];
  kafkaArray: any[] = [];
  cortexDisable: boolean;
  mispDisable: boolean;
  hiveDisable: boolean;
  gip_number: string;

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
              private sortSvc: SortingService) {
    this.isReady = false;
    this.isLoading = true;
    this.isAdvance = false;
    this.cortexDisable = true;
    this.mispDisable = true;
    this.hiveDisable = true;
    this.processList = PROCESS_LIST.map((p: ProcessInterface) => {
      p.children = [];
      return p;
    });
    this.processFormGroup = this._formBuilder.group({
      'selectedProcess': new FormControl('', Validators.required),
      'selectedNodes': new FormControl({value: [], disabled: true}),
      'node_affinity': new FormControl('')
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
    if(this._CatalogService.chart === undefined) {
      this.navigateToCatalog();
    } else {
      this.chart = this._CatalogService.chart;
      this.isDevDependent();

      this._CatalogService.getByString(`chart/${this.chart.id}/status`).subscribe((statusGroup: StatusClass[]) => {
        this.statuses = statusGroup;
        this.manageState_();
      });

      this._CatalogService.getByString(`${this.chart.id}/saved_values`).subscribe(values => {
        this.savedValues = values.length !== 0 ? values : null;
      });

      if (this.chart.id === "squid") {
        this._CatalogService.getNodes().subscribe(nodes => {
          this.gip_number = nodes[0].ip_address.split('.')[1];
        });
      }
      if(this.chart.id === "hive") {
        this.setupCortex();
        this.setupMisp();
      }
      if(this.chart.id === "misp") {
        this.setupCortex();
      }
    }
  }

  /**
   * Used for naviagting router back to catalog page
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
      this._CatalogService.getByString(`chart/${this.chart.devDependent}/status`).subscribe(status => {
        if(status.length === 0 ) {
          const message = `This chart is dependent on ${this.chart.devDependent} and it is not installed, are you sure you want to continue.`;
          const title = `${this.chart.id} is dependent on ${this.chart.devDependent}`;
          const option1 = "Take Me Back";
          const option2 = "Continue ";
          const dialogRef = this.dialog.open(ConfirmDailogComponent, {
            width: '35%',
            data: {"paneString": message, "paneTitle": title, "option1": option1, "option2": option2},
          });

          dialogRef.afterClosed().subscribe(result => {
            if( result === option1) {
              this.navigateToCatalog();
            }
          });
        }
      });
      if(this.chart.devDependent === "zeek") {
        this.setupKafkaArray();
      }
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
    this.valueFormGroup.controls[sensor.deployment_name].disabled ?
                                   this.valueFormGroup.controls[sensor.deployment_name].enable() :
                                   this.valueFormGroup.controls[sensor.deployment_name].disable();
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
        if (node.is_master_server === true) {
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
    this.getValuesFile();
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
    Object.keys(this.configFormGroup.value).map( key => {
      const hostname = this.configFormGroup.value[key];
      const object = {};
      object[key] = hostname;
      if(object[key].home_net) {
        object[key].home_net = JSON.parse(object[key].home_net);
      }
      if(object[key].external_net) {
        object[key].external_net = JSON.parse(object[key].external_net);
      }
      if(object[key].kafka_clusters) {
        object[key].kafka_clusters = JSON.parse(object[key].kafka_clusters);
      }
      configArray.push(object);
    });
    this.configArray = configArray;
    if(this.savedValues !== null) {
      this.savedValues.map( values => {
        this.processFormGroup.value.selectedNodes.map( nodes => {
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
    this._CatalogService.getValuesFile(this.chart.id, this.processFormGroup.value, this.configArray).subscribe(data => {
      this.content = data;
        this.processFormGroup.value.selectedNodes.map(nodes => {
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
    this.processFormGroup.value.selectedNodes.map(nodes => {
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
      this.valueFormGroup.controls[ob.deployment_name].disable()
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
    this.processFormGroup.value.selectedNodes.map(nodes => {
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
    switch (this.processFormGroup.value.selectedProcess) {
      case 'install':
        this._CatalogService.installHelm(this.chart.id, this.processFormGroup.value, this.makeValueArray())
          .subscribe(_data => this.snackBar.open(`${this.chart.id} Installation Queued`, 'OK', { duration: 5000 }));
        break;
      case 'uninstall':
        this.serverAny();
        this.addDeploymentName();
        this._CatalogService.deleteHelm(this.chart.id, this.processFormGroup.value)
          .subscribe(_data => this.snackBar.open(`${this.chart.id} Deletetion Queued`, 'OK', { duration: 5000 }));
        break;
      case 'reinstall':
        this._CatalogService.reinstallHelm(this.chart.id, this.processFormGroup.value, this.makeValueArray())
          .subscribe(_data => this.snackBar.open(`${this.chart.id} Reinstallation Queued`, 'OK', { duration: 5000 }));
        break;
      default:
    }
    this.navigateToCatalog();
    this._CatalogService.isLoading = false;
  }


  /**
   * makes the value array so i can send it to the backend the way they want it
   *
   * @returns {Array<any>}
   * @memberof CatalogPageComponent
   */
  makeValueArray(): Array<any> {
    this.processFormGroup.controls['node_affinity'].setValue(this.chart.node_affinity);
    this.processFormGroup.value.selectedNodes.map((node: NodeClass) => {
      this.valueFormGroup.controls[node.deployment_name].disable();
      const hostname_ctrl: Object = this.valueFormGroup.controls[node.deployment_name].value;
      this.valueFormGroup.controls[node.deployment_name].setValue(JSON.parse(hostname_ctrl.toString()));
    });

    return Object.keys(this.valueFormGroup.value).map( key => {
      const deployment_name = this.valueFormGroup.value[key];
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
    this.processFormGroup.value.selectedNodes.map(nodes => {
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
    nodeControls.addControl("deployment_name", new FormControl(deploymentName));

    if (this.chart.id === "squid") {
      nodeControls.addControl("jdms_gip_number", new FormControl(this.gip_number));
    }

    return nodeControls;
  }

  setupKafkaArray() {
    const array = [];

    this._CatalogService.getByString("zeek/saved_values").subscribe(values => {
      if(values !== null) {
        values.map( value => {
          const val = `${value.deployment_name}.default.svc.cluster.local:9092`;
          array.push(val);
        });
      }
    });
    this.kafkaArray = array;
  }

  setupCortex() {
    let cortexValues;

    this._CatalogService.getByString("cortex/saved_values").subscribe(values => {
      cortexValues = values.length !== 0 ? values : null;
      if(cortexValues != null) {
        this.cortexDisable = false;
      }
    });
  }

  setupMisp() {
    let mispValues;

    this._CatalogService.getByString("misp/saved_values").subscribe(values => {
      mispValues = values.length !== 0 ? values : null;
      if(mispValues != null) {
        this.mispDisable = false;
      }
    });
  }

  setupHive() {
    let hiveValues;

    this._CatalogService.getByString("hive/saved_values").subscribe(values => {
      hiveValues = values.length !== 0 ? values : null;
      if(hiveValues != null) {
        this.hiveDisable = false;
      }
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

    return ObjectUtilitiesClass.notUndefNull(value) && value.deployment_name !== deployment_name ?
             value.deployment_name : deployment_name;
  }

  /**
   * retuyrns true if we can show the configuration step
   *
   * @returns {boolean}
   * @memberof CatalogPageComponent
   */
  configReady(): boolean {
    this.isReady = (this.processFormGroup.value.selectedProcess === 'install' || this.processFormGroup.value.selectedProcess === 'reinstall') &&
                   (this.processFormGroup.value.selectedNodes.length !== 0 || this.chart.node_affinity === this.serverAnyValue);

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
    if( controlValue.value === true) {
      controlValue.setValue(control.trueValue);
    } else {
      controlValue.setValue(control.falseValue);
    }
  }

  /**
   * Used for setting the install, reinstall, uninstall capability for an application
   *
   * @private
   * @memberof CatalogPageComponent
   */
  private manageState_(): void {
    this._CatalogService.getNodes().subscribe((nodes: NodeClass[]) => {
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
      case 'textinputlist':
        if (value === undefined || typeof value[control.name] === "string") {
          return new FormControl(valid_control ? value[control.name] : control.default_value, this.getValidators_(control));
        } else {
          return new FormControl(valid_control ? JSON.stringify(value[control.name]) : control.default_value, this.getValidators_(control));
        }
      case 'invisible':
        return new FormControl(valid_control ? value[control.name] : hostname);
      case 'checkbox':
        return new FormControl(valid_control ? value[control.name] : control.default_value);
      case 'interface':
        const formControl: FormControl = new FormControl([]);
        if (valid_control) {
          formControl.setValue(value[control.name], { onlySelf: true } );
        }
        return formControl;
      case 'kafka-cluster-cluster':
        return new FormControl(JSON.stringify(this.kafkaArray));
      case 'cortex-checkbox':
        return new FormControl({ value: !this.cortexDisable, disabled: this.cortexDisable });
      case 'misp-checkbox':
        return new FormControl({ value: !this.mispDisable, disabled: this.mispDisable });
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

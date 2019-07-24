import {Component, Inject, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import {FormBuilder, FormGroup, Validators, FormControl, FormArray} from '@angular/forms';
import { ChartInfo, INodeInfo } from '../interface/chart.interface';
import { MatStepper } from '@angular/material/stepper';
import { CatalogService, config } from '../services/catalog.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ConfigmapsComponent } from 'src/app/configmaps/configmaps.component';
import { ArchiveSaveDialogComponent } from 'src/app/archive-save-dialog/archive-save-dialog.component';

@Component({
  selector: 'app-catalog-page',
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.scss']
})
export class CatalogPageComponent implements OnInit, AfterViewInit {
  public processFormGroup: FormGroup;
  public configFormGroup: FormGroup;
  public valueFormGroup: FormGroup;
  public nodeList: Array<INodeInfo> = [];
  public isReady: boolean = false;
  public isLoading: boolean = true;
  public processList: Array<any> = [];
  public chart: ChartInfo;
  public nodes: any;
  public isAdvance: boolean = false;
  public content: any;
  public savedValues: any;
  public statuses: any;
  public configArray: Array<any> = [];

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
  constructor(  private _formBuilder: FormBuilder,
                private _CatalogService: CatalogService,
                private cdRef: ChangeDetectorRef,
                private router: Router,
                private snackBar: MatSnackBar,
                public dialog: MatDialog, ) {

    this.processFormGroup = this._formBuilder.group({
      'selectedProcess': new FormControl(''),
      'selectedNodes': new FormControl([]),
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
      this.router.navigate(['/catalog']);
    } else {
      this.chart = this._CatalogService.chart;
      this.processList = [
      {
        "process": "install",
        "name": "Install",
        "children": []

      },
      {
        "process":"uninstall",
        "name": "Uninstall",
        "children": []
      },
      {
        "process":"reinstall",
        "name": "Reinstall",
        "children": []
      },
      {
        "process":"upgrade",
        "name": "Upgrade",
        "children": []
      }];

      this._CatalogService.getByString("chart/" + this.chart.id + "/status").subscribe(statusGroup => {
        this.statuses = statusGroup;
        // if ( statusGroup.length !== 0) {
        //   statusGroup.map(status => {
        //     this.manageState(status);
        //   });
        // } else {
          this.manageState();
        // }
      });

      this._CatalogService.getByString(this.chart.id + "/saved_values").subscribe(values => {
        this.savedValues = values.length !== 0 ? values : null;
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
    this.valueFormGroup.controls[sensor.deployment_name].disabled ? this.valueFormGroup.controls[sensor.deployment_name].enable() : this.valueFormGroup.controls[sensor.deployment_name].disable();
  }

  /**
   * manages the state of the nodes
   * probably a better way to do this but since micah keeps change
   * it up on me i stopped refactoring and just made it work
   * @param {INodeInfo} node
   * @returns
   * @memberof CatalogPageComponent
   */
  manageState(): void {
    this._CatalogService.getNodes().subscribe(nodes => {
      this.nodes = nodes;
      this.nodes.map( node => {
        this.statuses.map( status => {
          if ( node.hostname === status.hostname) {
            node.status = status;
          }
        });
          if( (this.chart.node_affinity === node.node_type)) {
            let status = node.status ? node.status.status : undefined;
            switch(status) {
              case 'DEPLOYED':
                this.processList.map( process => {
                  switch(process.process) {
                    case 'reinstall':
                      process.children.push(node);
                      break;
                    case 'uninstall':
                      process.children.push(node);
                      break;
                    case 'upgrade':
                      process.children.push(node);
                      break;
                  }
                });
                break;
              case 'UNKNOWN':
              case undefined:
                this.processList.map( process => {
                  switch(process.process) {
                    case 'install':
                      process.children.push(node);
                      break;
                  }
                });
                break;
            }
        }
      });
    });
  }

  /**
   * filters the nodes based on the process type
   *
   * @param {*} input
   * @returns
   * @memberof CatalogPageComponent
   */
  filterByInput(input) {
    this.processList.map(process => {
      if (process.process === input) {
        this.nodeList = process.children;
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
   * @param {MatStepper} stepper
   * @memberof CatalogPageComponent
   */
  getConfig(stepper: MatStepper) {
    this.serverAny();
    this.configReady();
    if (this.isReady == true ) {
      this.makeFormgroup();
    }
    stepper.next();
  }

  /**
   * testing to see if the chart is a "Server - Any" affinity, if it is then the node it will use is master server.
   *
   * @memberof CatalogPageComponent
   */
  serverAny() {
    if(this.chart.node_affinity === "Server - Any") {
      this.nodes.map( node => {
        if (node.is_master_server === true) {
          node.hostname = "server";
          let selectedNodes = this.processFormGroup.get("selectedNodes").value;
          selectedNodes.push(node);
        }
      })
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
    //TODO: dirty fix, need something better
    setTimeout(function(){ stepper.next();}, 1000);
  }

  /**
   * gets the values files by sending the info from the first 3 stepper pages.
   *
   * @memberof CatalogPageComponent
   */
  getValuesFile() {
    let configArray = [];
    Object.keys(this.configFormGroup.value).map( key => {
      let hostname = this.configFormGroup.value[key];
      let object = {};
      object[key] = hostname;
      configArray.push(object);
    });
    this.configArray = configArray;

    if(this.savedValues !== null) {
      this.savedValues.map( values => {
        this.processFormGroup.value.selectedNodes.map( nodes => {
          if (values.values.node_hostname === nodes.hostname || this.chart.node_affinity === "Server - Any") {
            this.compareValues();
          } else {
            this.getValuesCall();
          }
        });
      });
    } else {
      this.getValuesCall();
    }
    this.isAdvance = true;
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
          let ob = this.getMapValue(value, nodes.hostname);
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
              || this.chart.node_affinity === "Server - Any") {
            let savedObj = deployments.values;
            let configObj = configs[nodes.hostname];
            const ob = Object.assign({}, savedObj, configObj);
            this.setValues(ob, nodes);
          }
        })
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
    let values = JSON.stringify(ob, undefined, 2);
    this.valueFormGroup.addControl(ob.deployment_name, new FormControl(values));
    this.valueFormGroup.controls[ob.deployment_name].disable();
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
    let valueArray;
    switch (this.processFormGroup.value.selectedProcess) {
      case 'install':
        valueArray = this.makeValueArray();
        this._CatalogService.installHelm(this.chart.id, this.processFormGroup.value, valueArray).subscribe(data => {
          this.snackBar.open(this.chart.id +  " Installation Queued", 'OK', {
            duration: 5000,
          });
        });
        break;
      case 'uninstall':
        this.serverAny();
        this.addDeploymentName();
        this._CatalogService.deleteHelm(this.chart.id, this.processFormGroup.value).subscribe(data => {
          this.snackBar.open(this.chart.id +  " Deletetion Queued", 'OK', {
            duration: 5000,
          });
        });
        break;
      case 'reinstall':
        valueArray = this.makeValueArray();
        this._CatalogService.reinstallHelm(this.chart.id, this.processFormGroup.value, valueArray).subscribe(data => {
          this.snackBar.open( this.chart.id +  " Reinstallation Queued", 'OK', {
            duration: 5000,
          });
        });
        break;
      default:
    }
    this.router.navigate(['/catalog']);
  }


  /**
   * makes the value array so i can send it to the backend the way they want it
   *
   * @returns {Array<any>}
   * @memberof CatalogPageComponent
   */
  makeValueArray(): Array<any> {
    this.processFormGroup.controls['node_affinity'].setValue(this.chart.node_affinity);
    this.processFormGroup.value.selectedNodes.map(nodes => {
      this.valueFormGroup.controls[nodes.deployment_name].disable();
      let hostname_ctrl = this.valueFormGroup.controls[nodes.deployment_name] as FormGroup;
      let value = hostname_ctrl.value;
      this.valueFormGroup.controls[nodes.deployment_name].setValue(JSON.parse(value));
    });

    let valueArray = [];
    Object.keys(this.valueFormGroup.value).map( key => {
      let deployment_name = this.valueFormGroup.value[key];
      let object = {};
      object[key] = deployment_name;
      valueArray.push(object);
    });
    return valueArray;
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
    let nodeControls = this._formBuilder.group({});
    if (this.chart.formControls) {
      this.chart.formControls.map( control => {
        if (control.type === "textinput" || control.type === "textinputlist" ) {
          nodeControls.addControl(control.name, new FormControl( value ? value[control.name] : control.default_value, Validators.compose([
            control.regexp !== null ? Validators.pattern(control.regexp) : Validators.nullValidator,
            control.required ? Validators.required : Validators.nullValidator])));
        } else if (control.type === "invisible") {
          nodeControls.addControl(control.name, new FormControl( value ? value[control.name] : hostname));
        } else if (control.type === "checkbox") {
          nodeControls.addControl(control.name, new FormControl( value ? value[control.name] : false));
        } else if (control.type === "interface") {
          nodeControls.addControl(control.name, new FormControl([]))
          if(value) {
            nodeControls.controls[control.name].setValue(value[control.name], {onlySelf: true})
          }
        } else {
          nodeControls.addControl(control.name, new FormControl([]))
        }
      });
    }
    let deploymentName = this.makeRegexGreatAgain(this.chart.id, hostname);
    nodeControls.addControl("deployment_name", new FormControl(deploymentName));
    return nodeControls;
  }


  /**
   * parses out the .lan on the deployment name so that kubenetes doesnt crash
   *
   * @param {string} application
   * @param {string} node_hostname
   * @returns {string}
   * @memberof CatalogPageComponent
   */
  makeRegexGreatAgain(application: string, node_hostname: string): string {
    let new_hostname = node_hostname.replace(/\.(lan)?$/, '');
    let deployment_name = new_hostname + '-' + application;
    return deployment_name;
  }

  /**
   * retuyrns true if we can show the configuration step
   *
   * @returns {boolean}
   * @memberof CatalogPageComponent
   */
  configReady(): boolean {
    if ((this.processFormGroup.value.selectedProcess === 'install' || this.processFormGroup.value.selectedProcess === 'reinstall') && (this.processFormGroup.value.selectedNodes.length !== 0 || this.chart.node_affinity === "Server - Any") ) {
      return this.isReady = true;
    } else {
      return this.isReady = false;
    }
  }

  /**
   * Gets the error message of the control
   *
   * @param {*} control
   * @param {string} hostname
   * @returns {string}
   * @memberof CatalogPageComponent
   */
  getErrorMessage(control, hostname: string): string {
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
    let hostname_ctrl = this.configFormGroup.controls[node.hostname] as FormGroup;
    return hostname_ctrl.controls[control.name].invalid;
  }

}

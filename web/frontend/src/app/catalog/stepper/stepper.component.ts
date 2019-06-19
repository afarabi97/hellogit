import {Component, Inject, ChangeDetectorRef } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Chart, INodeInfo } from '../interface/chart.interface';
import { MatStepper } from '@angular/material/stepper';
import { CatalogService } from '../services/catalog.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent {
  processFormGroup: FormGroup;
  configFormGroup: FormGroup;
  nodeList: Array<INodeInfo> = [];
  isReady: boolean = false;
  isLoading: boolean = true;
  processList: Array<any> = [];

  /**
   *Creates an instance of StepperComponent.
   * @param {MatDialogRef<StepperComponent>} dialogRef
   * @param {Chart} chart
   * @param {FormBuilder} _formBuilder
   * @param {CatalogService} _CatalogService
   * @param {ChangeDetectorRef} cdRef
   * @param {MatSnackBar} snackBar
   * @memberof StepperComponent
   */
  constructor(
    public dialogRef: MatDialogRef<StepperComponent>,
    @Inject(MAT_DIALOG_DATA) public chart: Chart,
    private _formBuilder: FormBuilder,
    private _CatalogService: CatalogService,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar ) {}


  /**
   * closes the pane when clicked out of the area
   *
   * @memberof StepperComponent
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * creates the processList, inits process and config formgroup and gets the status
   *
   * @memberof StepperComponent
   */
  ngOnInit() {
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
    this.processFormGroup = this._formBuilder.group({
      'selectedProcess': new FormControl('install'),
      'selectedNodes': new FormControl([]),
    });
    this.configFormGroup = new FormGroup({});

    this._CatalogService.getByString(this.chart.id).subscribe(data => {
      console.log(data);
      this.isLoading = false;
      this.cdRef.detectChanges();
      data.map( node => {
        this.manageState(node);
      }, err => {
        console.log(err);
        this.dialogRef.close();
      });
    });

  }

  /**
   * manages the state of the nodes
   *
   * @param {INodeInfo} node
   * @returns
   * @memberof StepperComponent
   */
  manageState(node: INodeInfo) {
    switch(node.status) {
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
        this.processList.map( process => {
          switch(process.process) {
            case 'install':
              process.children.push(node);
              break;
          }
        });
        break;
    }
    return node;
  }


  /**
   * filters the nodes based on the process type
   *
   * @param {*} input
   * @returns
   * @memberof StepperComponent
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
   * @memberof StepperComponent
   */
  goBack(stepper: MatStepper) {
    stepper.previous();
  }

  /**
   * tells the stepper to go forward
   *
   * @param {MatStepper} stepper
   * @memberof StepperComponent
   */
  goForward(stepper: MatStepper) {
    this.configReady();
    if (this.isReady == true) {
      this.makeFormgroup();
    }
    setTimeout(function(){ stepper.next();}, 0);
  }

  /**
   * makes the formgroup for configFormGroup
   *
   * @memberof StepperComponent
   */
  makeFormgroup() {
    this.processFormGroup.value.selectedNodes.map(nodes => {
      let nodeControls = this.initConfigFormControl(nodes.hostname);
      this.configFormGroup.addControl(nodes.hostname, nodeControls);
    });
  }

  /**
   * runs the chart
   *
   * @memberof StepperComponent
   */
  runChart() {
    switch (this.processFormGroup.value.selectedProcess) {
      case 'install':
        this._CatalogService.installHelm(this.chart.id, this.processFormGroup.value, this.configFormGroup.value).subscribe(data => {
          this.snackBar.open(this.chart.id +  " Installed", 'OK', {
            duration: 5000,
          });
        });
        break;
      case 'uninstall':
        this._CatalogService.deleteHelm(this.chart.id, this.processFormGroup.value, this.configFormGroup.value).subscribe(data => {
          this.snackBar.open(this.chart.id +  " Deleted", 'OK', {
            duration: 5000,
          });
        });
      case 'reinstall':
        this._CatalogService.reinstallHelm(this.chart.id, this.processFormGroup.value, this.configFormGroup.value).subscribe(data => {
          this.snackBar.open( this.chart.id +  " Reinstalled", 'OK', {
            duration: 5000,
          });
        });
        break;
      default:
    }
    this.dialogRef.close();
  }

  /**
   * builds the config form control from the values received in the get charts
   *
   * @param {string} hostname
   * @param {FormGroup} [value]
   * @returns {FormGroup}
   * @memberof StepperComponent
   */
  initConfigFormControl(hostname: string, value?: FormGroup): FormGroup {
    let nodeControls = this._formBuilder.group({});
    this.chart.formControls.map( control => {
      if (control.type === "textinput" || control.type === "textinputlist" ) {
        nodeControls.addControl(control.name, new FormControl( value ? value[control.name] : control.default_value, Validators.compose([
          control.regexp !== null ? Validators.pattern(control.regexp) : Validators.nullValidator,
          control.required ? Validators.required : Validators.nullValidator])));
      } else if (control.type === "invisible") {
        nodeControls.addControl(control.name, new FormControl( value ? value[control.name] : hostname));
      }else {
        nodeControls.addControl(control.name, new FormControl([]))
      }
    });
    return nodeControls;
  }


  /**
   * retuyrns true if we can show the configuration step
   *
   * @returns {boolean}
   * @memberof StepperComponent
   */
  configReady(): boolean {
    if ((this.processFormGroup.value.selectedProcess === 'install' || this.processFormGroup.value.selectedProcess === 'reinstall') && this.processFormGroup.value.selectedNodes.length !== 0 ) {
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
   * @memberof StepperComponent
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
   * @memberof StepperComponent
   */
  isInvalidForm(node, control): boolean {
    let hostname_ctrl = this.configFormGroup.controls[node.hostname] as FormGroup;
    return hostname_ctrl.controls[control.name].invalid;
  }

}

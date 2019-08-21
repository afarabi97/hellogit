import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormArray, FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { getFormValidationErrors, FormGroupControls, AllValidationErrors, validateFromArray } from '../validators/generic-validators.validator';
import { KickstartService } from '../kickstart.service';
import { KitFormTime, kit_validators, KitForm, KitFormNode, kitTooltips } from './kit-form';
import { KitService } from '../kit.service';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { SnackbarWrapper } from '../classes/snackbar-wrapper';
import { Title } from '@angular/platform-browser';
import { DialogFormControl, DialogControlTypes } from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { getCurrentDate } from '../date-time-picker/date-time.component';


@Component({
  selector: 'app-kit-form',
  templateUrl: './kit-form.component.html',
  styleUrls: ['./kit-form.component.scss']
})
export class KitFormComponent implements OnInit, AfterViewInit {
  avaiable_ip_addrs: string[];
  executeKitForm: KitFormTime;
  kickstartForm;
  kitFormGroup: FormGroup;
  nodes: FormArray;

  constructor(private kickStartSrv: KickstartService,
    private title: Title,
    private router: Router,
    private kitSrv: KitService,
    private formBuilder: FormBuilder,
    private snackbar: SnackbarWrapper,
    private matDialog: MatDialog) {
    this.kitFormGroup = this.newKitFormGroup();
    this.nodes = this.kitFormGroup.get('nodes') as FormArray;
  }

  ngOnInit() {
    this.title.setTitle("Kit Configuration");
  }

  ngAfterViewInit() {
    this.initalizeForm();
  }

  /**
   * opens a mat dialog with  with Execute Kit data
   *
   * @memberof KitFormComponent
   */
  openExecuteKitDialog(): void {
    let dialogForm = this.formBuilder.group({
      date: new DialogFormControl("Current Date & Time", getCurrentDate(), undefined,
            undefined, undefined, DialogControlTypes.date),
      timezone: new DialogFormControl("Timezone", 'UTC', undefined,
            undefined, undefined, DialogControlTypes.timezone)
    });

    let dialogData = { title: "Execute Kit?",
                       instructions: 'Are you sure you want to generate the Kit inventory?  \
                                      Doing so will create a new inventory file in /opt/tfplenum/core/playbooks/inventory.yml. \
                                      To finish the Kit installation, you will need to cd /opt/tfplenum/core/playbooks then run make.',
                       dialogForm: dialogForm,
                       confirmBtnText: "Execute" };
    this.openDateTimeDialog(dialogData, false);
  }

  /**
   * opens a mat dialog with  with Kit inventory data
   *
   * @memberof KitFormComponent
   */
  public openGenKitInventoryDialog(): void {
    let dialogForm = this.formBuilder.group({
      date: new DialogFormControl("Current Date & Time", undefined, undefined,
            undefined, undefined, DialogControlTypes.date),
      timezone: new DialogFormControl("Timezone", 'UTC', undefined,
            undefined, undefined, DialogControlTypes.timezone)
    });

    let dialogData = { title: "Generate Kit Inventory?",
                       instructions: 'Are you sure you want to generate the Kit inventory?  \
                                      Doing so will create a new inventory file in /opt/tfplenum/core/playbooks/inventory.yml. \
                                      To finish the Kit installation, you will need to cd /opt/tfplenum/core/playbooks then run make.',
                       dialogForm: dialogForm,
                       confirmBtnText: "Execute" };
    this.openDateTimeDialog(dialogData, true);
  }

  /**
   * opens a mat dialog with
   *
   * @private
   * @param {*} data
   * @param {boolean} generateKitInvetory
   * @memberof KitFormComponent
   */
  private openDateTimeDialog(dialogData: { title: string, instructions: string, dialogForm: FormGroup, confirmBtnText: string },
                             generateKitInvetory: boolean): void {
    const dialogRef = this.matDialog.open(ModalDialogMatComponent, {
      width: "50%",
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      let form = result as FormGroup;
      if (form && form.valid){
        this.executeKitForm = new KitFormTime(form.get('date').value, form.get('timezone').value);
        if (!generateKitInvetory) {
          this.kitSrv.executeKit(this.kitFormGroup.getRawValue(), this.executeKitForm).subscribe(data => this.openConsole());
        } else {
          this.kitSrv.generateKit(this.kitFormGroup.getRawValue(), this.executeKitForm).subscribe(data => {
            this.snackbar.showSnackBar('Inventory file generated successfully. To finish the Kit installation, you will need to cd /opt/tfplenum/core/playbooks then run make.', -1, 'Dismiss');
          });
        }
      }
    });
  }

  /**
   * navigates the router to /stdout/Kit
   *
   * @memberof KitFormComponent
   */
  public openConsole(): void {
    this.router.navigate(['/stdout/Kit']);
  }

  /**
   * get Node deviceFacts and sets KubernetesCIDRange
   *
   * @private
   * @param {*} kitData
   * @memberof KitFormComponent
   */
  private setupForm(kitData: any): void {
    if (kitData === null || kitData === undefined) {
      this.getNodeDeviceFacts(this.kickstartForm['nodes']);
      this.setKubernetesCIDRRange();
    } else {
      this.kitFormGroup = this.newKitFormGroup(kitData);
      // this.getNodeDeviceFacts(this.kickstartForm['nodes']);
      this.setKubernetesCIDRRange();
    }
  }

  /**
   * get availableIPBlocks
   *
   * @private
   * @memberof KitFormComponent
   */
  private setKubernetesCIDRRange(): void {
    this.kickStartSrv.getAvailableIPBlocks().subscribe(ipblocks => {
      this.avaiable_ip_addrs = ipblocks;
    });
  }

  /**
   * Initialize the form from kickstart data. Will display snackbar if no kickstart.
   *
   * @private
   * @memberof KitFormComponent
   */
  private initalizeForm(): void {
    this.kickStartSrv.getKickstartForm().subscribe(kickstartData => {
      if (!kickstartData) {
        let reroute = () => this.router.navigate(['/kickstart'])
        this.snackbar.showSnackBar('Error - You cannot create a Kit until you have a Kickstart configuration.', -1, 'Kickstart', reroute);
        return;
      }
      this.kickstartForm = kickstartData;
      this.kitSrv.getKitForm().subscribe(kitData => this.setupForm(kitData));
    });
  }

  /**
   * Triggered everytime a user adds input to the Kubernetes CIDR input
   *
   * @param event - A Keyboard event.
   */
  public kubernetesInputEvent(): string {
    const kubernetes_value = this.kitFormGroup.get('kubernetes_services_cidr').value;
    if (kubernetes_value && kubernetes_value.length == 0) {
      return `Select an IP range`;
    }
    const octet_1 = kubernetes_value.split('.')[0] + '.';
    const octet_2 = kubernetes_value.split('.')[1] + '.';
    const octet_3 = kubernetes_value.split('.')[2] + '.';
    let octet_4 = parseInt(kubernetes_value.split('.')[3], 10);
    if (isNaN(octet_4)) {
      return `Incomplete IP Address`;
    } else {
      while (octet_4 > 0) {
        // The magic number 16 correlates to a /28. We're basically looking for
        // the first subnet which matches a /28 and that will end up being the
        // base address for the range. If the number is evenly divisible by 16
        // that means we've found the base of the address range and 15 beyond that
        // is the maximum range.
        if (octet_4 % 16 === 0) {
          break;
        } else {
          octet_4 -= 1;
        }
      }
      // You can't have an address of 0 so Metallb will actually increment this by
      // 1 in this case.
      if (octet_4 === 0) {
        octet_4 = 1;
        return `Kubernetes services range will be: ${octet_1 + octet_2 + octet_3 + octet_4} - ${octet_4 + 14}`;
      } else {
        return `Kubernetes services range will be: ${octet_1 + octet_2 + octet_3 + octet_4} - ${octet_4 + 15}`;
      }
    }
  }

  /**
   * forces only one formControl to be true in FormArray
   *
   * @param {*} formArray
   * @param {string} formName
   * @param {number} index
   * @memberof KitFormComponent
   */
  public singleSelectCheckbox(formArray, formName: string, index: number): void {
    formArray.map((control, i) => {
      let arrFormGroup = control as FormGroup;
      if (arrFormGroup.get(formName) && index !== i) {
        control.get(formName).setValue(false);
      }
    });
  }

  /**
   * returns a new KitFormGroup
   *
   * @private
   * @param {*} [kitForm]
   * @returns {FormGroup}
   * @memberof KitFormComponent
   */
  private newKitFormGroup(kitForm?: KitForm): FormGroup {
    const kitFormGroup = this.formBuilder.group({
      nodes: this.formBuilder.array([]),
      kubernetes_services_cidr: new FormControl(kitForm ? kitForm.kubernetes_services_cidr : '', Validators.compose([validateFromArray(kit_validators.kubernetes_services_cidr)])),
      dns_ip: new FormControl('')
    });
    kitFormGroup.setValidators(Validators.compose([
      validateFromArray(kit_validators.kit_form_one_master, { minRequired: 1, minRequiredValue: true, minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'is_master_server' }),
      validateFromArray(kit_validators.kit_form_one_sensor, { minRequired: 1, minRequiredValue: 'Sensor', minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'node_type' }),
      validateFromArray(kit_validators.kit_form_one_server, { minRequired: 1, minRequiredValue: 'Server', minRequiredArray: kitFormGroup.get('nodes'), minRequireControl: 'node_type' }),
    ]));
    if (kitForm) {
      const nodes = kitFormGroup.get('nodes') as FormArray;
      kitForm.nodes.map(node => nodes.push(this.newNode(node)));
      nodes.disable();
      kitFormGroup.disable()
    }
    return kitFormGroup;
  }

  /**
   *  returns a new Node FormGroup
   *
   * @private
   * @param {*} node
   * @returns
   * @memberof KitFormComponent
   */
  private newNode(node) {
    let genericNode = this.formBuilder.group({
      node_type: new FormControl(node && node.node_type ? node.node_type : '', Validators.compose([validateFromArray(kit_validators.node_type)])),
      hostname: new FormControl(node ? node.hostname : ''),
      management_ip_address: node ? node.management_ip_address ? node.management_ip_address : node.default_ipv4_settings.address : '',
      deviceFacts: node && node.deviceFacts ? node.deviceFacts : node
    });
    genericNode.get('node_type').valueChanges.subscribe(value => this.addNodeControls(value, genericNode, node));
    return genericNode;
  }


  /**
   * adds additional controls based on node_type
   *
   * @private
   * @param {string} value
   * @param {FormGroup} genericNode
   * @param {KitFormNode} node
   * @memberof KitFormComponent
   */
  private addNodeControls(value: string, genericNode: FormGroup, node: KitFormNode): void {
    if (value === 'Sensor') {
      this.addSensorControls(genericNode, node.is_remote);
    } else if (value === 'Server') {
      this.addServerControls(genericNode, node.is_master_server, node);
    }
  }

  /**
   * adds the sensor controls
   *
   * @private
   * @param {FormGroup} genericNode
   * @memberof KitFormComponent
   */
  private addSensorControls(genericNode: FormGroup, value): void {
    genericNode.addControl('is_remote', new FormControl(value ? value : false));
    // remove Server Controls
    if (genericNode.get('is_master_server')) {
      genericNode.removeControl('is_master_server');
    }
  }

  /**
   * adds server controls
   *
   * @private
   * @param {FormGroup} genericNode
   * @memberof KitFormComponent
   */
  private addServerControls(genericNode: FormGroup, value, node): void {
    genericNode.addControl('is_master_server', new FormControl(value ? value : false));
    // set the node to false because otherwise
    if (value) {
      node["is_master_server"] = false;
    }
    // remove Server Controls
    if (genericNode.get('is_remote')) {
      genericNode.removeControl('is_remote');
    }
  }

  /**
   * clears and resets the KitFormGroup
   *
   * @memberof KitFormComponent
   */
  public clearkitFormGroup(): void {
    this.kitFormGroup = this.newKitFormGroup();
    this.nodes = this.kitFormGroup.get('nodes') as FormArray;
    this.getNodeDeviceFacts(this.kickstartForm.nodes);
  }

  /**
   * gets the Node Device Facts
   *
   * @private
   * @param {*} kickstartNodes
   * @memberof KitFormComponent
   */
  private getNodeDeviceFacts(kickstartNodes: any[]): void {
    kickstartNodes.map(node => {
      this.kickStartSrv.gatherDeviceFacts(node.ip_address).subscribe(data => {
        let nodes = this.kitFormGroup.get('nodes') as FormArray;
        let newNode = this.newNode(data);
        nodes.push(newNode);
        this.nodes = nodes;
      });
    });
  }

  /**
   * returns AllValidationError
   *
   * @param {FormGroupControls} controls
   * @returns {AllValidationErrors[]}
   * @memberof KitFormComponent
   */
  public getFormValidationErrors(controls: FormGroupControls): AllValidationErrors[] {
    return getFormValidationErrors(controls);
  }

  /**
   * returns the KitFormGroup nodes as FormArray
   *
   * @readonly
   * @type {FormArray}
   * @memberof KitFormComponent
   */
  get kitNodes(): FormArray {
    return this.kitFormGroup.get('nodes') as FormArray;
  }

  /**
   * returns a tooltip from KickStartTooltips
   *
   * @param {string} inputName
   * @returns {string}
   * @memberof KitFormComponent
   */
  public getTooltip(inputName: string): string {
    return kitTooltips[inputName];
  }

  /**
   * returns error_message for control
   *
   * @param {(FormControl | AbstractControl)} control
   * @returns {string}
   * @memberof KitFormComponent
   */
  public getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }

}

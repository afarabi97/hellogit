import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormGroup, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { getFormValidationErrors, FormGroupControls, AllValidationErrors } from '../../validators/generic-validators.validator';
import { KickstartService } from '../services/kickstart.service';
import { KitFormTime, kitTooltips } from './kit-form';
import { KitService } from '../services/kit.service';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { Title } from '@angular/platform-browser';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import { CatalogService } from '../../catalog/services/catalog.service';
import { DialogFormControl, DialogControlTypes } from '../../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../../modal-dialog-mat/modal-dialog-mat.component';
import { getCurrentDate } from '../../date-time-picker/date-time.component';
import { WeaponSystemNameService } from '../../services/weapon-system-name.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-kit-form',
  templateUrl: './kit.component.html',
  styleUrls: ['./kit.component.scss']
})
export class KitComponent implements OnInit, AfterViewInit {
  avaiable_ip_addrs: string[];
  executeKitForm: KitFormTime;
  kickstartForm;
  kitFormGroup: FormGroup;
  nodes: FormArray;

  isGettingDeviceFacts: boolean;
  system_name: string;
  controllerAdmin: boolean;
  constructor(private kickStartSrv: KickstartService,
              private title: Title,
              private router: Router,
              private kitSrv: KitService,
              private formBuilder: FormBuilder,
              private snackbar: SnackbarWrapper,
              private matDialog: MatDialog,
              private _CatalogService: CatalogService,
              private sysNameSrv: WeaponSystemNameService,
              private ref: ChangeDetectorRef,
              private userService: UserService) {
    this.isGettingDeviceFacts = false;
    this.kitFormGroup = this.kitSrv.newKitFormGroup();
    this.nodes = this.kitFormGroup.get('nodes') as FormArray;
    this.controllerAdmin = this.userService.isControllerAdmin();
  }

  ngOnInit() {
    this.isGettingDeviceFacts = false;
    this.title.setTitle("Kit Configuration");
    this.system_name = this.sysNameSrv.getSystemName();
  }

  ngAfterViewInit() {
    this.initalizeForm();
  }

  hasRetrievedDeviceFacts(): boolean {
    let nodes = this.kitFormGroup.get('nodes') as FormArray;
    for (let control of nodes.controls) {
      // console.log(control.get('deviceFacts').value);
      if (!control.get('deviceFacts').value){
        return false;
      }
    }
    return true;
  }

  generateInventory(): void{
    this.kitSrv.generateKit(this.kitFormGroup.getRawValue()).subscribe(data => {
      this.snackbar.showSnackBar('Inventory file generated successfully. To finish the Kit installation, you will need to cd /opt/tfplenum/core/playbooks then run make.', -1, 'Dismiss');
    });
  }

  executeKit(): void{
    this.kitSrv.executeKit(this.kitFormGroup.getRawValue()).subscribe(data => this.openConsole());
  }

  /**
   * navigates the router to /stdout/Kit
   *
   * @memberof KitFormComponent
   */
  public openConsole(): void {
    this.isGettingDeviceFacts = false;
    this.router.navigate(['/stdout/Kit']);
  }

  public openRemoveNodeConsole(): void {
    this.isGettingDeviceFacts = false;
    this.router.navigate(['/stdout/Removenode']);
  }

  /**
   * get Node deviceFacts and sets KubernetesCIDRange
   *
   * @private
   * @param {*} kitData
   * @memberof KitFormComponent
   */
  private setupForm(kitData: any): void {
    this.isGettingDeviceFacts = false;
    if (kitData === null || kitData === undefined) {
      this.getNodeDeviceFacts(this.kickstartForm['nodes']);
      this.setKubernetesCIDRRange();
    } else {
      this.kitFormGroup = this.kitSrv.newKitFormGroup(kitData);
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
    this.isGettingDeviceFacts = true;
    this.ref.detectChanges();
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
   * clears and resets the KitFormGroup
   *
   * @memberof KitFormComponent
   */
  public clearkitFormGroup(): void {
    this.kitFormGroup = this.kitSrv.newKitFormGroup();
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
    this.isGettingDeviceFacts = true;
    this.ref.detectChanges();
    for (let i = 0; i < kickstartNodes.length; i++){
      this.kickStartSrv.gatherDeviceFacts(kickstartNodes[i].ip_address).subscribe(data => {
        if (data){
          let nodes = this.kitFormGroup.get('nodes') as FormArray;
          let newNode = this.kitSrv.newKitNodeForm(data);
          nodes.push(newNode);
          this.nodes = nodes;

          if (i === (kickstartNodes.length - 1)){
            this.isGettingDeviceFacts = false;
            let node = this.nodes.at(0);
            let control = node.get('is_master_server');
            if (control){
              control.setValue(true);
            }
          }

          this.ref.detectChanges();
        }
      });
    }
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

  /**
   * removes a formcontrol form nodeArray at index
   *
   * @param {FormArray} nodeArray
   * @param {number} index
   * @memberof KickstartFormComponent
   */
  public removeNode(index: number): void {
    const message = "Are you sure you want to delete this sensor ";
    const title = "Deleting sensor";
    const option1 = "Take me back";
    const option2 = "Continue";

    const dialogRef = this.matDialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": message, "paneTitle": title, "option1": option1, "option2": option2},
    });

    dialogRef.afterClosed().subscribe(result => {
      if( result === option2) {
        const nodeArray:FormArray = this.kitFormGroup.get('nodes') as FormArray;
        const removeNode = nodeArray.at(index);
        const hostname = removeNode.get('hostname').value;
        nodeArray.removeAt(index);
        this.kitFormGroup.get("remove_node").setValue(hostname);

        this.kitSrv.executeRemoveNode(this.kitFormGroup.getRawValue()).subscribe( result => {
          this.openRemoveNodeConsole();
        });
      }
    });
  }

  /**
   * Checks to see if there are any installed applications on the node
   *
   * @param {number} index
   * @memberof KitFormComponent
   */
  public canRemove(index: number): void {
    const nodeArray:FormArray = this.kitFormGroup.get('nodes') as FormArray;
    const removeNode = nodeArray.at(index);
    const hostname = removeNode.get('hostname').value;

    this._CatalogService.getinstalledapps(hostname).subscribe( result => {
      let result_casted = result as [];
      if( result_casted !== null && result_casted.length > 0 ) {

        let message = " Uninstall the following applications: " + result_casted;
        const title = "Installed applications on " + hostname;
        const option2 = "Take me to catalog";
        const option1 = "Return to page";

        const dialogRef = this.matDialog.open(ConfirmDailogComponent, {
          width: '35%',
          data: {"paneString": message, "paneTitle": title, "option1": option1, "option2": option2},
        });
        dialogRef.afterClosed().subscribe(result => {
          if( result === option2) {
            this.router.navigate(['/catalog']);
          }
        });
      } else {
        this.removeNode(index);
      }
    });
  }

}

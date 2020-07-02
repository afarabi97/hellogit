import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { validateFromArray, FormGroupControls, AllValidationErrors, getFormValidationErrors, errorObject } from '../../validators/generic-validators.validator';
import { IP_CONSTRAINT } from '../../frontend-constants';
import { KickstartService } from '../services/kickstart.service';
import { KitService } from '../services/kit.service';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import { MatDialog, MatSelectChange } from '@angular/material';
import { Router } from '@angular/router';
import { AddNodeSrvService } from '../services/add-node.service';
import { MatStepper } from '@angular/material';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { SystemSetupService } from '../services/system-setup.service';
import { Title } from '@angular/platform-browser';
import { ValidateServerCpuMem } from '../kit/kit-form';
import { UserService } from '../../user.service';


const add_node_validators = {
  hostname: [
    { ops: { pattern: /^[a-z]([a-z0-9-]){4,51}$/ }, error_message: 'Hostname must be alphanumeric, less than 51 characters, should NOT include domain. Special characters are not allowed with the exception of dashes (IE -).', validatorFn: 'pattern' },
    { error_message: 'Hostname is required', validatorFn: 'required' }
  ],
  ip_address: [
    { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }
  ],
  mac_address: [
    { error_message: 'Mac Address is required', validatorFn: 'required' },
    { ops: { pattern: /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/ }, error_message: 'You must enter a valid MAC Address.', validatorFn: 'pattern' }
  ],
  boot_drive: [{ error_message: 'Boot Drive is required', validatorFn: 'required' }],
  data_drive: [{ error_message: 'Data Drive is required', validatorFn: 'required' }],
  pxe_type: [{ error_message: 'PXE Type start is required', validatorFn: 'required' }]
};


@Component({
  selector: 'app-add-node',
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.css']
})
export class AddNodeComponent implements OnInit {
  node: FormGroup;
  kitNode: FormGroup;
  availableIPs: string[] = [];
  hostname: string;
  documentation_link: string = `http://${window.location.hostname}/THISISCVAH`;
  chooseNodeTypeLabel = "Choose the node type and execute Add Node";
  error_text: string;
  isKitNodeLoading: boolean;
  kickstartForm: Object;
  hasWizardState: boolean;
  kitData: Object;
  serverMemCpuError: string;
  cpuMemMisMatch: boolean;
  controllerAdmin: boolean;

  @ViewChild('stepper', {static: false})
  stepper: MatStepper;

  constructor(private fb: FormBuilder,
              private kickStartSrv: KickstartService,
              private addNodeSrv: AddNodeSrvService,
              private matDialog: MatDialog,
              private kitSrv: KitService,
              private router: Router,
              private systemSetupSrv: SystemSetupService,
              private title: Title,
              private userService: UserService) {
    this.error_text = null;
    this.isKitNodeLoading = true;
    this.hasWizardState = false;
    this.hostname = "";
    this.kitData = null;
    this.serverMemCpuError = "";
    this.cpuMemMisMatch = false;
    this.controllerAdmin = this.userService.isControllerAdmin();
  }

  ngOnInit() {
    this.title.setTitle("Add Node Wizard");
    this.node = this.fb.group({
      hostname: new FormControl('', Validators.compose([validateFromArray(add_node_validators.hostname)])),
      ip_address: new FormControl('', Validators.compose([validateFromArray(add_node_validators.ip_address)])),
      mac_address: new FormControl('', Validators.compose([validateFromArray(add_node_validators.mac_address)])),
      data_drive: new FormControl('sdb', Validators.compose([validateFromArray(add_node_validators.data_drive)])),
      boot_drive: new FormControl('sda', Validators.compose([validateFromArray(add_node_validators.boot_drive)])),
      pxe_type: new FormControl('BIOS', Validators.compose([validateFromArray(add_node_validators.pxe_type)]))
    });

    this.addNodeSrv.getAddNodeWizardState().subscribe(data => {
      if (data && data['form']){
        let node = data["form"];
        this.node.get('hostname').setValue(node['hostname']);
        this.node.get('ip_address').setValue(node['ip_address']);
        this.node.get('mac_address').setValue(node['mac_address']);
        this.node.get('data_drive').setValue(node['data_drive']);
        this.node.get('boot_drive').setValue(node['boot_drive']);
        this.node.get('pxe_type').setValue(node['pxe_type']);

        for (let i = 1; i < data['step']; i++){
          this.stepper.next();
        }

        this.hasWizardState = true;
      } else {
        this.hasWizardState = false;
      }
    });

    this.kickStartSrv.getKickstartForm().subscribe(data => {
      if (data){
        this.kickstartForm = data;
        let mng_ip = data['controller_interface'][0];
        let netmask = data['netmask'];
        this.kickStartSrv.getUnusedIPAddresses(mng_ip, netmask).subscribe((data: string[]) => {
           this.availableIPs = data;
        });
      }
    });

    this.kitNode = this.fb.group({
      hostname: new FormControl('', Validators.compose([validateFromArray(add_node_validators.hostname)])),
    });

    this.node.valueChanges.subscribe(value => {
      this.setFormValidationErrors(this.node.controls);
    });

    this.kitSrv.getKitForm().subscribe(data => {
      this.kitData = data;
      if (!data){
        this.systemSetupSrv.displaySnackBar("The Kit has not been setup yet.  The add node process wizard \
                                             should only be done after a full Kit has been provisioned. \
                                             Please go back and finish the Kickstart and Kit configuration pages first.");
      }
    });
  }

  executeKickstart(){
    let doItText = 'Yes';
    let dialogRef = this.matDialog.open(ConfirmDailogComponent, {
        width: "35%",
        data: {
          'paneTitle': 'Execute Kickstart',
          'paneString': 'Are you sure you want to execute Kickstart with this node? Doing so will open the console Window after \
                         this process completes.  You will need to come back to this page to finish the rest of the process.',
          'option1': 'Cancel',
          'option2':  doItText,
        }
      });
      dialogRef.afterClosed().subscribe(
        result => {
          if(result == doItText) {
            this.systemSetupSrv.executeKickstart(this.node);
          }
        }
      );
  }

  executeAddNode(): void {
    let doItText = 'Yes';
    let dialogRef = this.matDialog.open(ConfirmDailogComponent, {
        width: "35%",
        data: {
          'paneTitle': 'Execute Add Node',
          'paneString': 'Are you sure you want to add this node? Doing so will open the console Window after \
                         this process completes the node will be added to your Kubernetes cluster.',
          'option1': 'Cancel',
          'option2': doItText
        }
      });
      dialogRef.afterClosed().subscribe(
        result => {
          if(result == doItText) {
            this.kitSrv.executeAddNode(this.kitNode.getRawValue()).subscribe(data => this.openKitConsole());
          }
        }
      );
  }

  openKitConsole(): void {
    this.router.navigate(['/stdout/Kit']);
  }

  stepChanged(step: StepperSelectionEvent) {
    if (step && step.selectedStep.label === this.chooseNodeTypeLabel){
      this.isKitNodeLoading = true;
      this.kickStartSrv.gatherDeviceFacts(this.node.get('ip_address').value).subscribe(data => {
        this.isKitNodeLoading = false;
        if (data && data['error_message']){
          this.error_text = data['error_message'];
          this.addNodeSrv.displaySnackBar(data['error_message']);
        } else {
          this.error_text = null;
          this.hostname = data["hostname"];
          this.kitNode = this.systemSetupSrv.kitSrv.newKitNodeForm(data);
        }
      });
    }
  }

  public onNodeTypeChange(event: MatSelectChange){
    this.cpuMemMisMatch = false;
    if (event.value === "Server"){
      let kitFormGroup = this.systemSetupSrv.kitSrv.newKitFormGroup(this.kitData as any, false);
      let nodes = kitFormGroup.get("nodes") as FormArray;
      nodes.push(this.kitNode);
      let error = ValidateServerCpuMem(kitFormGroup) as errorObject;
      if (error){
        this.serverMemCpuError = error.error_message;
        this.cpuMemMisMatch = true;
      }
    }
  }

  private isMatch(strCmp1: string, strCmp2: string): boolean {
    if (strCmp1.toLowerCase().trim() === strCmp2.toLocaleLowerCase().trim()){
      return true;
    }
    return false;
  }

  private setFormValidationErrors(controls: FormGroupControls): AllValidationErrors[] {
    let errors: AllValidationErrors[] = [];
    if (this.hasWizardState){
      // Short circuit if the Wizard has state.  We do not want to invalidate the form if it has already been previously filled out.
      return errors;
    }

    if (this.kickstartForm){
      for (let node of this.kickstartForm['nodes']){
        if (this.isMatch(node['mac_address'], controls.mac_address.value)){
          controls.mac_address.setErrors({'error_message': 'The MAC address of this node matches one you have already provisioned.'});
        }
        if (this.isMatch(node['ip_address'], controls.ip_address.value)){
          controls.ip_address.setErrors({'error_message': 'The IP address of this node matches one you have already provisioned.'});
        }
        if (this.isMatch(node['hostname'], controls.hostname.value)){
          controls.hostname.setErrors({'error_message': 'The hostname of this node matches one you have already provisioned.'});
        }
      }
    }
    return errors;
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { validateFromArray, FormGroupControls, AllValidationErrors, getFormValidationErrors, errorObject } from '../../validators/generic-validators.validator';
import { IP_CONSTRAINT } from '../../frontend-constants';
import { KickstartService } from '../services/kickstart.service';
import { KitService } from '../services/kit.service';
import { ConfirmDailogComponent } from '../../confirm-dailog/confirm-dailog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { AddNodeSrvService } from '../services/add-node.service';
import { MatStepper } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { SystemSetupService } from '../services/system-setup.service';
import { Title } from '@angular/platform-browser';
import { ValidateServerCpuMem } from '../kit/kit-form';
import { UserService } from '../../services/user.service';


const add_node_validators = {
  hostname: [
    { ops: { pattern: /^[a-z]([a-z0-9-.]){4,51}$/ }, error_message: 'Hostname must be alphanumeric, less than 51 characters. Special characters are not allowed with the exception of dashes (IE -).', validatorFn: 'pattern' },
    { error_message: 'Hostname is required', validatorFn: 'required' }
  ],
  ip_address: [
    { ops: { pattern: new RegExp(IP_CONSTRAINT) }, error_message: 'You must enter a valid IP address.', validatorFn: 'pattern' }
  ],
  mac_address: [
    { error_message: 'Mac Address is required', validatorFn: 'required' },
    { ops: { pattern: /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/ }, error_message: 'You must enter a valid MAC Address.', validatorFn: 'pattern' }
  ],
  boot_drives: [{ error_message: 'Boot Drive is required', validatorFn: 'required' }],
  data_drives: [{ error_message: 'Data Drive is required', validatorFn: 'required' }],
  pxe_type: [{ error_message: 'PXE Type start is required', validatorFn: 'required' }],
  raid_drives: [
    { error_message: 'Raid drives should be a comma separated list of drives for raid when software raid enabled for example sda,sdb', validatorFn: 'required' },
    { ops: { pattern: /^([a-z|0-9]{3,7})(,[a-z|0-9]{3,7})+$/}, error_message: 'Raid Drives must be a comma separated list with at least 2 drives for example sda,sdb', validatorFn: 'pattern' },
  ],
  os_raid_root_size: [{ error_message: 'Root Data parition size is required', validatorFn: 'required' }],
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
  chooseNodeTypeLabel = "Execute Kit Deployment";
  error: boolean;
  isKitNodeLoading: boolean;
  kickstartForm: Object;
  hasWizardState: boolean;
  kitData: Object;
  controllerAdmin: boolean;

  @ViewChild('stepper')
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
    this.error = false;
    this.isKitNodeLoading = true;
    this.hasWizardState = false;
    this.hostname = "";
    this.kitData = null;
    this.controllerAdmin = this.userService.isControllerAdmin();
  }

  ngOnInit() {
    this.title.setTitle("Add Node Wizard");
    this.node = this.fb.group({
      _id: new FormControl(''),
      hostname: new FormControl('', Validators.compose([validateFromArray(add_node_validators.hostname)])),
      ip_address: new FormControl('', Validators.compose([validateFromArray(add_node_validators.ip_address)])),
      mac_address: new FormControl('', Validators.compose([validateFromArray(add_node_validators.mac_address)])),
      data_drives: new FormControl('sdb', Validators.compose([validateFromArray(add_node_validators.data_drives)])),
      boot_drives: new FormControl('sda', Validators.compose([validateFromArray(add_node_validators.boot_drives)])),
      pxe_type: new FormControl('BIOS', Validators.compose([validateFromArray(add_node_validators.pxe_type)])),
      os_raid: new FormControl(false),
      raid_drives: new FormControl('sda,sdb', Validators.compose([validateFromArray(add_node_validators.raid_drives)])),
      os_raid_root_size: new FormControl(50, Validators.compose([validateFromArray(add_node_validators.os_raid_root_size)]))
    });

    this.addNodeSrv.getAddNodeWizardState().subscribe(data => {
      console.log(data);
      if (data && data['kickstart_node']){
        let node = data["kickstart_node"];
        this.node.get('_id').setValue(node['_id']);
        this.node.get('hostname').setValue(node['hostname']);
        this.node.get('ip_address').setValue(node['ip_address']);
        this.node.get('mac_address').setValue(node['mac_address']);
        this.node.get('data_drives').setValue(node['data_drives'].join());
        this.node.get('boot_drives').setValue(node['boot_drives'].join());
        this.node.get('pxe_type').setValue(node['pxe_type']);
        this.node.get('os_raid').setValue(node['os_raid']);
        this.node.get('raid_drives').setValue(node['raid_drives']);
        this.node.get('os_raid_root_size').setValue(node['os_raid_root_size']);

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
        let mng_ip = data['controller_interface'];
        let netmask = data['netmask'];
        this.kickStartSrv.getUnusedIPAddresses(mng_ip, netmask).subscribe((data: string[]) => {
           this.availableIPs = data;
        });
      }
    });

    this.kitNode = this.fb.group({
      hostname: new FormControl('', Validators.compose([validateFromArray(add_node_validators.hostname)])),
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
            this.systemSetupSrv.putKickstartNode(this.node);
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
            this.kitSrv.executeAddNode(this.kitNode.getRawValue()).subscribe(data => {
              this.openKitConsole(data['job_id']);
            });
          }
        }
      );
  }

  openKitConsole(job_id:string): void {
    this.router.navigate([`/stdout/Addnode/${job_id}`]);
  }

  stepChanged(step: StepperSelectionEvent) {
    if (step && step.selectedStep.label === this.chooseNodeTypeLabel){
      this.gatherDeviceFacts();
    }
  }

  public gatherDeviceFacts(): void {
    this.isKitNodeLoading = true;
    this.kickStartSrv.gatherDeviceFacts(this.node.get('ip_address').value).subscribe(data => {
      this.gatherFactsSuccess(data);
    }, error => {
      this.gatherFactsError(error);
    }).add(() => {
      this.isKitNodeLoading = false;
    });
  }

  private gatherFactsSuccess(data) {
    if (data){
      this.error = false;
      data['error'] = undefined
      this.kitNode = this.systemSetupSrv.kitSrv.newKitNodeForm(data);
    }
  }
  private gatherFactsError(error) {
    this.error = true;
    let kit_domain = this.kickstartForm['domain'];
    this.kitNode = this.systemSetupSrv.kitSrv.newKitNodeForm({
      hostname: this.node.get('hostname').value+'.'+kit_domain,
      ip_address: this.node.get('ip_address').value,
      error: error.error
    });
  }

  public onNodeTypeChange(event: MatSelectChange){
    this.error = false;
    this.kitNode.patchValue({
      error: undefined
    })
    if (event.value === "Server"){
      let kitFormGroup = this.systemSetupSrv.kitSrv.newKitFormGroup(this.kitData as any, false);
      let nodes = kitFormGroup.get("nodes") as FormArray;
      nodes.push(this.kitNode);
      let error = ValidateServerCpuMem(kitFormGroup) as errorObject;
      if (error){
        this.kitNode.patchValue({
          error: error
        })
        this.error = true;
      }
    }
  }

}

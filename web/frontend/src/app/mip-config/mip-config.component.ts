import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef, Input } from '@angular/core';
import { KickstartService } from '../system-setup/services/kickstart.service';
import { MIPConfigNodeComponent } from '../mip-config-node/mip-config-node.component';
import { MIPService } from './mip.service';
import { Router } from '@angular/router';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { ObjectUtilitiesClass } from '../classes';
import { SnackbarWrapper } from '../classes/snackbar-wrapper';
import { CookieService } from '../services/cookies.service';

@Component({
  selector: 'app-mip-config',
  templateUrl: './mip-config.component.html',
  styleUrls: ['./mip-config.component.scss'],
  host: {
    'class': 'app-mip-config'
  }
})
export class MIPConfigComponent implements OnInit {

  @Input() uniqueHTMLID: string;
  nodes: Array<Object> = null;
  loading: boolean;
  form: FormGroup;
  boot_drives: any;
  default_type = "CPT";
  loading_nodes: Array<Boolean> = [];

  @ViewChildren(MIPConfigNodeComponent) mipNodes: QueryList<MIPConfigNodeComponent>;

  constructor(
    private kickStartSrv: KickstartService,
    private mipSrv: MIPService,
    private router: Router,
    private snackbar: SnackbarWrapper,
    private ref: ChangeDetectorRef,
    private cookieService_: CookieService) {
      this.createControls();

  }

  ngOnInit() {
    this.nodes = [];
    this.setupMIPs();
  }

  onEnable() {
    this.form.enable();
    const passwords = this.form.get('passwords') as FormArray;

    /* This if block controls the cookie setting for operator build type (MDT or CPT)
       If there is no cookie saved it will default to CPT otherwise it will reload the last saved type */
    if (this.cookieService_.get('type') == '') {
      this.form.get('type').setValue(this.default_type);
    } else {
      this.form.get('type').setValue(this.cookieService_.get('type')); }

    passwords.disable();
    passwords.at(5).enable();
  }

  onClear() {
    this.form.get('type').setValue(this.default_type);
    const assessor_pw = {'password': '', 'confirm_password': '', 'name': 'assessor_pw'};
    const usaf_admin_pw = {'password': '', 'confirm_password': '', 'name': 'usaf_admin_pw'};
    const admin_pw = {'password': '', 'confirm_password': '', 'name': 'admin_pw'};
    const auditor_pw = {'password': '', 'confirm_password': '', 'name': 'auditor_pw'};
    const maintainer_pw = {'password': '', 'confirm_password': '', 'name': 'maintainer_pw'};
    const global_pw = {'password': '', 'confirm_password': '', 'name': 'global_pw'};
    this.form.get('passwords').setValue([assessor_pw, usaf_admin_pw, admin_pw, auditor_pw, maintainer_pw, global_pw]);
    this.form.get('singlePassword').setValue(true);
  }

  private createControls() {
    this.form = new FormGroup({
      'mips': new FormArray([]),
      'type': new FormControl(this.default_type),
      'passwords': new FormArray([]),
      'singlePassword': new FormControl(true)
    });

    this.form.disable();
  }

  private setupMIPs() {
    this.loading = true;

    this.getMIPKickstartForm().subscribe(form => {
      if (form) {
        const error = 'error_message' in form;
        if (error) {
          this.loading = false;
          return;
        } else {
          const addressess = [];
          this.boot_drives = {};

          for (const node of form['nodes']) {
            const ip_address = node['ip_address'];
            const model = node['pxe_type'];
              if (model === 'SCSI/SATA/USB') {
                this.boot_drives[ip_address] = 'sda';
              }
              if (model === "NVMe") {
                this.boot_drives[ip_address] = 'nvme0n1';
              }
              addressess.push(ip_address);
          }
          this.getDeviceFacts(addressess);
        }
      } else {
        this.loading = false;
      }
    })
  }

  private getMIPKickstartForm() {
      return this.kickStartSrv.getMIPKickstartForm();
  }

  private gatherFactsError(error, address: string): Object {
    return {
      default_ipv4_settings: {address: address},
      hostname: "",
      management_ip: address,
      interfaces: [],
      memory_available: 0,
      memory_gb: 0,
      memory_mb: 0,
      error: error.error.error_message
    };
  }

  private getDeviceFacts(addresses: Array<string>) {
    for (let i = 0; i < addresses.length; i++) {
      let address = addresses[i]
      this.loading_nodes[i] = false;
      this.kickStartSrv.gatherDeviceFacts(address).subscribe(data => {
        this.nodes.push(data)
      }, error => {
        let errObj = this.gatherFactsError(error, address);
        this.nodes.push(errObj);
      }).add(() => {
        this.loading_nodes[i] = true;
        if (this.loading_nodes.length == this.nodes.length && this.loading_nodes.every(Boolean)) {
          this.loading = false;
          this.snackbar.showSnackBar('Gathering facts completed for all MIPs.', -1, 'Dismiss');
        }
      });
    }
  }

  public refreshDeviceFacts(index: number): void {
    this.loading = true;
    this.ref.detectChanges();
    const address = this.nodes[index]['management_ip'];
    this.kickStartSrv.gatherDeviceFacts(address).subscribe(data => {
      this.nodes.splice(index, 1, data);
    }, error => {
      let errObj = this.gatherFactsError(error, address);
      this.nodes.splice(index, 1, errObj);
    }).add(() => {
      this.loading = false;
      if (this.nodes[index]['hostname'] === ""){
        this.snackbar.showSnackBar(this.nodes[index]['error'], -1, 'Dismiss');
      } else {
        this.snackbar.showSnackBar('Gathering facts completed for '+this.nodes[index]['hostname'], -1, 'Dismiss');
      }

      this.ref.detectChanges();
    });
  }

  runPlaybook() {
    this.mipSrv.cacheDeviceFacts(this.nodes).subscribe(data => {});

    const formValue = this.form.value;
    this.cookieService_.set('type', this.form.get('type').value )
    this.mipSrv.executeMIP(formValue).subscribe(data => {
      this.openConsole(data['job_id']);
    });

  }

  openConsole(job_id: string) {
    this.router.navigate([`/stdout/Mipconfig/${job_id}`]);
  }

  /**
   * Used for generating unique element id for html
   *
   * @param {string} passedID
   * @returns {string}
   * @memberof MIPConfigComponent
   */
  generateUniqueHTMLID(passedID: string): string {
    return ObjectUtilitiesClass.notUndefNull(this.uniqueHTMLID) ? `${this.uniqueHTMLID}-${passedID}` : passedID;
  }

  isPlaybookDisabled(): boolean{
    let hasConnectionErrors = false;
    for (let node of this.nodes){
      if (node['error']){
        hasConnectionErrors = true;
        break;
      }
    }
    if (this.form.disabled || this.form.invalid || hasConnectionErrors){
      return true;
    }

    return false;
  }

}

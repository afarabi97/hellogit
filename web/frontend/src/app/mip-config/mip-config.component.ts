import { Component, OnInit, ViewChildren, QueryList, ViewChild, Input } from '@angular/core';
import { KickstartService } from '../system-setup/services/kickstart.service';
import { forkJoin } from 'rxjs';
import { MIPConfigNodeComponent } from '../mip-config-node/mip-config-node.component';
import { MIPService } from './mip.service';
import { Router } from '@angular/router';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { ObjectUtilitiesClass } from '../classes';

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
  nodes: any = null;
  loading: boolean;
  form: FormGroup;
  boot_drives: any;
  default_type = "CPT";

  @ViewChildren(MIPConfigNodeComponent) mipNodes: QueryList<MIPConfigNodeComponent>;

  constructor(
    private kickStartSrv: KickstartService,
    private mipSrv: MIPService,
    private router: Router) {
      this.createControls();
  }

  ngOnInit() {
      this.setupMIPs();
  }

  onEnable() {
    this.form.enable();
    const passwords = this.form.get('passwords') as FormArray;
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
            const hostname = node['hostname'];
            const model = node['pxe_type'];
              if (model === 'SCSI/SATA/USB') {
                this.boot_drives[hostname] = 'sda';
              }
              if (model === "NVMe") {
                this.boot_drives[hostname] = 'nvme0n1';
              }
              addressess.push(node['ip_address']);
          }

          this.getDeviceFacts(addressess).subscribe(nodes => {
              this.nodes = nodes;
              this.loading = false;
          });
        }
      } else {
        this.loading = false;
      }
    })
  }

  private getMIPKickstartForm() {
      return this.kickStartSrv.getMIPKickstartForm();
  }

  private getDeviceFacts(addresses: Array<string>) {
    const observables = [];
      for (const address of addresses) {
        const observable = this.kickStartSrv.gatherDeviceFacts(address);
          observables.push(observable);
      }

      return forkJoin(observables);
  }

  runPlaybook() {
    this.mipSrv.cacheDeviceFacts(this.nodes).subscribe(data => {});

    const formValue = this.form.value;
    this.mipSrv.executeMIP(formValue).subscribe(data => {
      console.log(data);
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

}

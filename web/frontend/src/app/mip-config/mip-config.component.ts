import { Component, OnInit, ViewChildren, QueryList, ViewChild, Input } from '@angular/core';
import { KickstartService } from '../system-setup/services/kickstart.service';
import { forkJoin } from 'rxjs';
import { MIPConfigNodeComponent } from '../mip-config-node/mip-config-node.component';
import { MIPService } from './mip.service';
import { Router } from '@angular/router';
import { FormGroup, FormArray, FormControl } from '@angular/forms';

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
    let passwords = <FormArray> this.form.get('passwords');
    passwords.disable();
    passwords.at(5).enable();
  }

  onClear() {
    this.form.get('type').setValue(this.default_type);
    let assessor_pw = {'password': '', 'confirm_password': '', 'name': 'assessor_pw'};
    let usaf_admin_pw = {'password': '', 'confirm_password': '', 'name': 'usaf_admin_pw'};
    let admin_pw = {'password': '', 'confirm_password': '', 'name': 'admin_pw'};
    let auditor_pw = {'password': '', 'confirm_password': '', 'name': 'auditor_pw'};
    let maintainer_pw = {'password': '', 'confirm_password': '', 'name': 'maintainer_pw'};
    let global_pw = {'password': '', 'confirm_password': '', 'name': 'global_pw'};
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
        let error = 'error_message' in form;
        if (error) {
          this.loading = false;
          return;
        } else {
          let addressess = [];
          this.boot_drives = {};

          for (let node of form['nodes']) {
              let hostname = node['hostname'];
              let model = node['pxe_type'];
              if (model === '6800/7720') {
                this.boot_drives[hostname] = 'sda';
              }
              if (model === "7730") {
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
        return;
      }
    })
  }

  private getMIPKickstartForm() {
      return this.kickStartSrv.getMIPKickstartForm();
  }

  private getDeviceFacts(addresses: Array<string>) {
      let observables = [];
      for (let address of addresses) {
          let observable = this.kickStartSrv.gatherDeviceFacts(address);
          observables.push(observable);
      }

      return forkJoin(observables);
  }

  runPlaybook() {
    this.mipSrv.cacheDeviceFacts(this.nodes).subscribe(data => {});

    let formValue = this.form.value;
    this.mipSrv.executeMIP(formValue).subscribe(data => {
      this.router.navigate(['/stdout/Mipconfig']);
    });

  }

  openConsole() {
    this.router.navigate(['/stdout/Mipconfig']);
  }

  /**
   * Used for generating unique element id for html
   *
   * @param {string} passedID
   * @returns {string}
   * @memberof MIPConfigComponent
   */
  generateUniqueHTMLID(passedID: string): string {
    return this.uniqueHTMLID ? `${this.uniqueHTMLID}-${passedID}` : passedID;
  }

}

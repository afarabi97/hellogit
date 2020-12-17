import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-mip-config-node',
  templateUrl: './mip-config-node.component.html',
  host: {
    'class': 'app-mip-config-node'
  }
})
export class MIPConfigNodeComponent implements OnInit {
    @Input() node: any;
    @Input() form: FormGroup;
    @Input() boot_drive: string;

    index_of_mip: number;

    ngOnInit() {
      this.createControls();
    }

    getBootDrive() {
      if (this.boot_drive) {
        return this.node.disks.find(e => e.name === this.boot_drive);
      } else {
        return { 'size_gb': 'unknown' };
      }
    }

    createControls() {
      const address = this.node['default_ipv4_settings']['address'];

      const mips = this.form.get('mips') as FormArray;
      const control1 = new FormControl(address);

      const controls = {'address': control1};
      const group = new FormGroup(controls);
      this.index_of_mip = mips.length;
      mips.push(group);
      mips.disable();
    }
}

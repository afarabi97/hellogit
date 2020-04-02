import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-mip-config-node',
  templateUrl: './mip-config-node.component.html',
  styleUrls: ['./mip-config-node.component.scss'],
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
        return this.node.disks.find(e => {return e.name === this.boot_drive});
      } else {
        return { 'size_gb': 'unknown' };
      }
    }

    createControls() {
      let address: string;

      address = this.node['default_ipv4_settings']['address'];

      let mips = <FormArray> this.form.get('mips');
      let control1 = new FormControl(address);

      let controls = {'address': control1};
      let group = new FormGroup(controls);
      this.index_of_mip = mips.length;
      mips.push(group);
      mips.disable();
    }
}

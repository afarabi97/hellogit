import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { kickStartTooltips } from '../../kickstart/kickstart-form';
import { PXE_TYPES, MIP_PXE_TYPES } from '../../../frontend-constants';
import { WeaponSystemNameService} from '../../../services/weapon-system-name.service';

@Component({
  selector: 'app-kickstart-node-form',
  templateUrl: './kickstart-node-form.component.html',
  styleUrls: ['./kickstart-node-form.component.css']
})
export class KickstartNodeFormComponent implements OnInit {

  @Input()
  node: FormGroup;

  @Input()
  availableIPs: string[] = [];

  pxe_types: string[];
  system_name: string;

  constructor(private sysNameSrv: WeaponSystemNameService) {
    this.setSystemName();
  }

  ngOnInit() {
  }

  private setSystemName() {
    this.sysNameSrv.getSystemName().subscribe(
      data => {
        this.system_name = data['system_name'];
        this.set_pxe_types(this.system_name);
      },
      err => {
        this.system_name = 'DIP';
        this.set_pxe_types(this.system_name);
      }
    );
  }

  set_pxe_types(name: string) {
    if(name === "DIP" || name === "GIP") {
      this.pxe_types = PXE_TYPES;
    }

    if(name === "MIP") {
      this.pxe_types = MIP_PXE_TYPES;
    }
  }

  getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }
}

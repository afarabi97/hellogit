import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { kickStartTooltips } from '../../kickstart/kickstart-form';
import { PXE_TYPES, MIP_PXE_TYPES } from '../../../frontend-constants';
import { WeaponSystemNameService} from '../../../services/weapon-system-name.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
  isRaid: boolean = false;


  constructor(private sysNameSrv: WeaponSystemNameService) {
    this.setupPXETypes();
  }

  ngOnInit() {
    this.isRaid = this.node.get('os_raid').value != null ? this.node.get('os_raid').value : false;
  }

  private setupPXETypes() {
    this.system_name = this.sysNameSrv.getSystemName();
    this.setPXETypes(this.system_name);
  }

  setPXETypes(name: string) {
    if(name === "DIP" || name === "GIP") {
      this.pxe_types = PXE_TYPES;
    }

    if(name === "MIP") {
      this.pxe_types = MIP_PXE_TYPES;
    }
  }

  checkRaidChanged(event: MatCheckboxChange){
    let checked = event.checked;
    let boot_drive = this.node.get('boot_drive');
    let data_drive = this.node.get('data_drive');
    let raid_drive = this.node.get('raid_drives')
    if (checked){
      this.isRaid = true;
      data_drive.disable()
      boot_drive.disable()
      raid_drive.enable()
    }
    else {
      this.isRaid = false;
      data_drive.enable()
      boot_drive.enable()
      raid_drive.disable()
    }
  }

  getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }
}

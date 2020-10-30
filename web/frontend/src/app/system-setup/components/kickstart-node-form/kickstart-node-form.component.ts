import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { ObjectUtilitiesClass } from '../../../classes';
import { MIP_PXE_TYPES, PXE_TYPES } from '../../../frontend-constants';
import { WeaponSystemNameService } from '../../../services/weapon-system-name.service';
import { kickStartTooltips } from '../../kickstart/kickstart-form';

@Component({
  selector: 'app-kickstart-node-form',
  templateUrl: './kickstart-node-form.component.html',
  styleUrls: ['./kickstart-node-form.component.css']
})
export class KickstartNodeFormComponent implements OnInit {
  // Unique ID passed from parent component to create unique element ids
  @Input() uniqueHTMLID: string;
  @Input()
  node: FormGroup;

  @Input()
  availableIPs: string[] = [];

  pxe_types: string[];
  system_name: string;
  isRaid = false;


  constructor(private sysNameSrv: WeaponSystemNameService) {
    this.setupPXETypes();
  }

  ngOnInit() {
    this.isRaid = ObjectUtilitiesClass.notUndefNull(this.node) &&
                  ObjectUtilitiesClass.notUndefNull(this.node.get('os_raid')) &&
                  ObjectUtilitiesClass.notUndefNull(this.node.get('os_raid').value) ? this.node.get('os_raid').value : false;
  }

  /**
   * Used for generating unique element id for html
   *
   * @param {string} passedID
   * @returns {string}
   * @memberof KickstartNodeFormComponent
   */
  generateUniqueHTMLID(passedID: string): string {
    return ObjectUtilitiesClass.notUndefNull(this.uniqueHTMLID) ? `${this.uniqueHTMLID}-${passedID}` : passedID;
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
    const checked: boolean = event.checked;
    const boot_drive = this.node.get('boot_drive');
    const data_drive = this.node.get('data_drive');
    const raid_drive = this.node.get('raid_drives');
    const os_raid_root_size = this.node.get('os_raid_root_size');
    if (checked){
      this.isRaid = true;
      data_drive.disable();
      boot_drive.disable();
      raid_drive.enable();
      os_raid_root_size.enable();
    } else {
      this.isRaid = false;
      data_drive.enable();
      boot_drive.enable();
      raid_drive.disable();
      os_raid_root_size.disable();
    }
  }

  getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }

  getErrorMessage(control: FormControl | AbstractControl): string {
    return control.errors ? control.errors.error_message : '';
  }
}

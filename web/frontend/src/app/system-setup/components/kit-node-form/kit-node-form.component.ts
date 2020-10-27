import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

import { ObjectUtilitiesClass } from '../../../classes';
import { WeaponSystemNameService } from '../../../services/weapon-system-name.service';
import { kickStartTooltips } from '../../kickstart/kickstart-form';

@Component({
  selector: 'app-kit-node-form',
  templateUrl: './kit-node-form.component.html',
  styleUrls: ['./kit-node-form.component.css']
})
export class KitNodeFormComponent implements OnInit {
  // Unique ID passed from parent component to create unique element ids
  @Input() uniqueHTMLID: string;
  @Input()
  node: FormGroup;

  @Input()
  disableMasterSelection: boolean;

  @Input()
  formArray: Array<FormGroup>;

  @Output()
  nodeTypeChange: EventEmitter<any> = new EventEmitter();

  isSystemDIP: boolean = false;
  isSystemGIP: boolean = false;
  isSystemMIP: boolean = false;
  nodeError: boolean = false;

  constructor(
    private sysNameSrv: WeaponSystemNameService
  ) {
    this.disableMasterSelection = false;
    this.formArray = [];
  }

  ngOnInit() {
    this.getSystem();
    this.nodeError = ObjectUtilitiesClass.notUndefNull(this.node.get("error").value)
    if(this.nodeError) {
      this.node.disable();
    }
  }

  /**
   * Used for generating unique element id for html
   *
   * @param {string} passedID
   * @returns {string}
   * @memberof KitNodeFormComponent
   */
  generateUniqueHTMLID(passedID: string): string {
    return ObjectUtilitiesClass.notUndefNull(this.uniqueHTMLID) ? `${this.uniqueHTMLID}-${passedID}` : passedID;
  }

  public getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
  }


  /**
   *  Makes an API Call via the WeaponSystemNameService's function getSystemName()
   *  depending on the output of that call, it sets one of the isSystem*IP variables
   *  to true. This function is called in @function ngOnInit() and is used to display
   *  the proper form group options when adding/selecting nodes.
   *  Please reference ./kit-node-form.compenent.html for clarification
   *
   *  Influences the following variables:
   *    @var isSystemDIP, @var isSystemGIP, @var isSystemMIP
   *
   * @private
   * @memberof KitNodeFormComponent
   */
  private getSystem() {
    const system_name: string = this.sysNameSrv.getSystemName();
    switch (system_name) {
      case 'DIP':
        this.isSystemDIP = true;
        break;
      case 'GIP':
        this.isSystemGIP = true;
        break;
      case 'MIP':
        this.isSystemMIP = true;
        break;
    }
  }


   /**
   * On Kit configuration page, this function ensures that only one Kubernetes master can be selected.
   *
   * @param {*} formArray
   * @param {string} formName
   * @param {number} index
   * @memberof KitFormComponent
   */
  public deselectOtherMasters(): void {
    this.formArray.map(control => {
      let arrFormGroup = control as FormGroup;
      if (arrFormGroup.get('hostname').value !== this.node.get('hostname').value){
        if (arrFormGroup.get('node_type').value === "Server"){
          control.get('is_master_server').setValue(false);
        }
      }
    });
  }

  public onNodeTypeChange(event: MatSelectChange){
    if (event.value === "Server"){
      if (this.disableMasterSelection){
        this.node.get('is_master_server').disable();
      }
    }
    this.nodeTypeChange.emit(event);
  }
}

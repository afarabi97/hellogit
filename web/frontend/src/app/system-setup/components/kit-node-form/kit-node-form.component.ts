import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { kickStartTooltips } from '../../kickstart/kickstart-form';
import { MatSelectChange } from '@angular/material';
import { WeaponSystemNameService } from '../../../services/weapon-system-name.service';

@Component({
  selector: 'app-kit-node-form',
  templateUrl: './kit-node-form.component.html',
  styleUrls: ['./kit-node-form.component.css']
})
export class KitNodeFormComponent implements OnInit, AfterViewInit, OnChanges {


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

  constructor(
    private weaponSystemNameService: WeaponSystemNameService
  ) {
    this.disableMasterSelection = false;
    this.formArray = [];
  }

  ngOnInit() {
    this.getSystem();
  }

  ngAfterViewInit(){
  }

  ngOnChanges(changes: SimpleChanges): void {

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
    let system_name: String = "";
    this.weaponSystemNameService.getSystemName().subscribe(
      data => {
        system_name = data['system_name'];
        switch (system_name.toLocaleUpperCase().trim()) {
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
    );
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

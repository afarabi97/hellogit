import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { kickStartTooltips } from '../../kickstart/kickstart-form';
import { MatSelectChange } from '@angular/material';


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

  constructor() {
    this.disableMasterSelection = false;
    this.formArray = [];
  }

  ngOnInit() {
  }

  ngAfterViewInit(){
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  public getTooltip(inputName: string): string {
    return kickStartTooltips[inputName];
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
  }


}

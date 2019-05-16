import { Component, OnInit, Input } from '@angular/core';
import { SensorResourcesForm } from './total-sensor-resources-form';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-total-sensor-resources-card',
  templateUrl: './total-sensor-resources-card.component.html',
  styleUrls: ['./total-sensor-resources-card.component.css']
})
export class TotalSensorResourcesCardComponent implements OnInit {

  @Input()
  sensorResourceForm: SensorResourcesForm;  
  home_nets: FormArray;
  external_nets: FormArray;

  constructor() { 
    
  }

  ngOnInit() {
    this.home_nets = this.sensorResourceForm.get('home_nets') as FormArray;
    this.external_nets = this.sensorResourceForm.get('external_nets') as FormArray;
  }

  addHomeNet(){
    this.sensorResourceForm.addHomeNet();
  }

  removeHomeNet(index: number){    
    this.sensorResourceForm.removeHomeNet(index);
  }

  addExternalNet(){
    this.sensorResourceForm.addExternalNet();
  }

  removeExternalNet(index: number){    
    this.sensorResourceForm.removeExternalNet(index);
  }
}

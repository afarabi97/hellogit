import { Component, Input, OnChanges } from '@angular/core';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-total-sensor-resources-card',
  templateUrl: './total-sensor-resources-card.component.html',
  styleUrls: ['./total-sensor-resources-card.component.css']
})
export class TotalSensorResourcesCardComponent implements OnChanges {
  @Input() nodes: FormArray;
  sensorResource: SensorResource = new SensorResource();

  constructor() {

  }

  ngOnChanges() {
    this.nodes.valueChanges.subscribe(nodes => {
      this.sensorResource.cpuCoresAvailable = 0;
      this.sensorResource.memoryAvailable = 0;
      this.setValues(nodes);
    });
    if (this.nodes) {
      this.setValues(this.nodes.value);
    }
  }

  setValues(nodes) {
    nodes.map(node => {
      if (node.node_type == 'Sensor' && node.deviceFacts) {
        this.sensorResource.cpuCoresAvailable += node.deviceFacts['cpus_available'];
        this.sensorResource.memoryAvailable += node.deviceFacts['memory_available'];
      }
    });
  }

}

export class SensorResource {
  cpuCoresAvailable: number;
  memoryAvailable: number;

  constructor() {
    this.cpuCoresAvailable = 0;
    this.memoryAvailable = 0;
  }
}
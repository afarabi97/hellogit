import { Component, Input, OnChanges } from '@angular/core';
import { TotalSystemResources } from './total-system-resource-form';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-total-system-resource-card',
  templateUrl: './total-system-resource-card.component.html',
  styleUrls: ['./total-system-resource-card.component.css']
})
export class TotalSystemResourceCardComponent implements OnChanges {
  @Input() nodes: FormArray
  systemResources: SystemResources = new SystemResources();
  constructor() { }

  ngOnChanges() {
    this.nodes.valueChanges.subscribe(nodes => {
      this.systemResources.cpuCoresAvailable = 0;
      this.systemResources.memoryAvailable = 0;
      this.setValues(nodes);
    });
    if (this.nodes) {
      this.setValues(this.nodes.value);
    }
  }

  setValues(nodes) {
    nodes.map(node => {
      if (node.deviceFacts) {
        this.systemResources.cpuCoresAvailable += node.deviceFacts['cpus_available'];
        this.systemResources.memoryAvailable += node.deviceFacts['memory_available'];
      }
    });
  }
}

export class SystemResources {
  cpuCoresAvailable
  memoryAvailable
  clusterStorageAvailable
  clusterStorageComitted

  constructor() {
    this.cpuCoresAvailable = 0;
    this.memoryAvailable = 0;
    this.clusterStorageAvailable = 0;
    this.clusterStorageComitted = 0;
  }
}

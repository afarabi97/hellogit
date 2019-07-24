import { Component, Input, OnChanges } from '@angular/core';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-total-server-resources-card',
  templateUrl: './total-server-resources-card.component.html',
  styleUrls: ['./total-server-resources-card.component.css']
})
export class TotalServerResourcesCardComponent implements OnChanges {
  @Input() nodes: FormArray;
  serverResource: ServerResource = new ServerResource();
  constructor() { }

  ngOnChanges() {
    this.nodes.valueChanges.subscribe(nodes => {
      this.serverResource.cpuCoresAvailable = 0;
      this.serverResource.memoryAvailable = 0;
      this.setValues(nodes);
    });
    if (this.nodes) {
      this.setValues(this.nodes.value);
    }
  }

  setValues(nodes) {
    nodes.map(node => {
      if (node.node_type == 'Server' && node.deviceFacts) {
        this.serverResource.cpuCoresAvailable += node.deviceFacts['cpus_available'];
        this.serverResource.memoryAvailable += node.deviceFacts['memory_available'];
      }
    });
  }

}


export class ServerResource {
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

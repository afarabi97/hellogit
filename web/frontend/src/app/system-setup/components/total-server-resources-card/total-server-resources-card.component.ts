import { Component, Input, OnChanges } from '@angular/core';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-total-server-resources-card',
  templateUrl: './total-server-resources-card.component.html',
  styleUrls: ['./total-server-resources-card.component.css']
})
export class TotalServerResourcesCardComponent implements OnChanges {
  @Input() nodes: FormArray;
  @Input() isScale: boolean = false;
  serverResource: ServerResource = new ServerResource();
  constructor() { }

  ngOnChanges() {
    this.nodes.valueChanges.subscribe(nodes => {
      this.serverResource.cpuCoresAvailable = 0;
      this.serverResource.memoryAvailable = 0;
      this.serverResource.clusterStorageAvailable_tb = 0;
      this.serverResource.clusterStorageAvailable_gb = 0;
      this.setValues(nodes);
    });
    if (this.nodes && this.isScale === false) {
      this.setValues(this.nodes.value);
    } else {
      this.setValuesScale(this.nodes);
    }
  }

  setValues(nodes) {
    console.log(nodes);
    nodes.map(node => {
      if (node.node_type == 'Server' && node.deviceFacts) {
        this.serverResource.cpuCoresAvailable += node.deviceFacts['cpus_available'];
        this.serverResource.memoryAvailable += node.deviceFacts['memory_available'];
        node.deviceFacts.disks.map(disk => {
          if(!disk.hasRoot) {
            this.serverResource.clusterStorageAvailable_gb += disk.size_gb;
            this.serverResource.clusterStorageAvailable_tb += disk.size_tb;
          }
        });
      }
    });
  }

  setValuesScale(nodes) {
    console.log(nodes);
  }

}


export class ServerResource {
  cpuCoresAvailable
  memoryAvailable
  clusterStorageAvailable_tb
  clusterStorageAvailable_gb
  clusterStorageComitted

  constructor() {
    this.cpuCoresAvailable = 0;
    this.memoryAvailable = 0;
    this.clusterStorageAvailable_gb = 0;
    this.clusterStorageAvailable_tb = 0;
    this.clusterStorageComitted = 0;
  }
}

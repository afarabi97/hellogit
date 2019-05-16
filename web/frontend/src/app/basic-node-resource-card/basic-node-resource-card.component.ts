import { Component, OnInit, Input } from '@angular/core';


export interface BasicNodeResourceInterface {
  basicNodeResource: BasicNodeResource;
}

export class BasicNodeResource {
  cpu_cores: number;
  memory: number;
  total_drive_space: number;

  constructor() {
    this.initializeValues();
  }

  private initializeValues() {
    this.cpu_cores = 0;
    this.memory = 0;
    this.total_drive_space = 0;
  }

  public setFromDeviceFacts(deviceFacts: Object) {
    this.initializeValues();
    this.cpu_cores = deviceFacts['cpus_available'];
    this.memory = deviceFacts['memory_available'];    

    let total_space: number = 0;
    for (let disk of deviceFacts["disks"]) {
      total_space += disk['size_gb'];
    }

    this.total_drive_space = total_space;    
  }
}


@Component({
  selector: 'app-basic-node-resource-card',
  templateUrl: './basic-node-resource-card.component.html',
  styleUrls: ['./basic-node-resource-card.component.css']
})
export class BasicNodeResourceCardComponent implements OnInit {

  @Input()
  title: string;

  @Input()
  basicNodeResource: BasicNodeResource;


  constructor() { }

  ngOnInit() {
  }

}

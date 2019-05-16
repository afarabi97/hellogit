import { Component, OnInit, Input } from '@angular/core';
import { TotalServerResources } from './total-server-resources-form';

@Component({
  selector: 'app-total-server-resources-card',
  templateUrl: './total-server-resources-card.component.html',
  styleUrls: ['./total-server-resources-card.component.css']
})
export class TotalServerResourcesCardComponent implements OnInit {

  @Input()
  totalServerResources: TotalServerResources;

  constructor() { }

  ngOnInit() {
  }

}

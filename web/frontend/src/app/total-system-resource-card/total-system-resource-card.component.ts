import { Component, OnInit, Input } from '@angular/core';
import { TotalSystemResources } from './total-system-resource-form';

@Component({
  selector: 'app-total-system-resource-card',
  templateUrl: './total-system-resource-card.component.html',
  styleUrls: ['./total-system-resource-card.component.css']
})
export class TotalSystemResourceCardComponent implements OnInit {

  @Input()
  totalSystemResources: TotalSystemResources;

  constructor() {
        
  }

  ngOnInit() {
  }

}

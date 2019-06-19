import { Component, Input } from '@angular/core';
import { Chart } from '../interface/chart.interface';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent{
  @Input() chart: Chart;
  color: string = '#e74c3c';
  hoverColor: string = '#222222';
  hovered: boolean = false;

  /**
   *Creates an instance of CardComponent.
   * @memberof CardComponent
   */
  constructor() { }

  ngOnInit() {

  }

  public hoverCard($event: Event) {
    this.hovered = !this.hovered;
    this.hoverColor = this.hovered ? this.color : '#e74c3c';
  }

}

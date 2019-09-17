import { Component, Input } from '@angular/core';
import { Chart } from '../interface/chart.interface';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() chart: Chart;
  public color: string = '#e74c3c';
  public hoverColor: string = '#222222';
  public hovered: boolean = false;

  /**
   *Creates an instance of CardComponent.
   * @memberof CardComponent
   */
  constructor( private _CatalogService: CatalogService) {

  }

  /**
   * tells when you the card is using the mouse over event
   *
   * @param {Event} $event
   * @memberof CardComponent
   */
  public hoverCard($event: Event) {
    this.hoverColor = this.hovered ? this.color : '#e74c3c';
  }


  /**
   *  tells you if the application is install or not
   *
   * @returns
   * @memberof CardComponent
   */
  getClassName() {
    if(this.chart.nodes !== undefined) {
      if( this.chart.nodes.length === 0 ) {
        return 'white';
      } else {
        return 'green';
      }
    }
    return 'white';
  }

  /**
   * colors the button
   *
   * @returns
   * @memberof CardComponent
   */
  blue() {
    return "#3498db";
  }

}

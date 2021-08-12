import { Component, Input } from '@angular/core';

import { ObjectUtilitiesClass } from '../../classes';
import { Chart } from '../interface/chart.interface';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {

  // Unique ID passed from parent component to create unique element ids
  @Input() uniqueHTMLID: string;
  @Input() chart: Chart;
  color: string;
  hoverColor: string;
  hovered: boolean;

  constructor() {
    this.color = '#e74c3c';
    this.hoverColor = '#222222';
    this.hovered = false;
  }

  /**
   * Used for generating unique element id for html
   *
   * @param {string} passedID
   * @returns {string}
   * @memberof CardComponent
   */
  generateUniqueHTMLID(passedID: string): string {
    return ObjectUtilitiesClass.notUndefNull(this.uniqueHTMLID) ? `${this.uniqueHTMLID}-${passedID}` : passedID;
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
      }
      let in_progress = false;
      let failed = false;
      this.chart.nodes.map( chart => {
        if( chart.status.toLowerCase() !== "deployed") {
          in_progress = true;
        } else if ( chart.status.toLowerCase() === "failed") {
          failed = true;
        }
      });
      return failed ? "red": (in_progress ? "yellow" : "green");
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

  installColor(node) {
    const status = node.status.toLowerCase();
    const colors = {
      "deployed": "lightgreen",
      "pending install": "yellow",
      "uninstalling": "yellow",
      "uninstalled": "red",
      "failed": "red",
    }
    if(colors[status]) {
      return colors[status];
    }
    return "white";
  }
}

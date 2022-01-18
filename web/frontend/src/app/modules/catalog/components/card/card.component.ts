import { Component, Input } from '@angular/core';

import { ChartClass, ObjectUtilitiesClass } from '../../../../classes';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {

  // Unique ID passed from parent component to create unique element ids
  @Input() uniqueHTMLID: string;
  @Input() chart: ChartClass;
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
   generateUniqueHTMLID(passedID: string): string {
    return ObjectUtilitiesClass.notUndefNull(this.uniqueHTMLID) ? `${this.uniqueHTMLID}-${passedID}` : passedID;
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
    if(this.chart.nodes !== undefined && this.chart.nodes.length > 0) {
      if( this.chart.nodes.length === 0 ) {
        return 'white';
      }
      let in_progress = false;
      let failed = false;
      this.chart.nodes.map( chart => {
        if(chart.status.toLowerCase() !== "deployed") {
          in_progress = true;
        } else if ( chart.status.toLowerCase() === "failed") {
          failed = true;
        }
      });
      // red yellow green
      return failed ? "#ff4949": (in_progress ? "#FFD966" : "#1eb980");
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
    return "#6fa8dc";
  }

  installColor(node) {
    const status = node.status.toLowerCase();
    const colors = {
      "deployed": "#1eb980",
      "pending install": "#FFD966",
      "uninstalling": "#FFD966",
      "uninstalled": "#ff4949",
      "failed": "#ff4949",
    };
    if(colors[status]) {
      return colors[status];
    }
    return "white";
  }
}

import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ChartClass, ObjectUtilitiesClass, StatusClass } from '../../../../classes';
import { COLORS_DICT, DEPLOYED, FAILED, GREEN, HOVER_COLOR, RED, WHITE, YELLOW } from '../../constants/catalog.constants';

/**
 * Component used for displaying identifiable information
 * for catalog application status
 *
 * @export
 * @class ApplicationCardComponent
 */
@Component({
  selector: 'cvah-application-card',
  templateUrl: './application-card.component.html',
  styleUrls: [
    './application-card.component.scss'
  ]
})
export class ApplicationCardComponent implements OnInit {
  // Unique ID passed from parent component to create unique element ids
  @Input() unique_html_id: string;
  @Input() chart: ChartClass;
  hover_color: string;
  hovered: boolean;

  /**
   * Creates an instance of ApplicationCardComponent.
   *
   * @memberof ApplicationCardComponent
   */
  constructor(private router_: Router,
              private change_detector_ref_: ChangeDetectorRef) {
    this.hovered = false;
  }

  /**
   * Used for calling methods on startup
   *
   * @memberof ApplicationCardComponent
   */
  ngOnInit(): void {
    this.hover_color = this.get_background_color();
  }

  /**
   * Used for generating unique element id for html
   *
   * @param {string} passed_id
   * @returns {string}
   * @memberof ApplicationCardComponent
   */
  generate_unique_html_id(passed_id: string): string {
    return ObjectUtilitiesClass.notUndefNull(this.unique_html_id) ? `${this.unique_html_id}-${passed_id}` : passed_id;
  }

  /**
   * Used for signaling a mouseenter event
   *
   * @memberof ApplicationCardComponent
   */
  mouseenter_hover_card(): void {
    this.hovered = true;
  }

  /**
   * Used for signaling a mouseleave event
   *
   * @memberof ApplicationCardComponent
   */
  mouseleave_hover_card(): void {
    this.hovered = false;
  }


  /**
   * Used for displaying colored text along side catalog application status
   *
   * @returns
   * @memberof ApplicationCardComponent
   */
  get_background_color(): string {
    const hover_color_old: string = this.hover_color;
    if (ObjectUtilitiesClass.notUndefNull(this.chart.nodes) &&
        this.chart.nodes.length > 0) {
      let in_progress: boolean = false;
      let failed: boolean = false;
      this.chart.nodes.forEach((status: StatusClass) => {
        if (status.status.toLowerCase() !== DEPLOYED.toLowerCase() && status.status.toLowerCase() !== FAILED) {
          in_progress = true;
        } else if (status.status.toLowerCase() === FAILED) {
          failed = true;
        }
      });
      // red yellow green
      this.hover_color = failed ? RED: (in_progress ? YELLOW : GREEN);
    } else {
      this.hover_color = WHITE;
    }

    if (hover_color_old !== this.hover_color) {
      this.change_detector_ref_.detectChanges();
    }

    return this.hover_color;
  }

  /**
   * Used to get the status color for status button
   *
   * @param {StatusClass} node
   * @return {*}  {string}
   * @memberof ApplicationCardComponent
   */
  get_status_color(node: StatusClass): string {
    const status: string = node.status.toLowerCase();
    if (ObjectUtilitiesClass.notUndefNull(COLORS_DICT[status])) {
      return COLORS_DICT[status];
    } else {
      return WHITE;
    }
  }

  /**
   * Used to open the card and pass data via navigation
   *
   * @param {ChartClass} chart
   * @memberof ChartListComponent
   */
  card_select(chart: ChartClass): void {
    this.router_.navigate([`/application/${chart.application}`]);
  }
}

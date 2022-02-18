import { Component, HostBinding, Input } from '@angular/core';

import { ChartClass } from '../../../../classes';
import { HOST_BINDING_CLASS_CHART_LIST_COMPONENT } from '../../constants/catalog.constants';

/**
 * Component used for displaying a card for catalog app chart list
 *
 * @export
 * @class ChartListComponent
 */
@Component({
  selector: 'cvah-chart-list',
  templateUrl: './chart-list.component.html',
  styleUrls: [
    './chart-list.component.scss'
  ]
})
export class ChartListComponent {
  // Chart List passed from parent component
  @Input() charts: ChartClass[];
  // Used for setting the host binding class
  @HostBinding('class') private chart_list_component_class_: string;

  /**
   * Creates an instance of ChartListComponent.
   *
   * @memberof ChartListComponent
   */
  constructor() {
    this.chart_list_component_class_ = HOST_BINDING_CLASS_CHART_LIST_COMPONENT;
  }
}

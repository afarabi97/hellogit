import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { ChartClass } from '../../../../classes';

@Component({
  selector: 'app-chart-list',
  templateUrl: './chart-list.component.html',
  styleUrls: ['./chart-list.component.scss'],
  host: {
    'class': 'app-chart-list'
  }
})
export class ChartListComponent{
  @Input() charts: ChartClass[];

  constructor(private router: Router) { }

  /**
   * opens the card and passes the data do
   *
   * @param {ChartClass} chart
   * @memberof ChartListComponent
   */
  onSelectCard(chart: ChartClass) {
    this.router.navigate([`/application/${chart.application}`]);
  }

}

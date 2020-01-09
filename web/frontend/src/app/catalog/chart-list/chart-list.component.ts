import { Component, Input } from '@angular/core';
import { Chart } from '../interface/chart.interface';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-chart-list',
  templateUrl: './chart-list.component.html',
  styleUrls: ['./chart-list.component.scss']
})
export class ChartListComponent{

  @Input() charts: Chart[];

  /**
   *Creates an instance of ChartListComponent.
   * @param {MatDialog} dialog
   * @memberof ChartListComponent
   */
  constructor(public dialog: MatDialog,
              private router: Router,
              private _CatalogService: CatalogService,) { }

  /**
   * opens the card and passes the data do
   *
   * @param {Chart} chart
   * @memberof ChartListComponent
   */
  onSelectCard(chart: Chart) {
    this._CatalogService.getByString("chart/" + chart.application + "/info" ).subscribe(data => {
      this._CatalogService.chart = data;
      this.router.navigate(['/application/' + chart.application])
    });


  }


}

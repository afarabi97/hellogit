import { Component, OnInit, Input, Output } from '@angular/core';
import { Chart } from '../interface/chart.interface';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { StepperComponent } from '../stepper/stepper.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chart-list',
  templateUrl: './chart-list.component.html',
  styleUrls: ['./chart-list.component.scss']
})
export class ChartListComponent {
  @Input() charts: Chart[];

  /**
   *Creates an instance of ChartListComponent.
   * @param {MatDialog} dialog
   * @memberof ChartListComponent
   */
  constructor(public dialog: MatDialog,
              private router: Router) { }

  /**
   * opens the card and passes the data do
   *
   * @param {Chart} chart
   * @memberof ChartListComponent
   */
  onSelectCard(chart: Chart) {
    const dialogRef = this.dialog.open(StepperComponent, {
      width: '50%',
      height: '670px',
      data: chart,
    });
    // this.router.navigate(['/'])
  }

}

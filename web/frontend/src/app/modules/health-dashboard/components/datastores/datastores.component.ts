import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../../../constants/cvah.constants';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { DatastoreClass } from '../../classes';
import {
  CHART_TYPE_PIE,
  COLUMNS_FOR_DATASTORE_TABLE,
  SUFFIX_SELECTIONS,
  TITLE_FONT_COLOR
} from '../../constants/health-dashboard.constant';
import { CalculatedSpaceInterface } from '../../interfaces';
import { HealthService } from '../../services/health.service';

/**
 * Component used for displaying datastores table data
 *
 * @export
 * @class HealthDashboardDatastoresComponent
 * @implements {OnInit}
 */
@UntilDestroy({ checkProperties: true })
@Component({
    selector: 'cvah-health-dashboard-datastores',
    templateUrl: './datastores.component.html',
    styleUrls: ['datastores.component.scss'],
    animations: [
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ]
})
export class HealthDashboardDatastoresComponent implements OnInit {
  // Used for passing what columns to display in datastore table
  columns_for_datastores: string[];
  // Used for indicating if card is visible
  is_card_visible: boolean;
  // Used for indicating if table is visible
  is_table_visibile: boolean;
  // Used for passing datastores to html
  datastores: DatastoreClass[];
  // Used for indicating the expanded table state for a datastore
  expanded_table: any;
  // Used for passing chart type to html
  pie_chart_type: string;
  // Used for passing chart title fornt color to html
  title_font_color: string;

  /**
   * Creates an instance of HealthDashboardDatastoresComponent.
   *
   * @param {HealthService} health_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @memberof HealthDashboardDatastoresComponent
   */
  constructor(private health_service_: HealthService,
              private mat_snackbar_service_: MatSnackBarService) {
    this.columns_for_datastores = COLUMNS_FOR_DATASTORE_TABLE;
    this.is_card_visible = true;
    this.is_table_visibile = false;
    this.datastores = [];
    this.expanded_table = null;
    this.pie_chart_type = CHART_TYPE_PIE;
    this.title_font_color = TITLE_FONT_COLOR;
  }

  /**
   * Used for making subscription calls for initializing the component
   *
   * @memberof HealthDashboardDatastoresComponent
   */
  ngOnInit(): void {
    this.api_get_datastores_();
  }

  /**
   * Used for toggling card visibility
   *
   * @memberof HealthDashboardDatastoresComponent
   */
  toggle_card(): void {
    this.is_card_visible = !this.is_card_visible;
  }

  /**
   * Used for passing back calcualted space with a suffix
   *
   * @param {number} bytes
   * @return {string}
   * @memberof HealthDashboardDatastoresComponent
   */
  to_si(bytes: number): string {
    return this.calculate_space_(bytes).space_with_suffix;
  }

  /**
   * Used for passing back array of numbers to html
   *
   * @param {DatastoreClass} datastore
   * @return {number[]}
   * @memberof HealthDashboardDatastoresComponent
   */
  chart_data(datastore: DatastoreClass): number[] {
    const free: number = this.calculate_space_(datastore.free_space).space;
    const capacity: number = this.calculate_space_(datastore.capacity).space;
    const used: number = capacity - free;

    return [used, capacity];
  }

  /**
   * Used to pass private method to parent component
   *
   * @memberof HealthDashboardDatastoresComponent
   */
  reload(): void {
    this.api_get_datastores_();
  }

  /**
   * Used for calculating space from based bytes
   *
   * @private
   * @param {number} bytes
   * @return {CalculatedSpaceInterface}
   * @memberof HealthDashboardDatastoresComponent
   */
  private calculate_space_(bytes: number): CalculatedSpaceInterface {
    const suffix: string[] = SUFFIX_SELECTIONS;
    let factor: number = 1;
    let count: number = 0;
    while (factor < 1099511627776) {
      const n: number = Math.round(((bytes / (factor * 1024)) + Number.EPSILON) * 100) / 100;
      /* istanbul ignore else */
      if (n <= 1) {
        break;
      }
      count += 1;
      factor = factor * 1024;
    }

    const space: number = Math.round(((bytes / factor) + Number.EPSILON) * 100) / 100;
    const calculated_space: CalculatedSpaceInterface = {
      space: space,
      space_with_suffix: `${space} ${suffix[count]}`
    };

    return calculated_space;
  }

  /**
   * Used for making api rest call to get datastores
   *
   * @private
   * @memberof HealthDashboardDatastoresComponent
   */
  private api_get_datastores_(): void {
    this.health_service_.get_datastores()
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: DatastoreClass[]) => {
          this.datastores = response;
        },
        (error: HttpErrorResponse) => {
          this.datastores = [];
          const message: string = 'retrieving datastore';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }
}

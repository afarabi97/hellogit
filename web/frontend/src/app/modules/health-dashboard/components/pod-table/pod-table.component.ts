import { animate, state, style, transition, trigger } from '@angular/animations';
import { ComponentType } from '@angular/cdk/portal';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChange, SimpleChanges, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ErrorMessageClass, KitTokenClass, ObjectUtilitiesClass } from '../../../../classes';
import {
  DIALOG_HEIGHT_90VH,
  DIALOG_WIDTH_80VW,
  DIALOG_WIDTH_900PX,
  MAT_SNACKBAR_CONFIGURATION_60000_DUR,
  POD_STATUS_VALUES,
  RUNNING,
  STATE_REASON,
  STATUS_COMPLETED,
  STATUS_CONTAINER_CREATING,
  STATUS_ERROR,
  STATUS_FAILED,
  STATUS_NOT_READY,
  STATUS_PENDING,
  STATUS_RUNNING,
  STATUS_SUCCEEDED,
  STATUS_TERMINATING,
  STATUS_UNKNOWN,
  TERMINATED,
  WAITING
} from '../../../../constants/cvah.constants';
import { TextEditorConfigurationInterface } from '../../../../interfaces';
import { MatSnackBarService } from '../../../../services/mat-snackbar.service';
import { SortingService } from '../../../../services/sorting.service';
import { NGXMonacoTextEditorComponent } from '../../../ngx-monaco-text-editor/ngx-monaco-text-editor.component';
import { DescribePodNodeClass, PodLogClass, PodStatusClass, StatusContainerStatusClass } from '../../classes';
import {
  CLOSE_CONFIRM_ACTION_CONFIGURATION,
  COLUMN_DEFINITIONS_PODS,
  COLUMNS_FOR_GROUP_HEADER_TABLE,
  NODE_NAME,
  UNASSIGNED
} from '../../constants/health-dashboard.constant';
import { AccumulatorInterface, ColumnDefinitionsInterface, GroupDataInterface } from '../../interfaces';
import { HealthService } from '../../services/health.service';
import { PodLogDialogComponent } from './components/pod-log-dialog/pod-log-dialog.component';

/**
 * Component used for displaying pod related tables
 *
 * @export
 * @class HealthDashboardPodTableComponent
 * @implements {OnChanges}
 */
@UntilDestroy({ checkProperties: true })
@Component({
  selector: 'cvah-health-dashboard-pod-table',
  templateUrl: 'pod-table.component.html',
  styleUrls: ['pod-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HealthDashboardPodTableComponent implements OnChanges {
  // Input passed from parent component
  @Input() token: KitTokenClass;
  // Used for passing what columns to display in group table
  column_for_group_header_table: string[];
  // Used for indicating if pods are visible
  is_pods_visible: Boolean;
  // Used for indicating the expanded group within the table
  expanded_group: string;
  // Used for passing group data to html tables
  group_data: GroupDataInterface[];
  // Used for passing filtered group data to html tables
  filtered_group_data: any[];
  // Used for retaining definition for each column
  private column_definitions_pods_: ColumnDefinitionsInterface[];

  /**
   * Creates an instance of HealthDashboardPodTableComponent.
   *
   * @param {MatDialog} mat_dialog_
   * @param {HealthService} health_service_
   * @param {MatSnackBarService} mat_snackbar_service_
   * @param {SortingService} sorting_service_
   * @memberof HealthDashboardPodTableComponent
   */
  constructor(private mat_dialog_: MatDialog,
              private health_service_: HealthService,
              private mat_snackbar_service_: MatSnackBarService,
              private sorting_service_: SortingService) {
    this.column_for_group_header_table = COLUMNS_FOR_GROUP_HEADER_TABLE;
    this.is_pods_visible = true;
    this.expanded_group = null;
    this.group_data = [];
    this.filtered_group_data = [];
    this.column_definitions_pods_ = COLUMN_DEFINITIONS_PODS;
  }

  /**
   * Used for handeling change for input token
   *
   * @param {SimpleChanges} changes
   * @memberof HealthDashboardPodTableComponent
   */
  ngOnChanges(changes: SimpleChanges): void {
    const token_changes: SimpleChange = changes['token'];
    /* istanbul ignore else */
    if (ObjectUtilitiesClass.notUndefNull(token_changes) &&
        (((token_changes.currentValue !== token_changes.previousValue) && (ObjectUtilitiesClass.notUndefNull(token_changes.previousValue))) || token_changes.isFirstChange)) {
      this.reload();
    }
  }

  /**
   * Used for retrieving the pod displayed columns
   *
   * @return {string[]}
   * @memberof HealthDashboardPodTableComponent
   */
  pod_displayed_cols(): string[] {
    return this.column_definitions_pods_.filter((cd: ColumnDefinitionsInterface) => !this.token ? true : cd.remote_access)
                                        .map((cd: ColumnDefinitionsInterface) => cd.def);
  }

  /**
   * Used for toggling the visible state of a card
   *
   * @memberof HealthDashboardPodTableComponent
   */
  toggle_pods_card(): void {
    this.is_pods_visible = !this.is_pods_visible;
  }

  /**
   * Used for passing private api call to html
   *
   * @param {string} pod_name
   * @param {string} namespace
   * @memberof HealthDashboardPodTableComponent
   */
  describe_pod(pod_name: string, namespace: string): void {
    this.api_describe_pod_(pod_name, namespace);
  }

  /**
   * Used for passing private api call to html
   *
   * @param {string} pod_name
   * @param {string} namespace
   * @memberof HealthDashboardPodTableComponent
   */
  pod_logs(pod_name: string, namespace: string): void {
    this.api_pod_logs_(pod_name, namespace);
  }

  /**
   * used for setting an expanded group
   *
   * @param {string} pod_name
   * @memberof HealthDashboardPodTableComponent
   */
  set_expanded_group(pod_name: string): void {
    this.expanded_group = this.expanded_group === pod_name ? null : pod_name;
  }

  /**
   * Used for retrieving a group
   *
   * @param {string} pod_name
   * @return {GroupDataInterface}
   * @memberof HealthDashboardPodTableComponent
   */
  get_group(pod_name: string): GroupDataInterface {
    for (const group of this.group_data) {
      /* istanbul ignore else */
      if (pod_name === group.group_name) {
        return group;
      }
    }
  }

  /**
   * Used for retrieving a containers status
   *
   * @param {StatusContainerStatusClass} container_status
   * @return {string}
   * @memberof HealthDashboardPodTableComponent
   */
  get_container_status(container_status: StatusContainerStatusClass): string {
    if (ObjectUtilitiesClass.notUndefNull(container_status.state[RUNNING])) {
      return RUNNING;
    } else if (ObjectUtilitiesClass.notUndefNull(container_status.state[TERMINATED])) {
      return container_status.state[TERMINATED][STATE_REASON] ?
               `${TERMINATED}: ${container_status.state[TERMINATED][STATE_REASON]}` : TERMINATED;
    } else if (ObjectUtilitiesClass.notUndefNull(container_status.state[WAITING])) {
      return container_status.state[WAITING][STATE_REASON] ?
               `${WAITING}: ${container_status.state[WAITING][STATE_REASON]}` : WAITING;
    } else {
      return '';
    }
  }

  /**
   * Used to pass private method to parent component
   *
   * @memberof HealthDashboardPodTableComponent
   */
  reload(): void {
    if (this.token && this.token.token == null) {
      this.generate_groups_([]);
    } else {
      this.api_get_pod_status_();
    }
  }

  /**
   * Used for generating groups that is then displayed in tables
   *
   * @private
   * @param {PodStatusClass[]} pods
   * @memberof HealthDashboardPodTableComponent
   */
  private generate_groups_(pods: PodStatusClass[]): void {
    if (!pods) {
      this.group_data = [];
      this.filtered_group_data = [];
    } else {
      const group_reducer = (accumulator: AccumulatorInterface, current_value: PodStatusClass) => {
        const current_group: string = ObjectUtilitiesClass.notUndefNull(current_value[NODE_NAME]) ?
                                        current_value[NODE_NAME] : UNASSIGNED;
        /* istanbul ignore else */
        if (!accumulator[current_group]) {
          accumulator[current_group] = [];
        }
        accumulator[current_group].push(current_value);

        return accumulator;
      };

      const groups: Object = pods.reduce(group_reducer, {});
      const group_names: string[] = Object.keys(groups).sort(this.sorting_service_.alphanum);
      this.filtered_group_data = group_names.map((key: string) => groups[key]);
      this.group_data = [];
      group_names.forEach((group: string, index: number) => {
        const group_data: GroupDataInterface = {
          group_name: group,
          group_status: this.generate_group_status_(index)
        };
        this.group_data.push(group_data);
      });
    }
  }

  /**
   * used for getting a group status
   *
   * @private
   * @param {number} index
   * @return {string}
   * @memberof HealthDashboardPodTableComponent
   */
  private generate_group_status_(index: number): string {
    if (this.filtered_group_data[index].length === 1) {
      return this.get_pod_icon_status_(this.filtered_group_data[index][0].status_brief, this.filtered_group_data[index][0].warnings);
    } else {
      return this.filtered_group_data[index].reduce((status: string, pod: PodStatusClass) => {
        const pod_status: string = this.get_pod_icon_status_(pod.status_brief, pod.warnings);

        return POD_STATUS_VALUES.indexOf(pod_status) > POD_STATUS_VALUES.indexOf(status) ? pod_status : status;
      });
    }
  }

  /**
   * Used for retrieving the icon to display as a status
   *
   * @private
   * @param {string} sb
   * @param {number} [warnings]
   * @return {string}
   * @memberof HealthDashboardPodTableComponent
   */
  private get_pod_icon_status_(sb: string, warnings?: number): string {
    if (sb === STATUS_RUNNING || sb === STATUS_SUCCEEDED || sb === STATUS_COMPLETED) {
      return POD_STATUS_VALUES[0];
    } else if (sb === STATUS_PENDING || sb === STATUS_CONTAINER_CREATING) {
      return POD_STATUS_VALUES[2];
    } else if (sb === STATUS_TERMINATING) {
      return POD_STATUS_VALUES[1];
    } else if (this.is_pod_error_state_(sb, warnings)) {
      return POD_STATUS_VALUES[3];
    } else {
      return POD_STATUS_VALUES[4];
    }
  }

  /**
   * Used for passing if a pod is considered in an error state
   *
   * @private
   * @param {string} sb
   * @param {number} warnings
   * @return {boolean}
   * @memberof HealthDashboardPodTableComponent
   */
  private is_pod_error_state_(sb: string, warnings?: number): boolean {
    return ((sb === STATUS_FAILED || sb === STATUS_ERROR) || warnings > 0 &&
            (sb !== STATUS_PENDING && sb !== STATUS_NOT_READY && sb !== STATUS_TERMINATING && sb !== STATUS_UNKNOWN && sb !== STATUS_CONTAINER_CREATING));
  }

  /**
   * Used for opening different dialog windows
   *
   * @private
   * @param {string} pod_name
   * @param {string} text
   * @memberof HealthDashboardPodTableComponent
   */
  private open_dialog_window_(pod_name: string, text: string): void {
    const text_editor_configuration: TextEditorConfigurationInterface = {
      show_options: false,
      is_read_only: true,
      title: pod_name,
      text: text,
      use_language: 'plaintext',
      disable_save: false,
      confirm_save: undefined,
      confirm_close: CLOSE_CONFIRM_ACTION_CONFIGURATION
    };
    this.mat_dialog_.open(NGXMonacoTextEditorComponent, {
      height: DIALOG_HEIGHT_90VH,
      width: DIALOG_WIDTH_80VW,
      disableClose: true,
      data: text_editor_configuration,
    });
  }

  /**
   * Used for opening pod_logs dialog window
   *
   * @private
   * @param {(ComponentType<unknown> | TemplateRef<unknown>)} component
   * @param {string} pod_name
   * @param {PodLogClass[]} pod_logs
   * @memberof HealthDashboardPodTableComponent
   */
  private open_pod_logs_dialog_window_(component: ComponentType<unknown> | TemplateRef<unknown>, pod_name: string, pod_logs: PodLogClass[]): void {
    this.mat_dialog_.open(component, {
      minWidth: DIALOG_WIDTH_900PX,
      disableClose: true,
      data: { 'title': pod_name, 'info': pod_logs }
    });
  }

  /**
   * Used for making api rest call for describe pod
   *
   * @private
   * @param {string} pod_name
   * @param {string} namespace
   * @memberof HealthDashboardPodTableComponent
   */
  private api_describe_pod_(pod_name: string, namespace: string): void {
    this.health_service_.describe_pod(pod_name, namespace)
      .subscribe(
        (response: DescribePodNodeClass) => {
          this.open_dialog_window_(pod_name, response.stdout);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving describe pod';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call for pod logs
   *
   * @private
   * @param {string} pod_name
   * @param {string} namespace
   * @memberof HealthDashboardPodTableComponent
   */
  private api_pod_logs_(pod_name: string, namespace: string): void {
    this.health_service_.pod_logs(pod_name, namespace)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: PodLogClass[]) => {
          this.open_pod_logs_dialog_window_(PodLogDialogComponent, pod_name, response);
        },
        (error: HttpErrorResponse) => {
          const message: string = 'retrieving pod logs';
          this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        });
  }

  /**
   * Used for making api rest call to get pod status
   *
   * @private
   * @memberof HealthDashboardPodTableComponent
   */
  private api_get_pod_status_(): void {
    this.health_service_.get_pods_status(this.token)
      .pipe(untilDestroyed(this))
      .subscribe(
        (response: PodStatusClass[]) => {
          this.generate_groups_(response);
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          this.generate_groups_([]);
          if (error instanceof ErrorMessageClass) {
            this.mat_snackbar_service_.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'retrieving pods status';
            this.mat_snackbar_service_.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
  }
}

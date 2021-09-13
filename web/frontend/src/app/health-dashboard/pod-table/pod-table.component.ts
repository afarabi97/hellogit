import { Component, OnChanges, Input } from "@angular/core";
import { KitTokenClass } from "../../system-setupv2/classes/kit-token.class";
import { ModalDialogDisplayMatComponent } from "../../modal-dialog-display-mat/modal-dialog-display-mat.component";
import { PodLogModalDialogComponent } from "../../pod-log-dialog/pod-log-dialog.component";
import { HealthService } from "../services/health.service";
import { MatDialog } from "@angular/material/dialog";
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ObjectUtilitiesClass } from "src/app/classes";
import { SortingService } from "../../services/sorting.service"

@Component({
  selector: "app-health-dashboard-pod-table",
  templateUrl: "pod-table.component.html",
  styleUrls: ['pod-table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HealthDashboardPodTableComponent implements OnChanges {
    @Input() token: KitTokenClass;

    group_header_column = ["node_name", "group_status"];
    pod_header_column = [
      { def: "namespace", remote_access: true },
      { def: "name", remote_access: true },
      { def: "status", remote_access: true },
      { def: "restart_count", remote_access: true },
      { def: "actions", remote_access: false },
    ];

    is_pods_visible: Boolean = true;
    filtered_group_data: any[];
    expanded_group: any;
    group_header_data = [];

    constructor(
      private health_service: HealthService,
      private dialog: MatDialog,
      private sort_service: SortingService) {}

    ngOnChanges() {
      this.reload();
    }

    pod_displayed_cols() {
      return this.pod_header_column
        .filter(cd => !this.token ? true : cd.remote_access)
        .map(cd => cd.def);
    }

    describe_pod(pod_name: string, namespace: string) {
      this.health_service.describe_pod(pod_name, namespace).subscribe(data => {
        this.open_dialog_screen(ModalDialogDisplayMatComponent, pod_name, data["stdout"]);
        });
    }

    pod_logs(pod_name: string, namespace: string) {
      this.health_service.pod_logs(pod_name, namespace).subscribe(data => {
          this.open_dialog_screen(PodLogModalDialogComponent, pod_name, data);
        });
    }

    open_dialog_screen(modal, pod_name: string, data: Object) {
      this.dialog.open(modal, {
        minWidth: "900px",
        data: { "title": pod_name, "info": data }
      });
    }

    is_pod_error_state(sb: string, warnings: number): boolean {
      return ((sb === "Failed" || sb === "Error") || warnings > 0 &&
        (sb !== "Pending" && sb !== "NotReady" && sb !== "Terminating" &&
          sb !== "Unknown" && sb !== "ContainerCreating"));
    }

    get_pod_icon_status(sb: string, warnings?: number): string {
      if (sb === "Running" || sb === "Succeeded" || sb === "Completed") return "check_circle";
      else if (sb === "Pending" || sb === "ContainerCreating") return "warning";
      else if (sb === "Terminating") return "circle";
      else if (this.is_pod_error_state(sb, warnings)) return "error";
    }

    generate_group_status(index): string {
      return this.filtered_group_data[index].reduce((status, pod) => {
        const pod_status = this.get_pod_icon_status(pod.status_brief, pod.warnings);
        if ((!status || status === 'check_circle') && pod_status === 'check_circle') return 'check_circle'
        if (status === 'check_circle' && pod_status !== 'check_circle') return pod_status;
        if (status === 'warning' && pod_status !== 'check_circle' && pod_status !== 'warning') return pod_status;
        if (status === 'circle' && pod_status === 'error') return pod_status;
      });
    }

    toggle_pods_card() {
      this.is_pods_visible = !this.is_pods_visible;
    }

    generate_groups(column: string, pods: Array<Object>) {
      if (!pods) {
        this.group_header_data = [];
        this.filtered_group_data = [];
        return;
      }

      const group_reducer = (accumulator, current_value) => {
        const current_group: string = ObjectUtilitiesClass.notUndefNull(current_value[column]) ? current_value[column] :
         'Unassigned';
        if (!accumulator[current_group]) {
          accumulator[current_group] = [{
            group_name: `${current_group}`,
          }];
        }

        accumulator[current_group].push(current_value);

        return accumulator;
      }

      const groups = pods.reduce(group_reducer, {});
      const group_names = Object.keys(groups).sort((a,b) => this.sort_service.alphanum(a,b));

      this.filtered_group_data = group_names.map((key) => groups[key].filter(pod => !pod['group_name']));
      this.group_header_data = [];
      group_names.forEach((group, index) => {
        this.group_header_data.push({group_name: group, group_status: this.generate_group_status(index)});
      });
    }

    reload() {

      if (this.token && this.token.token == null) {
        this.generate_groups('node_name', []);
        return;
      }
      this.health_service.get_pods_status(this.token).subscribe(
        data => {
          this.generate_groups('node_name', data);
        },
        error => {
          this.generate_groups('node_name', []);
       }
      );
    }
}

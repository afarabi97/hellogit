import { Component, OnInit } from '@angular/core';
import { SystemHealthService } from './services/system-health.service';
import { Title } from '@angular/platform-browser';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogDisplayMatComponent } from '../modal-dialog-display-mat/modal-dialog-display-mat.component';
import { PodLogModalDialogComponent } from '../pod-log-dialog/pod-log-dialog.component';
import { interval, Subscription } from 'rxjs';
import { ModalTableComponent } from './table-dialog/modal-table.component';
import { HealthStatusClass, HealthStatusTotalsClass, HealthStatusNodeInfoClass, HealthStatusUtilizationInfoClass } from './classes';

const MODAL_SIZE ='900px';

@Component({
  selector: 'app-system-health',
  templateUrl: './system-health.component.html',
  styleUrls: ['./system-health.component.css']
})
export class SystemHealthComponent implements OnInit {
  columns_for_node_table = ['name', 'type', 'ip_address', 'ready',
                            'storage', 'memory', 'cpu', 'actions'];

  columns_for_pod_table = ['namespace', 'pod_name', 'container_states',
                           'restart_count', 'actions'];

  totals: {[key: string]: HealthStatusTotalsClass};
  nodes: MatTableDataSource<Object>;
  is_node_expanded: {[key: string]: boolean} = {};

  node_info: {[key: string]: HealthStatusNodeInfoClass};
  utilization_info: {[key: string]: HealthStatusUtilizationInfoClass};

  pipeline_status: Object;

  pod_errors: MatTableDataSource<Object>;
  pod_health: { "scheduled": {[key: string]: MatTableDataSource<Object>},
                "unscheduled": MatTableDataSource<Object>};

  loading: boolean;

  tabs: Array<string>;

  private updateSubscription: Subscription;

  constructor(private title: Title,
              private healthSrv: SystemHealthService,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.title.setTitle("System Health");
    this.loading = false;

    this._reloadHealthPage();

    this.updateSubscription = interval(30000).subscribe((val) => {
      this._reloadHealthPage();
    });
  }

  ngOnDestroy() {
    this.updateSubscription.unsubscribe();
  }

  private _containerStatusHasAnError(container_status): boolean {
    if (container_status.state.running) {
      return false;
    }

    if (container_status.state.terminated) {
      return (container_status.state.terminated.exit_code !== 0) ? true : false;
    }

    if (container_status.state.waiting) {
      return true;
    }
  }

  podHasAnError(pod): boolean {
    if (pod.status.container_statuses) {
      return pod.status.container_statuses.map(container_status => this._containerStatusHasAnError(container_status)).some(error => error);
    }

    return (pod.status.phase !== "Running" || pod.status.phase !== "Succeeded");
  }

  private _getPodTabData(pods) {
    let scheduled = {};
    let unscheduled = [];

    for (const pod of pods) {
      if (pod.spec.node_name) {
        scheduled[pod.spec.node_name] ? scheduled[pod.spec.node_name].push(pod) : scheduled[pod.spec.node_name] = [pod];
      } else {
        unscheduled.push(pod);
      }
    }

    return {
      "scheduled": Object.fromEntries(
        Object.entries<Array<Object>>(scheduled).map(([key, value]) => [key, new MatTableDataSource(value)])),
      "unscheduled": new MatTableDataSource(unscheduled)
    }
  }

  private _reloadHealthPage() {
    this.healthSrv.getPipelineStatus().subscribe(data => {
      this.pipeline_status = data;
    });

    this.healthSrv.getHealthStatus().subscribe((status: HealthStatusClass) => {
      this.totals = status.totals;
      this.pod_errors = new MatTableDataSource(status.pods.filter(pod => this.podHasAnError(pod)));
      this.pod_health = this._getPodTabData(status.pods);
      this.nodes = new MatTableDataSource(status.nodes);
      this.node_info = status.node_info;
      this.utilization_info = status.utilization_info;
      this.tabs = Object.keys(this.pod_health.scheduled).sort();
    });
  }

  toggleNodeResources(node_name: string) {
    if (this.is_node_expanded.hasOwnProperty(node_name)) {
      this.is_node_expanded[node_name] = !this.is_node_expanded[node_name];
    } else {
      this.is_node_expanded[node_name] = true;
    }
  }

  openPodDialog(pod){
    this.dialog.open(ModalTableComponent, {
      width: MODAL_SIZE,
      data: { "title": pod.metadata.name, "pod": pod}
    });
  }

  describePod(pod_name: string, pod_namespace: string) {
    this.loading = true;
    this.healthSrv.describePod(pod_name, pod_namespace).subscribe(data => {
      this.loading = false;
      this.dialog.open(ModalDialogDisplayMatComponent, {
        minWidth: MODAL_SIZE,
        data: { "title": pod_name, "info": data['stdout'] }
      });
    });
  }

  podLogs(pod_name: string, pod_namespace: string) {
    this.loading = true;
    this.healthSrv.podLogs(pod_name, pod_namespace).subscribe(data => {
      this.loading = false;
      this.dialog.open(PodLogModalDialogComponent, {
        minWidth: MODAL_SIZE,
        data: { "title": pod_name, "info": data }
      });
    });
  }

  describeNode(node_name: string) {
    this.loading = true;
    this.healthSrv.describeNode(node_name).subscribe(data => {
      this.loading = false;
      this.dialog.open(ModalDialogDisplayMatComponent, {
        minWidth: MODAL_SIZE,
        data: { "title": node_name, "info": data['stdout']}
      });
    });
  }

  openNodeInfo(node_name: string, node_info: Object){
    this.dialog.open(ModalDialogDisplayMatComponent, {
      width: MODAL_SIZE,
      data: { "title": node_name + " info", info: JSON.stringify(node_info, null, 2)}
    });
  }

  openPodInfo(pod_name: string, pod_info: Object){
    this.dialog.open(ModalDialogDisplayMatComponent, {
      width: MODAL_SIZE,
      data: { "title": pod_name + " status", "info": JSON.stringify(pod_info, null, 2)}
    });
  }

  getPodRestartCount(pod): number {
    if (pod.status.container_statuses) {
      let restart_count = 0;
      for (const container_status of pod.status.container_statuses) {
        restart_count += container_status.restart_count;
      }
      return restart_count;
    }
    return null;
  }

  getContainerStatus(container_status): string {
    if (container_status.state.running) {
      return "running";
    }

    if (container_status.state.terminated) {
      return container_status.state.terminated.reason ? `terminated: ${container_status.state.terminated.reason}` : 'terminated';
    }

    if (container_status.state.waiting) {
      return container_status.state.waiting.reason ? `waiting: ${container_status.state.waiting.reason}` : 'waiting';
    }

    return "";
  }
}

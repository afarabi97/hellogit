import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { HealthDashboardStatusService } from "../../system-setupv2/services/health-dashboard-status.service";
import { HealthDashboardStatusClass } from '../../system-setupv2/classes';
import { interval, Subscription } from 'rxjs';
import { HealthDashboardNodeTableComponent } from '../node-table/node-table.component';
import { HealthDashboardPodTableComponent } from '../pod-table/pod-table.component';
import { HealthDashboardSNMPComponent } from '../snmp/snmp-stats.component';
import { HealthDashboardDatastoresComponent } from '../datastores/datastores.component';
import { MatDialog } from "@angular/material/dialog";
import { HealthDashboardModalDialogComponent } from "../../health-dashboard-dialog/health-dashboard-dialog.component";
import { KitSettingsService } from '../../system-setupv2/services/kit-settings.service';
import { Settings } from '../../system-setupv2//models/kit';
import { MatSnackBar, TextOnlySnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
    selector: 'app-health-dashboard',
    templateUrl: './health-dashboard.component.html',
    styleUrls: ['./health_dashboard.component.css']

})
export class HealthDashboardComponent implements OnInit {
  dashboard_status: Array<HealthDashboardStatusClass>;
  remote_dashboard_status: Array<HealthDashboardStatusClass>;
  column_defintion = [
    {def: 'hostname', localhost_only: false},
    {def: 'ipaddress', localhost_only: true},
    {def: 'elasticsearch_status', localhost_only: true},
    {def: 'kibana_status', localhost_only: true},
    {def: 'actions', localhost_only: false}
  ];
  token: HealthDashboardStatusClass;
  is_gip: boolean;
  kitSelected: string;
  snack_bar_ref: MatSnackBarRef<TextOnlySnackBar>;
  kit_unavail : string = 'No data present or data is too old. Check that the remote health agent is running on the selected kit.';

  @ViewChild(HealthDashboardSNMPComponent)
  snmp_component: HealthDashboardSNMPComponent;

  @ViewChild(HealthDashboardDatastoresComponent)
  datastores_component: HealthDashboardDatastoresComponent;

  @ViewChild(HealthDashboardNodeTableComponent)
  node_component: HealthDashboardNodeTableComponent;

  @ViewChild(HealthDashboardPodTableComponent)
  pod_component: HealthDashboardPodTableComponent;

  private update_subscription: Subscription;

  constructor(
    private title: Title,
    private dialog: MatDialog,
    private dashboard_status_service: HealthDashboardStatusService,
    private kit_settings_service: KitSettingsService,
    private snack_bar: MatSnackBar
  ) {
    this.dashboard_status_service.get_health_dashboard_status().subscribe(status => { this.dashboard_status = status;
    });
    this.dashboard_status_service.get_remote_health_dashboard_status().subscribe(status => { this.remote_dashboard_status = status;
    });
  }

  ngOnInit() {
    this.title.setTitle("Health");
    this.kit_settings_service.getKitSettings().subscribe((data: Settings) => {
      this.is_gip = data.is_gip ? true : false;
      this.update_subscription = interval(30000).subscribe((number) => {
        if (this.is_gip && !this.token) {
          this.snmp_component.reload();
          this.datastores_component.reload();
        }
        this.node_component.reload();
        this.pod_component.reload();
        this.dashboard_status_service.get_health_dashboard_status().subscribe(status => { this.dashboard_status = status;
        });
        this.dashboard_status_service.get_remote_health_dashboard_status().subscribe(status =>{ this.remote_dashboard_status = status;
        });
      });
    });
    this.kitSelected = "localhost";
  }

  ngOnDestroy() {
    this.update_subscription.unsubscribe();
    if (this.snack_bar_ref) {
      this.snack_bar_ref.dismiss();
    }
  }

  kibana_info(ipaddress: string): void {
    this.dashboard_status_service.get_health_dashboard_kibana_info(ipaddress).subscribe(login => {
      this.dialog.open(HealthDashboardModalDialogComponent,{
        minWidth: "400px",
        data: { "title": "Kibana Login", "info": login }
      });
    });
  }

  kit_select(token: HealthDashboardStatusClass): void {
    if (this.snack_bar_ref) {
      this.snack_bar_ref.dismiss();
      this.snack_bar_ref = null;
    }
    this.token = token;
    if (!this.token) {
      this.kitSelected = "localhost";
    }
    else {
      this.kitSelected = token.ipaddress;
      if (!this.token.token) {
        this.snack_bar_ref = this.snack_bar.open(this.kit_unavail, 'Dismiss');
      }
    }
  }

  get_column_definition(remote: boolean) {
    return this.column_defintion.filter(cd => remote ? true : cd.localhost_only).map(cd => cd.def);
  }
}

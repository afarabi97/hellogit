import { Component, OnChanges, Input } from '@angular/core';
import { HealthService } from '../services/health.service';
import { KitTokenClass } from '../../system-setupv2/classes/kit-token.class';
import { ModalDialogDisplayMatComponent } from '../../modal-dialog-display-mat/modal-dialog-display-mat.component';
import { MatDialog } from '@angular/material/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-health-dashboard-node-table',
    templateUrl: './node-table.component.html',
    styleUrls: ['node-table.component.css'],
    animations: [
      trigger('detailExpand', [
        state('collapsed', style({height: '0px', minHeight: '0'})),
        state('expanded', style({height: '*'})),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]),
    ],
})
export class HealthDashboardNodeTableComponent implements OnChanges {
  @Input() token: KitTokenClass;
    BYTES_PER_GIB = 1024 * 1024 * 1024;


    columns_for_sensor_inner_table = ['app','total_packets', 'total_packets_dropped'];
    columns_for_server_inner_table = ['node_name', 'thread_pool_name', 'rejects'];
    column_definitions = [
      { def: 'name', remote_access: true },
      { def: 'address', remote_access: true },
      { def: 'ready', remote_access: true },
      { def: 'type', remote_access: true },
      { def: 'storage', remote_access: true },
      { def: 'memory', remote_access: true },
      { def: 'cpu', remote_access: true },
      { def: 'actions', remote_access: false },
      { def: 'expand_col', remote_access: true }
    ];

    is_nodes_visible: Boolean = true;
    nodes: Array<Object>;
    expandedElement: any[] = [];

    constructor(
      private health_service: HealthService,
      private dialog: MatDialog) {}

    ngOnChanges() {
      this.reload();
    }

    node_displayed_cols() {
      return this.column_definitions
        .filter(cd => !this.token ? true : cd.remote_access)
        .map(cd => cd.def);
    }

    describe_node(node_name: string) {
      this.health_service.describe_node(node_name).subscribe(data => {
        this.dialog.open(ModalDialogDisplayMatComponent, {
          minWidth: '900px',
          data: { 'title': node_name, 'info': data['stdout'] }
        });
      });
    }

    toggle_nodes_card() {
      this.is_nodes_visible = !this.is_nodes_visible;
    }

    reload() {
      if (this.expandedElement.length == 0) {
        if (this.token && this.token.token == null) {
          this.nodes = [];
          return;
        }
        this.health_service.get_nodes_status(this.token).subscribe(
          data => {
            this.nodes = data;
            this.health_service.write_rejects(this.token).subscribe(rejects => {
              this.health_service.suricata_pckt_stats(this.token).subscribe(suricata_data => {
                this.health_service.zeek_pckt_stats(this.token).subscribe(zeek_data => {
                  this.nodes = this.nodes.map(node => {
                      node['app_data'] = [];
                      zeek_data.map(data2 => {
                        if (data2['node_name'] === node['name']) {
                          node['app_data'].push(data2);
                        }
                      });
                      suricata_data.map(data3 => {
                        if (data3['node_name'] === node['name']) {
                          node['app_data'].push(data3);
                        }
                      });
                      if (node['type'] === 'server') {
                        node['write_rejects'] = rejects;
                      }
                      return node;
                  });
                });
              });
            });
          },
          error => {
            this.nodes = [];
          }
        );
      }
    }
}

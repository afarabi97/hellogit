import { Component, OnInit } from '@angular/core';
import { HealthService } from '../services/health.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogDisplayMatComponent } from '../../modal-dialog-display-mat/modal-dialog-display-mat.component';
import { DIALOG_WIDTH_800PX } from '../../constants/cvah.constants';

@Component({
    selector: 'app-health-dashboard-snmp',
    templateUrl: './snmp-stats.component.html',
    styleUrls: ['snmp-stats.component.css'],

})
export class HealthDashboardSNMPComponent implements OnInit {
    is_snmp_visible = true;
    snmp_data: Array<Object> = [];
    san_disk_data: Array<Object> = [];
    columns_for_snmp_table: string[] = ['name', 'device_type', 'host', 'recieved', 'delivered', 'actions'];

    constructor(
      private health_service: HealthService,
      private dialog: MatDialog
    ) {}

    ngOnInit() {
      this.get_snmp_data();
    }

    toggle_snmp_card() {
      this.is_snmp_visible = !this.is_snmp_visible;
    }

    get_snmp_data() {
      this.health_service.get_snmp_data().subscribe(data => {
        this.snmp_data = data;
      }, error => {
        this.snmp_data = [];
      });
    }

    show_data(data: Object) {
      this.dialog.open(ModalDialogDisplayMatComponent, {
        minWidth: DIALOG_WIDTH_800PX,
        data: { 'title': 'Data', 'info': JSON.stringify(data, null, 2) }
      });
    }

    reload() {
      this.get_snmp_data();
    }
}

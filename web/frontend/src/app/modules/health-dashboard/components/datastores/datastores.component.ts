import { Component, OnInit } from '@angular/core';

import { HealthService } from '../../services/health.service';

@Component({
    selector: 'app-health-dashboard-datastores',
    templateUrl: './datastores.component.html',
    styleUrls: ['datastores.component.css'],
})
export class HealthDashboardDatastoresComponent implements OnInit {
    is_card_visible = true;
    is_table_visibile = false;
    columns_for_datastores = ['name', 'free', 'capacity', 'percent_full'];
    datastores: Array<Object> = [];
    expandedTable: any;
    pieChartType = 'pie';
    titleFontColor = '#cfcfcf';

    constructor(private health_service: HealthService) {}

    ngOnInit() {
      this.get_datastores();
    }

    toggle_card() {
      this.is_card_visible = !this.is_card_visible;
    }

    get_datastores() {
      this.health_service.get_datastores().subscribe(data => {
        this.datastores = data;
      }, error => {
        this.datastores = [];
      });
    }

    reload() {
      this.get_datastores();
    }

    to_si(bytes) {
      const suffix = ['', 'KiB', 'MiB', 'GiB', 'TiB'];
      let factor = 1;
      let count = 0;
      while (factor < 1099511627776) {
          const n = Math.round(((bytes / (factor * 1024)) + Number.EPSILON) * 100) / 100;
          if (n <= 1) {
              break;
          }
          count += 1;
          factor = factor * 1024;
      }
      return `${Math.round(((bytes/factor) + Number.EPSILON) * 100) / 100} ${suffix[count]}`;
  }

  chart_data(datastore) {
    const calc_space = (bytes) => {
      let factor = 1;
      while (factor < 1099511627776) {
          const n = Math.round(((bytes / (factor * 1024)) + Number.EPSILON) * 100) / 100;
          if (n <= 1) {
              break;
          }
          factor = factor * 1024;
      }
      return Math.round(((bytes/factor) + Number.EPSILON) * 100) / 100;
    };
    const free = calc_space(datastore.free_space);
    const capacity = calc_space(datastore.capacity);
    const used = capacity - free;
    return [used, capacity];
  }
}

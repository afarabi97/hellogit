import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from '../interface/chart.interface';
import { CatalogService } from '../services/catalog.service';
import { Title } from '@angular/platform-browser';
import { Notification } from '../../notifications/interface/notifications.interface';
import { WebsocketService } from '../../services/websocket.service';
import { take, first, filter } from 'rxjs/operators';
import { MatSlideToggle } from '@angular/material';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  public charts: any;
  public filteredCharts: Chart[];
  public ioConnection: any;

  @ViewChild('pmoElement', {static: false})
  public pmoElement: MatSlideToggle;

  @ViewChild('commElement', {static: false})
  public commElement: MatSlideToggle;

  pmoSupportedApplications = ['cortex', 'hive', 'logstash', 'moloch', 'moloch-viewer', 'mongodb', 'rocketchat', 'suricata', 'wikijs', 'zeek'];

  /**
   *Creates an instance of CatalogComponent.
   * @param {CatalogService} _CatalogService
   * @memberof CatalogComponent
   * @param {WebsocketService} _WebsocketService
   */
  constructor(
    public _CatalogService: CatalogService,
    private titleSvc: Title,
    public _WebsocketService:WebsocketService,
    private snackbar: SnackbarWrapper,
  ) { }

  /**
   * Gets all the charts
   *
   * @memberof CatalogComponent
   */
  ngOnInit() {
    this.titleSvc.setTitle("Catalog");

    this._CatalogService.get_all_application_statuses().subscribe(data => {

      this.charts = data;
      this.setPMOSupported(this.charts);
      this._CatalogService.isLoading = true;
      this.filteredCharts = this.filterPMOApplications(true).concat(
        this.filterCommunityApplications(this.commElement.checked)
      );
    });

    this.ioConnection = this._WebsocketService.onBroadcast()
    .subscribe((message: Notification) => {
      if(message.role === "catalog" && message.status === "COMPLETED") {
        this._CatalogService.getByString("chart/" + message.application.toLowerCase() + "/status").subscribe(statusGroup => {
          this.charts.map( chart => {
            if( chart.application === message.application.toLowerCase()) {
              chart.nodes = statusGroup;
            }
          });
          this._CatalogService.isLoading = true;
        });
      }
    });
  }

  ngOnDestroy() {
    this.ioConnection.unsubscribe();
  }

  private setPMOSupported(charts: Chart[]){
    for (let chart of charts){
      chart.pmoSupported = false;
      for (let appName of this.pmoSupportedApplications){
        if (appName === chart.application){
          chart.pmoSupported = true;
          break;
        }
      }
    }
  }

  private filterPMOApplications(isChecked: boolean): Chart[] {
    let filteredCharts = [] as Chart[];
    if (isChecked){
      filteredCharts = this.charts.filter((obj,index,ary) => {
        for (let appName of this.pmoSupportedApplications){
          if (appName === obj.application){
            return true;
          }
        }
        return false;
      });
    }
    return filteredCharts;
  }

  private filterCommunityApplications(isChecked: boolean): Chart[] {
    let filteredCharts = [] as Chart[];
    if (isChecked){
      filteredCharts = this.charts.filter((obj,index,ary) => {
        for (let appName of this.pmoSupportedApplications){
          if (appName === obj.application){
            return false;
          }
        }
        return true;
      });
    }
    return filteredCharts;
  }

  pmoToggle(event: MatSlideToggle){
    this.filteredCharts = this.filterPMOApplications(event.checked).concat(
      this.filterCommunityApplications(this.commElement.checked)
    );
  }

  communityToggle(event: MatSlideToggle){
    this.filteredCharts = this.filterCommunityApplications(event.checked).concat(
      this.filterPMOApplications(this.pmoElement.checked)
    );
  }
}

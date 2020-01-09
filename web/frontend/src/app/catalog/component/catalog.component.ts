import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from '../interface/chart.interface';
import { CatalogService } from '../services/catalog.service';
import { Title } from '@angular/platform-browser';
import { Notification } from '../../notifications/interface/notifications.interface';
import { WebsocketService } from '../../services/websocket.service';
import { take, first, filter } from 'rxjs/operators';
import { MatSlideToggle } from '@angular/material';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  public charts: any;
  public filteredCharts: Chart[];

  @ViewChild('pmoElement', {static: false})
  public pmoElement: MatSlideToggle;

  @ViewChild('commElement', {static: false})
  public commElement: MatSlideToggle;

  pmoSupportedApplications = ['hive', 'logstash', 'moloch', 'moloch-viewer', 'mongodb', 'rocketchat', 'suricata', 'zeek'];

  /**
   *Creates an instance of CatalogComponent.
   * @param {CatalogService} _CatalogService
   * @memberof CatalogComponent
   */
  constructor(
    public _CatalogService: CatalogService,
    private titleSvc: Title,
    public _WebsocketService:WebsocketService
  ) { }

  /**
   * Gets all the charts
   *
   * @memberof CatalogComponent
   */
  ngOnInit() {
    this.titleSvc.setTitle("Catalog");
    this._CatalogService.getByString("charts").subscribe(data => {
      data.map( node => {
        this._CatalogService.getByString("chart/" + node.application + "/status").subscribe(statusGroup => {
          node.nodes = [];
          const request = statusGroup.map(status => {
            if( node.application === status.application) {
              node.nodes.push(status);
            }
          });
          Promise.all(request).then(() => {
            this._CatalogService.isLoading = true;
          });
        });
      });
      this.charts = data;
      this.setPMOSupported(this.charts);
      this.filteredCharts = this.filterPMOApplications(true).concat(
        this.filterCommunityApplications(this.commElement.checked)
      );
    });

    this._WebsocketService.onBroadcast().pipe(take(2))
    .subscribe((message: Notification) => {
      if(message.role === "catalog" && message.status === "DEPLOYED") {
        this._CatalogService.getByString("chart/" + message.application.toLowerCase() + "/status/force").subscribe(statusGroup => {
          this.charts.map( chart => {
            if( chart.application === message.application.toLowerCase()) {
              chart.nodes = statusGroup;
            }
          });
          this._CatalogService.isLoading = true;
        });
      } else if (message.role === "catalog" && message.action === "Deleting" && this.charts !== undefined) {
        this.charts.map( chart => {
          if( chart.application === message.application.toLowerCase()) {
            chart.nodes = [];
          }
        });
        this._CatalogService.isLoading = true;
      }
    });
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

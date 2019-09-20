import { Component, OnInit } from '@angular/core';
import { Chart } from '../interface/chart.interface';
import { CatalogService } from '../services/catalog.service';
import { Title } from '@angular/platform-browser';
import { Notification } from '../../notifications/interface/notifications.interface';
import { WebsocketService } from '../../services/websocket.service';
import { take, first } from 'rxjs/operators';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  public charts: any;



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
}

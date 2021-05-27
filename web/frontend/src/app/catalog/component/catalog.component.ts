import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { Title } from '@angular/platform-browser';

import { Notification } from '../../notifications/interface/notifications.interface';
import { CookieService } from '../../services/cookies.service';
import { WebsocketService } from '../../services/websocket.service';
import { Chart } from '../interface/chart.interface';
import { CatalogService } from '../services/catalog.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit, OnDestroy {
  charts: any;
  filteredCharts: Chart[];
  ioConnection: any;
  showCharts = { 'pmo': true, 'comm': false };
  @ViewChild('pmoElement')  public pmoElement: MatSlideToggle;
  @ViewChild('commElement') public commElement: MatSlideToggle;

  /**
   *Creates an instance of CatalogComponent.
   * @param {CatalogService} _CatalogService
   * @memberof CatalogComponent
   * @param {WebsocketService} _WebsocketService
   */
   constructor(public _CatalogService: CatalogService,
               private titleSvc: Title,
               public _WebsocketService: WebsocketService,
               private cookieService: CookieService) { }

  /**
   * Gets all the charts
   *
   * @memberof CatalogComponent
   */
  ngOnInit() {
    this.titleSvc.setTitle("Catalog");
    this._CatalogService.isLoading = false;
    if(this.cookieService.get('chartFilter') !== '') {
      const show = JSON.parse(this.cookieService.get('chartFilter'));
      this.showCharts['pmo'] = false;
      this.showCharts['comm'] = false;
      if(show['pmo']) {
        this.showCharts['pmo'] = true;
      }
      if(show['comm']) {
        this.showCharts['comm'] = true;
      }
    }
    this._CatalogService.get_all_application_statuses().subscribe(data => {
      this.charts = data;
      this._CatalogService.isLoading = true;
      this.filterCharts();
    });

    this.ioConnection = this._WebsocketService.onBroadcast()
    .subscribe((message: Notification) => {
      if(message.role === "catalog" && message.status === "COMPLETED") {
        this._CatalogService.getByString(`chart/${message.application.toLowerCase()}/status`).subscribe(statusGroup => {
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

  private filterPMOApplications(isChecked: boolean): Chart[] {
    let filteredCharts = [] as Chart[];
    if (isChecked){
      filteredCharts = this.charts.filter((obj,index,ary) => {
        if (obj.pmoSupported){
          return true;
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
        if (obj.pmoSupported){
          return false;
        }
        return true;
      });
    }
    return filteredCharts;
  }

  pmoToggle(event: MatSlideToggle){
    this.showCharts['pmo'] = event.checked;
    this.filterCharts();
  }

  communityToggle(event: MatSlideToggle){
    this.showCharts['comm'] = event.checked;
    this.filterCharts();
  }

  filterCharts() {
    this.filteredCharts = this.filterPMOApplications(this.showCharts['pmo']).concat(
      this.filterCommunityApplications(this.showCharts['comm'])
    ).sort((a, b) => a.application.localeCompare(b.application));
    this.updateCookie();
  }

  private updateCookie() {
    this.cookieService.set('chartFilter', JSON.stringify(this.showCharts));
  }
}


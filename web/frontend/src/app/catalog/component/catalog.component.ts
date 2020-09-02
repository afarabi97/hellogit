import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from '../interface/chart.interface';
import { CatalogService } from '../services/catalog.service';
import { Title } from '@angular/platform-browser';
import { Notification } from '../../notifications/interface/notifications.interface';
import { WebsocketService } from '../../services/websocket.service';
import { take, first, filter } from 'rxjs/operators';
import { MatSlideToggle } from '@angular/material';
import { SnackbarWrapper } from '../../classes/snackbar-wrapper';
import { CookieService } from '../../services/cookies.service';
import { WeaponSystemNameService } from '../../services/weapon-system-name.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  public charts: any;
  private fip: string;
  public filteredCharts: Chart[];
  public ioConnection: any;
  public showCharts = { 'pmo': true, 'comm': false };

  @ViewChild('pmoElement', {static: false})
  public pmoElement: MatSlideToggle;

  @ViewChild('commElement', {static: false})
  public commElement: MatSlideToggle;

  pmoSupportedApplications = ['cortex', 'hive', 'misp', 'logstash', 'moloch', 'moloch-viewer', 'mongodb', 'rocketchat', 'suricata', 'wikijs', 'zeek', 'squid'];
  gipApplications = ['squid'];

  /**
   *Creates an instance of CatalogComponent.
   * @param {CatalogService} _CatalogService
   * @memberof CatalogComponent
   * @param {WebsocketService} _WebsocketService
   */
   constructor(public _CatalogService: CatalogService,
               private titleSvc: Title,
               public _WebsocketService:WebsocketService,
               private snackbar: SnackbarWrapper,
               public nameService: WeaponSystemNameService,
               private cookieService: CookieService) { }

  /**
   * Gets all the charts
   *
   * @memberof CatalogComponent
   */
  ngOnInit() {
    this.titleSvc.setTitle("Catalog");
    this._CatalogService.isLoading = false;
    this.nameService.getSystemNameFromApi().subscribe(
      data => {
        this.fip = data["system_name"];        
      }
    );
    if(this.cookieService.get('chartFilter') != '') {
      let show = JSON.parse(this.cookieService.get('chartFilter'));
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
      this.setPMOSupported(this.charts);
      this.setTags(this.charts);
      this._CatalogService.isLoading = true;
      this.filterCharts();
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

  private setTags(charts: Chart[]) {
    charts.forEach(chart => {
      if (this.isGIPApplication(chart)) {
        this.addTag(chart, 'GIP');
      } 
    })
  }

  private isGIPApplication(chart: Chart) {
    return this.gipApplications.includes(chart.application);
  }

  private addTag(chart: Chart, tag: string) {
    if (!chart.tags) {
      chart.tags = new Set();
    }
    chart.tags.add(tag);
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
    if ('DIP' === this.fip) {
      this.filteredCharts = this.filteredCharts.filter(chart => {
        return chart.tags ? !chart.tags.has('GIP') : true;
      });
    }
    this.updateCookie();
  }

  private updateCookie() {
    this.cookieService.set('chartFilter', JSON.stringify(this.showCharts));
  }
}


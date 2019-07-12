import { Component, OnInit } from '@angular/core';
import { Chart } from '../interface/chart.interface';
import { CatalogService } from '../services/catalog.service';

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
    private _CatalogService: CatalogService
  ) { }

  /**
   * Gets all the charts
   *
   * @memberof CatalogComponent
   */
  ngOnInit() {
    this._CatalogService.getByString("charts").subscribe(data => {
      data.map( node => {
        this._CatalogService.getByString("chart/" + node.application + "/status").subscribe(statusGroup => {
          node.nodes = [];
          statusGroup.map(status => {
            if( node.application === status.application) {
              node.nodes.push(status);
            }
          });
        });
      });
      this.charts = data;
    }, error => {
      console.log(error);
    });
  }
}

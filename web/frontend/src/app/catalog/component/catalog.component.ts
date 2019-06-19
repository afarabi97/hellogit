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
    this._CatalogService.get().subscribe(data => {
      this.charts = data;
    }, error => {
      console.log(error);
    });
  }

}

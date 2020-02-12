import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ESScaleServiceService } from './es-scale-service.service';
import { ConfirmDailogComponent } from '../confirm-dailog/confirm-dailog.component';
import { MatDialog } from '@angular/material';
import { WebsocketService } from '../services/websocket.service';


class SliderControl {
  title: string;
  type: string;
  currentCount: number;
  minCount: number;
  maxCount: number;
  maxNodeCountPer: number;
  hidden: boolean;

  constructor(type: string, data: Object){
    this.type = type;
    this.hidden = false;

    if (this.type === "master"){
      this.title = "Elastic Master Pod";
    } else if (this.type === "data"){
      this.title = "Elastic Data Pod";
    } else if (this.type === "coordinating"){
      this.title = "Elastic Coordinating Pod";
    } else {
      this.title = "This is not supported and is a programming error.";
    }

    if (data){
      this.currentCount = data["elastic"][type];
      let name = "max_scale_count_" + type;
      this.maxCount = data["elastic"][type] + data["elastic"][name];
    } else {
      this.currentCount = 0;
      this.maxCount = 0;
    }

    if (this.currentCount === 0){
      this.hidden = true;
    }
  }
}


@Component({
  selector: 'app-es-scale',
  templateUrl: './es-scale.component.html',
  styleUrls: ['./es-scale.component.scss']
})
export class ESScaleComponent implements OnInit, AfterViewInit {
  public nodes: FormArray;
  public newArray: Array<any> = [];
  public max = 6;
  public min = 3;
  public step = 1;
  public thumbLabel = false;
  public value = 0;
  public status: boolean = false;
  public ioConnection: any;
  public elasticPodTypes: Array<SliderControl>;

  masterSlider: SliderControl;

  constructor(private EsScaleSrv: ESScaleServiceService,
              private formBuilder: FormBuilder,
              public dialog: MatDialog,
              public _WebsocketService: WebsocketService) {
    this.elasticPodTypes = new Array<SliderControl>();
  }

  ngOnInit() {
    this.EsScaleSrv.checkElastic().subscribe(response => {
      if(response["status"] !== "Ready") {
        this.scaleInProgressDialog();
        this.status = true;
      }
    });


    this.ioConnection = this._WebsocketService.onBroadcast()
    .subscribe((message: any) => {
      if(message["status"] === "COMPLETED") {
        this.status = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.EsScaleSrv.getElaticNodes().subscribe(data => {
      this.elasticPodTypes.length = 0; // clear the array without dereferencing it.
      this.elasticPodTypes.push(new SliderControl("master", data));
      this.elasticPodTypes.push(new SliderControl("data", data));
      this.elasticPodTypes.push(new SliderControl("coordinating", data));
    });
  }

  askRunDialog() {
    this.runDialog();
  }

  runScale() {
    let elastic = {}
    this.elasticPodTypes.forEach(pod => {
      elastic[pod.type] = pod.currentCount;
    });

    this.EsScaleSrv.postElaticNodes(elastic).subscribe(response => {
      setTimeout(() => {
        this.EsScaleSrv.deployElastic().subscribe(response => {
          this.status = true;
        });
      }, 5000);

    });
  }

  scaleInProgressDialog() {
    let message = "Elastic Scaling is currnetly in progress";
    let title = "Elastic Scaling";
    let option2 = "Okay";

    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": message, "paneTitle": title,  "option2": option2},
    });

  }
  runDialog() {
    let message = "Are you sure that you want to change the Elastic Scaling configuration, This will take some time";
    let title = "Elastic Scaling";
    let option1 = "Close";
    let option2 = "Okay";

    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": message, "paneTitle": title,"option1": option1,  "option2": option2},
    });

    dialogRef.afterClosed().subscribe(result => {
      if( result === option2) {
        if (this.status === true) {
          this.cantRunDialog();
        } else {
          this.runScale();
        }
      }
    });
  }

  cantRunDialog() {
    let message = "Elastic Scaling is currently in progress so you can not change these configuration at this time";
    let title = "Elastic Scaling";
    let option2 = "Okay";

    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": message, "paneTitle": title, "option2": option2},
    });
  }
}
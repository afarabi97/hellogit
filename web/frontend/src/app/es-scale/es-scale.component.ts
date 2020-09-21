import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ESScaleServiceService } from './es-scale-service.service';
import { ConfirmDailogComponent } from '../confirm-dailog/confirm-dailog.component';
import { MatDialog } from '@angular/material';
import { WebsocketService } from '../services/websocket.service';
import { SnackbarWrapper } from '../classes/snackbar-wrapper';
import { Router } from '@angular/router';
import { UserService } from '../user.service';


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
      this.title = "Master";
    } else if (this.type === "data"){
      this.title = "Data";
    } else if (this.type === "coordinating"){
      this.title = "Coordinating";
    } else if (this.type === "ml"){
      this.title = "Machine Learning";
    } else {
      this.title = "This is not supported and is a programming error.";
    }

    if (data){
      this.currentCount = data["elastic"][type];
      const name = `max_scale_count_ ${type}`;
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
  public isUserEditing: boolean;
  public elasticConfig: string;
  public loading: boolean;
  public controllerMaintainer: boolean;

  masterSlider: SliderControl;

  constructor(private EsScaleSrv: ESScaleServiceService,
              private formBuilder: FormBuilder,
              public dialog: MatDialog,
              public _WebsocketService: WebsocketService,
              private snackbar: SnackbarWrapper,
              private router: Router,
              private userService: UserService) {
    this.elasticPodTypes = new Array<SliderControl>();
    this.isUserEditing = false;
    this.elasticConfig = "";
    this.loading = true;
    this.controllerMaintainer = this.userService.isControllerMaintainer();
  }

  ngOnInit() {
    this.loading = true;
    this.EsScaleSrv.checkElastic().subscribe(response => {
      if(response["status"] !== "Ready" && response["status"] !== "Unknown" && response["status"] !== "None") {
        this.scaleInProgressDialog();
        this.status = true;
      } else if(response["status"] === "None") {
        const reroute = () => this.router.navigate(['/kit_configuration'])
        this.snackbar.showSnackBar('Error - You cannot scale Elastic until you have a Kit deployed and Elastic is installed', -1, 'Kit Config', reroute);
        this.loading = false;
      } else if(response["status"] === "Unknown") {
        this.snackbar.showSnackBar('Error - Unknown Elastic Status', -1, 'Dismiss');
        this.loading = false;
      } else {
        this.loading = false;
      }
    });


    this.ioConnection = this._WebsocketService.onBroadcast()
    .subscribe((message: any) => {
      if(message["status"] === "COMPLETED") {
        this.status = false;
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.EsScaleSrv.getElasticNodes().subscribe(data => {
      this.elasticPodTypes.length = 0; // clear the array without dereferencing it.
      this.elasticPodTypes.push(new SliderControl("master", data));
      this.elasticPodTypes.push(new SliderControl("data", data));
      this.elasticPodTypes.push(new SliderControl("coordinating", data));
      this.elasticPodTypes.push(new SliderControl("ml", data));
    });
  }

  askRunDialog() {
    this.runDialog();
  }

  runScale() {
    this.loading = true;
    const elastic = {}
    this.elasticPodTypes.forEach(pod => {
      elastic[pod.type] = pod.currentCount;
    });

    this.EsScaleSrv.postElasticNodes(elastic).subscribe(response => {
      setTimeout(() => {
        this.EsScaleSrv.deployElastic().subscribe(response => {
          this.status = true;
        });
      }, 5000);

    });
  }

  scaleInProgressDialog() {
    const message = "Elastic Scaling is currnetly in progress";
    const title = "Elastic Scaling";
    const option2 = "Okay";

    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": message, "paneTitle": title,  "option2": option2},
    });

  }
  runDialog() {
    const message = "Are you sure that you want to change the Elastic Scaling configuration, This will take some time";
    const title = "Elastic Scaling";
    const option1 = "Close";
    const option2 = "Okay";

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
    const message = "Elastic Scaling is currently in progress so you can not change these configuration at this time";
    const title = "Elastic Scaling";
    const option2 = "Okay";

    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: '35%',
      data: {"paneString": message, "paneTitle": title, "option2": option2},
    });
  }

  editElasticConfig(){
    this.isUserEditing = true;
    this.EsScaleSrv.getElasticFullConfig().subscribe(data => {
      this.elasticConfig = data['elastic'];
    });
  }

  saveAndCloseEditor(configData: string){
    this.isUserEditing = false;
    this.EsScaleSrv.postElasticFullConfig(configData).subscribe(data => {
      setTimeout(() => {
        this.EsScaleSrv.deployElastic().subscribe(response => {
          this.status = true;
        });
      }, 5000);
    }, error => {

    });
  }

  closeEditor(event: any) {
    this.isUserEditing = false;
  }
}

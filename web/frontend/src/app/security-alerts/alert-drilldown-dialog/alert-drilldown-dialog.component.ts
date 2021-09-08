import { AfterViewInit, Component, Inject, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from '../alerts.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBarService } from '../../services/mat-snackbar.service';


@Component({
  selector: 'alert-drilldown-dialog',
  templateUrl: 'alert-drilldown-dialog.component.html'
})
export class AlertDrillDownDialogComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('dialogPaginator') dialogPaginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dynamicColumns: string[];
  allColumns: string[];
  alerts: MatTableDataSource<Object>;
  links: object[];

  constructor( public dialogRef: MatDialogRef<AlertDrillDownDialogComponent>,
               private alertSrv: AlertService,
               private matSnackBarSrv: MatSnackBarService,
               @Inject(MAT_DIALOG_DATA) public alertGroup: any) {
    this.alerts = new MatTableDataSource();
    this.links = this.alertGroup['links'];
    delete this.alertGroup['links'];
    this.setColumns(alertGroup);
  }

  ngOnInit(){
    this.alertSrv.getAlertList(this.alertGroup).subscribe(data => {
      this.alerts.data = data['hits']['hits'] as object[];
    });
  }

  ngAfterViewInit(): void {
    this.alerts.paginator = this.dialogPaginator;
    this.alerts.sort = this.sort;
  }

  ngOnChanges() {
    this.alerts = new MatTableDataSource(this.alerts.data);
    this.alerts.paginator = this.dialogPaginator;
    this.alerts.sort = this.sort;
  }

  isDynamicColumn(column: string){
    if (column === 'actions' || column === 'count'){
      return false;
    }
    return true;
  }

  getColumnValue(alert: Object, columnName: string){
    if (columnName === 'rule.name'){
      if (alert['_source']['event']['kind'] === 'signal'){
        columnName = 'signal.rule.name';
      }
    }

    if (alert && columnName){
      const values = columnName.split('.');
      let ret_val = alert['_source'];
      for (const i of values){
        ret_val = ret_val[i];
      }
      return ret_val;
    }
    return '';
  }

  getTimeStamp(alert: Object){
    if (alert && alert['_source'] && alert['_source']['@timestamp']){
      return alert['_source']['@timestamp'];
    }
    return '';
  }

  openKibana(alert: Object) {
    const id = alert['_id'];
    const startDatetime = this.alertGroup['form']['startDatetime'].toISOString();
    const endDatetime = this.alertGroup['form']['endDatetime'].toISOString();

    let index = 'filebeat-*';
    const prefix = this.getLink('kibana');
    let url = '';
    if (alert['_source']['event']['kind'] && alert['_source']['event']['kind'] === 'alert') {
      if (alert['_source']['event']['module'] === 'endgame'){
        index = 'endgame-dashboard-index-pattern';
      }
    }

    if (alert['_source']['event']['kind'] && alert['_source']['event']['kind'] === 'signal') {
      url = `${prefix}/app/security/detections?query=(language:kuery,query:%27_id%20:%20%22${id}%22%27)
&timerange=(global:(linkTo:!(timeline),timerange:(from:%27${startDatetime}%27,kind:absolute,to:%27${endDatetime}%27)),
timeline:(linkTo:!(global),timerange:(from:%27${startDatetime}%27,kind:absolute,to:%27${endDatetime}%27)))`;
    }  else {
      url = `${prefix}/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:
(from:'${startDatetime}',to:'${endDatetime}'))&_a=
(columns:!(_source),filters:!(),index:'${index}',interval:auto,
query:(language:kuery,query:'_id:%20%22${id}%22%20'),sort:!())`;
    }

    const win = window.open(url, '_blank');
    win.focus();
  }

  openMoloch(alert: Object){
    const prefix = this.getLink('arkime');

    if (prefix === ''){
      this.matSnackBarSrv.displaySnackBar('Arkime is not installed.  Please go to the catalog page and install it if you want this capability to work.');
      return;
    }

    const timeAmount = this.alertGroup['form']['timeAmount'];
    let hourAmount = 1;
    if (this.alertGroup['form']['timeInterval'] === 'days'){
      hourAmount = timeAmount * 24;
    } else if (this.alertGroup['form']['timeInterval'] === 'minutes'){
      if (timeAmount > 60){
        hourAmount = Math.floor( timeAmount / 60 );
      }
    }

    if (alert['_source'] && alert['_source']['network'] && alert['_source']['network']['community_id']){
      const communityID = alert['_source']['network']['community_id'];
      const url = `${prefix}/sessions?expression=communityId%20%3D%3D%20%22${communityID}%22&date=${hourAmount}`;
      const win = window.open(url, '_blank');
      win.focus();
    } else {
      this.matSnackBarSrv.displaySnackBar('Failed to pivot to arkime as community ID does not exist.');
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  private setColumns(alert: Object){
    this.dynamicColumns = [];
    for (const field in alert){
      if (field === 'count' || field === 'form' || field === 'links'){
        continue;
      }
      this.dynamicColumns.push(field);
    }

    this.allColumns = ['actions', 'timestamp'].concat(this.dynamicColumns);
  }

  private getLink(search: string) {
    for (const entry of this.links){
      if (entry['dns'].includes(search)){
        return entry['dns'];
      }
    }
    return '';
  }
}

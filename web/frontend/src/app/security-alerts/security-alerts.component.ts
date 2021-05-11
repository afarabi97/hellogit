import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { forkJoin, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { UserPortalLinkClass } from '../classes';
import { ConfirmDailogComponent } from '../confirm-dailog/confirm-dailog.component';
import {
  DialogControlTypes,
  DialogFormControl,
  DialogFormControlConfigClass
} from '../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../modal-dialog-mat/modal-dialog-mat.component';
import { CookieService } from '../services/cookies.service';
import { MatSnackBarService } from '../services/mat-snackbar.service';
import { PortalService } from '../services/portal.service';
import { AlertDrillDownDialog } from './alert-drilldown-dialog/alert-drilldown-dialog.component';
import { AlertService } from './alerts.service';

const DIALOG_WIDTH = "1000px";

const MOLOCH_FIELD_LOOKUP = {
  "source.address": "ip.src",
  "source.ip": "ip.src",
  "source.port": "port.src",
  "destination.port": "port.dst",
  "destination.address": "ip.dst",
  "destination.ip": "ip.dst"
};


@Component({
  selector: 'app-security-alerts',
  templateUrl: './security-alerts.component.html',
  styleUrls: ['./security-alerts.component.css']
})
export class SecurityAlertsComponent implements OnInit {
  @ViewChild('paginator') paginator: MatPaginator;
  //CHIP fields
  @ViewChild('groupByInput') groupByInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild(MatSort) sort: MatSort;
  links: UserPortalLinkClass[];
  alerts: MatTableDataSource<Object>;
  autoRefresh: boolean;
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  groupByCtrl = new FormControl();
  filteredGroups: Observable<string[]>;
  dynamicColumns: string[];
  allColumns: string[];
  allChipOptions: string[] = [];
  //END CHIP fields
  controlForm: FormGroup;

  constructor(private title: Title,
              private matSnackBarSrv: MatSnackBarService,
              private dialog: MatDialog,
              private alertSrv: AlertService,
              private fb: FormBuilder,
              private cookieService: CookieService,
              private portalSrv: PortalService) {
    this.setupControlFormGroupFromCookies();
    this.setAutoRefreshFromCookie();
    this.links = [];
    this.alerts = new MatTableDataSource();
    this.filteredGroups = this.groupByCtrl.valueChanges.pipe(
      startWith(null),
      map((group: string | null) => group ? this._filter(group) : this.allChipOptions.slice()));
  }

  isacknowledgedChecked(){
    return this.controlForm.get('acknowledged').value;
  }

  isEscalatedChecked(){
    return this.controlForm.get('escalated').value;
  }

  isShowClosedChecked(){
    return this.controlForm.get('showClosed').value;
  }

  isDynamicColumn(column: string){
    if (column === "actions" || column === "count"){
      return false;
    }
    return true;
  }

  getAggCount(alert: Object){
    if (alert){
      return alert["count"];
    }
    return 0;
  }

  getColumnValue(alert: Object, columnName: string){
    if (columnName === "@timestamp"){
      const time = new Date(alert[columnName]);
      return time.toISOString();
    }

    if (alert && columnName){
      return alert[columnName];
    }
    return "";
  }

  refreshAlerts(){
    this.updateAlertsTable(true);
  }

  ngOnInit() {
    this.title.setTitle("Security Alerts");
    this.loadDynamicColumnsFromCooke();
    this.populateChipOptions();
    this.updateAlertsTable();
    this.setPortalLinks();

    setInterval(() => {
      if (this.autoRefresh){
        this.updateAlertsTable();
      }
    }, 15000);
  }

  ngAfterViewInit(): void {
    this.alerts.paginator = this.paginator;
    this.alerts.sort = this.sort;
  }

  ngOnChanges() {
    this.alerts = new MatTableDataSource(this.alerts.data);
    this.alerts.paginator = this.paginator;
  }

  ngOnDestroy(){
      this.saveCookies();
      //Turn off auto refresh when we leave the page so its not running in the background.
      this.autoRefresh = false;
  }

  acknowledgeEvent(alert: Object) {
    const count = alert["count"];
    const paneString = `Are you sure you want to acknowledge ${count} alerts? \
                        \n\nDoing so will turn these alerts into a false positive \
                        which will not appear anymore on your alerts page.`;
    const paneTitle = 'Acknowledge Alerts';
    this._ackorUnsetAck(alert, paneTitle, paneString);
  }

  unSetacknowledgedEvent(alert: Object){
    const count = alert["count"];
    const paneString = `Are you sure you want to undo ${count} acknowledged alerts? \
                        \n\nDoing so will return the selected events back to their original state.`;
    const paneTitle = "Undo Acknowledged Alerts";
    this._ackorUnsetAck(alert, paneTitle, paneString);
  }

  escalateEvent(alert: Object) {
    alert['event.escalated'] = true;
    const kibanaLink = this.getKibanaLink(alert);
    delete alert['event.escalated'];

    const molohPrefix = this.getLink("arkime");
    let molochLink = "N/A";
    if (molohPrefix === ""){
      molochLink = "N/A - Failed to create because Moloch is not installed.";
    }

    const molochExpression = this.buildMolochExpression(alert);
    if (molochExpression === ""){
      const fields = this.getRequiredKibanaFields().join(', ');
      molochLink = `N/A - Failed to create Moloch link because you need one of the following Group By fields: ${fields}`;
    } else {
      molochLink = this.getMolochLink(alert, molohPrefix, molochExpression);
    }

    alert['form'] = this.controlForm.value;
    alert['links'] = this.links;

    forkJoin({
      hive_settings: this.alertSrv.getHiveSettings(),
      alerts: this.alertSrv.getAlertList(alert, 1)
    }).subscribe(data => {
      if (data.hive_settings["admin_api_key"] === "" || data.hive_settings["admin_api_key"] === "org_admin_api_key"){
        this.matSnackBarSrv.displaySnackBar(`Hive is not configured. Plase click on the Gear
          Icon in upper left hand corner of page and set your API key there.`);
        return;
      }

      if (!data.alerts){
        this.matSnackBarSrv.displaySnackBar("Failed to get event details for the selected Alert group.");
        return;
      }
      const alertDetails = data.alerts["hits"]["hits"][0];

      let title = "";
      let severity = "2";
      if (alertDetails && alertDetails["_source"] && alertDetails["_source"]["event"]){
        if (alertDetails["_source"]["event"]["kind"] === "signal"){
          title = alertDetails["_source"]["signal"]["rule"]["name"];
        } else {
          if (alertDetails["_source"]["rule"] && alertDetails["_source"]["rule"]["name"]){
            title = alertDetails["_source"]["rule"]["name"];
          }
        }
        if (alertDetails["_source"]["event"]["severity"]){
          severity = alertDetails["_source"]["event"]["severity"].toString();
        }
      }

      const count = alert["count"];
      const paneString = `Are you sure you want to escalate ${count} alerts? \
                          \n\nDoing so will create hive ticket.`;
      const paneTitle = 'Escalate Alerts';
      const eventTitleConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      eventTitleConfig.validatorOrOpts = [Validators.required];
      eventTitleConfig.tooltip = "Title of the case";
      eventTitleConfig.label = 'Title';
      eventTitleConfig.formState = title;

      const eventTagsConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      eventTagsConfig.tooltip = "Case tags";
      eventTagsConfig.label = 'Tags';
      eventTagsConfig.controlType = DialogControlTypes.chips;

      const eventDescriptionConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      eventDescriptionConfig.validatorOrOpts = [Validators.required];
      eventDescriptionConfig.tooltip = "Description of the case";
      eventDescriptionConfig.label = 'Description';
      eventDescriptionConfig.controlType = DialogControlTypes.textarea;
      eventDescriptionConfig.formState = `[Kibana SIEM Link](${kibanaLink})\n\n[Arkime Link](${molochLink})`;

      const eventSeverityConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      eventSeverityConfig.label = 'Severity';
      eventSeverityConfig.formState = severity;
      eventSeverityConfig.validatorOrOpts = [Validators.required];
      eventSeverityConfig.tooltip = "Severity of the case (1: low; 2: medium; 3: high)";
      eventSeverityConfig.controlType = DialogControlTypes.dropdown;
      eventSeverityConfig.options = ['1', '2', '3'];

      const escalateEventForm = this.fb.group({
        event_title: new DialogFormControl(eventTitleConfig),
        event_tags: new DialogFormControl(eventTagsConfig),
        event_severity: new DialogFormControl(eventSeverityConfig),
        event_description: new DialogFormControl(eventDescriptionConfig),
      });
      const dialogRef = this.dialog.open(ModalDialogMatComponent, {
        width: DIALOG_WIDTH,
        data: {
          title: paneTitle,
          instructions: paneString,
          dialogForm: escalateEventForm,
          confirmBtnText: "Save"
        }
      });
      dialogRef.afterClosed().subscribe (
        result => {
          const form = result as FormGroup;
          if(form && form.valid) {
            this.alertSrv.modifyAlert(alert, this.controlForm, true, form).subscribe(new_data=>{
              const new_count = new_data["total"];
              const msg = `Successfully performed operation on ${new_count} Alerts.`;
              this.matSnackBarSrv.displaySnackBar(msg);
              this.updateAlertsTable();
            }, err => {
              if (err && err["message"]){
                this.matSnackBarSrv.displaySnackBar(err["message"]);
              } else {
                this.matSnackBarSrv.displaySnackBar('Failed to acknowledge the Alert Aggregation for an unknown reason.');
              }
            });
          }
        }
      );
    });
 }

  // Filter
  filterAcknowledge(event: MatSlideToggleChange){
    if (event.checked){
      this.controlForm.get('escalated').setValue(false);
    }

    this.controlForm.get('showClosed').setValue(false);
    this.updateAlertsTable();
  }

  filterEscalated(event: MatSlideToggleChange){
    if (event.checked){
      this.controlForm.get('acknowledged').setValue(false);
    }
    this.controlForm.get('showClosed').setValue(false);
    this.updateAlertsTable();
  }

  showClosedAlerts(event: MatSlideToggleChange){
    this.updateAlertsTable();
  }

  //CHIP Start
  addChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (this.allChipOptions.includes(value.trim()) && !this.dynamicColumns.includes(value.trim())){
        this.dynamicColumns.push(value.trim());
        this.allColumns.push(value.trim());
        this.updateAlertsTable();
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.groupByCtrl.setValue(null);
  }

  removeChip(group: string): void {
    const index = this.dynamicColumns.indexOf(group);
    const index2 = this.allColumns.indexOf(group);

    if (index >= 0) {
      this.dynamicColumns.splice(index, 1);
      this.allColumns.splice(index2, 1);
      this.updateAlertsTable();
    }
  }

  selectedChip(event: MatAutocompleteSelectedEvent): void {
    if (!this.dynamicColumns.includes(event.option.viewValue)){
      this.dynamicColumns.push(event.option.viewValue);
      this.allColumns.push(event.option.viewValue);

      this.updateAlertsTable();
    }

    if (this.groupByInput.nativeElement.value){
      this.groupByInput.nativeElement.value = '';
    }

    this.groupByCtrl.setValue(null);
  }

  //CHIP End

  changeQueryTime(event: KeyboardEvent) {
    if (event && event.target['value'] !== "") {
      this.updateAlertsTable();
    }
  }

  timeIntervalChange(event: MatSelectChange){
    if (event) {
      this.updateAlertsTable();
    }
  }

  eventDrilldown(alert: Object) {
    alert['form'] = this.controlForm.value;
    alert['links'] = this.links;
    this.dialog.open(AlertDrillDownDialog, {
      width: DIALOG_WIDTH,
      data: alert
    });
  }

  openKibana(alert: Object) {
    const url = this.getKibanaLink(alert);
    const win = window.open(url, '_blank');
    win.focus();
  }

  openHive(alert: Object){
    alert['form'] = this.controlForm.value;
    alert['links'] = this.links;
    this.alertSrv.getAlertList(alert, 1).subscribe(data=> {
      const hive_id = Math.abs(data["hits"]["hits"][0]["_source"]["event"]["hive_id"]);
      const prefix = this.getLink("hive");
      const url = `${prefix}/index.html#!/case/~~${hive_id}/details`;
      const win = window.open(url, '_blank');
      win.focus();
    });
  }

  openMoloch(alert: Object){
    const prefix = this.getLink("arkime");

    if (prefix === ""){
      this.matSnackBarSrv.displaySnackBar("Arkime is not installed.  Please go to the catalog page and install it if you want this capability to work.");
      return;
    }

    const expression = this.buildMolochExpression(alert);
    if (expression === ""){
      const fields = this.getRequiredKibanaFields().join(', ');
      this.matSnackBarSrv.displaySnackBar(`Failed to pivot to Arkime because
you need one of the following Group By fields: ${fields}`);
      return;
    }

    const url = this.getMolochLink(alert, prefix, expression);
    const win = window.open(url, '_blank');
    win.focus();
  }

  openHiveTokenSettings(){

    this.alertSrv.getHiveSettings().subscribe(data => {
      const hiveKeyConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      hiveKeyConfig.validatorOrOpts = [Validators.minLength(32), Validators.maxLength(32), Validators.required];
      hiveKeyConfig.tooltip = "Must be a valid Hive token that is 32 characters in length.";
      hiveKeyConfig.label = 'HIVE Admin API Key';
      if (data && data['admin_api_key']){
        hiveKeyConfig.formState = data['admin_api_key'];
      } else {
        hiveKeyConfig.formState = '';
      }

      const hiveKeyConfig2: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      hiveKeyConfig2.validatorOrOpts = [Validators.minLength(32), Validators.maxLength(32), Validators.required];
      hiveKeyConfig2.tooltip = "Must be a valid Hive token that is 32 characters in length.";
      hiveKeyConfig2.label = 'HIVE Org Admin API Key';
      if (data && data['org_admin_api_key']){
        hiveKeyConfig2.formState = data['org_admin_api_key'];
      } else {
        hiveKeyConfig2.formState = '';
      }

      const hiveForm = this.fb.group({
        admin_api_key: new DialogFormControl(hiveKeyConfig),
        org_admin_api_key: new DialogFormControl(hiveKeyConfig2)
      });
      const dialogRef = this.dialog.open(ModalDialogMatComponent, {
        width: DIALOG_WIDTH,
        data: {
          title: "HIVE Settings",
          instructions: `In order to Hive event escalation to work, please
copy and paste the admin and org_admin Hive API keys in the boxes below. The key can be found inside the Hive's applcation settings.`,
          dialogForm: hiveForm,
          confirmBtnText: "Save"
        }
      });
      dialogRef.afterClosed().subscribe(
        result => {
          const form = result as FormGroup;
          if(form && form.valid) {
            this.alertSrv.saveHiveSettings(form).subscribe((_data) => {
              this.matSnackBarSrv.displaySnackBar(`Successfully saved the Hive API Key.`);
            }, err => {
              if (err['error'] && err['error']['message']){
                const message = err['error']['message'];
                this.matSnackBarSrv.displaySnackBar(`Failed to configure Hive webhook with ${message}`);
              } else {
                this.matSnackBarSrv.displaySnackBar(`Failed to save Hive API key for an unknown reason.
Please check the /var/log/tfplenum logs for more information`);
              }

            });
          }
        }
      );
    });
  }

  toggleAutoRefresh(){
    this.autoRefresh = !this.autoRefresh;
  }

  toggleAbsoluteTimeCtrls(){
    this.controlForm.get('absoluteTime').setValue(!this.controlForm.get('absoluteTime').value);
    this.setDateTimes();
    this.updateAlertsTable();
  }

  startDatetimeChange(event){
    this.validateDatetimes();
    this.updateAlertsTable();
  }

  endDatetimeChange(event){
    this.validateDatetimes();
    this.updateAlertsTable();
  }

  absoluteTime(): boolean{
    if(this.controlForm){
      return this.controlForm.get('absoluteTime').value;
    }
    return false;
  }

  private setAutoRefreshFromCookie(){
    const autoRefreshCookie = this.cookieService.get("autoRefresh");
    if (autoRefreshCookie.length > 0){
      this.autoRefresh = (autoRefreshCookie === "true");
    } else {
      this.autoRefresh = true;
    }
  }

  private setupControlFormGroupFromCookies(){
    const savedControls = this.cookieService.get("controlForm");
    if (savedControls.length > 0){
      const values = JSON.parse(savedControls);
      this.controlForm = this.fb.group({
        acknowledged: new FormControl(values['acknowledged']),
        escalated: new FormControl(values['escalated']),
        showClosed: new FormControl(values['showClosed']),
        timeInterval: new FormControl(values['timeInterval']),
        timeAmount: new FormControl(values['timeAmount']),
        startDatetime: new FormControl(new Date(values['startDatetime'])),
        endDatetime: new FormControl(new Date(values['endDatetime'])),
        absoluteTime: new FormControl(values['absoluteTime'])
      });
    } else {
      this.controlForm = this.fb.group({
        acknowledged: new FormControl(false),
        escalated: new FormControl(false),
        showClosed: new FormControl(false),
        timeInterval: new FormControl('hours'),
        timeAmount: new FormControl(24),
        startDatetime: new FormControl(),
        endDatetime: new FormControl(),
        absoluteTime: new FormControl(false)
      });
    }
  }

  private setPortalLinks(){
    this.portalSrv.get_portal_links().subscribe((data: any) => {
      this.links = data;
    });
  }


  private loadDynamicColumnsFromCooke(){
    const saved_columns = this.cookieService.get("dynamic-column");
    if (saved_columns.length > 0){
      this.dynamicColumns = JSON.parse(saved_columns);
    } else {
      this.dynamicColumns = ['event.module', 'event.kind', 'rule.name']; // NOTE: this will default to most basic options
    }
    this.allColumns =  ['actions', 'count'].concat(this.dynamicColumns);
  }

  private populateChipOptions(){
    this.alertSrv.getFields().subscribe(data => {
      this.allChipOptions = data as string[];
    });
  }

  private setDateTimes(){
    const timeAmt = this.controlForm.get('timeAmount').value;
    const timeInterval = this.controlForm.get('timeInterval').value;
    const initalDate = new Date();
    if (timeInterval === "days"){
      initalDate.setDate(initalDate.getDate() - timeAmt);
    } else if (timeInterval === "hours"){
      initalDate.setHours(initalDate.getHours() - timeAmt);
    } else if (timeInterval === "minutes") {
      initalDate.setMinutes(initalDate.getMinutes() - timeAmt);
    }

    this.controlForm.get('startDatetime').setValue(initalDate);
    this.controlForm.get('endDatetime').setValue(new Date());
  }

  private getStartDatetime(): string {
    return this.controlForm.get('startDatetime').value.toISOString();
  }

  private getEndDatetime(): string {
    return this.controlForm.get('endDatetime').value.toISOString();
  }

  private validateDatetimes(){
    if (this.controlForm.get('startDatetime').value >= this.controlForm.get('endDatetime').value){
      this.matSnackBarSrv.displaySnackBar("Zero results returned because start datetime cannot be larger than end datetime.");
    }
  }

  private updateAlertsTable(displayMessage:boolean=false){
    if (this.dynamicColumns.length > 0){
      if (!this.controlForm.get('absoluteTime').value){
        this.setDateTimes();
      }

      const acknowledge = this.isacknowledgedChecked();
      const escalated = this.isEscalatedChecked();
      const showClosed = this.isShowClosedChecked();
      this.saveCookies();
      this.alertSrv.getAlerts(this.dynamicColumns.join(","),
                              this.getStartDatetime(),
                              this.getEndDatetime(),
                              acknowledge, escalated, showClosed).subscribe(data => {
        this.alerts.data = data as object[];
        if (displayMessage){
          this.matSnackBarSrv.displaySnackBar("Successfully updated Alerts table!");
        }
      }, err => {
        if (err.status === 400){
          this.matSnackBarSrv.displaySnackBar(err.error["message"]);
        } else if (err.message){
          this.matSnackBarSrv.displaySnackBar(err.message);
        } else {
          this.matSnackBarSrv.displaySnackBar("Unknown failure. Check logs for more details.");
        }
      });
    } else {
      this.alerts.data = [];
    }
  }

  private saveCookies(){
    this.cookieService.set("dynamic-column", JSON.stringify(this.dynamicColumns));
    this.cookieService.set('controlForm', JSON.stringify(this.controlForm.value));
    this.cookieService.set('autoRefresh', this.autoRefresh.toString());
  }

  private _ackorUnsetAck(alert: Object, paneTitle: string, paneString: string){
    const option2 = "Confirm";
    const count = alert["count"];

    const dialogRef = this.dialog.open(ConfirmDailogComponent, {
      width: DIALOG_WIDTH,
      data: {
        paneString: paneString,
        paneTitle: paneTitle,
        option1: "Cancel",
        option2: option2
      },
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === option2) {
        this.alertSrv.modifyAlert(alert, this.controlForm, false).subscribe(data=>{
          const new_count = data["total"];
          const msg = `Successfully performed operation on ${new_count} Alerts.`;
          this.matSnackBarSrv.displaySnackBar(msg);
          this.updateAlertsTable();
        }, err => {
          this.matSnackBarSrv.displaySnackBar('Failed to acknowledge the Alert Aggregation for an unknown reason.');
        });

      }
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allChipOptions.filter(group => group.toLowerCase().indexOf(filterValue) === 0);
  }

  private getLink(search: string) {
    for (const entry of this.links){
      if (entry['dns'].includes(search)){
        return entry['dns'];
      }
    }
    return "";
  }

  private getQueryPiece(alert: Object): string {
    let ret_val = '';
    for (const field in alert){
      if (field === "count" || field === "form" || field === "links"){
        continue;
      }
      if (alert['event.kind'] === "signal" && field === "rule.name"){
        ret_val += 'signal.rule.name : "' + alert[field] + '" and ';
      } else {
        ret_val += field + ' : "' + alert[field] + '" and ';
      }
    }

    return ret_val.slice(0, ret_val.length - 5);
  }

  private getKibanaLink(alert: Object){
    const prefix = this.getLink("kibana");
    let query = this.getQueryPiece(alert);
    if (this.isEscalatedChecked()){
      query += " and event.escalated : true";
    }

    const startDateTime = this.getStartDatetime();
    const endDateTime = this.getEndDatetime();
    let page = 'overview';
    if (alert['event.kind'] && alert['event.kind'] === "signal"){
      page = "detections";
    } else if (alert['event.kind'] && alert['event.kind'] === "alert") {
      if (alert['event.module'] ) {
        if (alert['event.module'] === "zeek" || alert['event.module'] === "suricata"){
          page = "network/external-alerts";
        } else if (alert['event.module'] === "endgame" || alert['event.module'] === "system" || alert['event.module'] === "sysmon"){
          page = "hosts/alerts";
        }
      }
    }

    const url = `${prefix}/app/security/${page}?query=(language:kuery,query:'${query}')
    &timerange=(global:(linkTo:!(timeline),timerange:(from:%27${startDateTime}%27,kind:absolute,to:%27${endDateTime}%27)),
    timeline:(linkTo:!(global),timerange:(from:%27${startDateTime}%27,kind:absolute,to:%27${endDateTime}%27)))`;

    return url.replace(/'/g, "%27").replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");  //url.replaceAll("'", "%27").replaceAll(" ", "%20");
  }

  private getMolochLink(alert: Object, prefix: string, expression: string) {
    const startTime = Math.floor(this.controlForm.get('startDatetime').value.getTime() / 1000);
    const stopTime = Math.floor(this.controlForm.get('endDatetime').value.getTime() / 1000);
    const url = `${prefix}/sessions?graphType=lpHisto&seriesType=bars
&expression=${expression}&startTime=${startTime}&stopTime=${stopTime}`;
    return url;
  }

  private buildMolochExpression(alert: Object): string {
    const fields = this.getFields(alert);
    let url_part = "";
    for (const field of fields){
      const molochField = MOLOCH_FIELD_LOOKUP[field];
      if (molochField){
        const alertValue = alert[field];
        url_part += `${molochField}%20%3D%3D${alertValue}%26%26%20`;
      }
    }
    return url_part.slice(0, url_part.length - 9);
  }

  private getRequiredKibanaFields(){
    const fields = [];
    for (const field in MOLOCH_FIELD_LOOKUP){
      fields.push(field);
    }
    return fields;
  }

  private getFields(alert: Object) : string[]{
    const fields = [];
    for (const field in alert){
      if (field === 'count' || field === 'form' || field === 'links'){
        continue;
      }
      fields.push(field);
    }
    return fields;
  }
}

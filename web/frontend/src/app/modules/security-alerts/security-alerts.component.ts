import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

import { ErrorMessageClass, ObjectUtilitiesClass, PortalLinkClass } from '../../classes';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MAT_SNACKBAR_CONFIGURATION_60000_DUR } from '../../constants/cvah.constants';
import { ConfirmDialogMatDialogDataInterface } from '../../interfaces';
import {
  DialogControlTypes,
  DialogFormControl,
  DialogFormControlConfigClass
} from '../../modal-dialog-mat/modal-dialog-mat-form-types';
import { ModalDialogMatComponent } from '../../modal-dialog-mat/modal-dialog-mat.component';
import { CookieService } from '../../services/cookies.service';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { PortalService } from '../../services/portal.service';
import { AlertListClass, HiveSettingsClass, UpdateAlertsClass } from './classes';
import { AlertDrillDownDialogComponent } from './components/alert-drilldown-dialog/alert-drilldown-dialog.component';
import { AlertFormInterface, HiveSettingsInterface } from './interfaces';
import { AlertService } from './services/alerts.service';

const DIALOG_WIDTH = '1000px';
const MOLOCH_FIELD_LOOKUP = {
  'source.address': 'ip.src',
  'source.ip': 'ip.src',
  'source.port': 'port.src',
  'destination.port': 'port.dst',
  'destination.address': 'ip.dst',
  'destination.ip': 'ip.dst'
};


@Component({
  selector: 'app-security-alerts',
  templateUrl: './security-alerts.component.html',
  styleUrls: ['./security-alerts.component.css']
})
export class SecurityAlertsComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('paginator') paginator: MatPaginator;
  //CHIP fields
  @ViewChild('groupByInput') groupByInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild(MatSort) sort: MatSort;
  links: PortalLinkClass[];
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
    if (column === 'actions' || column === 'count'){
      return false;
    }
    return true;
  }

  getAggCount(update_alert: UpdateAlertsClass){
    return ObjectUtilitiesClass.notUndefNull(update_alert) &&
           ObjectUtilitiesClass.notUndefNull(update_alert.count) ? update_alert.count : 0;
  }

  getColumnValue(update_alert: UpdateAlertsClass, columnName: string){
    if (columnName === '@timestamp'){
      const time = new Date(alert[columnName]);
      return time.toISOString();
    }

    if (update_alert && columnName){
      return update_alert[columnName];
    }
    return '';
  }

  refreshAlerts(){
    this.updateAlertsTable(true);
  }

  ngOnInit() {
    this.title.setTitle('Security Alerts');
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

  acknowledgeEvent(update_alert: UpdateAlertsClass) {
    const paneString = `Are you sure you want to acknowledge ${update_alert.count} alerts? \
                        \n\nDoing so will turn these alerts into a false positive \
                        which will not appear anymore on your alerts page.`;
    const paneTitle = 'Acknowledge Alerts';
    this._ackorUnsetAck(update_alert, paneTitle, paneString);
  }

  removeAlerts(update_alert: UpdateAlertsClass) {
    const paneString = `Are you sure you want to remove ${update_alert.count} alerts? \
                        \n\nDoing so will turn these alerts into a false positive \
                        which will not appear anymore on your alerts page. Also, \
                        the hive case for these alerts shall be deleted. \
                        It is advised to close out cases in the hive application itself.`;
    const paneTitle = 'Remove Alerts';

    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: paneTitle,
      message: paneString,
      option1: 'Cancel',
      option2: 'Confirm'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: confirm_dialog,
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {

        update_alert.form = this.controlForm.getRawValue() as AlertFormInterface;
        this.alertSrv.remove_alerts(update_alert).subscribe(new_data=>{
          const new_count = new_data['total'];
          const msg = `Successfully performed operation on ${new_count} Alerts.`;
          this.matSnackBarSrv.displaySnackBar(msg);
          this.updateAlertsTable();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.matSnackBarSrv.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'removing alert';
            this.matSnackBarSrv.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
        });
      }
    });
  }

  unSetacknowledgedEvent(update_alert: UpdateAlertsClass){
    const paneString = `Are you sure you want to undo ${update_alert.count} acknowledged alerts? \
                        \n\nDoing so will return the selected events back to their original state.`;
    const paneTitle = 'Undo Acknowledged Alerts';
    this._ackorUnsetAck(update_alert, paneTitle, paneString);
  }

  escalateEvent(update_alert: UpdateAlertsClass) {
    update_alert['event.escalated'] = true;
    const kibanaLink = this.getKibanaLink(update_alert);
    delete update_alert['event.escalated'];

    const molohPrefix = this.getLink('arkime');
    let molochLink = 'N/A';
    if (molohPrefix === ''){
      molochLink = 'N/A - Failed to create because Moloch is not installed.';
    }

    const molochExpression = this.buildMolochExpression(update_alert);
    if (molochExpression === ''){
      const fields = this.getRequiredKibanaFields().join(', ');
      molochLink = `N/A - Failed to create Moloch link because you need one of the following Group By fields: ${fields}`;
    } else {
      molochLink = this.getMolochLink(molohPrefix, molochExpression);
    }

    update_alert.form = this.controlForm.value;
    update_alert.links = this.links;

    forkJoin({
      hive_settings: this.alertSrv.get_hive_settings(),
      alerts: this.alertSrv.get_alert_list(update_alert, 1)
    }).subscribe(data => {
      if (data.hive_settings['admin_api_key'] === '' || data.hive_settings['admin_api_key'] === 'org_admin_api_key'){
        this.matSnackBarSrv.displaySnackBar(`Hive is not configured. Plase click on the Gear
          Icon in upper left hand corner of page and set your API key there.`);
        return;
      }

      if (!data.alerts){
        this.matSnackBarSrv.displaySnackBar('Failed to get event details for the selected Alert group.');
        return;
      }
      const alertDetails = data.alerts['hits']['hits'][0];

      let title = '';
      let severity = '2';
      if (alertDetails && alertDetails['_source'] && alertDetails['_source']['event']){
        if (alertDetails['_source']['event']['kind'] === 'signal'){
          title = alertDetails['_source']['signal']['rule']['name'];
        } else {
          if (alertDetails['_source']['rule'] && alertDetails['_source']['rule']['name']){
            title = alertDetails['_source']['rule']['name'];
          }
        }
        if (alertDetails['_source']['event']['severity']){
          severity = alertDetails['_source']['event']['severity'].toString();
        }
      }

      const paneString = `Are you sure you want to escalate ${update_alert.count} alerts? \
                          \n\nDoing so will create hive ticket.`;
      const paneTitle = 'Escalate Alerts';
      const eventTitleConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      eventTitleConfig.validatorOrOpts = [Validators.required];
      eventTitleConfig.tooltip = 'Title of the case';
      eventTitleConfig.label = 'Title';
      eventTitleConfig.formState = title;
      const eventTagsConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      eventTagsConfig.tooltip = 'Case tags';
      eventTagsConfig.label = 'Tags';
      eventTagsConfig.controlType = DialogControlTypes.chips;
      const eventDescriptionConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      eventDescriptionConfig.validatorOrOpts = [Validators.required];
      eventDescriptionConfig.tooltip = 'Description of the case';
      eventDescriptionConfig.label = 'Description';
      eventDescriptionConfig.controlType = DialogControlTypes.textarea;
      eventDescriptionConfig.formState = `[Kibana SIEM Link](${kibanaLink})\n\n[Arkime Link](${molochLink})`;
      const eventSeverityConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      eventSeverityConfig.label = 'Severity';
      eventSeverityConfig.formState = severity;
      eventSeverityConfig.validatorOrOpts = [Validators.required];
      eventSeverityConfig.tooltip = 'Severity of the case (1: low; 2: medium; 3: high)';
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
          confirmBtnText: 'Save'
        }
      });
      dialogRef.afterClosed().subscribe (
        (response: FormGroup) => {
          if (ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            update_alert.form = this.controlForm.value;
            update_alert.form.performEscalation = true;
            update_alert.form.hiveForm = response.value;
            this.alertSrv.modify_alert(update_alert).subscribe(new_data=>{
              const new_count = new_data['total'];
              const msg = `Successfully performed operation on ${new_count} Alerts.`;
              this.matSnackBarSrv.displaySnackBar(msg);
              this.updateAlertsTable();
            },
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error instanceof ErrorMessageClass) {
                this.matSnackBarSrv.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
              } else {
                const message: string = 'modifying alert';
                this.matSnackBarSrv.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
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
    if (event && event.target['value'] !== '') {
      this.updateAlertsTable();
    }
  }

  timeIntervalChange(event: MatSelectChange){
    if (event) {
      this.updateAlertsTable();
    }
  }

  eventDrilldown(update_alert: UpdateAlertsClass) {
    update_alert.form = this.controlForm.value;
    update_alert.links = this.links;
    this.dialog.open(AlertDrillDownDialogComponent, {
      width: DIALOG_WIDTH,
      data: update_alert
    });
  }

  openKibana(update_alert: UpdateAlertsClass) {
    const url = this.getKibanaLink(update_alert);
    const win = window.open(url, '_blank');
    win.focus();
  }

  openHive(update_alert: UpdateAlertsClass){
    update_alert.form = this.controlForm.value;
    update_alert.links = this.links;
    this.alertSrv.get_alert_list(update_alert, 1).subscribe((data: AlertListClass)=> {
      const hive_id = Math.abs(data.hits.hits[0]._source.event['hive_id']);
      const prefix = this.getLink('hive');
      const url = `${prefix}/index.html#!/case/~~${hive_id}/details`;
      const win = window.open(url, '_blank');
      win.focus();
    });
  }

  openMoloch(update_alert: UpdateAlertsClass){
    const prefix = this.getLink('arkime');

    if (prefix === ''){
      this.matSnackBarSrv.displaySnackBar('Arkime is not installed.  Please go to the catalog page and install it if you want this capability to work.');
      return;
    }

    const expression = this.buildMolochExpression(update_alert);
    if (expression === ''){
      const fields = this.getRequiredKibanaFields().join(', ');
      this.matSnackBarSrv.displaySnackBar(`Failed to pivot to Arkime because
you need one of the following Group By fields: ${fields}`);
      return;
    }

    const url = this.getMolochLink(prefix, expression);
    const win = window.open(url, '_blank');
    win.focus();
  }

  openHiveTokenSettings(){

    this.alertSrv.get_hive_settings().subscribe((data: HiveSettingsClass) => {
      const hiveKeyConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      hiveKeyConfig.validatorOrOpts = [Validators.minLength(32), Validators.maxLength(32), Validators.required];
      hiveKeyConfig.tooltip = 'Must be a valid Hive token that is 32 characters in length.';
      hiveKeyConfig.label = 'HIVE Admin API Key';
      if (data && data['admin_api_key']){
        hiveKeyConfig.formState = data['admin_api_key'];
      } else {
        hiveKeyConfig.formState = '';
      }

      const hiveKeyConfig2: DialogFormControlConfigClass = new DialogFormControlConfigClass();
      hiveKeyConfig2.validatorOrOpts = [Validators.minLength(32), Validators.maxLength(32), Validators.required];
      hiveKeyConfig2.tooltip = 'Must be a valid Hive token that is 32 characters in length.';
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
          title: 'HIVE Settings',
          instructions: `In order to Hive event escalation to work, please
copy and paste the admin and org_admin Hive API keys in the boxes below. The key can be found inside the Hive's applcation settings.`,
          dialogForm: hiveForm,
          confirmBtnText: 'Save'
        }
      });
      dialogRef.afterClosed().subscribe(
        (response: FormGroup) => {
          if(ObjectUtilitiesClass.notUndefNull(response) && response.valid) {
            this.alertSrv.save_hive_settings(response.getRawValue() as HiveSettingsInterface).subscribe((_data) => {
              this.matSnackBarSrv.displaySnackBar(`Successfully saved the Hive API Key.`);
            },
            (error: ErrorMessageClass | HttpErrorResponse) => {
              if (error instanceof ErrorMessageClass) {
                this.matSnackBarSrv.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
              } else {
                const message: string = 'saving Hive API key for an unknown reason. Please check the /var/log/tfplenum logs for more information';
                this.matSnackBarSrv.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
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
    const autoRefreshCookie = this.cookieService.get('autoRefresh');
    if (autoRefreshCookie.length > 0){
      this.autoRefresh = (autoRefreshCookie === 'true');
    } else {
      this.autoRefresh = true;
    }
  }

  private setupControlFormGroupFromCookies(){
    const savedControls = this.cookieService.get('controlForm');
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
    this.portalSrv.get_portal_links().subscribe((data: PortalLinkClass[]) => {
      this.links = data;
    });
  }


  private loadDynamicColumnsFromCooke(){
    const saved_columns = this.cookieService.get('dynamic-column');
    if (saved_columns.length > 0){
      this.dynamicColumns = JSON.parse(saved_columns);
    } else {
      this.dynamicColumns = ['event.module', 'event.kind', 'rule.name']; // NOTE: this will default to most basic options
    }
    this.allColumns =  ['actions', 'count'].concat(this.dynamicColumns);
  }

  private populateChipOptions(){
    this.alertSrv.get_fields().subscribe((data: string[]) => {
      this.allChipOptions = data;
    });
  }

  private setDateTimes(){
    const timeAmt = this.controlForm.get('timeAmount').value;
    const timeInterval = this.controlForm.get('timeInterval').value;
    const initalDate = new Date();
    if (timeInterval === 'days'){
      initalDate.setDate(initalDate.getDate() - timeAmt);
    } else if (timeInterval === 'hours'){
      initalDate.setHours(initalDate.getHours() - timeAmt);
    } else if (timeInterval === 'minutes') {
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
      this.matSnackBarSrv.displaySnackBar('Zero results returned because start datetime cannot be larger than end datetime.');
    }
  }

  private updateAlertsTable(displayMessage: boolean=false){
    if (this.dynamicColumns.length > 0){
      if (!this.controlForm.get('absoluteTime').value){
        this.setDateTimes();
      }

      const acknowledge = this.isacknowledgedChecked();
      const escalated = this.isEscalatedChecked();
      const showClosed = this.isShowClosedChecked();
      this.saveCookies();
      this.alertSrv.get_alerts(this.dynamicColumns.join(','),
                               this.getStartDatetime(),
                               this.getEndDatetime(),
                               acknowledge, escalated, showClosed).subscribe((data: UpdateAlertsClass[]) => {
        this.alerts.data = data;
        if (displayMessage){
          this.matSnackBarSrv.displaySnackBar('Successfully updated Alerts table!');
        }
      },
      (error: ErrorMessageClass | HttpErrorResponse) => {
        if (error instanceof ErrorMessageClass) {
          this.matSnackBarSrv.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        } else {
          const message: string = 'retrieving alerts check logs for more details';
          this.matSnackBarSrv.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
        }
      });
    } else {
      this.alerts.data = [];
    }
  }

  private saveCookies(){
    this.cookieService.set('dynamic-column', JSON.stringify(this.dynamicColumns));
    this.cookieService.set('controlForm', JSON.stringify(this.controlForm.value));
    this.cookieService.set('autoRefresh', this.autoRefresh.toString());
  }

  private _ackorUnsetAck(update_alert: UpdateAlertsClass, paneTitle: string, paneString: string){
    const confirm_dialog: ConfirmDialogMatDialogDataInterface = {
      title: paneTitle,
      message: paneString,
      option1: 'Cancel',
      option2: 'Confirm'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: DIALOG_WIDTH,
      data: confirm_dialog,
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response === confirm_dialog.option2) {
        update_alert.form = this.controlForm.value;
        update_alert.form.performEscalation = false;
        this.alertSrv.modify_alert(update_alert).subscribe(data=>{
          const new_count = data['total'];
          const msg = `Successfully performed operation on ${new_count} Alerts.`;
          this.matSnackBarSrv.displaySnackBar(msg);
          this.updateAlertsTable();
        },
        (error: ErrorMessageClass | HttpErrorResponse) => {
          if (error instanceof ErrorMessageClass) {
            this.matSnackBarSrv.displaySnackBar(error.error_message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          } else {
            const message: string = 'modifying alert';
            this.matSnackBarSrv.generate_return_error_snackbar_message(message, MAT_SNACKBAR_CONFIGURATION_60000_DUR);
          }
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
    return '';
  }

  private getQueryPiece(update_alert: UpdateAlertsClass): string {
    let ret_val = '';
    for (const field in update_alert){
      if (field === 'count' || field === 'form' || field === 'links'){
        continue;
      }
      if (update_alert['event.kind'] === 'signal' && field === 'rule.name'){
        ret_val += 'signal.rule.name : "' + update_alert[field] + '" and ';
      } else {
        ret_val += field + ' : "' + update_alert[field] + '" and ';
      }
    }

    return ret_val.slice(0, ret_val.length - 5);
  }

  private getKibanaLink(update_alert: UpdateAlertsClass){
    const prefix = this.getLink('kibana');
    let query = this.getQueryPiece(update_alert);
    if (this.isEscalatedChecked()){
      query += ' and event.escalated : true';
    }

    const startDateTime = this.getStartDatetime();
    const endDateTime = this.getEndDatetime();
    let page = 'overview';
    if (update_alert['event.kind'] && update_alert['event.kind'] === 'signal'){
      page = 'detections';
    } else if (update_alert['event.kind'] && update_alert['event.kind'] === 'alert') {
      if (update_alert['event.module'] ) {
        if (update_alert['event.module'] === 'zeek' || update_alert['event.module'] === 'suricata'){
          page = 'network/external-alerts';
        } else if (update_alert['event.module'] === 'endgame') {
          // Since Endgame alerts do not show up on the SIEM engine page as we would expect we will instead pivot to the discover page only for this type of alert.
          return `${prefix}/app/discover#/?_g=(filters:!(),query:(language:kuery,query:''),refreshInterval:(pause:!t,value:0),time:(from:%27${startDateTime}%27,to:%27${endDateTime}%27))&_a=(columns:!(),filters:!(),index:endgame-dashboard-index-pattern,interval:auto,query:(language:kuery,query:'${query}'),sort:!(!('@timestamp',desc)))`;
        } else if (update_alert['event.module'] === 'system' || update_alert['event.module'] === 'sysmon') {
          page = 'hosts/alerts';
        }
      }
    }

    const url = `${prefix}/app/security/${page}?query=(language:kuery,query:'${query}')&timerange=(global:(linkTo:!(timeline),timerange:(from:%27${startDateTime}%27,kind:absolute,to:%27${endDateTime}%27)),timeline:(linkTo:!(global),timerange:(from:%27${startDateTime}%27,kind:absolute,to:%27${endDateTime}%27)))`;
    return url.replace(/'/g, '%27').replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

  private getMolochLink(prefix: string, expression: string) {
    const startTime = Math.floor(this.controlForm.get('startDatetime').value.getTime() / 1000);
    const stopTime = Math.floor(this.controlForm.get('endDatetime').value.getTime() / 1000);
    const url = `${prefix}/sessions?graphType=lpHisto&seriesType=bars&expression=${expression}&startTime=${startTime}&stopTime=${stopTime}`;
    return url;
  }

  private buildMolochExpression(update_alert: UpdateAlertsClass): string {
    const fields = this.getFields(update_alert);
    let url_part = '';
    for (const field of fields){
      const molochField = MOLOCH_FIELD_LOOKUP[field];
      if (molochField){
        const alertValue = update_alert[field];
        url_part += `${molochField}%20%3D%3D${alertValue}%26%26%20`;
      }
    }
    return url_part.slice(0, url_part.length - 9);
  }

  private getRequiredKibanaFields(){
    const fields = [];
    for (const field in MOLOCH_FIELD_LOOKUP){
      if (field) {
        fields.push(field);
      }
    }
    return fields;
  }

  private getFields(update_alert: UpdateAlertsClass) : string[]{
    const fields = [];
    for (const field in update_alert){
      if (field === 'count' || field === 'form' || field === 'links'){
        continue;
      }
      fields.push(field);
    }
    return fields;
  }
}

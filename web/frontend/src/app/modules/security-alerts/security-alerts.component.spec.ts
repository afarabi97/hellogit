import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { _MatAutocompleteBase, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { _MatOptionBase } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { of, throwError } from 'rxjs';

import {
  MockAlertListClassSignal,
  MockAlertListClassSuricata,
  MockErrorMessageClass,
  MockHiveSettingsClassAdminApiKeyDefaultText,
  MockHiveSettingsClassAdminApiKeyEmpty,
  MockModifyRemoveReturnClass,
  MockPortalLinkClass,
  MockUpdateAlertsClassBadICMPChecksum,
  MockUpdateAlertsClassCaptureLoss,
  MockUpdateAlertsClassDataBeforeEstablished,
  MockUpdateAlertsClassDataBeforeEstablishedDays,
  MockUpdateAlertsClassPossibleSplitRouting,
  MockUpdateAlertsClassWithArkimeFields
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import {
  MockAlertFormInterfaceDays,
  MockAlertFormInterfaceStartDateTimeGreaterThanEnd,
  MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesLess60,
  MockUpdateAlertsInterfaceWithArkimeFields
} from '../../../../static-data/interface-objects';
import { MockAlertFields } from '../../../../static-data/return-data';
import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION, TRUE } from '../../constants/cvah.constants';
import {
  DialogControlTypes,
  DialogFormControl,
  DialogFormControlConfigClass
} from '../../modal-dialog-mat/modal-dialog-mat-form-types';
import { TestingModule } from '../testing-modules/testing.module';
import { InjectorModule } from '../utilily-modules/injector.module';
import {
  ACTIONS_COLUMN_NAME,
  ALL_COLUMNS_START_VALUES,
  ARKIME,
  AUTO_REFRESH_COOKIE,
  COUNT_COLUMN_NAME,
  DYNAMIC_COLUMNS_COOKIE,
  DYNAMIC_COLUMNS_DEFAULT_VALUES,
  EVENT_DECRIPTION_CONFIG_LABEL,
  EVENT_DECRIPTION_CONFIG_TOOLTIP,
  EVENT_SEVERITY_CONFIG_LABEL,
  EVENT_SEVERITY_CONFIG_TOOLTIP,
  EVENT_TAGS_CONFIG_LABEL,
  EVENT_TAGS_CONFIG_TOOLTIP,
  EVENT_TITLE_CONFIG_LABEL,
  EVENT_TITLE_CONFIG_TOOLTIP,
  FORM_COLUMN_NAME,
  HOURS,
  KIBANA,
  KIBANA_DETECTIONS_PAGE,
  KIBANA_HOSTS_ALERTS_PAGE,
  KIBANA_NETWORK_EXTERNAL_PAGE,
  LINKS_COLUMN_NAME,
  MINUTES,
  MODIFY_API_SWITCH,
  NA_FAILED_ARKIME_NOT_INSTALLED,
  REMOVE_API_SWITCH,
  START_DATE_TIME_LARGE,
  TIME_FORM_GROUP_COOKIE,
  TIMESTAMP_SOURCE
} from './constants/security-alerts.constant';
import { AlertFormInterface } from './interfaces';
import { SecurityAlertsComponent } from './security-alerts.component';
import { SecurityAlertsModule } from './security-alerts.module';

class MatDialogRefMock {
  close() {
    return {
      afterClosed: () => of ()
    };
  }
}

class MatDialogMock {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  open() {
    return {
      afterClosed: () => of(null)
    };
  }
  closeAll() {
    return {
      afterClosed: () => of(null)
    };
  }
}

describe('SecurityAlertsComponent', () => {
  let component: SecurityAlertsComponent;
  let fixture: ComponentFixture<SecurityAlertsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyNGAfterViewInit: jasmine.Spy<any>;
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyNGOnDestroy: jasmine.Spy<any>;
  let spyToggleAutoRefresh: jasmine.Spy<any>;
  let spyRefreshAlerts: jasmine.Spy<any>;
  let spyChangeQueryTimeAmount: jasmine.Spy<any>;
  let spyTimeIntervalSelectionChange: jasmine.Spy<any>;
  let spyToggleAbsoluteTimeControls: jasmine.Spy<any>;
  let spyUseAbsoluteTime: jasmine.Spy<any>;
  let spyStartDateTimeChange: jasmine.Spy<any>;
  let spyFilterAcknowledge: jasmine.Spy<any>;
  let spyFilterEscalted: jasmine.Spy<any>;
  let spyFilterClosedAlerts: jasmine.Spy<any>;
  let spyAddAlertChip: jasmine.Spy<any>;
  let spyRemoveAlertChip: jasmine.Spy<any>;
  let spyAutocompleteSelectionChip: jasmine.Spy<any>;
  let spyGetTimeFormGroupFieldValue: jasmine.Spy<any>;
  let spyIsDynamicColumnName: jasmine.Spy<any>;
  let spyGetAlertCount: jasmine.Spy<any>;
  let spyGetColumnValue: jasmine.Spy<any>;
  let spyAcknowledgeEvent: jasmine.Spy<any>;
  let spyUnacknowledgedEvent: jasmine.Spy<any>;
  let spyRemoveAlertsConfirmDialog: jasmine.Spy<any>;
  let spyOpenAlertDrilldownDialog: jasmine.Spy<any>;
  let spyEscalateAlert: jasmine.Spy<any>;
  let spyOpenAlertInKibanaTab: jasmine.Spy<any>;
  let spyOpenAlertInArkimeTab: jasmine.Spy<any>;
  let spyOpenAlertInHiveTab: jasmine.Spy<any>;
  let spyInitializeTimeFormGroup: jasmine.Spy<any>;
  let spySetTimeFormGroup: jasmine.Spy<any>;
  let spyGetAutoRefresh: jasmine.Spy<any>;
  let spySetAutoRefresh: jasmine.Spy<any>;
  let spyGetDynamicColumns: jasmine.Spy<any>;
  let spySetDynamicColumns: jasmine.Spy<any>;
  let spySetAllColumns: jasmine.Spy<any>;
  let spyUpdateAlertsTable: jasmine.Spy<any>;
  let spySetMatTablePaginatorAndSort: jasmine.Spy<any>;
  let spyOpenConfirmDialog: jasmine.Spy<any>;
  let spyOpenEscalateAlert: jasmine.Spy<any>;
  let spySetDateTimes: jasmine.Spy<any>;
  let spyValidateDateTimes: jasmine.Spy<any>;
  let spyFilterChipOptions: jasmine.Spy<any>;
  let spyGetKibanaLink: jasmine.Spy<any>;
  let spyGetLink: jasmine.Spy<any>;
  let spyGetKibanaQuery: jasmine.Spy<any>;
  let spyBuildArkimeExpression: jasmine.Spy<any>;
  let spyGetArkimeLink: jasmine.Spy<any>;
  let spyGetFields: jasmine.Spy<any>;
  let spySuccessModifyRemoveAlerts: jasmine.Spy<any>;
  let spySaveCookies: jasmine.Spy<any>;
  let spyApiGetFields: jasmine.Spy<any>;
  let spyApiGetAlerts: jasmine.Spy<any>;
  let spyApiGetAlertList: jasmine.Spy<any>;
  let spyApiModifyAlert: jasmine.Spy<any>;
  let spyApiRemoveAlerts: jasmine.Spy<any>;
  let spyApiGetPortalLinks: jasmine.Spy<any>;
  let spyApiForkJoinGetHiveSettingsAndGetAlertsList: jasmine.Spy<any>;

  // Test Data
  const test_keyboard_event: KeyboardEvent = {
    target: {
      value: 'test'
    }
  } as any;
  const test_mat_select_change: MatSelectChange = {
    source: {} as MatSelect,
    value: true
  };
  const test_mat_slide_toggle_change: MatSlideToggleChange = {
    source: {} as MatSlideToggle,
    checked: true
  };
  const test_mat_chip_input_event: MatChipInputEvent = {
    input: {} as HTMLInputElement,
    value: 'as.number'
  };
  const test_mat_auto_complete_selected_event: MatAutocompleteSelectedEvent = {
    source: {} as _MatAutocompleteBase,
    option: {
      viewValue: 'as.number'
    } as _MatOptionBase
  };
  const test_column_name: string = 'event.module';
  const event_title_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  event_title_config.validatorOrOpts = [];
  event_title_config.tooltip = EVENT_TITLE_CONFIG_TOOLTIP;
  event_title_config.label = EVENT_TITLE_CONFIG_LABEL;
  event_title_config.formState = 'test';
  const event_tags_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  event_tags_config.tooltip = EVENT_TAGS_CONFIG_TOOLTIP;
  event_tags_config.label = EVENT_TAGS_CONFIG_LABEL;
  event_tags_config.controlType = DialogControlTypes.chips;
  const event_description_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  event_description_config.validatorOrOpts = [];
  event_description_config.tooltip = EVENT_DECRIPTION_CONFIG_TOOLTIP;
  event_description_config.label = EVENT_DECRIPTION_CONFIG_LABEL;
  event_description_config.controlType = DialogControlTypes.textarea;
  event_description_config.formState = `test`;
  const event_severity_config: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  event_severity_config.tooltip = EVENT_SEVERITY_CONFIG_TOOLTIP;
  event_severity_config.label = EVENT_SEVERITY_CONFIG_LABEL;
  event_severity_config.formState = '2';
  event_severity_config.validatorOrOpts = [];
  event_severity_config.controlType = DialogControlTypes.dropdown;
  event_severity_config.options = ['1', '2', '3'];
  const escalate_event_form_group: FormGroup = new FormGroup({
    event_title: new DialogFormControl(event_title_config),
    event_tags: new DialogFormControl(event_tags_config),
    event_severity: new DialogFormControl(event_severity_config),
    event_description: new DialogFormControl(event_description_config)
  });
  const escalate_event_form_group_return: FormGroup = new FormGroup({
    event_title: new FormControl('title'),
    event_tags: new FormControl('tags'),
    event_severity: new FormControl('2'),
    event_description: new FormControl('description'),
  });
  escalate_event_form_group_return.markAsTouched();
  escalate_event_form_group_return.markAllAsTouched();
  escalate_event_form_group_return.markAsDirty();
  const escalate_event_form_group_return_invalid: FormGroup = new FormGroup({
    event_title: new FormControl('title'),
    event_tags: new FormControl('tags'),
    event_severity: new FormControl('2'),
    event_description: new FormControl(null, [Validators.required]),
  });
  const test_arkime_prefix: string = 'https://arkime.test';
  const test_arkime_expression: string = 'ip.src%20%3D%3D10.9.6.101%26%26%20ip.dst%20%3D%3D209.141.59.124';
  const test_kibana_link: string = 'https://kibana.philpot/app/security/network/external-alerts?query=%28language:kuery,query:%27event.module%20:%20"zeek"%20and%20event.kind%20:%20"alert"%20and%20rule.name%20:%20"possible_split_routing"%20and%20source.ip%20:%20"10.9.6.101"%20and%20destination.ip%20:%20"209.141.59.124"%20and%20event.escalated%20:%20"true"%27%29&timerange=%28global:%28linkTo:!%28timeline%29,timerange:%28from:%272022-11-10T22:15:16.107Z%27,kind:absolute,to:%272022-11-11T22:15:16.107Z%27%29%29,timeline:%28linkTo:!%28global%29,timerange:%28from:%272022-11-10T22:15:16.107Z%27,kind:absolute,to:%272022-11-11T22:15:16.107Z%27%29%29%29';
  const test_arkime_link: string = 'https://arkime.philpot/sessions?graphType=lpHisto&seriesType=bars&expression=ip.src%20%3D%3D10.9.6.101%26%26%20ip.dst%20%3D%3D209.141.59.124&startTime=1668118516&stopTime=1668204916';
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        InjectorModule,
        SecurityAlertsModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: MAT_DIALOG_DATA, useValue: MockUpdateAlertsClassCaptureLoss }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityAlertsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyNGAfterViewInit = spyOn(component, 'ngAfterViewInit').and.callThrough();
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyNGOnDestroy = spyOn(component, 'ngOnDestroy').and.callThrough();
    spyToggleAutoRefresh = spyOn(component, 'toggle_auto_refresh').and.callThrough();
    spyRefreshAlerts = spyOn(component, 'refresh_alerts').and.callThrough();
    spyChangeQueryTimeAmount = spyOn(component, 'change_query_time_amount').and.callThrough();
    spyTimeIntervalSelectionChange = spyOn(component, 'time_interval_selection_change').and.callThrough();
    spyToggleAbsoluteTimeControls = spyOn(component, 'toggle_absolute_time_controls').and.callThrough();
    spyUseAbsoluteTime = spyOn(component, 'use_absolute_time').and.callThrough();
    spyStartDateTimeChange = spyOn(component, 'date_time_change').and.callThrough();
    spyFilterAcknowledge = spyOn(component, 'filter_acknowledged').and.callThrough();
    spyFilterEscalted = spyOn(component, 'filter_escalated').and.callThrough();
    spyFilterClosedAlerts = spyOn(component, 'filter_closed_alerts').and.callThrough();
    spyAddAlertChip = spyOn(component, 'add_alert_chip').and.callThrough();
    spyRemoveAlertChip = spyOn(component, 'remove_alert_chip').and.callThrough();
    spyAutocompleteSelectionChip = spyOn(component, 'autocomplete_selection_chip').and.callThrough();
    spyGetTimeFormGroupFieldValue = spyOn(component, 'get_time_form_group_field_value').and.callThrough();
    spyIsDynamicColumnName = spyOn(component, 'is_dynamic_column_name').and.callThrough();
    spyGetAlertCount = spyOn(component, 'get_alert_count').and.callThrough();
    spyGetColumnValue = spyOn(component, 'get_column_value').and.callThrough();
    spyAcknowledgeEvent = spyOn(component, 'acknowledge_event').and.callThrough();
    spyUnacknowledgedEvent = spyOn(component, 'unacknowledged_event').and.callThrough();
    spyRemoveAlertsConfirmDialog = spyOn(component, 'remove_alerts_confirm_dialog').and.callThrough();
    spyOpenAlertDrilldownDialog = spyOn(component, 'open_alert_drilldown_dialog').and.callThrough();
    spyEscalateAlert = spyOn(component, 'escalate_alert').and.callThrough();
    spyOpenAlertInKibanaTab = spyOn(component, 'open_alert_in_kibana_tab').and.callThrough();
    spyOpenAlertInArkimeTab = spyOn(component, 'open_alert_in_arkime_tab').and.callThrough();
    spyOpenAlertInHiveTab = spyOn(component, 'open_alert_in_hive_tab').and.callThrough();
    spyInitializeTimeFormGroup = spyOn<any>(component, 'initialize_time_form_group_').and.callThrough();
    spySetTimeFormGroup = spyOn<any>(component, 'set_time_form_group_').and.callThrough();
    spyGetAutoRefresh = spyOn<any>(component, 'get_auto_refresh_').and.callThrough();
    spySetAutoRefresh = spyOn<any>(component, 'set_suto_refresh_').and.callThrough();
    spyGetDynamicColumns = spyOn<any>(component, 'get_dynamic_columns_').and.callThrough();
    spySetDynamicColumns = spyOn<any>(component, 'set_dynamic_columns_').and.callThrough();
    spySetAllColumns = spyOn<any>(component, 'set_all_columns_').and.callThrough();
    spyUpdateAlertsTable = spyOn<any>(component, 'update_alerts_table_').and.callThrough();
    spySetMatTablePaginatorAndSort = spyOn<any>(component, 'set_mat_table_paginator_and_sort_').and.callThrough();
    spyOpenConfirmDialog = spyOn<any>(component, 'open_confirm_dialog_').and.callThrough();
    spyOpenEscalateAlert = spyOn<any>(component, 'open_escalate_alert_').and.callThrough();
    spySetDateTimes = spyOn<any>(component, 'set_date_times_').and.callThrough();
    spyValidateDateTimes = spyOn<any>(component, 'validate_date_times_').and.callThrough();
    spyFilterChipOptions = spyOn<any>(component, 'filter_chip_options_').and.callThrough();
    spyGetKibanaLink = spyOn<any>(component, 'get_kibana_link_').and.callThrough();
    spyGetLink = spyOn<any>(component, 'get_link_').and.callThrough();
    spyGetKibanaQuery = spyOn<any>(component, 'get_kibana_query_').and.callThrough();
    spyBuildArkimeExpression = spyOn<any>(component, 'build_arkime_expression_').and.callThrough();
    spyGetArkimeLink = spyOn<any>(component, 'get_arkime_link_').and.callThrough();
    spyGetFields = spyOn<any>(component, 'get_fields_').and.callThrough();
    spySuccessModifyRemoveAlerts = spyOn<any>(component, 'success_modify_remove_alerts_').and.callThrough();
    spySaveCookies = spyOn<any>(component, 'save_cookies_').and.callThrough();
    spyApiGetFields = spyOn<any>(component, 'api_get_fields_').and.callThrough();
    spyApiGetAlerts = spyOn<any>(component, 'api_get_alerts_').and.callThrough();
    spyApiGetAlertList = spyOn<any>(component, 'api_get_alert_list_').and.callThrough();
    spyApiModifyAlert = spyOn<any>(component, 'api_modify_alert_').and.callThrough();
    spyApiRemoveAlerts = spyOn<any>(component, 'api_remove_alerts_').and.callThrough();
    spyApiGetPortalLinks = spyOn<any>(component, 'api_get_portal_links_').and.callThrough();
    spyApiForkJoinGetHiveSettingsAndGetAlertsList = spyOn<any>(component, 'api_fork_join_get_hive_settings_and_get_alert_list_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyNGAfterViewInit.calls.reset();
    spyNGOnChanges.calls.reset();
    spyNGOnDestroy.calls.reset();
    spyToggleAutoRefresh.calls.reset();
    spyRefreshAlerts.calls.reset();
    spyChangeQueryTimeAmount.calls.reset();
    spyTimeIntervalSelectionChange.calls.reset();
    spyToggleAbsoluteTimeControls.calls.reset();
    spyUseAbsoluteTime.calls.reset();
    spyStartDateTimeChange.calls.reset();
    spyFilterAcknowledge.calls.reset();
    spyFilterEscalted.calls.reset();
    spyFilterClosedAlerts.calls.reset();
    spyAddAlertChip.calls.reset();
    spyRemoveAlertChip.calls.reset();
    spyAutocompleteSelectionChip.calls.reset();
    spyGetTimeFormGroupFieldValue.calls.reset();
    spyIsDynamicColumnName.calls.reset();
    spyGetAlertCount.calls.reset();
    spyGetColumnValue.calls.reset();
    spyAcknowledgeEvent.calls.reset();
    spyUnacknowledgedEvent.calls.reset();
    spyRemoveAlertsConfirmDialog.calls.reset();
    spyOpenAlertDrilldownDialog.calls.reset();
    spyEscalateAlert.calls.reset();
    spyOpenAlertInKibanaTab.calls.reset();
    spyOpenAlertInArkimeTab.calls.reset();
    spyOpenAlertInHiveTab.calls.reset();
    spyInitializeTimeFormGroup.calls.reset();
    spySetTimeFormGroup.calls.reset();
    spyGetAutoRefresh.calls.reset();
    spySetAutoRefresh.calls.reset();
    spyGetDynamicColumns.calls.reset();
    spySetDynamicColumns.calls.reset();
    spySetAllColumns.calls.reset();
    spyUpdateAlertsTable.calls.reset();
    spySetMatTablePaginatorAndSort.calls.reset();
    spyOpenConfirmDialog.calls.reset();
    spyOpenEscalateAlert.calls.reset();
    spySetDateTimes.calls.reset();
    spyValidateDateTimes.calls.reset();
    spyFilterChipOptions.calls.reset();
    spyGetKibanaLink.calls.reset();
    spyGetLink.calls.reset();
    spyGetKibanaQuery.calls.reset();
    spyBuildArkimeExpression.calls.reset();
    spyGetArkimeLink.calls.reset();
    spyGetFields.calls.reset();
    spySuccessModifyRemoveAlerts.calls.reset();
    spySaveCookies.calls.reset();
    spyApiGetFields.calls.reset();
    spyApiGetAlerts.calls.reset();
    spyApiGetAlertList.calls.reset();
    spyApiModifyAlert.calls.reset();
    spyApiRemoveAlerts.calls.reset();
    spyApiGetPortalLinks.calls.reset();
    spyApiForkJoinGetHiveSettingsAndGetAlertsList.calls.reset();
  };
  const set_time_form_group = (alert_form_interface: AlertFormInterface) => {
    const form_group = new FormGroup({});
    const keys: string[] = Object.keys(alert_form_interface);
    keys.forEach((key: string) => {
      form_group.addControl(key, new FormControl(alert_form_interface[key]));
    });

    return component.time_form_group = form_group;
  };

  afterAll(() => {
    component.ngOnDestroy();
    remove_styles_from_dom();
});

  it('should create SecurityAlertsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('SecurityAlertsComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_time_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_time_form_group_']).toHaveBeenCalled();
      });

      it('should call get_auto_refresh_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['get_auto_refresh_']).toHaveBeenCalled();
      });

      it('should call get_dynamic_columns_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['get_dynamic_columns_']).toHaveBeenCalled();
      });

      it('should call update_alerts_table_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });

      it('should call api_get_fields_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_fields_']).toHaveBeenCalled();
      });

      it('should call api_get_portal_links_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_portal_links_']).toHaveBeenCalled();
      });

      it('should call ngOnInit() and set alert_interval_', () => {
        reset();

        component['alert_interval_'] = undefined;

        expect(component['alert_interval_']).toBeUndefined();

        component.ngOnInit();

        expect(component['alert_interval_']).toBeDefined();
      });

      it('should call update_alerts_table_() from set interval from ngOnInit()', fakeAsync(() => {
        reset();

        component.ngOnInit();

        tick(15100);

        fixture.detectChanges();

        expect(component['update_alerts_table_']).toHaveBeenCalledTimes(2);
        discardPeriodicTasks();
      }));
    });

    describe('ngAfterViewInit()', () => {
      it('should call ngAfterViewInit()', () => {
        reset();

        component.ngAfterViewInit();

        expect(component.ngAfterViewInit).toHaveBeenCalled();
      });

      it('should call set_mat_table_paginator_and_sort_() from ngAfterViewInit()', () => {
        reset();

        component.ngAfterViewInit();

        expect(component['set_mat_table_paginator_and_sort_']).toHaveBeenCalled();
      });
    });

    describe('ngOnChanges()', () => {
      it('should call ngOnChanges()', () => {
        reset();

        component.ngOnChanges();

        expect(component.ngOnChanges).toHaveBeenCalled();
      });

      it('should call set_mat_table_paginator_and_sort_() from ngOnChanges()', () => {
        reset();

        component.ngOnChanges();

        expect(component['set_mat_table_paginator_and_sort_']).toHaveBeenCalled();
      });
    });

    describe('ngOnDestroy()', () => {
      it('should call ngOnDestroy()', () => {
        reset();

        component.ngOnDestroy();

        expect(component.ngOnDestroy).toHaveBeenCalled();
      });

      it('should call save_cookies_() from ngOnDestroy()', () => {
        reset();

        component.ngOnDestroy();

        expect(component['save_cookies_']).toHaveBeenCalled();
      });
    });

    describe('toggle_auto_refresh()', () => {
      it('should call toggle_auto_refresh()', () => {
        reset();

        component.auto_refresh = false;
        component.toggle_auto_refresh();

        expect(component.toggle_auto_refresh).toHaveBeenCalled();
      });

      it('should call toggle_auto_refresh() and set auto_refresh = true', () => {
        reset();

        component.auto_refresh = false;
        component.toggle_auto_refresh();

        expect(component.auto_refresh).toBeTrue();
      });

      it('should call toggle_auto_refresh() and set autoi_refresh = false', () => {
        reset();

        component.auto_refresh = true;
        component.toggle_auto_refresh();

        expect(component.auto_refresh).toBeFalse();
      });
    });

    describe('refresh_alerts()', () => {
      it('should call refresh_alerts()', () => {
        reset();

        component.refresh_alerts();

        expect(component.refresh_alerts).toHaveBeenCalled();
      });

      it('should call update_alerts_table_() from refresh_alerts()', () => {
        reset();

        component.refresh_alerts();

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });
    });

    describe('change_query_time_amount()', () => {
      it('should call change_query_time_amount()', () => {
        reset();

        component.change_query_time_amount(test_keyboard_event);

        expect(component.change_query_time_amount).toHaveBeenCalled();
      });

      it('should call update_alerts_table_() from change_query_time_amount()', () => {
        reset();

        component.change_query_time_amount(test_keyboard_event);

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });
    });

    describe('time_interval_selection_change()', () => {
      it('should call time_interval_selection_change()', () => {
        reset();

        component.time_interval_selection_change(test_mat_select_change);

        expect(component.time_interval_selection_change).toHaveBeenCalled();
      });

      it('should call update_alerts_table_() from time_interval_selection_change()', () => {
        reset();

        component.time_interval_selection_change(test_mat_select_change);

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });
    });

    describe('toggle_absolute_time_controls()', () => {
      it('should call toggle_absolute_time_controls()', () => {
        reset();

        component.toggle_absolute_time_controls();

        expect(component.toggle_absolute_time_controls).toHaveBeenCalled();
      });

      it('should call toggle_absolute_time_controls() and set time_form_group.absolute_time = !time_form_group.absolute_time', () => {
        reset();

        component.time_form_group.get(component.absolute_time).setValue(false);
        component.toggle_absolute_time_controls();

        expect(component.time_form_group.get(component.absolute_time).value).toBeTrue();
      });

      it('should call set_date_times_() from toggle_absolute_time_controls()', () => {
        reset();

        component.toggle_absolute_time_controls();

        expect(component['set_date_times_']).toHaveBeenCalled();
      });

      it('should call update_alerts_table_() from toggle_absolute_time_controls()', () => {
        reset();

        component.toggle_absolute_time_controls();

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });
    });

    describe('use_absolute_time()', () => {
      it('should call use_absolute_time()', () => {
        reset();

        component.use_absolute_time();

        expect(component.use_absolute_time).toHaveBeenCalled();
      });

      it('should call use_absolute_time() and return time_form_group.absolute_time', () => {
        reset();

        component.time_form_group.get(component.absolute_time).setValue(false);
        const return_value: boolean = component.use_absolute_time();

        expect(return_value).toBeFalse();
      });

      it('should call use_absolute_time() and return false', () => {
        reset();

        component.time_form_group = undefined;
        const return_value: boolean = component.use_absolute_time();

        expect(return_value).toBeFalse();
      });
    });

    describe('date_time_change()', () => {
      it('should call date_time_change()', () => {
        reset();

        component.date_time_change();

        expect(component.date_time_change).toHaveBeenCalled();
      });

      it('should call validate_date_times_() from date_time_change()', () => {
        reset();

        component.date_time_change();

        expect(component['validate_date_times_']).toHaveBeenCalled();
      });

      it('should call update_alerts_table_() from date_time_change()', () => {
        reset();

        component.date_time_change();

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });
    });

    describe('filter_acknowledged()', () => {
      it('should call filter_acknowledged()', () => {
        reset();

        component.filter_acknowledged(test_mat_slide_toggle_change);

        expect(component.filter_acknowledged).toHaveBeenCalled();
      });

      it('should call filter_acknowledged() and set time_form_group.escalated = false', () => {
        reset();

        component.time_form_group.get(component.escalated).setValue(true);
        component.filter_acknowledged(test_mat_slide_toggle_change);

        expect(component.time_form_group.get(component.escalated).value).toBeFalse();
      });

      it('should call filter_acknowledged() and set time_form_group.show_closed = false', () => {
        reset();

        component.time_form_group.get(component.show_closed).setValue(true);
        component.filter_acknowledged(test_mat_slide_toggle_change);

        expect(component.time_form_group.get(component.show_closed).value).toBeFalse();
      });

      it('should call update_alerts_table_() from filter_acknowledged()', () => {
        reset();

        component.filter_acknowledged(test_mat_slide_toggle_change);

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });
    });

    describe('filter_escalated()', () => {
      it('should call filter_escalated()', () => {
        reset();

        component.filter_escalated(test_mat_slide_toggle_change);

        expect(component.filter_escalated).toHaveBeenCalled();
      });

      it('should call filter_escalated() and set time_form_group.acknowledged = false', () => {
        reset();

        component.time_form_group.get(component.acknowledged).setValue(true);
        component.filter_escalated(test_mat_slide_toggle_change);

        expect(component.time_form_group.get(component.acknowledged).value).toBeFalse();
      });

      it('should call filter_escalated() and set time_form_group.show_closed = false', () => {
        reset();

        component.time_form_group.get(component.show_closed).setValue(true);
        component.filter_escalated(test_mat_slide_toggle_change);

        expect(component.time_form_group.get(component.show_closed).value).toBeFalse();
      });

      it('should call update_alerts_table_() from filter_escalated()', () => {
        reset();

        component.filter_escalated(test_mat_slide_toggle_change);

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });
    });

    describe('filter_closed_alerts()', () => {
      it('should call filter_closed_alerts()', () => {
        reset();

        component.filter_closed_alerts();

        expect(component.filter_closed_alerts).toHaveBeenCalled();
      });

      it('should call update_alerts_table_() from filter_closed_alerts()', () => {
        reset();

        component.filter_closed_alerts();

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });
    });

    describe('add_alert_chip()', () => {
      it('should call add_alert_chip()', () => {
        reset();

        component.add_alert_chip(test_mat_chip_input_event);

        expect(component.add_alert_chip).toHaveBeenCalled();
      });

      it('should call add_alert_chip() and add input event value to dynamic_columns', () => {
        reset();

        if (component.dynamic_columns.includes(test_mat_chip_input_event.value)) {
          component.dynamic_columns = component.dynamic_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }

        if (component.all_columns.includes(test_mat_chip_input_event.value)) {
          component.all_columns = component.all_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }
        component.add_alert_chip(test_mat_chip_input_event);

        expect(component.dynamic_columns.includes(test_mat_chip_input_event.value)).toBeTrue();
      });

      it('should call add_alert_chip() and add input event value to all_columns', () => {
        reset();

        if (component.dynamic_columns.includes(test_mat_chip_input_event.value)) {
          component.dynamic_columns = component.dynamic_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }

        if (component.all_columns.includes(test_mat_chip_input_event.value)) {
          component.all_columns = component.all_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }
        component.add_alert_chip(test_mat_chip_input_event);

        expect(component.all_columns.includes(test_mat_chip_input_event.value)).toBeTrue();
      });

      it('should call update_alerts_table_() from add_alert_chip()', () => {
        reset();

        if (component.dynamic_columns.includes(test_mat_chip_input_event.value)) {
          component.dynamic_columns = component.dynamic_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }

        if (component.all_columns.includes(test_mat_chip_input_event.value)) {
          component.all_columns = component.all_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }
        component.add_alert_chip(test_mat_chip_input_event);
        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });

      it('should call add_alert_chip() and set input.value = empty string', () => {
        reset();

        component.add_alert_chip(test_mat_chip_input_event);

        expect(test_mat_chip_input_event.input.value).toEqual('');
      });

      it('should call add_alert_chip() and set group_by_control = empty string', () => {
        reset();

        component.add_alert_chip(test_mat_chip_input_event);

        expect(component.group_by_control.value).toEqual('');
      });
    });

    describe('remove_alert_chip()', () => {
      it('should call remove_alert_chip()', () => {
        reset();

        if (!component.dynamic_columns.includes(test_mat_chip_input_event.value)) {
          component.dynamic_columns.push(test_mat_chip_input_event.value);
        }

        if (!component.all_columns.includes(test_mat_chip_input_event.value)) {
          component.all_columns.push(test_mat_chip_input_event.value);
        }
        component.remove_alert_chip(test_mat_chip_input_event.value);

        expect(component.remove_alert_chip).toHaveBeenCalled();
      });

      it('should call remove_alert_chip() and remove input value from dynamic_columns', () => {
        reset();

        if (!component.dynamic_columns.includes(test_mat_chip_input_event.value)) {
          component.dynamic_columns.push(test_mat_chip_input_event.value);
        }

        if (!component.all_columns.includes(test_mat_chip_input_event.value)) {
          component.all_columns.push(test_mat_chip_input_event.value);
        }
        component.remove_alert_chip(test_mat_chip_input_event.value);

        expect(component.dynamic_columns.includes(test_mat_chip_input_event.value)).toBeFalse();
      });

      it('should call remove_alert_chip() and remove input value from all_columns', () => {
        reset();

        if (!component.dynamic_columns.includes(test_mat_chip_input_event.value)) {
          component.dynamic_columns.push(test_mat_chip_input_event.value);
        }

        if (!component.all_columns.includes(test_mat_chip_input_event.value)) {
          component.all_columns.push(test_mat_chip_input_event.value);
        }
        component.remove_alert_chip(test_mat_chip_input_event.value);

        expect(component.all_columns.includes(test_mat_chip_input_event.value)).toBeFalse();
      });

      it('should call update_alerts_table_() from remove_alert_chip()', () => {
        reset();

        if (!component.dynamic_columns.includes(test_mat_chip_input_event.value)) {
          component.dynamic_columns.push(test_mat_chip_input_event.value);
        }

        if (!component.all_columns.includes(test_mat_chip_input_event.value)) {
          component.all_columns.push(test_mat_chip_input_event.value);
        }
        component.remove_alert_chip(test_mat_chip_input_event.value);

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });
    });

    describe('autocomplete_selection_chip()', () => {
      it('should call autocomplete_selection_chip()', () => {
        reset();

        component.autocomplete_selection_chip(test_mat_auto_complete_selected_event);

        expect(component.autocomplete_selection_chip).toHaveBeenCalled();
      });

      it('should call autocomplete_selection_chip() and add input event value to dynamic_columns', () => {
        reset();

        if (component.dynamic_columns.includes(test_mat_auto_complete_selected_event.option.viewValue)) {
          component.dynamic_columns = component.dynamic_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }

        if (component.all_columns.includes(test_mat_auto_complete_selected_event.option.viewValue)) {
          component.all_columns = component.all_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }
        component.autocomplete_selection_chip(test_mat_auto_complete_selected_event);

        expect(component.dynamic_columns.includes(test_mat_auto_complete_selected_event.option.viewValue)).toBeTrue();
      });

      it('should call autocomplete_selection_chip() and add input event value to all_columns', () => {
        reset();

        if (component.dynamic_columns.includes(test_mat_auto_complete_selected_event.option.viewValue)) {
          component.dynamic_columns = component.dynamic_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }

        if (component.all_columns.includes(test_mat_auto_complete_selected_event.option.viewValue)) {
          component.all_columns = component.all_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }
        component.autocomplete_selection_chip(test_mat_auto_complete_selected_event);

        expect(component.all_columns.includes(test_mat_auto_complete_selected_event.option.viewValue)).toBeTrue();
      });

      it('should call update_alerts_table_() from autocomplete_selection_chip()', () => {
        reset();

        if (component.dynamic_columns.includes(test_mat_auto_complete_selected_event.option.viewValue)) {
          component.dynamic_columns = component.dynamic_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }

        if (component.all_columns.includes(test_mat_auto_complete_selected_event.option.viewValue)) {
          component.all_columns = component.all_columns.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }
        component.autocomplete_selection_chip(test_mat_auto_complete_selected_event);

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });

      it('should call autocomplete_selection_chip() and set component.group_by_input_.nativeElement.value = empty string', () => {
        reset();

        component.autocomplete_selection_chip(test_mat_auto_complete_selected_event);

        expect(component['group_by_input_'].nativeElement.value).toEqual('');
      });

      it('should call autocomplete_selection_chip() and set group_by_control = empty string', () => {
        reset();

        component.autocomplete_selection_chip(test_mat_auto_complete_selected_event);

        expect(component.group_by_control.value).toEqual('');
      });
    });

    describe('get_time_form_group_field_value()', () => {
      it('should call get_time_form_group_field_value()', () => {
        reset();

        component.get_time_form_group_field_value(component.acknowledged);

        expect(component.get_time_form_group_field_value).toHaveBeenCalled();
      });

      it('should call get_time_form_group_field_value() and return boolean true', () => {
        reset();

        const return_value: boolean = (component.get_time_form_group_field_value(component.absolute_time) as boolean);

        expect(return_value).toBeFalse();
      });
    });

    describe('is_dynamic_column_name()', () => {
      it('should call is_dynamic_column_name()', () => {
        reset();

        component.is_dynamic_column_name(ACTIONS_COLUMN_NAME);

        expect(component.is_dynamic_column_name).toHaveBeenCalled();
      });

      it('should call is_dynamic_column_name() and return boolean true', () => {
        reset();

        const return_value: boolean = component.is_dynamic_column_name('test.column');

        expect(return_value).toBeTrue();
      });

      it('should call is_dynamic_column_name() and return boolean false', () => {
        reset();

        let return_value: boolean = component.is_dynamic_column_name(ACTIONS_COLUMN_NAME);

        expect(return_value).toBeFalse();

        return_value = component.is_dynamic_column_name(COUNT_COLUMN_NAME);

        expect(return_value).toBeFalse();
      });
    });

    describe('get_alert_count()', () => {
      it('should call get_alert_count()', () => {
        reset();

        component.get_alert_count(MockUpdateAlertsClassCaptureLoss);

        expect(component.get_alert_count).toHaveBeenCalled();
      });

      it('should call get_alert_count() and return update_alert.count', () => {
        reset();

        const return_value: number = component.get_alert_count(MockUpdateAlertsClassCaptureLoss);

        expect(return_value).toEqual(MockUpdateAlertsClassCaptureLoss.count);
      });

      it('should call get_alert_count() and return 0', () => {
        reset();


        const return_value: number = component.get_alert_count(undefined);

        expect(return_value).toEqual(0);
      });
    });

    describe('get_column_value()', () => {
      it('should call get_column_value()', () => {
        reset();

        component.get_column_value(MockUpdateAlertsClassCaptureLoss, test_column_name);

        expect(component.get_column_value).toHaveBeenCalled();
      });

      it('should call get_column_value() and return new date', () => {
        reset();

        const return_value: string = component.get_column_value(MockUpdateAlertsInterfaceWithArkimeFields, TIMESTAMP_SOURCE);

        expect(return_value).not.toEqual('');
        expect(return_value).toEqual(MockUpdateAlertsInterfaceWithArkimeFields[TIMESTAMP_SOURCE]);
      });

      it('should call get_column_value() and return update_alert[column_name]', () => {
        reset();

        const return_value: string = component.get_column_value(MockUpdateAlertsClassCaptureLoss, test_column_name);

        expect(return_value).toEqual(MockUpdateAlertsClassCaptureLoss[test_column_name]);
      });

      it('should call get_column_value() and return empty string', () => {
        reset();


        const return_value: string = component.get_column_value(MockUpdateAlertsClassCaptureLoss, '');

        expect(return_value).toEqual('');
      });
    });

    describe('acknowledge_event()', () => {
      it('should call acknowledge_event()', () => {
        reset();

        component.acknowledge_event(MockUpdateAlertsClassCaptureLoss);

        expect(component.acknowledge_event).toHaveBeenCalled();
      });

      it('should call open_confirm_dialog_() from acknowledge_event()', () => {
        reset();

        component.acknowledge_event(MockUpdateAlertsClassCaptureLoss);

        expect(component['open_confirm_dialog_']).toHaveBeenCalled();
      });
    });

    describe('unacknowledged_event()', () => {
      it('should call unacknowledged_event()', () => {
        reset();

        component.unacknowledged_event(MockUpdateAlertsClassCaptureLoss);

        expect(component.unacknowledged_event).toHaveBeenCalled();
      });

      it('should call open_confirm_dialog_() from unacknowledged_event()', () => {
        reset();

        component.unacknowledged_event(MockUpdateAlertsClassCaptureLoss);

        expect(component['open_confirm_dialog_']).toHaveBeenCalled();
      });
    });

    describe('remove_alerts_confirm_dialog()', () => {
      it('should call remove_alerts_confirm_dialog()', () => {
        reset();

        component.remove_alerts_confirm_dialog(MockUpdateAlertsClassCaptureLoss);

        expect(component.remove_alerts_confirm_dialog).toHaveBeenCalled();
      });

      it('should call open_confirm_dialog_() from remove_alerts_confirm_dialog()', () => {
        reset();

        component.remove_alerts_confirm_dialog(MockUpdateAlertsClassCaptureLoss);

        expect(component['open_confirm_dialog_']).toHaveBeenCalled();
      });
    });

    describe('open_alert_drilldown_dialog()', () => {
      it('should call open_alert_drilldown_dialog()', () => {
        reset();

        component.open_alert_drilldown_dialog(MockUpdateAlertsClassCaptureLoss);

        expect(component.open_alert_drilldown_dialog).toHaveBeenCalled();
      });

      it('should call open_alert_drilldown_dialog() and update update_alert.form with time_form_group', () => {
        reset();

        component.open_alert_drilldown_dialog(MockUpdateAlertsClassCaptureLoss);

        expect(MockUpdateAlertsClassCaptureLoss.form).toEqual(component.time_form_group.getRawValue() as AlertFormInterface);
      });

      it('should call open_alert_drilldown_dialog() and update update_alert.links with portal_links_', () => {
        reset();

        component.open_alert_drilldown_dialog(MockUpdateAlertsClassCaptureLoss);

        expect(MockUpdateAlertsClassCaptureLoss.links).toEqual(component['portal_links_']);
      });
    });

    describe('escalate_alert()', () => {
      it('should call escalate_alert()', () => {
        reset();

        component.escalate_alert(MockUpdateAlertsClassCaptureLoss);

        expect(component.escalate_alert).toHaveBeenCalled();
      });

      it('should call escalate_alert() and update update_alert[event.escalted] with true', () => {
        reset();

        component.escalate_alert(MockUpdateAlertsClassCaptureLoss);

        expect(MockUpdateAlertsClassCaptureLoss['event.escalated']).toBeTrue();
      });

      it('should call escalate_alert() and update update_alert.form with time_form_group', () => {
        reset();

        component.escalate_alert(MockUpdateAlertsClassCaptureLoss);

        expect(MockUpdateAlertsClassCaptureLoss.form).toEqual(component.time_form_group.getRawValue() as AlertFormInterface);
      });

      it('should call escalate_alert() and update update_alert.links with portal_links_', () => {
        reset();

        component.escalate_alert(MockUpdateAlertsClassCaptureLoss);

        expect(MockUpdateAlertsClassCaptureLoss.links).toEqual(component['portal_links_']);
      });

      it('should call get_kibana_link_() from escalate_alert()', () => {
        reset();

        component.escalate_alert(MockUpdateAlertsClassCaptureLoss);

        expect(component['get_kibana_link_']).toHaveBeenCalled();
      });

      it('should call get_link_() from escalate_alert()', () => {
        reset();

        component.escalate_alert(MockUpdateAlertsClassCaptureLoss);

        expect(component['get_link_']).toHaveBeenCalled();
      });

      it('should call build_arkime_expression_() from escalate_alert()', () => {
        reset();

        component.escalate_alert(MockUpdateAlertsClassCaptureLoss);

        expect(component['build_arkime_expression_']).toHaveBeenCalled();
      });

      it('should call get_arkime_link_() from escalate_alert()', () => {
        reset();

        component.escalate_alert(MockUpdateAlertsClassCaptureLoss);

        expect(component['get_arkime_link_']).toHaveBeenCalled();
      });

      it('should call api_fork_join_get_hive_settings_and_get_alert_list_() from escalate_alert()', () => {
        reset();

        component.escalate_alert(MockUpdateAlertsClassCaptureLoss);

        expect(component['api_fork_join_get_hive_settings_and_get_alert_list_']).toHaveBeenCalled();
      });
    });

    describe('open_alert_in_kibana_tab()', () => {
      it('should call open_alert_in_kibana_tab()', () => {
        reset();

        component.open_alert_in_kibana_tab(MockUpdateAlertsClassCaptureLoss);

        expect(component.open_alert_in_kibana_tab).toHaveBeenCalled();
      });

      it('should call get_kibana_link_() from open_alert_in_kibana_tab()', () => {
        reset();

        component.open_alert_in_kibana_tab(MockUpdateAlertsClassCaptureLoss);

        expect(component['get_kibana_link_']).toHaveBeenCalled();
      });

      it('should call windows_redirect_handler_service_.open_in_new_tab() from open_alert_in_kibana_tab()', () => {
        reset();

        component.open_alert_in_kibana_tab(MockUpdateAlertsClassCaptureLoss);

        expect(component['windows_redirect_handler_service_'].open_in_new_tab).toHaveBeenCalled();
      });
    });

    describe('open_alert_in_arkime_tab()', () => {
      it('should call open_alert_in_arkime_tab()', () => {
        reset();

        component.open_alert_in_arkime_tab(MockUpdateAlertsClassCaptureLoss);

        expect(component.open_alert_in_arkime_tab).toHaveBeenCalled();
      });

      it('should call get_link_() from open_alert_in_arkime_tab()', () => {
        reset();

        component.open_alert_in_arkime_tab(MockUpdateAlertsClassCaptureLoss);

        expect(component['get_link_']).toHaveBeenCalled();
      });

      it('should call build_arkime_expression_() from open_alert_in_arkime_tab()', () => {
        reset();

        component.open_alert_in_arkime_tab(MockUpdateAlertsClassCaptureLoss);

        expect(component['build_arkime_expression_']).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from open_alert_in_arkime_tab() when arkime_prefix = empty string', () => {
        reset();

        component['portal_links_'] = [];
        component.open_alert_in_arkime_tab(MockUpdateAlertsClassCaptureLoss);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from open_alert_in_arkime_tab() when arkime_expression = empty string', () => {
        reset();

        component['portal_links_'] = [];
        component.open_alert_in_arkime_tab(MockUpdateAlertsClassCaptureLoss);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call get_arkime_link_() from open_alert_in_arkime_tab()', () => {
        reset();

        component.open_alert_in_arkime_tab(MockUpdateAlertsClassWithArkimeFields);

        expect(component['get_arkime_link_']).toHaveBeenCalled();
      });

      it('should call windows_redirect_handler_service_.open_in_new_tab() from open_alert_in_arkime_tab()', () => {
        reset();

        component.open_alert_in_arkime_tab(MockUpdateAlertsClassWithArkimeFields);

        expect(component['windows_redirect_handler_service_'].open_in_new_tab).toHaveBeenCalled();
      });
    });

    describe('open_alert_in_hive_tab()', () => {
      it('should call open_alert_in_hive_tab()', () => {
        reset();

        component.open_alert_in_hive_tab(MockUpdateAlertsClassCaptureLoss);

        expect(component.open_alert_in_hive_tab).toHaveBeenCalled();
      });

      it('should call open_alert_in_hive_tab() and update update_alert.form with time_form_group', () => {
        reset();

        component.open_alert_in_hive_tab(MockUpdateAlertsClassCaptureLoss);

        expect(MockUpdateAlertsClassCaptureLoss.form).toEqual(component.time_form_group.getRawValue() as AlertFormInterface);
      });

      it('should call open_alert_in_hive_tab() and update update_alert.links with portal_links_', () => {
        reset();

        component.open_alert_in_hive_tab(MockUpdateAlertsClassCaptureLoss);

        expect(MockUpdateAlertsClassCaptureLoss.links).toEqual(component['portal_links_']);
      });

      it('should call api_get_alert_list_() from open_alert_in_hive_tab()', () => {
        reset();

        component.open_alert_in_hive_tab(MockUpdateAlertsClassCaptureLoss);

        expect(component['api_get_alert_list_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_time_form_group_()', () => {
      it('should call initialize_time_form_group_()', () => {
        reset();

        component['initialize_time_form_group_']();

        expect(component['initialize_time_form_group_']).toHaveBeenCalled();
      });

      it('should call cookie_service_.get() from initialize_time_form_group_()', () => {
        reset();

        component['initialize_time_form_group_']();

        expect(component['cookie_service_'].get).toHaveBeenCalled();
      });

      it('should call initialize_time_form_group_() and set const time_form_group with cookie values', () => {
        reset();

        component['cookie_service_'].set(TIME_FORM_GROUP_COOKIE, JSON.stringify(MockAlertFormInterfaceDays));
        component['initialize_time_form_group_']();

        expect((component.time_form_group.get(component.start_date_time).value as Date)).toEqual(MockAlertFormInterfaceDays.startDatetime);
      });

      it('should call initialize_time_form_group_() and set const time_form_group with default values', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['cookie_service_'], 'get').and.returnValue(of(undefined));

        component['initialize_time_form_group_']();

        expect(component.time_form_group.get(component.start_date_time).value).toBeNull();
      });

      it('should call set_time_form_group_() from initialize_time_form_group_()', () => {
        reset();

        component['initialize_time_form_group_']();

        expect(component['set_time_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private set_time_form_group_()', () => {
      it('should call set_time_form_group_()', () => {
        reset();

        component['set_time_form_group_'](set_time_form_group(MockAlertFormInterfaceDays));

        expect(component['set_time_form_group_']).toHaveBeenCalled();
      });

      it('should call set_time_form_group_() and set time_form_group with passed value', () => {
        reset();

        component['set_time_form_group_'](set_time_form_group(MockAlertFormInterfaceDays));

        expect((component.time_form_group.get(component.start_date_time).value as Date)).toEqual(MockAlertFormInterfaceDays.startDatetime);
      });
    });

    describe('private get_auto_refresh_()', () => {
      it('should call get_auto_refresh_()', () => {
        reset();

        component['get_auto_refresh_']();

        expect(component['get_auto_refresh_']).toHaveBeenCalled();
      });

      it('should call cookie_service_.get() from get_auto_refresh_()', () => {
        reset();

        component['get_auto_refresh_']();

        expect(component['cookie_service_'].get).toHaveBeenCalled();
      });

      it('should call get_auto_refresh_() and handle cookie found', () => {
        reset();

        component['cookie_service_'].set(AUTO_REFRESH_COOKIE, TRUE);
        component['get_auto_refresh_']();

        expect(component['get_auto_refresh_']).toHaveBeenCalled();
      });

      it('should call get_auto_refresh_() and handle cookie not found', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['cookie_service_'], 'get').and.returnValue(of(undefined));

        component['get_auto_refresh_']();

        expect(component['get_auto_refresh_']).toHaveBeenCalled();
      });

      it('should call set_suto_refresh_() from get_auto_refresh_()', () => {
        reset();

        component['get_auto_refresh_']();

        expect(component['set_suto_refresh_']).toHaveBeenCalled();
      });
    });

    describe('private set_suto_refresh_()', () => {
      it('should call set_suto_refresh_()', () => {
        reset();

        component['set_suto_refresh_'](true);

        expect(component['set_suto_refresh_']).toHaveBeenCalled();
      });

      it('should call set_suto_refresh_() and set auto_refresh with passed value', () => {
        reset();

        component['set_suto_refresh_'](true);

        expect(component.auto_refresh).toBeTrue();
      });
    });

    describe('private get_dynamic_columns_()', () => {
      it('should call get_dynamic_columns_()', () => {
        reset();

        component['get_dynamic_columns_']();

        expect(component['get_dynamic_columns_']).toHaveBeenCalled();
      });

      it('should call cookie_service_.get() from get_dynamic_columns_()', () => {
        reset();

        component['get_dynamic_columns_']();

        expect(component['cookie_service_'].get).toHaveBeenCalled();
      });

      it('should call get_dynamic_columns_() and handle cookie found', () => {
        reset();

        component['cookie_service_'].set(DYNAMIC_COLUMNS_COOKIE, JSON.stringify(DYNAMIC_COLUMNS_DEFAULT_VALUES));
        component['get_dynamic_columns_']();

        expect(component['get_dynamic_columns_']).toHaveBeenCalled();
      });

      it('should call get_dynamic_columns_() and handle cookie not found', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['cookie_service_'], 'get').and.returnValue(of(undefined));

        component['get_dynamic_columns_']();

        expect(component['get_dynamic_columns_']).toHaveBeenCalled();
      });

      it('should call set_dynamic_columns_() from get_dynamic_columns_()', () => {
        reset();

        component['get_dynamic_columns_']();

        expect(component['set_dynamic_columns_']).toHaveBeenCalled();
      });

      it('should call set_all_columns_() from get_dynamic_columns_()', () => {
        reset();

        component['get_dynamic_columns_']();

        expect(component['set_all_columns_']).toHaveBeenCalled();
      });
    });

    describe('private set_dynamic_columns_()', () => {
      it('should call set_dynamic_columns_()', () => {
        reset();

        component['set_dynamic_columns_'](DYNAMIC_COLUMNS_DEFAULT_VALUES);

        expect(component['set_dynamic_columns_']).toHaveBeenCalled();
      });

      it('should call set_dynamic_columns_() and set dynamic_columns with passed value', () => {
        reset();

        component['set_dynamic_columns_'](DYNAMIC_COLUMNS_DEFAULT_VALUES);

        expect(component.dynamic_columns).toEqual(DYNAMIC_COLUMNS_DEFAULT_VALUES);
      });
    });

    describe('private set_all_columns_()', () => {
      it('should call set_all_columns_()', () => {
        reset();

        component['set_all_columns_'](DYNAMIC_COLUMNS_DEFAULT_VALUES);

        expect(component['set_all_columns_']).toHaveBeenCalled();
      });

      it('should call set_all_columns_() and set dynamic_columns with passed value', () => {
        reset();

        component['set_all_columns_'](DYNAMIC_COLUMNS_DEFAULT_VALUES);

        expect(component.all_columns).toEqual(ALL_COLUMNS_START_VALUES.concat(DYNAMIC_COLUMNS_DEFAULT_VALUES));
      });
    });

    describe('private update_alerts_table_()', () => {
      it('should call update_alerts_table_()', () => {
        reset();

        component.dynamic_columns = [];
        component['update_alerts_table_']();

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });

      it('should call get_time_form_group_field_value() from update_alerts_table_', () => {
        reset();

        component.dynamic_columns = DYNAMIC_COLUMNS_DEFAULT_VALUES;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['update_alerts_table_'](true);

        expect(component['get_time_form_group_field_value']).toHaveBeenCalled();
      });

      it('should call set_date_times_() from update_alerts_table_', () => {
        reset();

        component.dynamic_columns = DYNAMIC_COLUMNS_DEFAULT_VALUES;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['update_alerts_table_'](true);

        expect(component['set_date_times_']).toHaveBeenCalled();
      });

      it('should call api_get_alerts_() from update_alerts_table_', () => {
        reset();

        component.dynamic_columns = DYNAMIC_COLUMNS_DEFAULT_VALUES;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['update_alerts_table_'](true);

        expect(component['api_get_alerts_']).toHaveBeenCalled();
      });

      it('should call save_cookies_() from update_alerts_table_', () => {
        reset();

        component.dynamic_columns = DYNAMIC_COLUMNS_DEFAULT_VALUES;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['update_alerts_table_'](true);

        expect(component['save_cookies_']).toHaveBeenCalled();
      });
    });

    describe('private set_mat_table_paginator_and_sort_()', () => {
      it('should call set_mat_table_paginator_and_sort_()', () => {
        reset();

        component['set_mat_table_paginator_and_sort_']();

        expect(component['set_mat_table_paginator_and_sort_']).toHaveBeenCalled();
      });
    });

    describe('private open_confirm_dialog_()', () => {
      it('should call open_confirm_dialog_()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_confirm_dialog_'](MockUpdateAlertsClassCaptureLoss, EVENT_TITLE_CONFIG_TOOLTIP, START_DATE_TIME_LARGE, '');

        expect(component['open_confirm_dialog_']).toHaveBeenCalled();
      });

      it('should call open_confirm_dialog_() and set update_alert[form] = time_form_group when external dialog confirm pressed', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        MockUpdateAlertsClassCaptureLoss['form'] = undefined;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_confirm_dialog_'](MockUpdateAlertsClassCaptureLoss, EVENT_TITLE_CONFIG_TOOLTIP, START_DATE_TIME_LARGE, '');

        expect(MockUpdateAlertsClassCaptureLoss.form).toEqual(component.time_form_group.getRawValue() as AlertFormInterface);

        MockUpdateAlertsClassCaptureLoss['form'] = MockAlertFormInterfaceDays;
      });

      it('should call open_confirm_dialog_() and not set update_alert[form] = time_form_group when external dialog confirm pressed', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        MockUpdateAlertsClassCaptureLoss['form'] = undefined;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_confirm_dialog_'](MockUpdateAlertsClassCaptureLoss, EVENT_TITLE_CONFIG_TOOLTIP, START_DATE_TIME_LARGE, '');

        expect(MockUpdateAlertsClassCaptureLoss.form).toBeUndefined();

        MockUpdateAlertsClassCaptureLoss['form'] = MockAlertFormInterfaceDays;
      });

      it('should call open_confirm_dialog_() and set update_alert[form]performEscalation = false when external dialog confirm pressed and MODIFY_API_SWITCH passed to method', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        MockUpdateAlertsClassCaptureLoss['form'] = undefined;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_confirm_dialog_'](MockUpdateAlertsClassCaptureLoss, EVENT_TITLE_CONFIG_TOOLTIP, START_DATE_TIME_LARGE, MODIFY_API_SWITCH);

        expect(MockUpdateAlertsClassCaptureLoss.form.performEscalation).toBeFalse();

        MockUpdateAlertsClassCaptureLoss['form'] = MockAlertFormInterfaceDays;
      });

      it('should call api_modify_alert_() from open_confirm_dialog_() when external dialog confirm pressed and MODIFY_API_SWITCH passed to method', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        MockUpdateAlertsClassCaptureLoss['form'] = undefined;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_confirm_dialog_'](MockUpdateAlertsClassCaptureLoss, EVENT_TITLE_CONFIG_TOOLTIP, START_DATE_TIME_LARGE, MODIFY_API_SWITCH);

        expect(component['api_modify_alert_']).toHaveBeenCalled();

        MockUpdateAlertsClassCaptureLoss['form'] = MockAlertFormInterfaceDays;
      });

      it('should call open_confirm_dialog_() and not set update_alert[form]performEscalation = false when external dialog confirm pressed and MODIFY_API_SWITCH passed to method', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        MockUpdateAlertsClassCaptureLoss['form'] = undefined;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_confirm_dialog_'](MockUpdateAlertsClassCaptureLoss, EVENT_TITLE_CONFIG_TOOLTIP, START_DATE_TIME_LARGE, MODIFY_API_SWITCH);

        expect(MockUpdateAlertsClassCaptureLoss.form).toBeUndefined();

        MockUpdateAlertsClassCaptureLoss['form'] = MockAlertFormInterfaceDays;
      });

      it('should not call api_modify_alert_() from open_confirm_dialog_() when external dialog confirm pressed and MODIFY_API_SWITCH passed to method', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        MockUpdateAlertsClassCaptureLoss['form'] = undefined;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_confirm_dialog_'](MockUpdateAlertsClassCaptureLoss, EVENT_TITLE_CONFIG_TOOLTIP, START_DATE_TIME_LARGE, MODIFY_API_SWITCH);

        expect(component['api_modify_alert_']).not.toHaveBeenCalled();

        MockUpdateAlertsClassCaptureLoss['form'] = MockAlertFormInterfaceDays;
      });

      it('should call api_remove_alerts_() from open_confirm_dialog_() when external dialog confirm pressed and REMOVE_API_SWITCH passed to method', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        MockUpdateAlertsClassCaptureLoss['form'] = undefined;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_confirm_dialog_'](MockUpdateAlertsClassCaptureLoss, EVENT_TITLE_CONFIG_TOOLTIP, START_DATE_TIME_LARGE, REMOVE_API_SWITCH);

        expect(component['api_remove_alerts_']).toHaveBeenCalled();

        MockUpdateAlertsClassCaptureLoss['form'] = MockAlertFormInterfaceDays;
      });

      it('should not call api_remove_alerts_() from open_confirm_dialog_() when external dialog confirm pressed and REMOVE_API_SWITCH passed to method', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        MockUpdateAlertsClassCaptureLoss['form'] = undefined;
        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_confirm_dialog_'](MockUpdateAlertsClassCaptureLoss, EVENT_TITLE_CONFIG_TOOLTIP, START_DATE_TIME_LARGE, REMOVE_API_SWITCH);

        expect(component['api_remove_alerts_']).not.toHaveBeenCalled();

        MockUpdateAlertsClassCaptureLoss['form'] = MockAlertFormInterfaceDays;
      });
    });

    describe('private open_escalate_alert_()', () => {
      it('should call open_escalate_alert_()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(escalate_event_form_group_return) } as MatDialogRef<typeof component>);

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_escalate_alert_'](MockUpdateAlertsClassCaptureLoss, START_DATE_TIME_LARGE, escalate_event_form_group);

        expect(component['open_escalate_alert_']).toHaveBeenCalled();
      });

      it('should call api_modify_alert_() from open_escalate_alert_() when valid formgroup returned', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(escalate_event_form_group_return) } as MatDialogRef<typeof component>);

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_escalate_alert_'](MockUpdateAlertsClassCaptureLoss, START_DATE_TIME_LARGE, escalate_event_form_group);

        expect(component['api_modify_alert_']).toHaveBeenCalled();
      });

      it('should not call api_modify_alert_() from open_escalate_alert_() when invalid formgroup returned', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(escalate_event_form_group_return_invalid) } as MatDialogRef<typeof component>);

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['open_escalate_alert_'](MockUpdateAlertsClassCaptureLoss, START_DATE_TIME_LARGE, escalate_event_form_group);

        expect(component['api_modify_alert_']).not.toHaveBeenCalled();
      });
    });

    describe('private set_date_times_()', () => {
      it('should call set_date_times_()', () => {
        reset();

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        // Default DAYS path taken with time_form_group
        component['set_date_times_']();

        expect(component['set_date_times_']).toHaveBeenCalled();
      });

      it('should call get_time_form_group_field_value() from set_date_times_()', () => {
        reset();

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        // Need to make sure HOURS path taken
        component.time_form_group.get(component.time_interval).setValue(HOURS);
        component['set_date_times_']();

        expect(component['get_time_form_group_field_value']).toHaveBeenCalled();
      });

      it('should call get_time_form_group_field_value() from set_date_times_()', () => {
        reset();

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        // Need to make sure MINUTES path taken
        component.time_form_group.get(component.time_interval).setValue(MINUTES);
        component['set_date_times_']();

        expect(component['get_time_form_group_field_value']).toHaveBeenCalled();
      });
    });

    describe('private validate_date_times_()', () => {
      it('should call validate_date_times_()', () => {
        reset();

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        // Default DAYS path taken with time_form_group
        component['validate_date_times_']();

        expect(component['validate_date_times_']).toHaveBeenCalled();
      });

      it('should call get_time_form_group_field_value() from validate_date_times_()', () => {
        reset();

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        // Need to make sure HOURS path taken
        component.time_form_group.get(component.time_interval).setValue(HOURS);
        component['validate_date_times_']();

        expect(component['get_time_form_group_field_value']).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from validate_date_times_()', () => {
        reset();

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceStartDateTimeGreaterThanEnd);
        // Need to make sure MINUTES path taken
        component.time_form_group.get(component.time_interval).setValue(MINUTES);
        component['validate_date_times_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });
    });

    describe('private filter_chip_options_()', () => {
      it('should call filter_chip_options_()', () => {
        reset();

        component['filter_chip_options_'](MockAlertFields[0]);

        expect(component['filter_chip_options_']).toHaveBeenCalled();
      });

      it('should call filter_chip_options_() and return filtered data', () => {
        reset();

        const return_value: string[] = component['filter_chip_options_'](MockAlertFields[0]);

        expect(return_value).toEqual([MockAlertFields[0]]);
      });
    });

    describe('private get_kibana_link_()', () => {
      it('should call get_kibana_link_()', () => {
        reset();

        component['get_kibana_link_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['get_kibana_link_']).toHaveBeenCalled();
      });

      it('should call get_link_() from get_kibana_link_()', () => {
        reset();

        component['get_kibana_link_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['get_link_']).toHaveBeenCalled();
      });

      it('should call get_kibana_query_() from get_kibana_link_()', () => {
        reset();

        component['get_kibana_link_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['get_kibana_query_']).toHaveBeenCalled();
      });

      it('should call get_time_form_group_field_value() from get_kibana_link_()', () => {
        reset();

        component['get_kibana_link_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['get_time_form_group_field_value']).toHaveBeenCalled();
      });

      it('should call get_kibana_link_() and return url including KIBANA_DETECTIONS_PAGE', () => {
        reset();

        const return_value: string = component['get_kibana_link_'](MockUpdateAlertsClassBadICMPChecksum);

        expect(return_value.includes(KIBANA_DETECTIONS_PAGE)).toBeTrue();
      });

      it('should call get_kibana_link_() and return url including KIBANA_NETWORK_EXTERNAL_PAGE', () => {
        reset();

        const return_value: string = component['get_kibana_link_'](MockUpdateAlertsClassCaptureLoss);
        component['get_kibana_link_'](MockUpdateAlertsClassPossibleSplitRouting);

        expect(return_value.includes(KIBANA_NETWORK_EXTERNAL_PAGE)).toBeTrue();
      });

      it('should call get_kibana_link_() and return url not including KIBANA_NETWORK_EXTERNAL_PAGE or KIBANA_HOSTS_ALERTS_PAGE', () => {
        reset();

        const return_value: string = component['get_kibana_link_'](MockUpdateAlertsClassDataBeforeEstablished);

        expect(return_value.includes(KIBANA_NETWORK_EXTERNAL_PAGE)).toBeFalse();
        expect(return_value.includes(KIBANA_HOSTS_ALERTS_PAGE)).toBeFalse();
      });

      it('should call get_kibana_link_() and return url including KIBANA_HOSTS_ALERTS_PAGE', () => {
        reset();

        const return_value: string = component['get_kibana_link_'](MockUpdateAlertsClassDataBeforeEstablishedDays);
        component['get_kibana_link_'](MockUpdateAlertsInterfaceDataBeforeEstablishedMinutesLess60);

        expect(return_value.includes(KIBANA_HOSTS_ALERTS_PAGE)).toBeTrue();
      });
    });

    describe('private get_link_()', () => {
      it('should call get_link_()', () => {
        reset();

        component['get_link_'](ARKIME);

        expect(component['get_link_']).toHaveBeenCalled();
      });

      it('should call get_link_() and return empty string', () => {
        reset();

        const return_value: string = component['get_link_'](KIBANA);

        expect(return_value).toEqual('');
      });

      it('should call get_link_() and return empty string', () => {
        reset();

        const return_value: string = component['get_link_'](ARKIME);

        expect(return_value).toEqual(MockPortalLinkClass.dns);
      });
    });

    describe('private get_kibana_query_()', () => {
      it('should call get_kibana_query_()', () => {
        reset();

        component['get_kibana_query_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['get_kibana_query_']).toHaveBeenCalled();
      });

      it('should call get_time_form_group_field_value() from get_kibana_query_()', () => {
        reset();

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component.time_form_group.get(component.escalated).setValue(true);
        component['get_kibana_query_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['get_time_form_group_field_value']).toHaveBeenCalled();
      });
    });

    describe('private build_arkime_expression_()', () => {
      it('should call build_arkime_expression_()', () => {
        reset();

        component['build_arkime_expression_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['build_arkime_expression_']).toHaveBeenCalled();
      });

      it('should call get_fields_() from build_arkime_expression_()', () => {
        reset();

        component['build_arkime_expression_'](MockUpdateAlertsInterfaceWithArkimeFields);

        expect(component['get_fields_']).toHaveBeenCalled();
      });

      it('should call build_arkime_expression_() and return empty string', () => {
        reset();

        const return_value: string = component['build_arkime_expression_'](MockUpdateAlertsClassCaptureLoss);

        expect(return_value).toEqual('');
      });

      it('should call build_arkime_expression_() and return arkime expression', () => {
        reset();

        const return_value: string = component['build_arkime_expression_'](MockUpdateAlertsInterfaceWithArkimeFields);

        expect(return_value.length > 0).toBeTrue();
      });
    });

    describe('private get_arkime_link_()', () => {
      it('should call get_arkime_link_()', () => {
        reset();

        component['get_arkime_link_'](test_arkime_prefix, test_arkime_expression);

        expect(component['get_arkime_link_']).toHaveBeenCalled();
      });

      it('should call get_arkime_link_() and return NA_FAILED_ARKIME_NOT_INSTALLED', () => {
        reset();

        const return_value: string = component['get_arkime_link_']('', test_arkime_expression);

        expect(return_value).toEqual(NA_FAILED_ARKIME_NOT_INSTALLED);
      });

      it('should call get_arkime_link_() and return N/A - Failed to create Arkime link because you need one of the following Group By fields:', () => {
        reset();

        const return_value: string = component['get_arkime_link_'](test_arkime_prefix, '');

        expect(return_value.includes('N/A - Failed to create Arkime link because you need one of the following Group By fields:')).toBeTrue();
      });

      it('should call get_arkime_link_() and return url with prefix and expression', () => {
        reset();

        const return_value: string = component['get_arkime_link_'](test_arkime_prefix, test_arkime_expression);

        expect(return_value.includes(test_arkime_prefix)).toBeTrue();
        expect(return_value.includes(test_arkime_expression)).toBeTrue();
      });
    });

    describe('private get_fields_()', () => {
      it('should call get_fields_()', () => {
        reset();

        component['get_fields_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['get_fields_']).toHaveBeenCalled();
      });

      it('should call get_fields_() and return fields not equal to COUNT_COLUMN_NAME, FORM_COLUMN_NAME, and LINKS_COLUMN_NAME', () => {
        reset();

        const return_value: string[] = component['get_fields_'](MockUpdateAlertsClassCaptureLoss);

        expect(return_value.includes(COUNT_COLUMN_NAME)).toBeFalse();
        expect(return_value.includes(FORM_COLUMN_NAME)).toBeFalse();
        expect(return_value.includes(LINKS_COLUMN_NAME)).toBeFalse();
        expect(return_value.length > 0).toBeTrue();
      });
    });

    describe('private success_modify_remove_alerts_()', () => {
      it('should call success_modify_remove_alerts_()', () => {
        reset();

        component['success_modify_remove_alerts_'](MockModifyRemoveReturnClass);

        expect(component['success_modify_remove_alerts_']).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.generate_return_success_snackbar_message() from success_modify_remove_alerts_()', () => {
        reset();

        component['success_modify_remove_alerts_'](MockModifyRemoveReturnClass);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call update_alerts_table_() from success_modify_remove_alerts_()', () => {
        reset();

        component['success_modify_remove_alerts_'](MockModifyRemoveReturnClass);

        expect(component['update_alerts_table_']).toHaveBeenCalled();
      });
    });

    describe('private save_cookies_()', () => {
      it('should call save_cookies_()', () => {
        reset();

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['save_cookies_']();

        expect(component['save_cookies_']).toHaveBeenCalled();
      });

      it('should call cookie_service_.set() from save_cookies_()', () => {
        reset();

        component.time_form_group = set_time_form_group(MockAlertFormInterfaceDays);
        component['save_cookies_']();

        expect(component['cookie_service_'].set).toHaveBeenCalled();
      });
    });

    describe('private api_get_fields_()', () => {
      it('should call api_get_fields_()', () => {
        reset();

        component['api_get_fields_']();

        expect(component['api_get_fields_']).toHaveBeenCalled();
      });

      it('should call alert_service_.get_fields() from api_get_fields_()', () => {
        reset();

        component['api_get_fields_']();

        expect(component['alert_service_'].get_fields).toHaveBeenCalled();
      });

      it('should call alert_service_.get_fields() and set all_chip_options_ = response', () => {
        reset();

        component['all_chip_options_'] = [];
        component['api_get_fields_']();

        expect(component['all_chip_options_']).toEqual(MockAlertFields);
      });

      it('should call alert_service_.get_fields() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'get_fields').and.returnValue(throwError(mock_http_error_response));

        component['api_get_fields_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_alerts_()', () => {
      it('should call api_get_alerts_()', () => {
        reset();

        component['api_get_alerts_'](true, true, true, true);

        expect(component['api_get_alerts_']).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alerts() from api_get_alerts_()', () => {
        reset();

        component['api_get_alerts_'](true, true, true, true);

        expect(component['alert_service_'].get_alerts).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alerts() and handle response', () => {
        reset();

        component['api_get_alerts_'](true, true, true, true);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alerts() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'get_alerts').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_alerts_'](true, true, true, true);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alerts() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'get_alerts').and.returnValue(throwError(mock_http_error_response));

        component['api_get_alerts_'](true, true, true, true);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_alert_list_()', () => {
      it('should call api_get_alert_list_()', () => {
        reset();

        component['api_get_alert_list_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['api_get_alert_list_']).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alert_list() from api_get_alert_list_()', () => {
        reset();

        component['api_get_alert_list_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['alert_service_'].get_alert_list).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alert_list() and handle response and call get_link_()', () => {
        reset();

        component['api_get_alert_list_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['get_link_']).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alert_list() and handle response and call windows_redirect_handler_service_.open_in_new_tab()', () => {
        reset();

        component['api_get_alert_list_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['windows_redirect_handler_service_'].open_in_new_tab).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alert_list() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'get_alert_list').and.returnValue(throwError(mock_http_error_response));

        component['api_get_alert_list_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_modify_alert_()', () => {
      it('should call api_modify_alert_()', () => {
        reset();

        component['api_modify_alert_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['api_modify_alert_']).toHaveBeenCalled();
      });

      it('should call alert_service_.modify_alert() from api_modify_alert_()', () => {
        reset();

        component['api_modify_alert_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['alert_service_'].modify_alert).toHaveBeenCalled();
      });

      it('should call alert_service_.modify_alert() and handle response and call success_modify_remove_alerts_()', () => {
        reset();

        component['api_modify_alert_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['success_modify_remove_alerts_']).toHaveBeenCalled();
      });

      it('should call alert_service_.modify_alert() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'modify_alert').and.returnValue(throwError(MockErrorMessageClass));

        component['api_modify_alert_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call alert_service_.modify_alert() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'modify_alert').and.returnValue(throwError(mock_http_error_response));

        component['api_modify_alert_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_remove_alerts_()', () => {
      it('should call api_remove_alerts_()', () => {
        reset();

        component['api_remove_alerts_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['api_remove_alerts_']).toHaveBeenCalled();
      });

      it('should call alert_service_.remove_alerts() from api_remove_alerts_()', () => {
        reset();

        component['api_remove_alerts_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['alert_service_'].remove_alerts).toHaveBeenCalled();
      });

      it('should call alert_service_.remove_alerts() and handle response and call success_modify_remove_alerts_()', () => {
        reset();

        component['api_remove_alerts_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['success_modify_remove_alerts_']).toHaveBeenCalled();
      });

      it('should call alert_service_.remove_alerts() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'remove_alerts').and.returnValue(throwError(MockErrorMessageClass));

        component['api_remove_alerts_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call alert_service_.remove_alerts() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'remove_alerts').and.returnValue(throwError(mock_http_error_response));

        component['api_remove_alerts_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_portal_links_()', () => {
      it('should call api_get_portal_links_()', () => {
        reset();

        component['api_get_portal_links_']();

        expect(component['api_get_portal_links_']).toHaveBeenCalled();
      });

      it('should call portal_service_.get_portal_links() from api_get_portal_links_()', () => {
        reset();

        component['api_get_portal_links_']();

        expect(component['portal_service_'].get_portal_links).toHaveBeenCalled();
      });

      it('should call portal_service_.get_portal_links()() and handle response and set portal_links', () => {
        reset();

        component['portal_links_'] = [];

        expect(component['portal_links_'].length > 0).toBeFalse();

        component['api_get_portal_links_']();

        expect(component['portal_links_'].length > 0).toBeTrue();
      });

      it('should call portal_service_.get_portal_links() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['portal_service_'], 'get_portal_links').and.returnValue(throwError(mock_http_error_response));

        component['api_get_portal_links_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_fork_join_get_hive_settings_and_get_alert_list_()', () => {
      it('should call api_fork_join_get_hive_settings_and_get_alert_list_()', () => {
        reset();

        component['api_fork_join_get_hive_settings_and_get_alert_list_'](MockUpdateAlertsClassCaptureLoss, test_kibana_link, test_arkime_link);

        expect(component['api_fork_join_get_hive_settings_and_get_alert_list_']).toHaveBeenCalled();
      });

      it('should call global_hive_settings_service_.get_hive_settings() from api_fork_join_get_hive_settings_and_get_alert_list_()', () => {
        reset();

        component['api_fork_join_get_hive_settings_and_get_alert_list_'](MockUpdateAlertsClassCaptureLoss, test_kibana_link, test_arkime_link);

        expect(component['global_hive_settings_service_'].get_hive_settings).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alert_list() from api_fork_join_get_hive_settings_and_get_alert_list_()', () => {
        reset();

        component['api_fork_join_get_hive_settings_and_get_alert_list_'](MockUpdateAlertsClassCaptureLoss, test_kibana_link, test_arkime_link);

        expect(component['alert_service_'].get_alert_list).toHaveBeenCalled();
      });

      it('should call global_hive_settings_service_.get_hive_settings() and handle response of not right hive settings', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_hive_settings_service_'], 'get_hive_settings').and.returnValue(of(MockHiveSettingsClassAdminApiKeyEmpty));

        component['api_fork_join_get_hive_settings_and_get_alert_list_'](MockUpdateAlertsClassCaptureLoss, test_kibana_link, test_arkime_link);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_hive_settings_service_'], 'get_hive_settings').and.returnValue(of(MockHiveSettingsClassAdminApiKeyDefaultText));

        component['api_fork_join_get_hive_settings_and_get_alert_list_'](MockUpdateAlertsClassCaptureLoss, test_kibana_link, test_arkime_link);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alert_list() and handle response of undefined', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'get_alert_list').and.returnValue(of(undefined));

        component['api_fork_join_get_hive_settings_and_get_alert_list_'](MockUpdateAlertsClassCaptureLoss, test_kibana_link, test_arkime_link);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call global_hive_settings_service_.get_hive_settings() and alert_service_.get_alert_list() and handle response and call open_escalate_alert_()', () => {
        reset();

        // Change and recall twice so that way all response loops checked
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'get_alert_list').and.returnValue(of(MockAlertListClassSignal));

        component['api_fork_join_get_hive_settings_and_get_alert_list_'](MockUpdateAlertsClassCaptureLoss, test_kibana_link, test_arkime_link);

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'get_alert_list').and.returnValue(of(MockAlertListClassSuricata));

        component['api_fork_join_get_hive_settings_and_get_alert_list_'](MockUpdateAlertsClassCaptureLoss, test_kibana_link, test_arkime_link);

        expect(component['open_escalate_alert_']).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alert_list() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'get_alert_list').and.returnValue(throwError(mock_http_error_response));

        component['api_fork_join_get_hive_settings_and_get_alert_list_'](MockUpdateAlertsClassCaptureLoss, test_kibana_link, test_arkime_link);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

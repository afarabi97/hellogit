import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import {
  MockAlertListClassEndgame,
  MockAlertListClassSignal,
  MockAlertListClassSuricata,
  MockAlertListClassZeek,
  MockPortalLinkClass,
  MockUpdateAlertsClassCaptureLoss,
  MockUpdateAlertsClassDataBeforeEstablishedDays,
  MockUpdateAlertsClassDataBeforeEstablishedMinutesGreater60
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import { HitSourceClass } from '../../classes';
import {
  ACTIONS_COLUMN_NAME,
  COUNT_COLUMN_NAME,
  DAYS,
  MINUTES,
  RULE_NAME_COLUMN_NAME
} from '../../constants/security-alerts.constant';
import { SecurityAlertsModule } from '../../security-alerts.module';
import { AlertDrillDownDialogComponent } from './alert-drilldown-dialog.component';

class MatDialogRefMock {
  close() {
    return {
      afterClosed: () => of ()
    };
  }
}

describe('AlertDrillDownDialogComponent', () => {
  let component: AlertDrillDownDialogComponent;
  let fixture: ComponentFixture<AlertDrillDownDialogComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyNGAfterViewInit: jasmine.Spy<any>;
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyIsDynamicColumn: jasmine.Spy<any>;
  let spyGetColumnValue: jasmine.Spy<any>;
  let spyGetTimestamp: jasmine.Spy<any>;
  let spyOpenKibana: jasmine.Spy<any>;
  let spyOpenArkime: jasmine.Spy<any>;
  let spyClose: jasmine.Spy<any>;
  let spySetColumns: jasmine.Spy<any>;
  let spySetMatPaginatorAndSort: jasmine.Spy<any>;
  let spyGetLink: jasmine.Spy<any>;
  let spyApiGetAlertList: jasmine.Spy<any>;

  // Test Data
  const test_search_value: string = 'test';
  const arkime_search_value: string = 'arkime';
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
        { provide: MAT_DIALOG_DATA, useValue: MockUpdateAlertsClassCaptureLoss }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertDrillDownDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyNGAfterViewInit = spyOn(component, 'ngAfterViewInit').and.callThrough();
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyIsDynamicColumn = spyOn(component, 'is_dynamic_column').and.callThrough();
    spyGetColumnValue = spyOn(component, 'get_column_value').and.callThrough();
    spyGetTimestamp = spyOn(component, 'get_timestamp').and.callThrough();
    spyOpenKibana = spyOn(component, 'open_in_kibana').and.callThrough();
    spyOpenArkime = spyOn(component, 'open_in_arkime').and.callThrough();
    spyClose = spyOn(component, 'close').and.callThrough();
    spySetColumns = spyOn<any>(component, 'set_columns_').and.callThrough();
    spySetMatPaginatorAndSort = spyOn<any>(component, 'set_mat_table_paginator_and_sort_').and.callThrough();
    spyGetLink = spyOn<any>(component, 'get_link_').and.callThrough();
    spyApiGetAlertList = spyOn<any>(component, 'api_get_alert_list_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyNGAfterViewInit.calls.reset();
    spyNGOnChanges.calls.reset();
    spyIsDynamicColumn.calls.reset();
    spyGetColumnValue.calls.reset();
    spyGetTimestamp.calls.reset();
    spyOpenKibana.calls.reset();
    spyOpenArkime.calls.reset();
    spyClose.calls.reset();
    spySetColumns.calls.reset();
    spySetMatPaginatorAndSort.calls.reset();
    spyGetLink.calls.reset();
    spyApiGetAlertList.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create AlertDrillDownDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('AlertDrillDownDialogComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call set_columns_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['set_columns_']).toHaveBeenCalled();
      });

      it('should call api_get_alert_list_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_alert_list_']).toHaveBeenCalled();
      });
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

    describe('is_dynamic_column()', () => {
      it('should call is_dynamic_column()', () => {
        reset();

        component.is_dynamic_column(ACTIONS_COLUMN_NAME);

        expect(component.is_dynamic_column).toHaveBeenCalled();
      });

      it('should call is_dynamic_column() and return boolean true', () => {
        reset();

        const return_value: boolean = component.is_dynamic_column('test.column');

        expect(return_value).toBeTrue();
      });

      it('should call is_dynamic_column() and return boolean false', () => {
        reset();

        let return_value: boolean = component.is_dynamic_column(ACTIONS_COLUMN_NAME);

        expect(return_value).toBeFalse();

        return_value = component.is_dynamic_column(COUNT_COLUMN_NAME);

        expect(return_value).toBeFalse();
      });
    });

    describe('get_column_value()', () => {
      it('should call get_column_value()', () => {
        reset();

        component.get_column_value(MockAlertListClassSignal.hits.hits[0], RULE_NAME_COLUMN_NAME);

        expect(component.get_column_value).toHaveBeenCalled();
      });

      it('should call get_column_value() and return known value', () => {
        reset();

        const return_value: HitSourceClass | number | boolean | string = component.get_column_value(MockAlertListClassSignal.hits.hits[0], RULE_NAME_COLUMN_NAME);

        expect(return_value).toEqual(MockAlertListClassSignal.hits.hits[0]._source.signal.rule.name);
      });

      it('should call get_column_value() and return empty string', () => {
        reset();

        const return_value: HitSourceClass | number | boolean | string = component.get_column_value(MockAlertListClassSignal.hits.hits[0], undefined);

        expect(return_value).toEqual('');
      });
    });

    describe('get_timestamp()', () => {
      it('should call get_timestamp()', () => {
        reset();

        component.get_timestamp(MockAlertListClassSignal.hits.hits[0]);

        expect(component.get_timestamp).toHaveBeenCalled();
      });

      it('should call get_timestamp() and return known value', () => {
        reset();

        const return_value: string = component.get_timestamp(MockAlertListClassSignal.hits.hits[0]);

        expect(return_value).toEqual(MockAlertListClassSignal.hits.hits[0]._source['@timestamp']);
      });

      it('should call get_timestamp() and return empty string', () => {
        reset();

        const return_value: string = component.get_timestamp(undefined);

        expect(return_value).toEqual('');
      });
    });

    describe('open_in_kibana()', () => {
      it('should call open_in_kibana()', () => {
        reset();

        component.open_in_kibana(MockAlertListClassSignal.hits.hits[0]);

        expect(component.open_in_kibana).toHaveBeenCalled();
      });

      it('should call get_link_() from open_in_kibana()', () => {
        reset();

        component.open_in_kibana(MockAlertListClassSignal.hits.hits[0]);

        expect(component['get_link_']).toHaveBeenCalled();
      });

      it('should call windows_redirect_handler_service_.open_in_new_tab() from open_in_kibana() when kind = ALERT_KIND', () => {
        reset();

        component.open_in_kibana(MockAlertListClassZeek.hits.hits[0]);

        expect(component['windows_redirect_handler_service_'].open_in_new_tab).toHaveBeenCalled();
      });

      it('should call windows_redirect_handler_service_.open_in_new_tab() from open_in_kibana() when kind = ALERT_KIND and module = ENDGAME_MODULE', () => {
        reset();

        component.open_in_kibana(MockAlertListClassEndgame.hits.hits[0]);

        expect(component['windows_redirect_handler_service_'].open_in_new_tab).toHaveBeenCalled();
      });

      it('should call windows_redirect_handler_service_.open_in_new_tab() from open_in_kibana() when kind = SIGNAL_KIND', () => {
        reset();

        component.open_in_kibana(MockAlertListClassSignal.hits.hits[0]);

        expect(component['windows_redirect_handler_service_'].open_in_new_tab).toHaveBeenCalled();
      });
    });

    describe('open_in_arkime()', () => {
      it('should call open_in_arkime()', () => {
        reset();

        component.open_in_arkime(MockAlertListClassSignal.hits.hits[0]);

        expect(component.open_in_arkime).toHaveBeenCalled();
      });

      it('should call get_link_() from open_in_arkime()', () => {
        reset();

        component.open_in_arkime(MockAlertListClassSignal.hits.hits[0]);

        expect(component['get_link_']).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from open_in_arkime() when prefix = empty string', () => {
        reset();

        component['portal_links_'] = [];
        component.open_in_arkime(MockAlertListClassSignal.hits.hits[0]);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call windows_redirect_handler_service_.open_in_new_tab() when prefix != empty string and timeInterval = DAYS', () => {
        reset();

        component.update_alerts_mat_dialog_data = MockUpdateAlertsClassDataBeforeEstablishedDays;
        component.open_in_arkime(MockAlertListClassZeek.hits.hits[0]);

        expect(component.update_alerts_mat_dialog_data.form.timeInterval).toEqual(DAYS);
      });

      it('should call windows_redirect_handler_service_.open_in_new_tab() when prefix != empty string and timeInterval = MINUTES and time_amount > 60', () => {
        reset();

        component.update_alerts_mat_dialog_data = MockUpdateAlertsClassDataBeforeEstablishedMinutesGreater60;
        component.open_in_arkime(MockAlertListClassZeek.hits.hits[0]);

        expect(component.update_alerts_mat_dialog_data.form.timeInterval).toEqual(MINUTES);
      });

      it('should call mat_snackbar_service_.displaySnackBar() from open_in_arkime() when alert._source.network.community_id undefined', () => {
        reset();

        component.open_in_arkime(MockAlertListClassZeek.hits.hits[0]);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call windows_redirect_handler_service_.open_in_new_tab() from open_in_arkime() when alert._source.network.community_id defined', () => {
        reset();

        component.open_in_arkime(MockAlertListClassSuricata.hits.hits[0]);

        expect(component['windows_redirect_handler_service_'].open_in_new_tab).toHaveBeenCalled();
      });
    });

    describe('close()', () => {
      it('should call close()', () => {
        reset();

        component.close();

        expect(component.close).toHaveBeenCalled();
      });
    });

    describe('private set_columns_()', () => {
      it('should call set_columns_()', () => {
        reset();

        component['set_columns_'](MockUpdateAlertsClassCaptureLoss);

        expect(component['set_columns_']).toHaveBeenCalled();
      });

      it('should call set_columns_() and set dynamic_columns', () => {
        reset();

        component['set_columns_'](MockUpdateAlertsClassCaptureLoss);

        expect(component.dynamic_columns).not.toEqual([]);
      });

      it('should call set_columns_() and set all_columns', () => {
        reset();

        component['set_columns_'](MockUpdateAlertsClassCaptureLoss);

        expect(component.all_columns).not.toEqual([]);
      });
    });

    describe('private set_mat_table_paginator_and_sort_()', () => {
      it('should call set_mat_table_paginator_and_sort_()', () => {
        reset();

        component['set_mat_table_paginator_and_sort_']();

        expect(component['set_mat_table_paginator_and_sort_']).toHaveBeenCalled();
      });
    });

    describe('private get_link_()', () => {
      it('should call get_link_()', () => {
        reset();

        component['get_link_'](test_search_value);

        expect(component['get_link_']).toHaveBeenCalled();
      });

      it('should call get_link_() and return dns match', () => {
        reset();

        const return_value: string = component['get_link_'](arkime_search_value);

        expect(return_value).toEqual(MockPortalLinkClass.dns);
      });

      it('should call get_link_() and return empty string', () => {
        reset();

        const return_value: string = component['get_link_'](test_search_value);

        expect(return_value).toEqual('');
      });
    });

    describe('private api_get_alert_list_()', () => {
      it('should call api_get_alert_list_()', () => {
        reset();

        component['api_get_alert_list_']();

        expect(component['api_get_alert_list_']).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alert_list() from api_get_alert_list_()', () => {
        reset();

        component['api_get_alert_list_']();

        expect(component['alert_service_'].get_alert_list).toHaveBeenCalled();
      });

      it('should call alert_service_.get_alert_list() and set alerts_mat_table_data_source.data = response.hits.hits', () => {
        reset();

        component.alerts_mat_table_data_source.data = [];
        component['api_get_alert_list_']();

        expect(component.alerts_mat_table_data_source.data).toEqual(MockAlertListClassZeek.hits.hits);
      });

      it('should call alert_service_.get_alert_list() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['alert_service_'], 'get_alert_list').and.returnValue(throwError(mock_http_error_response));

        component['api_get_alert_list_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { throwError } from 'rxjs';

import {
  MockErrorMessageClass,
  MockKeyValueClassArray,
  MockKitSettingsClass,
  MockKitTokenClass,
  MockKitTokenClassAlt,
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { TestingModule } from '../testing-modules/testing.module';
import { COLUMN_DEFINITIONS_LOCALHOST_DASHBOARD, KIT_UNAVAILABLE, LOCALHOST } from './constants/health-dashboard.constant';
import { HealthDashboardComponent } from './health-dashboard.component';
import { HealthDashboardModule } from './health-dashboard.module';
import { ColumnDefinitionsLocalhostInterface } from './interfaces';

describe('HealthDashboardComponent', () => {
  let component: HealthDashboardComponent;
  let fixture: ComponentFixture<HealthDashboardComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyNGOnDestroy: jasmine.Spy<any>;
  let spySelectedTabChange: jasmine.Spy<any>;
  let spyKibanaInfo: jasmine.Spy<any>;
  let spyGetElasticsearchStatusMatTooltip: jasmine.Spy<any>;
  let spyGetKibanaStatusMatTooltip: jasmine.Spy<any>;
  let spyKitSelect: jasmine.Spy<any>;
  let spyGetColumnDefinitions: jasmine.Spy<any>;
  let spyCreateReloadInterval: jasmine.Spy<any>;
  let spyOpenDialogWindow: jasmine.Spy<any>;
  let spyApiGetHealthDashboardStatus: jasmine.Spy<any>;
  let spyApiGetRemoteHealthDashboardStatus: jasmine.Spy<any>;
  let spyApiGetHealthDashboardStatusKibanaInfoRemote: jasmine.Spy<any>;
  let spyApiGetKitSettings: jasmine.Spy<any>;

  // Test Data
  const mat_tab_change_event_index_0: MatTabChangeEvent = {
    index: 0,
    tab: {} as any
  };
  const mat_tab_change_event_index_1: MatTabChangeEvent = {
    index: 1,
    tab: {} as any
  };
  const columns_all: string[] = COLUMN_DEFINITIONS_LOCALHOST_DASHBOARD.map((cd: ColumnDefinitionsLocalhostInterface) => cd.def);
  const columns_all_localhost_only: string[] = COLUMN_DEFINITIONS_LOCALHOST_DASHBOARD.filter((cd: ColumnDefinitionsLocalhostInterface) => cd.localhost_only)
                                                                                     .map((cd: ColumnDefinitionsLocalhostInterface) => cd.def);
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HealthDashboardModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthDashboardComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyNGOnDestroy = spyOn(component, 'ngOnDestroy').and.callThrough();
    spySelectedTabChange = spyOn(component, 'selected_tab_change').and.callThrough();
    spyKibanaInfo = spyOn(component, 'kibana_info').and.callThrough();
    spyGetElasticsearchStatusMatTooltip = spyOn(component, 'get_elasticsearch_status_mat_tooltip').and.callThrough();
    spyGetKibanaStatusMatTooltip = spyOn(component, 'get_kibana_status_mat_tooltip').and.callThrough();
    spyKitSelect = spyOn(component, 'kit_select').and.callThrough();
    spyGetColumnDefinitions = spyOn(component, 'get_column_definitions').and.callThrough();
    spyCreateReloadInterval = spyOn<any>(component, 'create_reload_interval_').and.callThrough();
    spyOpenDialogWindow = spyOn<any>(component, 'open_dialog_window_').and.callThrough();
    spyApiGetHealthDashboardStatus = spyOn<any>(component, 'api_get_health_dashboard_status_').and.callThrough();
    spyApiGetRemoteHealthDashboardStatus = spyOn<any>(component, 'api_get_remote_health_dashboard_status_').and.callThrough();
    spyApiGetHealthDashboardStatusKibanaInfoRemote = spyOn<any>(component, 'api_get_health_dashboard_status_kibana_info_remote_').and.callThrough();
    spyApiGetKitSettings = spyOn<any>(component, 'api_get_kit_settings_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyNGOnDestroy.calls.reset();
    spySelectedTabChange.calls.reset();
    spyKibanaInfo.calls.reset();
    spyGetElasticsearchStatusMatTooltip.calls.reset();
    spyGetKibanaStatusMatTooltip.calls.reset();
    spyKitSelect.calls.reset();
    spyGetColumnDefinitions.calls.reset();
    spyCreateReloadInterval.calls.reset();
    spyOpenDialogWindow.calls.reset();
    spyApiGetHealthDashboardStatus.calls.reset();
    spyApiGetRemoteHealthDashboardStatus.calls.reset();
    spyApiGetHealthDashboardStatusKibanaInfoRemote.calls.reset();
    spyApiGetKitSettings.calls.reset();
  };

  afterAll(() => {
    component.ngOnDestroy();
    remove_styles_from_dom();
  });

  it('should create HealthDashboardComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('HealthDashboardComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_health_dashboard_status_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_health_dashboard_status_']).toHaveBeenCalled();
      });

      it('should call api_get_remote_health_dashboard_status_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_remote_health_dashboard_status_']).toHaveBeenCalled();
      });

      it('should call api_get_kit_settings_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_kit_settings_']).toHaveBeenCalled();
      });
    });

    describe('ngOnDestroy()', () => {
      it('should call ngOnDestroy()', () => {
        reset();

        component.ngOnDestroy();

        expect(component.ngOnDestroy).toHaveBeenCalled();
      });
    });

    describe('selected_tab_change()', () => {
      it('should call selected_tab_change()', () => {
        reset();

        component.selected_tab_change();

        expect(component.selected_tab_change).toHaveBeenCalled();
      });

      it('should call selected_tab_change() and set kit_selected not LOCALHOST', () => {
        reset();

        component.selected_tab_change(mat_tab_change_event_index_1);

        expect(component.kit_selected).toEqual(MockKitTokenClass.ipaddress);
      });

      it('should call selected_tab_change() and set token not null', () => {
        reset();

        component.selected_tab_change(mat_tab_change_event_index_1);

        expect(component.token).toEqual(MockKitTokenClass);
      });

      it('should call selected_tab_change() and set kit_selected = LOCALHOST', () => {
        reset();

        component.selected_tab_change(mat_tab_change_event_index_0);

        expect(component.kit_selected).toEqual(LOCALHOST);
      });

      it('should call selected_tab_change() and set token = null', () => {
        reset();

        component.selected_tab_change(mat_tab_change_event_index_0);

        expect(component.token).toBeNull();
      });
    });

    describe('kibana_info()', () => {
      it('should call kibana_info()', () => {
        reset();

        component.kibana_info(MockKitTokenClass.ipaddress);

        expect(component.kibana_info).toHaveBeenCalled();
      });

      it('should call api_get_health_dashboard_status_kibana_info_remote_() from kibana_info()', () => {
        reset();

        component.kibana_info(MockKitTokenClass.ipaddress);

        expect(component['api_get_health_dashboard_status_kibana_info_remote_']).toHaveBeenCalled();
      });
    });

    describe('get_elasticsearch_status_mat_tooltip()', () => {
      it('should call get_elasticsearch_status_mat_tooltip()', () => {
        reset();

        component.get_elasticsearch_status_mat_tooltip(MockKitTokenClass);

        expect(component.get_elasticsearch_status_mat_tooltip).toHaveBeenCalled();
      });

      it('should call get_elasticsearch_status_mat_tooltip() and return kit_token.elasticsearch_status', () => {
        reset();

        const return_value: string = component.get_elasticsearch_status_mat_tooltip(MockKitTokenClass);

        expect(return_value).toEqual(MockKitTokenClass.elasticsearch_status);
      });

      it('should call get_elasticsearch_status_mat_tooltip() and return KIT_UNAVAILABLE', () => {
        reset();

        const return_value: string = component.get_elasticsearch_status_mat_tooltip();

        expect(return_value).toEqual(KIT_UNAVAILABLE);
      });
    });

    describe('get_kibana_status_mat_tooltip()', () => {
      it('should call get_kibana_status_mat_tooltip()', () => {
        reset();

        component.get_kibana_status_mat_tooltip(MockKitTokenClass);

        expect(component.get_kibana_status_mat_tooltip).toHaveBeenCalled();
      });

      it('should call get_kibana_status_mat_tooltip() and return kit_token.kibana_status', () => {
        reset();

        const return_value: string = component.get_kibana_status_mat_tooltip(MockKitTokenClass);

        expect(return_value).toEqual(MockKitTokenClass.kibana_status);
      });

      it('should call get_kibana_status_mat_tooltip() and return KIT_UNAVAILABLE', () => {
        reset();

        const return_value: string = component.get_kibana_status_mat_tooltip();

        expect(return_value).toEqual(KIT_UNAVAILABLE);
      });
    });

    describe('kit_select()', () => {
      it('should call kit_select()', () => {
        reset();

        component.kit_select(MockKitTokenClass);

        expect(component.kit_select).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.destroySnackBar() from kit_select()', () => {
        reset();

        component.kit_select(MockKitTokenClass);

        expect(component['mat_snackbar_service_'].destroySnackBar).toHaveBeenCalled();
      });

      it('should call kit_select() and set token to passed token value', () => {
        reset();

        component.kit_select(MockKitTokenClass);

        expect(component.token).toEqual(MockKitTokenClass);

        component.kit_select(null);

        expect(component.token).toBeNull();
      });

      it('should call kit_select() and set kit_selected = LOCALHOST when token = null', () => {
        reset();

        component.kit_select(null);

        expect(component.kit_selected).toEqual(LOCALHOST);
      });

      it('should call kit_select() and set kit_selected = token.ipaddress when token != null', () => {
        reset();

        component.kit_select(MockKitTokenClass);

        expect(component.kit_selected).toEqual(MockKitTokenClass.ipaddress);
      });

      it('should call mat_snackbar_service_.displaySnackBar() from kit_select() when token.token = null', () => {
        reset();

        component.kit_select(MockKitTokenClassAlt);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });
    });

    describe('get_column_definitions()', () => {
      it('should call get_column_definitions()', () => {
        reset();

        component.get_column_definitions(true);

        expect(component.get_column_definitions).toHaveBeenCalled();
      });

      it('should call get_column_definitions() and return all columns def', () => {
        reset();

        const return_value: string[] = component.get_column_definitions(true);

        expect(return_value).toEqual(columns_all);
      });

      it('should call get_column_definitions() and return all remote access columns def', () => {
        reset();

        component.token = MockKitTokenClass;
        const return_value: string[] = component.get_column_definitions(false);

        expect(return_value).toEqual(columns_all_localhost_only);
      });
    });

    describe('private create_reload_interval_()', () => {
      it('should call create_reload_interval_()', () => {
        reset();

        component['create_reload_interval_']();

        expect(component['create_reload_interval_']).toHaveBeenCalled();
      });

      it('should call create_reload_interval_() and set update_subscription$_', () => {
        reset();

        component['update_subscription$_'] = undefined;

        expect(component['update_subscription$_']).toBeUndefined();

        component['create_reload_interval_']();

        expect(component['update_subscription$_']).toBeDefined();
      });

      it('should call api_get_health_dashboard_status_() from set interval from create_reload_interval_()', fakeAsync(() => {
        reset();

        component.is_gip = true;
        component.token = null;

        fixture.detectChanges();

        component['create_reload_interval_']();

        tick(30100);

        fixture.detectChanges();

        expect(component['api_get_health_dashboard_status_']).toHaveBeenCalled();
        discardPeriodicTasks();
      }));

      it('should call api_get_remote_health_dashboard_status_() from set interval from create_reload_interval_()', fakeAsync(() => {
        reset();

        component['create_reload_interval_']();

        tick(30100);

        fixture.detectChanges();

        expect(component['api_get_remote_health_dashboard_status_']).toHaveBeenCalled();
        discardPeriodicTasks();
      }));
    });

    describe('private open_dialog_window_()', () => {
      it('should call open_dialog_window_()', () => {
        reset();

        component['open_dialog_window_'](MockKeyValueClassArray);

        expect(component['open_dialog_window_']).toHaveBeenCalled();
      });
    });

    describe('private api_get_health_dashboard_status_()', () => {
      it('should call api_get_health_dashboard_status_()', () => {
        reset();

        component['api_get_health_dashboard_status_']();

        expect(component['api_get_health_dashboard_status_']).toHaveBeenCalled();
      });

      it('should call health_dashboard_status_service_.get_health_dashboard_status() from api_get_health_dashboard_status_()', () => {
        reset();

        component['api_get_health_dashboard_status_']();

        expect(component['health_dashboard_status_service_'].get_health_dashboard_status).toHaveBeenCalled();
      });

      it('should call health_dashboard_status_service_.get_health_dashboard_status() and on success set dashboard_status = response', () => {
        reset();

        component['api_get_health_dashboard_status_']();

        expect(component.dashboard_status).toEqual([MockKitTokenClass]);
      });

      it('should call health_dashboard_status_service_.get_health_dashboard_status() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_dashboard_status_service_'], 'get_health_dashboard_status').and.returnValue(throwError(mock_http_error_response));

        component['api_get_health_dashboard_status_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_remote_health_dashboard_status_()', () => {
      it('should call api_get_remote_health_dashboard_status_()', () => {
        reset();

        component['api_get_remote_health_dashboard_status_']();

        expect(component['api_get_remote_health_dashboard_status_']).toHaveBeenCalled();
      });

      it('should call health_dashboard_status_service_.get_remote_health_dashboard_status() from api_get_remote_health_dashboard_status_()', () => {
        reset();

        component['api_get_remote_health_dashboard_status_']();

        expect(component['health_dashboard_status_service_'].get_remote_health_dashboard_status).toHaveBeenCalled();
      });

      it('should call health_dashboard_status_service_.get_remote_health_dashboard_status() and on success set remote_dashboard_status = response', () => {
        reset();

        component['api_get_remote_health_dashboard_status_']();

        expect(component.remote_dashboard_status).toEqual([MockKitTokenClass]);
      });

      it('should call health_dashboard_status_service_.get_remote_health_dashboard_status() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_dashboard_status_service_'], 'get_remote_health_dashboard_status').and.returnValue(throwError(mock_http_error_response));

        component['api_get_remote_health_dashboard_status_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_health_dashboard_status_kibana_info_remote_()', () => {
      it('should call api_get_health_dashboard_status_kibana_info_remote_()', () => {
        reset();

        component['api_get_health_dashboard_status_kibana_info_remote_'](MockKitTokenClass.ipaddress);

        expect(component['api_get_health_dashboard_status_kibana_info_remote_']).toHaveBeenCalled();
      });

      it('should call health_dashboard_status_service_.get_health_dashboard_status_kibana_info_remote() from api_get_health_dashboard_status_kibana_info_remote_()', () => {
        reset();

        component['api_get_health_dashboard_status_kibana_info_remote_'](MockKitTokenClass.ipaddress);

        expect(component['health_dashboard_status_service_'].get_health_dashboard_status_kibana_info_remote).toHaveBeenCalled();
      });

      it('should call health_dashboard_status_service_.get_health_dashboard_status_kibana_info_remote() and on success call open_dialog_window_()', () => {
        reset();

        component['api_get_health_dashboard_status_kibana_info_remote_'](MockKitTokenClass.ipaddress);

        expect(component['open_dialog_window_']).toHaveBeenCalled();
      });

      it('should call health_dashboard_status_service_.get_health_dashboard_status_kibana_info_remote() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_dashboard_status_service_'], 'get_health_dashboard_status_kibana_info_remote').and.returnValue(throwError(mock_http_error_response));

        component['api_get_health_dashboard_status_kibana_info_remote_'](MockKitTokenClass.ipaddress);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_kit_settings_()', () => {
      it('should call api_get_kit_settings_()', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component['api_get_kit_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getKitSettings() from api_get_kit_settings_()', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component['kit_settings_service_'].getKitSettings).toHaveBeenCalled();
      });

      it('should kit_settings_service_.getKitSettings() and on success set is_gip = response.is_gip', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component.is_gip).toEqual(MockKitSettingsClass.is_gip);
      });

      it('should kit_settings_service_.getKitSettings() and on success call create_reload_interval_()', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component['create_reload_interval_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getKitSettings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'getKitSettings').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_kit_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getKitSettings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'getKitSettings').and.returnValue(throwError(mock_http_error_response));

        component['api_get_kit_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

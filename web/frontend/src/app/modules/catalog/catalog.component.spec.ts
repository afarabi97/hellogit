import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import {
  MockChartClassArray,
  MockNodeClassArray,
  MockNotificationClass_ZeekInstallComplete
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { ChartClass, NodeClass } from '../../classes';
import { WebsocketService } from '../../services/websocket.service';
import { TestingModule } from '../testing-modules/testing.module';
import { CatalogComponent } from './catalog.component';
import { CatalogModule } from './catalog.module';
import { DEFAULT_SHOW_CHART, SENSOR_VALUE } from './constants/catalog.constants';
import { ShowChartsInterface } from './interfaces';

class MockSocket {
  onBroadcast() {
    return of(MockNotificationClass_ZeekInstallComplete);
  }
}

describe('CatalogComponent', () => {
  let component: CatalogComponent;
  let fixture: ComponentFixture<CatalogComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyFilterCharts: jasmine.Spy<any>;
  let spyFilterPMOApplications: jasmine.Spy<any>;
  let spyFilterCommunityApplications: jasmine.Spy<any>;
  let spyFilterSensorApplications: jasmine.Spy<any>;
  let spyCookieGet: jasmine.Spy<any>;
  let spyCookieSet: jasmine.Spy<any>;
  let spySetupWebsocketOnbroadcast: jasmine.Spy<any>;
  let spyApiGetAllApplicationStatuses: jasmine.Spy<any>;
  let spyApiGetCatalogNodes: jasmine.Spy<any>;

  // Test Data
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });
  const cookie: ShowChartsInterface = {
    pmo: true,
    community: true
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        CatalogModule,
        TestingModule
      ],
      providers: [
        { provide: WebsocketService, useClass: MockSocket }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyFilterCharts = spyOn(component, 'filter_charts').and.callThrough();
    spyFilterPMOApplications = spyOn<any>(component, 'filter_pmo_applications_').and.callThrough();
    spyFilterCommunityApplications = spyOn<any>(component, 'filter_community_applications_').and.callThrough();
    spyFilterSensorApplications = spyOn<any>(component, 'filter_sensor_applications_').and.callThrough();
    spyCookieGet = spyOn<any>(component, 'cookie_get_').and.callThrough();
    spyCookieSet = spyOn<any>(component, 'cookie_set_').and.callThrough();
    spySetupWebsocketOnbroadcast = spyOn<any>(component, 'setup_websocket_onbroadcast_').and.callThrough();
    spyApiGetAllApplicationStatuses = spyOn<any>(component, 'api_get_all_application_statuses_').and.callThrough();
    spyApiGetCatalogNodes = spyOn<any>(component, 'api_get_catalog_nodes_').and.callThrough();

    // Add service spies
    // Allows respy to change default spy created in spy service
    jasmine.getEnv().allowRespy(true);
    spyOn(component['cookie_service_'], 'get').and.returnValue(JSON.stringify(cookie));

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyFilterCharts.calls.reset();
    spyFilterPMOApplications.calls.reset();
    spyFilterCommunityApplications.calls.reset();
    spyFilterSensorApplications.calls.reset();
    spyCookieGet.calls.reset();
    spyCookieSet.calls.reset();
    spySetupWebsocketOnbroadcast.calls.reset();
    spyApiGetAllApplicationStatuses.calls.reset();
    spyApiGetCatalogNodes.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create CatalogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('CatalogComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call cookie_get_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['cookie_get_']).toHaveBeenCalled();
      });

      it('should call setup_websocket_onbroadcast_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['setup_websocket_onbroadcast_']).toHaveBeenCalled();
      });

      it('should call api_get_all_application_statuses_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_all_application_statuses_']).toHaveBeenCalled();
      });
    });

    describe('filter_charts()', () => {
      it('should call filter_charts()', () => {
        reset();

        component.filter_charts();

        expect(component.filter_charts).toHaveBeenCalled();
      });

      it('should call filter_pmo_applications_() from filter_charts()', () => {
        reset();

        component.filter_charts();

        expect(component['filter_pmo_applications_']).toHaveBeenCalled();
      });

      it('should call filter_community_applications_() from filter_charts()', () => {
        reset();

        component.filter_charts();

        expect(component['filter_community_applications_']).toHaveBeenCalled();
      });

      it('should call filter_sensor_applications_() from filter_charts()', () => {
        reset();

        component.filter_charts();

        expect(component['filter_sensor_applications_']).toHaveBeenCalled();
      });

      it('should call cookie_set_() from filter_charts()', () => {
        reset();

        component.filter_charts();

        expect(component['cookie_set_']).toHaveBeenCalled();
      });
    });

    describe('private filter_pmo_applications_()', () => {
      it('should call filter_pmo_applications_()', () => {
        reset();

        component['filter_pmo_applications_'](true);

        expect(component['filter_pmo_applications_']).toHaveBeenCalled();
      });

      it('should call filter_pmo_applications_() and return ChartClass[] length > 0', () => {
        reset();

        const return_value: ChartClass[] = component['filter_pmo_applications_'](true);

        expect(return_value.length).toBeGreaterThan(0);
      });

      it('should call filter_pmo_applications_() and return ChartClass[] length = 0', () => {
        reset();

        const return_value: ChartClass[] = component['filter_pmo_applications_'](false);

        expect(return_value.length).toEqual(0);
      });
    });

    describe('private filter_community_applications_()', () => {
      it('should call filter_community_applications_()', () => {
        reset();

        component['filter_community_applications_'](true);

        expect(component['filter_community_applications_']).toHaveBeenCalled();
      });

      it('should call filter_community_applications_() and return ChartClass[] length > 0', () => {
        reset();

        const return_value: ChartClass[] = component['filter_community_applications_'](true);

        expect(return_value.length).toBeGreaterThan(0);
      });

      it('should call filter_community_applications_() and return ChartClass[] length = 0', () => {
        reset();

        const return_value: ChartClass[] = component['filter_community_applications_'](false);

        expect(return_value.length).toEqual(0);
      });
    });

    describe('private filter_sensor_applications_()', () => {
      it('should call filter_sensor_applications_()', () => {
        reset();

        component['filter_sensor_applications_']();

        expect(component['filter_sensor_applications_']).toHaveBeenCalled();
      });

      it('should call filter_sensor_applications_() and set filtered_charts with non sensor apps', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_all_application_statuses').and.returnValue(of(MockChartClassArray.filter((chart: ChartClass) => !chart.isSensorApp)));

        component['has_sensors_'] = false;
        component['filter_sensor_applications_']();

        let sensor_app_detected: boolean = false;
        component.filtered_charts.forEach((c: ChartClass) => {
          if (c.isSensorApp) {
            sensor_app_detected = true;
          }
        });

        expect(sensor_app_detected).toBeFalse();
        expect(component.filtered_charts.length).toBeGreaterThan(0);
      });

      it('should call filter_sensor_applications_() and set filtered_charts with sensor apps and non sensor apps', () => {
        reset();

        component['has_sensors_'] = true;
        component['filter_sensor_applications_']();

        let sensor_app_detected: boolean = false;
        component.filtered_charts.forEach((c: ChartClass) => {
          if (c.isSensorApp) {
            sensor_app_detected = true;
          }
        });

        expect(sensor_app_detected).toBeTrue();
        expect(component.filtered_charts.length).toBeGreaterThan(0);
      });
    });

    describe('private cookie_get_()', () => {
      it('should call cookie_get_()', () => {
        reset();

        component['cookie_get_']();

        expect(component['cookie_get_']).toHaveBeenCalled();
      });

      it('should call cookie_service_.get() from cookie_get_()', () => {
        reset();

        component['cookie_get_']();

        expect(component['cookie_service_'].get).toHaveBeenCalled();
      });

      it('should call cookie_get_() and set show_charts = cookie value', () => {
        reset();

        component['cookie_get_']();

        expect(component.show_charts).toEqual(cookie);
      });

      it('should call cookie_get_() and set show_charts = default show charts value', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['cookie_service_'], 'get').and.returnValue('');

        component['cookie_get_']();

        expect(component.show_charts).toEqual(DEFAULT_SHOW_CHART);
      });
    });

    describe('private cookie_set_()', () => {
      it('should call cookie_set_()', () => {
        reset();

        component['cookie_set_']();

        expect(component['cookie_set_']).toHaveBeenCalled();
      });

      it('should call cookie_service_.set() from cookie_set_()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['cookie_service_'], 'set');

        component['cookie_set_']();

        expect(component['cookie_service_'].set).toHaveBeenCalled();
      });
    });

    // TODO - Update when websocket has been flushed out
    describe('private setup_websocket_onbroadcast_()', () => {
      it('should call setup_websocket_onbroadcast_()', () => {
        reset();

        component['setup_websocket_onbroadcast_']();

        expect(component['setup_websocket_onbroadcast_']).toHaveBeenCalled();
      });
    });

    describe('private api_get_all_application_statuses_()', () => {
      it('should call api_get_all_application_statuses_()', () => {
        reset();

        component['api_get_all_application_statuses_']();

        expect(component['api_get_all_application_statuses_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_all_application_statuses() from api_get_all_application_statuses_()', () => {
        reset();

        component['api_get_all_application_statuses_']();

        expect(component['catalog_service_'].get_all_application_statuses).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_all_application_statuses() and set charts = response', () => {
        reset();

        component['charts'] = [];
        component['api_get_all_application_statuses_']();

        expect(component['charts_'].length).toBeGreaterThan(0);
      });

      it('should call api_get_catalog_nodes_() from catalog_service_.get_all_application_statuses()', () => {
        reset();

        component['api_get_all_application_statuses_']();

        expect(component['api_get_catalog_nodes_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_all_application_statuses() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_all_application_statuses').and.returnValue(throwError(mock_http_error_response));

        component['api_get_all_application_statuses_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_catalog_nodes_()', () => {
      it('should call api_get_catalog_nodes_()', () => {
        reset();

        component['api_get_catalog_nodes_']();

        expect(component['api_get_catalog_nodes_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_catalog_nodes() from api_get_catalog_nodes_()', () => {
        reset();

        component['api_get_catalog_nodes_']();

        expect(component['catalog_service_'].get_catalog_nodes).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_catalog_nodes() and set has_sensors_ = true if sensor detected', () => {
        reset();

        component['has_sensors_'] = false;
        component['api_get_catalog_nodes_']();

        expect(component['has_sensors_']).toBeTrue();
      });

      it('should call catalog_service_.get_catalog_nodes() and not set has_sensors_ = true if no sensor detected', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_catalog_nodes').and.returnValue(of(MockNodeClassArray.filter((node: NodeClass) => node.node_type !== SENSOR_VALUE)));

        component['has_sensors_'] = false;
        component['api_get_catalog_nodes_']();

        expect(component['has_sensors_']).toBeFalse();
      });

      it('should call catalog_service_.get_catalog_nodes() and set is_loading = false', () => {
        reset();

        component['is_loading'] = true;
        component['api_get_catalog_nodes_']();

        expect(component['is_loading']).toBeFalse();
      });

      it('should call filter_charts() from catalog_service_.get_catalog_nodes()', () => {
        reset();

        component['api_get_catalog_nodes_']();

        expect(component['filter_charts']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_catalog_nodes() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_catalog_nodes').and.returnValue(throwError(mock_http_error_response));

        component['api_get_catalog_nodes_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

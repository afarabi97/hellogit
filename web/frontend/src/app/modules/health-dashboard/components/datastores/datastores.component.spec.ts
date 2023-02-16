import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { MockDatastoreClassArray } from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { TestingModule } from '../../../testing-modules/testing.module';
import { HealthDashboardModule } from '../../health-dashboard.module';
import { CalculatedSpaceInterface } from '../../interfaces';
import { HealthDashboardDatastoresComponent } from './datastores.component';

describe('HealthDashboardDatastoresComponent', () => {
  let component: HealthDashboardDatastoresComponent;
  let fixture: ComponentFixture<HealthDashboardDatastoresComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyToggleCard: jasmine.Spy<any>;
  let spyToSi: jasmine.Spy<any>;
  let spyChartData: jasmine.Spy<any>;
  let spyReload: jasmine.Spy<any>;
  let spyCalculateSpace: jasmine.Spy<any>;
  let spyApiGetDataStores: jasmine.Spy<any>;

  // Test Data
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
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthDashboardDatastoresComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyToggleCard = spyOn(component, 'toggle_card').and.callThrough();
    spyToSi = spyOn(component, 'to_si').and.callThrough();
    spyChartData = spyOn(component, 'chart_data').and.callThrough();
    spyReload = spyOn(component, 'reload').and.callThrough();
    spyCalculateSpace = spyOn<any>(component, 'calculate_space_').and.callThrough();
    spyApiGetDataStores = spyOn<any>(component, 'api_get_datastores_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyToggleCard.calls.reset();
    spyToSi.calls.reset();
    spyChartData.calls.reset();
    spyReload.calls.reset();
    spyCalculateSpace.calls.reset();
    spyApiGetDataStores.calls.reset();
  };

  afterAll(() => {
    remove_styles_from_dom();
  });

  it('should create HealthDashboardDatastoresComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('HealthDashboardDatastoresComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_datastores_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_datastores_']).toHaveBeenCalled();
      });
    });

    describe('toggle_card()', () => {
      it('should call toggle_card()', () => {
        reset();

        component.is_card_visible = false;
        component.toggle_card();

        expect(component.toggle_card).toHaveBeenCalled();
      });

      it('should call toggle_card() and set is_card_visible = !is_card_visible', () => {
        reset();

        component.is_card_visible = true;
        component.toggle_card();

        expect(component.is_card_visible).toBeFalse();
      });
    });

    describe('to_si()', () => {
      it('should call to_si()', () => {
        reset();

        component.to_si(208006021120);

        expect(component.to_si).toHaveBeenCalled();
      });

      it('should call to_si() and return 193.72 GiB', () => {
        reset();

        const return_value: string = component.to_si(208006021120);

        expect(return_value).toEqual('193.72 GiB');
      });
    });

    describe('chart_data()', () => {
      it('should call chart_data()', () => {
        reset();

        component.chart_data(MockDatastoreClassArray[0]);

        expect(component.chart_data).toHaveBeenCalled();
      });

      it('should call chart_data() and return [22.28, 216]', () => {
        reset();

        const return_value: number[] = component.chart_data(MockDatastoreClassArray[0]);

        expect(return_value).toEqual([22.28, 216]);
      });
    });

    describe('reload()', () => {
      it('should call reload()', () => {
        reset();

        component.reload();

        expect(component.reload).toHaveBeenCalled();
      });

      it('should call api_get_datastores_() from reload()', () => {
        reset();

        component.reload();

        expect(component['api_get_datastores_']).toHaveBeenCalled();
      });
    });

    describe('private calculate_space_()', () => {
      it('should call calculate_space_()', () => {
        reset();

        component['calculate_space_'](208006021120);

        expect(component['calculate_space_']).toHaveBeenCalled();
      });

      it('should call calculate_space_() and return calculated space interface', () => {
        reset();

        const return_value: CalculatedSpaceInterface = component['calculate_space_'](208006021120);

        expect(return_value.space).toEqual(193.72);
        expect(return_value.space_with_suffix).toEqual('193.72 GiB');
      });
    });

    describe('private api_get_datastores_()', () => {
      it('should call api_get_datastores_()', () => {
        reset();

        component['api_get_datastores_']();

        expect(component['api_get_datastores_']).toHaveBeenCalled();
      });

      it('should call health_service_.get_datastores() from api_get_datastores_()', () => {
        reset();

        component['api_get_datastores_']();

        expect(component['health_service_'].get_datastores).toHaveBeenCalled();
      });

      it('should call health_service_.get_datastores() and set component.datastores equal to response', () => {
        reset();

        component['api_get_datastores_']();

        expect(component.datastores).toEqual(MockDatastoreClassArray);
      });

      it('should call health_service_.get_datastores() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'get_datastores').and.returnValue(throwError(mock_http_error_response));

        component['api_get_datastores_']();

        expect(component.datastores).toEqual([]);
        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

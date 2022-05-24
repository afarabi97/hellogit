import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { throwError } from 'rxjs';

import {
  MockErrorMessageClass,
  MockInitialDeviceStateClassArray,
  MockInitialDeviceStateClassSensor1,
  MockInitialDeviceStateClassSensor2,
  MockInitialDeviceStateClassSensor3
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import { ACTIVE, DOWN, MAINTENANCE } from '../../constants/tools.constant';
import { ToolsModule } from '../../tools.module';
import { NodeMaintenanceFormComponent } from './node-maintenance.component';

describe('NodeMaintenanceFormComponent', () => {
  let component: NodeMaintenanceFormComponent;
  let fixture: ComponentFixture<NodeMaintenanceFormComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyIsSliderChecked: jasmine.Spy<any>;
  let spySetInterfaceStates: jasmine.Spy<any>;
  let spyGetSliderLabel: jasmine.Spy<any>;
  let spyApiChangeRemoteNetworkDeviceState: jasmine.Spy<any>;
  let spyApiGetInitialDeviceStates: jasmine.Spy<any>;

  // Test Data
  const mat_slide_toggle_change_false: MatSlideToggleChange = {
    checked: false
  } as MatSlideToggleChange;
  const mat_slide_toggle_change_true: MatSlideToggleChange = {
    checked: false
  } as MatSlideToggleChange;
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
        ToolsModule,
        TestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeMaintenanceFormComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyIsSliderChecked = spyOn(component, 'is_slider_checked').and.callThrough();
    spySetInterfaceStates = spyOn(component, 'set_interface_states').and.callThrough();
    spyGetSliderLabel = spyOn(component, 'get_slider_label').and.callThrough();
    spyApiChangeRemoteNetworkDeviceState = spyOn<any>(component, 'api_change_remote_network_device_state_').and.callThrough();
    spyApiGetInitialDeviceStates = spyOn<any>(component, 'api_get_initial_device_states_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyIsSliderChecked.calls.reset();
    spySetInterfaceStates.calls.reset();
    spyGetSliderLabel.calls.reset();
    spyApiChangeRemoteNetworkDeviceState.calls.reset();
    spyApiGetInitialDeviceStates.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create NodeMaintenanceFormComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('NodeMaintenanceFormComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_initial_device_states_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_initial_device_states_']).toHaveBeenCalled();
      });
    });

    describe('is_slider_checked()', () => {
      it('should call is_slider_checked()', () => {
        reset();

        component.is_slider_checked(MockInitialDeviceStateClassSensor1);

        expect(component.is_slider_checked).toHaveBeenCalled();
      });

      it('should call is_slider_checked() and return false with node defined', () => {
        reset();

        const return_value: boolean = component.is_slider_checked(MockInitialDeviceStateClassSensor3);

        expect(return_value).toBeFalse();
      });

      it('should call is_slider_checked() and return true with node defined', () => {
        reset();

        const return_value: boolean = component.is_slider_checked(MockInitialDeviceStateClassSensor2);

        expect(return_value).toBeTrue();
      });

      it('should call is_slider_checked() and return true with node undefined', () => {
        reset();

        const return_value: boolean = component.is_slider_checked(undefined);

        expect(return_value).toBeTrue();
      });
    });

    describe('set_interface_states()', () => {
      it('should call set_interface_states()', () => {
        reset();

        component.set_interface_states(mat_slide_toggle_change_false, MockInitialDeviceStateClassSensor1);

        expect(component.set_interface_states).toHaveBeenCalled();
      });

      it('should call api_change_remote_network_device_state_() from set_interface_states()', () => {
        reset();

        component.set_interface_states(mat_slide_toggle_change_true, MockInitialDeviceStateClassSensor3);

        expect(component['api_change_remote_network_device_state_']).toHaveBeenCalled();
      });
    });

    describe('get_slider_label()', () => {
      it('should call get_slider_label()', () => {
        reset();

        component.get_slider_label(MockInitialDeviceStateClassSensor3);

        expect(component.get_slider_label).toHaveBeenCalled();
      });

      it('should call get_slider_label() and return MAINTENANCE', () => {
        reset();

        const return_value: string = component.get_slider_label(MockInitialDeviceStateClassSensor3);

        expect(return_value).toEqual(MAINTENANCE);
      });

      it('should call get_slider_label() and return ACTIVE', () => {
        reset();

        const return_value: string = component.get_slider_label(MockInitialDeviceStateClassSensor1);

        expect(return_value).toEqual(ACTIVE);
      });
    });

    describe('private api_change_remote_network_device_state_()', () => {
      it('should call api_change_remote_network_device_state_()', () => {
        reset();

        component['api_change_remote_network_device_state_'](mat_slide_toggle_change_true, MockInitialDeviceStateClassSensor3.node, MockInitialDeviceStateClassSensor3.interfaces[1].name, DOWN);

        expect(component['api_change_remote_network_device_state_']).toHaveBeenCalled();
      });

      it('should call tools_service_.change_remote_network_device_state() from api_change_remote_network_device_state_()', () => {
        reset();

        component['api_change_remote_network_device_state_'](mat_slide_toggle_change_true, MockInitialDeviceStateClassSensor3.node, MockInitialDeviceStateClassSensor3.interfaces[1].name, DOWN);

        expect(component['tools_service_'].change_remote_network_device_state).toHaveBeenCalled();
      });

      it('should call tools_service_.change_remote_network_device_state() and handle response and call api_get_initial_device_states_()', () => {
        reset();

        component['api_change_remote_network_device_state_'](mat_slide_toggle_change_true, MockInitialDeviceStateClassSensor3.node, MockInitialDeviceStateClassSensor3.interfaces[1].name, DOWN);

        expect(component['api_get_initial_device_states_']).toHaveBeenCalled();
      });

      it('should call tools_service_.change_remote_network_device_state() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'change_remote_network_device_state').and.returnValue(throwError(MockErrorMessageClass));

        component['api_change_remote_network_device_state_'](mat_slide_toggle_change_true, MockInitialDeviceStateClassSensor3.node, MockInitialDeviceStateClassSensor3.interfaces[1].name, DOWN);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call tools_service_.change_remote_network_device_state() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'change_remote_network_device_state').and.returnValue(throwError(mock_http_error_response));

        component['api_change_remote_network_device_state_'](mat_slide_toggle_change_true, MockInitialDeviceStateClassSensor3.node, MockInitialDeviceStateClassSensor3.interfaces[1].name, DOWN);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_initial_device_states_()', () => {
      it('should call api_get_initial_device_states_()', () => {
        reset();

        component['api_get_initial_device_states_']();

        expect(component['api_get_initial_device_states_']).toHaveBeenCalled();
      });

      it('should call tools_service_.get_initial_device_states() from api_change_remote_network_device_state_()', () => {
        reset();

        component['api_get_initial_device_states_']();

        expect(component['tools_service_'].get_initial_device_states).toHaveBeenCalled();
      });

      it('should call tools_service_.get_initial_device_states() and handle response and nodes = response', () => {
        reset();

        component['api_get_initial_device_states_']();

        expect(component.nodes).toEqual(MockInitialDeviceStateClassArray);
      });

      it('should call tools_service_.get_initial_device_states() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'get_initial_device_states').and.returnValue(throwError(mock_http_error_response));

        component['api_get_initial_device_states_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

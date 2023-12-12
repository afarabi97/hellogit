import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { throwError } from 'rxjs';

import {
  MockControllerInfoClass,
  MockErrorMessageClass,
  MockGeneralSettingsClass,
  MockKitSettingsClass,
  MockKitSettingsClass_Alt,
  MockKitStatusClass
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { TestingModule } from '../testing-modules/testing.module';
import { InjectorModule } from '../utilily-modules/injector.module';
import { SystemSettingsComponent } from './system-settings.component';
import { SystemSettingsModule } from './system-settings.module';

describe('SystemSettingsComponent', () => {
  let component: SystemSettingsComponent;
  let fixture: ComponentFixture<SystemSettingsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyUpdateGeneralSettings: jasmine.Spy<any>;
  let spyUpdateKitSettings: jasmine.Spy<any>;
  let spyUpdateAddKitButton: jasmine.Spy<any>;
  let spyCheckIsGip: jasmine.Spy<any>;
  let spyApiGetGeneralSettings: jasmine.Spy<any>;
  let spyApiGetKitStatus: jasmine.Spy<any>;
  let spyApiGetControllerInfo: jasmine.Spy<any>;
  let spyApiGetKitSettings: jasmine.Spy<any>;

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
        SystemSettingsModule,
        InjectorModule,
        TestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemSettingsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyUpdateGeneralSettings = spyOn(component, 'update_general_settings').and.callThrough();
    spyUpdateKitSettings = spyOn(component, 'update_kit_settings').and.callThrough();
    spyUpdateAddKitButton = spyOn(component, 'update_add_kit_button').and.callThrough();
    spyCheckIsGip = spyOn(component, 'check_is_gip').and.callThrough();
    spyApiGetGeneralSettings = spyOn<any>(component, 'api_get_general_settings_').and.callThrough();
    spyApiGetKitStatus = spyOn<any>(component, 'api_get_kit_status_').and.callThrough();
    spyApiGetControllerInfo = spyOn<any>(component, 'api_get_controller_info_').and.callThrough();
    spyApiGetKitSettings = spyOn<any>(component, 'api_get_kit_settings_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyUpdateGeneralSettings.calls.reset();
    spyUpdateKitSettings.calls.reset();
    spyUpdateAddKitButton.calls.reset();
    spyCheckIsGip.calls.reset();
    spyApiGetGeneralSettings.calls.reset();
    spyApiGetKitStatus.calls.reset();
    spyApiGetControllerInfo.calls.reset();
    spyApiGetKitSettings.calls.reset();
  };

  afterAll(() => {
    remove_styles_from_dom();
  });

  it('should create SystemSettingsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('SystemSettingsComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_general_settings_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_general_settings_']).toHaveBeenCalled();
      });

      it('should call api_get_kit_status_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_kit_status_']).toHaveBeenCalled();
      });

      it('should call api_get_controller_info_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_controller_info_']).toHaveBeenCalled();
      });

      it('should call api_get_kit_settings_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_kit_settings_']).toHaveBeenCalled();
      });
    });

    describe('update_general_settings()', () => {
      it('should call update_general_settings()', () => {
        reset();

        component.general_settings = {};
        component.update_general_settings(MockGeneralSettingsClass);

        expect(component.update_general_settings).toHaveBeenCalled();
      });

      it('should call update_general_settings() and set general_settings = value', () => {
        reset();

        component.general_settings = {};
        component.update_general_settings(MockGeneralSettingsClass);

        expect(component.general_settings).toEqual(MockGeneralSettingsClass);
      });
    });

    describe('update_kit_settings()', () => {
      it('should call update_kit_settings()', () => {
        reset();

        component.update_kit_settings(MockKitSettingsClass);

        expect(component.update_kit_settings).toHaveBeenCalled();
      });

      it('should call update_kit_settings() and set kit_settings = value', () => {
        reset();

        component.update_kit_settings(MockKitSettingsClass_Alt);

        expect(component.kit_settings).toEqual(MockKitSettingsClass_Alt);
      });
    });

    describe('update_add_kit_button()', () => {
      it('should call update_add_kit_button()', () => {
        reset();

        component.update_add_kit_button(true);

        expect(component.update_add_kit_button).toHaveBeenCalled();
      });

      it('should call update_add_kit_button() and set disable_add_kit_button = true', () => {
        reset();

        component.update_add_kit_button(true);

        expect(component.disable_add_kit_button).toBeTrue();
      });

      it('should call update_add_kit_button() and set disable_add_kit_button = false', () => {
        reset();

        component.update_add_kit_button(false);

        expect(component.disable_add_kit_button).toBeFalse();
      });
    });

    describe('check_is_gip()', () => {
      it('should call check_is_gip()', () => {
        reset();

        component.kit_settings = MockKitSettingsClass;
        component.check_is_gip();

        expect(component.check_is_gip).toHaveBeenCalled();
      });

      it('should call check_is_gip() and return true', () => {
        reset();

        component.kit_settings = MockKitSettingsClass_Alt;
        const return_value: boolean = component.check_is_gip();

        expect(return_value).toBeTrue();
      });

      it('should call check_is_gip() and return false', () => {
        reset();

        component.kit_settings = MockKitSettingsClass;
        const return_value: boolean = component.check_is_gip();

        expect(return_value).toBeFalse();
      });
    });

    describe('private api_get_general_settings_()', () => {
      it('should call api_get_general_settings_()', () => {
        reset();

        component['api_get_general_settings_']();

        expect(component['api_get_general_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_general_settings() from api_get_general_settings_()', () => {
        reset();

        component['api_get_general_settings_']();

        expect(component['kit_settings_service_'].get_general_settings).toHaveBeenCalled();
      });

      it('should call from kit_settings_service_.get_general_settings() and handle response and set general_settings = response', () => {
        reset();

        component['api_get_general_settings_']();

        expect(component.general_settings).toEqual(MockGeneralSettingsClass);
      });

      it('should call kit_settings_service_.get_general_settings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_general_settings').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_general_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_general_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_general_settings').and.returnValue(throwError(mock_http_error_response));

        component['api_get_general_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_kit_status_()', () => {

      it('should call api_get_kit_status_()', () => {
        reset();

        component['api_get_kit_status_']();

        expect(component['api_get_kit_status_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_status() from api_get_kit_status_()', () => {
        reset();

        component['api_get_kit_status_']();

        expect(component['kit_settings_service_'].get_kit_status).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_status() and handle response and kit_status_ with response', () => {
        reset();

        component['api_get_kit_status_']();

        expect(component.kit_status).toEqual(MockKitStatusClass);
      });

      it('should call kit_settings_service_.get_kit_status() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_kit_status').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_kit_status_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_status() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_kit_status').and.returnValue(throwError(mock_http_error_response));

        component['api_get_kit_status_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_controller_info_()', () => {
      it('should call api_get_controller_info_()', () => {
        reset();

        component['api_get_controller_info_']();

        expect(component['api_get_controller_info_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_controller_info() from api_get_controller_info_()', () => {
        reset();

        component['api_get_controller_info_']();

        expect(component['kit_settings_service_'].get_controller_info).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_controller_info() and handle response and set controller_info = response', () => {
        reset();

        component['api_get_controller_info_']();

        expect(component['controller_info']).toEqual(MockControllerInfoClass);
      });

      it('should call kit_settings_service_.get_controller_info() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_controller_info').and.returnValue(throwError(mock_http_error_response));

        component['api_get_controller_info_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_kit_settings_()', () => {
      it('should call api_get_kit_settings_()', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component['api_get_kit_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_settings() from api_get_kit_settings_()', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component['kit_settings_service_'].get_kit_settings).toHaveBeenCalled();
      });

      it('should kit_settings_service_.get_kit_settings() and on success set kit_settings = response', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component.kit_settings).toEqual(MockKitSettingsClass);
      });

      it('should kit_settings_service_.get_kit_settings() and on success set disable_add_kit_button = false', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component.disable_add_kit_button).toBeFalse();
      });

      it('should call kit_settings_service_.get_kit_settings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_kit_settings').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_kit_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_kit_settings').and.returnValue(throwError(mock_http_error_response));

        component['api_get_kit_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

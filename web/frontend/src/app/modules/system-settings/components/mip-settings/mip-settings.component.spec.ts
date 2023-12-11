import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { of, throwError } from 'rxjs';

import {
  MockErrorMessageClass,
  MockKitStatusClass,
  MockKitStatusClassAlt,
  MockMipSettingsClass,
  MockPostValidationObject,
  MockPostValidationStringArray,
  MockValidationErrorClass
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { PostValidationClass } from '../../../../classes';
import { COMMON_VALIDATORS } from '../../../../constants/cvah.constants';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { TestingModule } from '../../../testing-modules/testing.module';
import { SystemSettingsModule } from '../../system-settings.module';
import { MIPSettingsComponent } from './mip-settings.component';

describe('MIPSettingsComponent', () => {
  let component: MIPSettingsComponent;
  let fixture: ComponentFixture<MIPSettingsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyREEvaluate: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyClickButtonSave: jasmine.Spy<any>;
  let spyOpenPasswordDialogWindow: jasmine.Spy<any>;
  let spyInitializeMipSettingsFormGroup: jasmine.Spy<any>;
  let spyCheckJob: jasmine.Spy<any>;
  let spyConstructPostValidationErrorMessage: jasmine.Spy<any>;
  let spyWebsocketGetSocketOnKitStatusChange: jasmine.Spy<any>;
  let spyApiGetMipSettings: jasmine.Spy<any>;
  let spyApiUpdateMipSettings: jasmine.Spy<any>;

  // Test Data
  const form_control: FormControl = new FormControl('');
  const error_message_form_control: FormControl = new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  error_message_form_control.markAsTouched();
  const post_validation_keys: string[] = Object.keys(MockPostValidationObject.post_validation);
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
        TestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MIPSettingsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyREEvaluate = spyOn(component, 're_evaluate').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyClickButtonSave = spyOn(component, 'click_button_save').and.callThrough();
    spyOpenPasswordDialogWindow = spyOn(component, 'open_password_dialog_window').and.callThrough();
    spyInitializeMipSettingsFormGroup = spyOn<any>(component, 'initialize_mip_settings_form_group_').and.callThrough();
    spyCheckJob = spyOn<any>(component, 'check_job_').and.callThrough();
    spyConstructPostValidationErrorMessage = spyOn<any>(component, 'construct_post_validation_error_message_').and.callThrough();
    spyWebsocketGetSocketOnKitStatusChange = spyOn<any>(component, 'websocket_get_socket_on_kit_status_change').and.callThrough();
    spyApiGetMipSettings = spyOn<any>(component, 'api_get_mip_settings_').and.callThrough();
    spyApiUpdateMipSettings = spyOn<any>(component, 'api_update_mip_settings_').and.callThrough();

    component.kit_status = MockKitStatusClass;

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyNGOnChanges.calls.reset();
    spyREEvaluate.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyClickButtonSave.calls.reset();
    spyOpenPasswordDialogWindow.calls.reset();
    spyInitializeMipSettingsFormGroup.calls.reset();
    spyCheckJob.calls.reset();
    spyConstructPostValidationErrorMessage.calls.reset();
    spyWebsocketGetSocketOnKitStatusChange.calls.reset();
    spyApiGetMipSettings.calls.reset();
    spyApiUpdateMipSettings.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create MIPSettingsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('MIPSettingsComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_mip_settings_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_mip_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call websocket_get_socket_on_kit_status_change() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['websocket_get_socket_on_kit_status_change']).toHaveBeenCalled();
      });

      it('should call api_get_mip_settings_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_mip_settings_']).toHaveBeenCalled();
      });
    });

    describe('ngOnChanges()', () => {
      it('should call ngOnChanges()', () => {
        reset();

        component.ngOnChanges();

        expect(component.ngOnChanges).toHaveBeenCalled();
      });

      it('should call check_job_() from ngOnInit() on mip_settings_form_group changes', () => {
        reset();

        component.ngOnChanges();

        expect(component['check_job_']).toHaveBeenCalled();
      });
    });

    describe('re_evaluate()', () => {
      it('should call re_evaluate_()', () => {
        reset();

        component['initialize_mip_settings_form_group_']();
        component.re_evaluate();

        expect(component.re_evaluate).toHaveBeenCalled();
      });
    });

    describe('get_error_message()', () => {
      it('should call get_error_message()', () => {
        reset();

        component.get_error_message(error_message_form_control);

        expect(component.get_error_message).toHaveBeenCalled();
      });

      it('should call get_error_message() and return error message', () => {
        reset();

        const return_value: string = component.get_error_message(error_message_form_control);

        expect(return_value).toEqual(COMMON_VALIDATORS.required[0].error_message);
      });

      it('should call get_error_message() and return empty string', () => {
        reset();

        const return_value: string = component.get_error_message(form_control);

        expect(return_value).toEqual('');
      });
    });

    describe('click_button_save()', () => {
      it('should call click_button_save()', () => {
        reset();

        component['initialize_mip_settings_form_group_']();
        component.click_button_save();

        expect(component.click_button_save).toHaveBeenCalled();
      });

      it('should call api_update_mip_settings_() from click_button_save()', () => {
        reset();

        component['initialize_mip_settings_form_group_']();
        component.click_button_save();

        expect(component['api_update_mip_settings_']).toHaveBeenCalled();
      });
    });

    describe('open_password_dialog_window()', () => {
      it('should call open_password_dialog_window()', () => {
        reset();

        component.open_password_dialog_window();

        expect(component.open_password_dialog_window).toHaveBeenCalled();
      });
    });

    describe('private initialize_mip_settings_form_group_()', () => {
      it('should call initialize_mip_settings_form_group_()', () => {
        reset();

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);

        expect(component['initialize_mip_settings_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private check_job_()', () => {
      it('should call check_job_()', () => {
        reset();

        component['check_job_']();

        expect(component['check_job_']).toHaveBeenCalled();
      });

      it('should call check_job_() and disable mip_settings_form_group when kit_status.general_settings_configured = false', () => {
        reset();

        component.kit_status = MockKitStatusClassAlt;
        component['initialize_mip_settings_form_group_']();
        component['check_job_']();

        expect(component.mip_settings_form_group.disabled).toBeTrue();
      });

      it('should call check_job_() and enable mip_settings_form_group when kit_status.general_settings_configured = true', () => {
        reset();

        component.kit_status = MockKitStatusClass;
        component['initialize_mip_settings_form_group_']();
        component['check_job_']();

        expect(component.mip_settings_form_group.enabled).toBeTrue();
      });
    });

    describe('private construct_post_validation_error_message_()', () => {
      it('should call construct_post_validation_error_message_()', () => {
        reset();

        component['construct_post_validation_error_message_'](MockPostValidationObject.post_validation, post_validation_keys);

        expect(component['construct_post_validation_error_message_']).toHaveBeenCalled();
      });

      it('should call construct_post_validation_error_message_() and return error message', () => {
        reset();

        const return_value: string = component['construct_post_validation_error_message_'](MockPostValidationObject.post_validation, post_validation_keys);

        expect(return_value.length > 0).toBeTrue();
      });
    });

    describe('private websocket_get_socket_on_kit_status_change()', () => {
      it('should call websocket_get_socket_on_kit_status_change()', () => {
        reset();

        component['websocket_get_socket_on_kit_status_change']();

        expect(component['websocket_get_socket_on_kit_status_change']).toHaveBeenCalled();
      });
    });

    describe('private api_get_mip_settings_()', () => {
      it('should call api_get_mip_settings_()', () => {
        reset();

        component['initialize_mip_settings_form_group_']();
        component['api_get_mip_settings_']();

        expect(component['api_get_mip_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_mip_settings() from api_get_mip_settings_()', () => {
        reset();

        component['initialize_mip_settings_form_group_']();
        component['api_get_mip_settings_']();

        expect(component['kit_settings_service_'].get_mip_settings).toHaveBeenCalled();
      });

      it('should call from kit_settings_service_.get_mip_settings() and handle response and call initialize_mip_settings_form_group_()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_mip_settings').and.returnValue(of(MockMipSettingsClass));

        component['initialize_mip_settings_form_group_']();
        component['api_get_mip_settings_']();

        expect(component['kit_settings_service_'].get_mip_settings).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_mip_settings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_mip_settings').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_mip_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_mip_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_mip_settings').and.returnValue(throwError(mock_http_error_response));

        component['api_get_mip_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_update_mip_settings_()', () => {
      it('should call api_update_mip_settings_()', () => {
        reset();

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);
        component['api_update_mip_settings_']();

        expect(component['api_update_mip_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_mip_settings() from api_update_mip_settings_()', () => {
        reset();

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);
        component['api_update_mip_settings_']();

        expect(component['kit_settings_service_'].update_mip_settings).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_mip_settings() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);
        component['api_update_mip_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_mip_settings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_mip_settings').and.returnValue(throwError(MockErrorMessageClass));

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);
        component['api_update_mip_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_mip_settings() and handle error response instance ValidationErrorClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_mip_settings').and.returnValue(throwError(MockValidationErrorClass));

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);
        component['api_update_mip_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_mip_settings() and handle error response instance PostValidationClass string', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_mip_settings').and.returnValue(throwError(new PostValidationClass('im a string error' as any)));

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);
        component['api_update_mip_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_mip_settings() and handle error response instance PostValidationClass string[]', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_mip_settings').and.returnValue(throwError(MockPostValidationStringArray));

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);
        component['api_update_mip_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_mip_settings() and handle error response instance PostValidationClass object and call construct_post_validation_error_message_()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_mip_settings').and.returnValue(throwError(MockPostValidationObject));

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);
        component['api_update_mip_settings_']();

        expect(component['construct_post_validation_error_message_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_mip_settings() and handle error response instance PostValidationClass object', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_mip_settings').and.returnValue(throwError(MockPostValidationObject));

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);
        component['api_update_mip_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_mip_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_mip_settings').and.returnValue(throwError(mock_http_error_response));

        component['initialize_mip_settings_form_group_'](MockMipSettingsClass);
        component['api_update_mip_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

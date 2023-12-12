import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { throwError } from 'rxjs';

import {
  MockErrorMessageClass,
  MockPostValidationObject,
  MockPostValidationStringArray,
  MockValidationErrorClass,
  MockVMWareDataClass,
  MockVMWareSettingsClass
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { ObjectUtilitiesClass, PostValidationClass } from '../../../../classes';
import { COMMON_VALIDATORS } from '../../../../constants/cvah.constants';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import { SystemSettingsModule } from '../../system-settings.module';
import { VMWareSettingsComponent } from './vmware-settings.component';

describe('VMWareSettingsComponent', () => {
  let component: VMWareSettingsComponent;
  let fixture: ComponentFixture<VMWareSettingsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyIsVMWareChecked: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyClickButtonTestConnection: jasmine.Spy<any>;
  let spyClickButtonSave: jasmine.Spy<any>;
  let spyInitializeVMWareSettingsFormGroup: jasmine.Spy<any>;
  let spySetVMWareSettingsFormGroup: jasmine.Spy<any>;
  let spyInputControl: jasmine.Spy<any>;
  let spyInputControlReset: jasmine.Spy<any>;
  let spyConstructPostValidationErrorMessage: jasmine.Spy<any>;
  let spyApiGetVMWareSettings: jasmine.Spy<any>;
  let spyApiSaveVMWareSettings: jasmine.Spy<any>;
  let spyApiTestVMWareSettings: jasmine.Spy<any>;

  // Test Data
  const error_message_form_control: FormControl = new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  error_message_form_control.markAsTouched();
  const form_control: FormControl = new FormControl('test', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  form_control.markAsTouched();
  const post_validation_keys: string[] = Object.keys(MockPostValidationObject.post_validation);
  const vmware_settings_form_group: FormGroup = new FormGroup({
    ip_address: new FormControl('10.10.200.200'),
    username: new FormControl('test.gitlab@test.lab'),
    password: new FormControl('1qaz2wsx!QAZ@WSX'),
    datastore: new FormControl('DEV-vSAN'),
    vcenter: new FormControl(true),
    folder: new FormControl('Test'),
    datacenter: new FormControl('DEV_Datacenter'),
    portgroup: new FormControl('31-Dev21-Test'),
    cluster: new FormControl('DEV_Cluster')
  });
  const vmware_settings_form_group_with_nulls: FormGroup = new FormGroup({
    ip_address: new FormControl('10.10.200.200'),
    username: new FormControl('test.gitlab@test.lab'),
    password: new FormControl('1qaz2wsx!QAZ@WSX'),
    datastore: new FormControl(null),
    vcenter: new FormControl(true),
    folder: new FormControl(null),
    datacenter: new FormControl(null),
    portgroup: new FormControl(null),
    cluster: new FormControl(null)
  });
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
        SystemSettingsModule,
        TestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VMWareSettingsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyIsVMWareChecked = spyOn(component, 'is_wmware_checked').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyClickButtonTestConnection = spyOn(component, 'click_button_test_connection').and.callThrough();
    spyClickButtonSave = spyOn(component, 'click_button_save').and.callThrough();
    spyInitializeVMWareSettingsFormGroup = spyOn<any>(component, 'initialize_vmware_settings_form_group_').and.callThrough();
    spySetVMWareSettingsFormGroup = spyOn<any>(component, 'set_vmware_settings_form_group_').and.callThrough();
    spyInputControl = spyOn<any>(component, 'input_control_').and.callThrough();
    spyInputControlReset = spyOn<any>(component, 'input_control_reset_').and.callThrough();
    spyConstructPostValidationErrorMessage = spyOn<any>(component, 'construct_post_validation_error_message_').and.callThrough();
    spyApiGetVMWareSettings = spyOn<any>(component, 'api_get_vmware_settings_').and.callThrough();
    spyApiSaveVMWareSettings = spyOn<any>(component, 'api_save_vmware_settings_').and.callThrough();
    spyApiTestVMWareSettings = spyOn<any>(component, 'api_test_vmware_settings_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyIsVMWareChecked.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyClickButtonTestConnection.calls.reset();
    spyClickButtonSave.calls.reset();
    spyInitializeVMWareSettingsFormGroup.calls.reset();
    spySetVMWareSettingsFormGroup.calls.reset();
    spyInputControl.calls.reset();
    spyInputControlReset.calls.reset();
    spyConstructPostValidationErrorMessage.calls.reset();
    spyApiGetVMWareSettings.calls.reset();
    spyApiSaveVMWareSettings.calls.reset();
    spyApiTestVMWareSettings.calls.reset();
  };

  afterAll(() => {
    remove_styles_from_dom();
  });

  it('should create VMWareSettingsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('VMWareSettingsComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_vmware_settings_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_vmware_settings_']).toHaveBeenCalled();
      });
    });

    describe('is_wmware_checked()', () => {
      it('should call is_wmware_checked()', () => {
        reset();

        component.vmware_settings_form_group = vmware_settings_form_group;
        component.is_wmware_checked();

        expect(component.is_wmware_checked).toHaveBeenCalled();
      });

      it('should call is_wmware_checked() and return vmware_settings_form_group.vcenter value', () => {
        reset();

        component.vmware_settings_form_group = vmware_settings_form_group;
        const return_Value: boolean = component.is_wmware_checked();

        expect(return_Value).toEqual(vmware_settings_form_group.get('vcenter').value);
      });

      it('should call is_wmware_checked() and return false', () => {
        reset();

        component.vmware_settings_form_group = undefined;
        const return_Value: boolean = component.is_wmware_checked();

        expect(return_Value).toBeFalse();
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

    describe('click_button_test_connection()', () => {
      it('should call click_button_test_connection()', () => {
        reset();

        component.click_button_test_connection();

        expect(component.click_button_test_connection).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from call click_button_test_connection()', () => {
        reset();

        component.click_button_test_connection();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call api_test_vmware_settings_() from call click_button_test_connection()', () => {
        reset();

        component.click_button_test_connection();

        expect(component['api_test_vmware_settings_']).toHaveBeenCalled();
      });
    });

    describe('click_button_save()', () => {
      it('should call click_button_save()', () => {
        reset();

        component.click_button_save();

        expect(component.click_button_save).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from call click_button_save()', () => {
        reset();

        component.click_button_save();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call api_save_vmware_settings_() from call click_button_save()', () => {
        reset();

        component.click_button_save();

        expect(component['api_save_vmware_settings_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_vmware_settings_form_group_()', () => {
      it('should call initialize_vmware_settings_form_group_()', () => {
        reset();

        component['initialize_vmware_settings_form_group_']();

        expect(component['initialize_vmware_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call set_vmware_settings_form_group_() from initialize_vmware_settings_form_group_()', () => {
        reset();

        component['initialize_vmware_settings_form_group_'](MockVMWareSettingsClass);

        component.vmware_settings_form_group.get('password').setValue('1qaz2wsx!QAZ@WSXs');
        component.vmware_settings_form_group.get('password_confirm').setValue('1qaz2wsx!QAZ@WSXs');

        expect(component['set_vmware_settings_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private set_vmware_settings_form_group_()', () => {
      it('should call set_vmware_settings_form_group_()', () => {
        reset();

        component['set_vmware_settings_form_group_'](vmware_settings_form_group);

        expect(component['set_vmware_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call set_vmware_settings_form_group_() and set vmware_settings_form_group with passed value', () => {
        reset();

        component['set_vmware_settings_form_group_'](vmware_settings_form_group);

        expect(component.vmware_settings_form_group).toEqual(vmware_settings_form_group);
      });
    });

    describe('private input_control_()', () => {
      it('should call input_control_()', () => {
        reset();

        component['initialize_vmware_settings_form_group_'](MockVMWareSettingsClass);
        component['input_control_'](true);

        expect(component['input_control_']).toHaveBeenCalled();
      });

      it('should call input_control_() and set vmware_settings_form_group [folder, datacenter, cluster, portgoup, datastore] controls to disabled', () => {
        reset();

        component['initialize_vmware_settings_form_group_'](MockVMWareSettingsClass);
        component['input_control_'](true);

        expect(component.vmware_settings_form_group.get('folder').disabled).toBeTrue();
        expect(component.vmware_settings_form_group.get('datacenter').disabled).toBeTrue();
        expect(component.vmware_settings_form_group.get('cluster').disabled).toBeTrue();
        expect(component.vmware_settings_form_group.get('portgroup').disabled).toBeTrue();
        expect(component.vmware_settings_form_group.get('datastore').disabled).toBeTrue();
        expect(component.vmware_settings_form_group.get('folder').enabled).toBeFalse();
        expect(component.vmware_settings_form_group.get('datacenter').enabled).toBeFalse();
        expect(component.vmware_settings_form_group.get('cluster').enabled).toBeFalse();
        expect(component.vmware_settings_form_group.get('portgroup').enabled).toBeFalse();
        expect(component.vmware_settings_form_group.get('datastore').enabled).toBeFalse();
      });

      it('should call input_control_() and set vmware_settings_form_group [folder, datacenter, cluster, portgoup, datastore] controls to enabled', () => {
        reset();

        component['initialize_vmware_settings_form_group_'](MockVMWareSettingsClass);
        component['input_control_'](false);

        expect(component.vmware_settings_form_group.get('folder').disabled).toBeFalse();
        expect(component.vmware_settings_form_group.get('datacenter').disabled).toBeFalse();
        expect(component.vmware_settings_form_group.get('cluster').disabled).toBeFalse();
        expect(component.vmware_settings_form_group.get('portgroup').disabled).toBeFalse();
        expect(component.vmware_settings_form_group.get('datastore').disabled).toBeFalse();
        expect(component.vmware_settings_form_group.get('folder').enabled).toBeTrue();
        expect(component.vmware_settings_form_group.get('datacenter').enabled).toBeTrue();
        expect(component.vmware_settings_form_group.get('cluster').enabled).toBeTrue();
        expect(component.vmware_settings_form_group.get('portgroup').enabled).toBeTrue();
        expect(component.vmware_settings_form_group.get('datastore').enabled).toBeTrue();
      });
    });

    describe('private input_control_reset_()', () => {
      it('should call input_control_reset_()', () => {
        reset();

        component['set_vmware_settings_form_group_'](vmware_settings_form_group);
        component['input_control_reset_']();

        expect(component['input_control_reset_']).toHaveBeenCalled();
      });

      it('should call input_control_reset_() and reset values to null in form group', () => {
        reset();

        component['set_vmware_settings_form_group_'](vmware_settings_form_group_with_nulls);
        component['input_control_reset_']();

        expect(ObjectUtilitiesClass.notUndefNull(component.vmware_settings_form_group.get('folder').value)).toBeFalse();
        expect(ObjectUtilitiesClass.notUndefNull(component.vmware_settings_form_group.get('datacenter').value)).toBeFalse();
        expect(ObjectUtilitiesClass.notUndefNull(component.vmware_settings_form_group.get('cluster').value)).toBeFalse();
        expect(ObjectUtilitiesClass.notUndefNull(component.vmware_settings_form_group.get('portgroup').value)).toBeFalse();
        expect(ObjectUtilitiesClass.notUndefNull(component.vmware_settings_form_group.get('datastore').value)).toBeFalse();
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

    describe('private api_get_vmware_settings_()', () => {
      it('should call api_get_vmware_settings_()', () => {
        reset();

        component['api_get_vmware_settings_']();

        expect(component['api_get_vmware_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_vmware_settings() from api_get_vmware_settings_()', () => {
        reset();

        component['api_get_vmware_settings_']();

        expect(component['kit_settings_service_'].get_vmware_settings).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_vmware_settings() and handle response and call initialize_vmware_settings_form_group_()', () => {
        reset();

        component['api_get_vmware_settings_']();

        expect(component['initialize_vmware_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_vmware_settings() and handle response and call input_control_()', () => {
        reset();

        component['api_get_vmware_settings_']();

        expect(component['input_control_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_vmware_settings() and handle response and call api_test_vmware_settings_()', () => {
        reset();

        component['api_get_vmware_settings_']();

        expect(component['api_test_vmware_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_vmware_settings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_vmware_settings').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_vmware_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_vmware_settings').and.returnValue(throwError(mock_http_error_response));

        component['api_get_vmware_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_save_vmware_settings_()', () => {
      it('should call api_save_vmware_settings_()', () => {
        reset();

        component['api_save_vmware_settings_']();

        expect(component['api_save_vmware_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.save_vmware_settings() from api_save_vmware_settings_()', () => {
        reset();

        component['api_save_vmware_settings_']();

        expect(component['kit_settings_service_'].save_vmware_settings).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.save_vmware_settings() and handle response and call initialize_vmware_settings_form_group_()', () => {
        reset();

        component['api_save_vmware_settings_']();

        expect(component['initialize_vmware_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.save_vmware_settings() and handle response and set isSaveVmwareSettingsBtnEnabled = true', () => {
        reset();

        component.isSaveVmwareSettingsBtnEnabled = false;
        component['api_save_vmware_settings_']();

        expect(component.isSaveVmwareSettingsBtnEnabled).toBeTrue();
      });

      it('should call kit_settings_service_.save_vmware_settings() and handle response and call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_save_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.save_vmware_settings() and handle error response and set isSaveVmwareSettingsBtnEnabled = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'save_vmware_settings').and.returnValue(throwError(MockErrorMessageClass));

        component.isSaveVmwareSettingsBtnEnabled = false;
        component['api_save_vmware_settings_']();

        expect(component.isSaveVmwareSettingsBtnEnabled).toBeTrue();
      });

      it('should call kit_settings_service_.save_vmware_settings() and handle error response instance ValidationErrorClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'save_vmware_settings').and.returnValue(throwError(MockValidationErrorClass));

        component['api_save_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.save_vmware_settings() and handle error response instance PostValidationClass string', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'save_vmware_settings').and.returnValue(throwError(new PostValidationClass('im a string error' as any)));

        component['api_save_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.save_vmware_settings() and handle error response instance PostValidationClass string[]', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'save_vmware_settings').and.returnValue(throwError(MockPostValidationStringArray));

        component['api_save_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.save_vmware_settings() and handle error response instance PostValidationClass object and call construct_post_validation_error_message_()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'save_vmware_settings').and.returnValue(throwError(MockPostValidationObject));

        component['api_save_vmware_settings_']();

        expect(component['construct_post_validation_error_message_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.save_vmware_settings() and handle error response instance PostValidationClass object', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'save_vmware_settings').and.returnValue(throwError(MockPostValidationObject));

        component['api_save_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.save_vmware_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'save_vmware_settings').and.returnValue(throwError(mock_http_error_response));

        component['api_save_vmware_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_test_vmware_settings_()', () => {
      it('should call api_test_vmware_settings_()', () => {
        reset();

        component['api_test_vmware_settings_'](false);

        expect(component['api_test_vmware_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() from api_test_vmware_settings_()', () => {
        reset();

        component['api_test_vmware_settings_']();

        expect(component['kit_settings_service_'].test_vmware_settings).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle response and set isTestVmwareSettingsBtnEnabled = true', () => {
        reset();

        component.isTestVmwareSettingsBtnEnabled = false;
        component['api_test_vmware_settings_']();

        expect(component.isTestVmwareSettingsBtnEnabled).toBeTrue();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle response and set vmware_data = response', () => {
        reset();

        component.vmware_data = {};
        component['api_test_vmware_settings_']();

        expect(component.vmware_data).toEqual(MockVMWareDataClass);
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle response and call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_test_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle response and call initialize_vmware_settings_form_group_() when vmware_settings passed into method', () => {
        reset();

        component['api_test_vmware_settings_'](true, MockVMWareSettingsClass);

        expect(component['initialize_vmware_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle response and call input_control_reset_() when vmware_settings not passed into method', () => {
        reset();

        component['api_test_vmware_settings_'](true);

        expect(component['input_control_reset_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle response and call input_control_()', () => {
        reset();

        component['api_test_vmware_settings_'](true);

        expect(component['input_control_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle error response and set isTestVmwareSettingsBtnEnabled = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'test_vmware_settings').and.returnValue(throwError(MockErrorMessageClass));

        component.isTestVmwareSettingsBtnEnabled = false;
        component['api_test_vmware_settings_']();

        expect(component.isTestVmwareSettingsBtnEnabled).toBeTrue();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'test_vmware_settings').and.returnValue(throwError(MockErrorMessageClass));

        component['api_test_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle error response instance ValidationErrorClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'test_vmware_settings').and.returnValue(throwError(MockValidationErrorClass));

        component['api_test_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle error response instance PostValidationClass string', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'test_vmware_settings').and.returnValue(throwError(new PostValidationClass('im a string error' as any)));

        component['api_test_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle error response instance PostValidationClass string[]', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'test_vmware_settings').and.returnValue(throwError(MockPostValidationStringArray));

        component['api_test_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle error response instance PostValidationClass object and call construct_post_validation_error_message_()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'test_vmware_settings').and.returnValue(throwError(MockPostValidationObject));

        component['api_test_vmware_settings_']();

        expect(component['construct_post_validation_error_message_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle error response instance PostValidationClass object', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'test_vmware_settings').and.returnValue(throwError(MockPostValidationObject));

        component['api_test_vmware_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.test_vmware_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'test_vmware_settings').and.returnValue(throwError(mock_http_error_response));

        component['api_test_vmware_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

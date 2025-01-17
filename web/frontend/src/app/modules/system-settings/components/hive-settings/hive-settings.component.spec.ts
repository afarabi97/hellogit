import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { MockErrorMessageClass, MockHiveSettingsClass } from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockServerStdoutMatDialogDataInterface } from '../../../../../../static-data/interface-objects';
import { HiveSettingsInterface } from '../../../../interfaces';
import { TestingModule } from '../../../testing-modules/testing.module';
import { SystemSettingsModule } from '../../system-settings.module';
import { HiveSettingsComponent } from './hive-settings.component';

describe('HiveSettingsComponent', () => {
  let component: HiveSettingsComponent;
  let fixture: ComponentFixture<HiveSettingsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyClickButtonSave: jasmine.Spy<any>;
  let spySetHiveSettingsFormGroup: jasmine.Spy<any>;
  let spyApiGetHiveSettings: jasmine.Spy<any>;
  let spyApiSaveHiveSettings: jasmine.Spy<any>;

  // Test Data
  const hive_settings_interface: HiveSettingsInterface = MockHiveSettingsClass as HiveSettingsInterface;
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
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: MockServerStdoutMatDialogDataInterface }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HiveSettingsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyClickButtonSave = spyOn(component, 'click_button_save').and.callThrough();
    spySetHiveSettingsFormGroup = spyOn<any>(component, 'set_hive_settings_form_group_').and.callThrough();
    spyApiGetHiveSettings = spyOn<any>(component, 'api_get_hive_settings_').and.callThrough();
    spyApiSaveHiveSettings = spyOn<any>(component, 'api_save_hive_settings_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyClickButtonSave.calls.reset();
    spySetHiveSettingsFormGroup.calls.reset();
    spyApiGetHiveSettings.calls.reset();
    spyApiSaveHiveSettings.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create HiveSettingsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('HiveSettingsComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_hive_settings_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_hive_settings_']).toHaveBeenCalled();
      });
    });

    describe('click_button_save()', () => {
      it('should call click_button_save()', () => {
        reset();

        component.click_button_save();

        expect(component.click_button_save).toHaveBeenCalled();
      });

      it('should call api_save_hive_settings_() from click_button_save()', () => {
        reset();

        component.click_button_save();

        expect(component['api_save_hive_settings_']).toHaveBeenCalled();
      });
    });

    describe('private set_hive_settings_form_group_()', () => {
      it('should call set_hive_settings_form_group_()', () => {
        reset();

        component['set_hive_settings_form_group_'](new FormGroup({}));

        expect(component['set_hive_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call set_hive_settings_form_group_() and set hive_settings_form_group = passed form group variable', () => {
        reset();

        component.hive_settings_form_group = undefined;

        expect(component.hive_settings_form_group).toBeUndefined();

        component['set_hive_settings_form_group_'](new FormGroup({}));

        expect(component.hive_settings_form_group).toBeDefined();
      });
    });

    describe('private api_get_hive_settings_()', () => {
      it('should call api_get_hive_settings_()', () => {
        reset();

        component['api_get_hive_settings_']();

        expect(component['api_get_hive_settings_']).toHaveBeenCalled();
      });

      it('should call global_hive_settings_service_.get_hive_settings() from api_get_hive_settings_()', () => {
        reset();

        component['api_get_hive_settings_']();

        expect(component['global_hive_settings_service_'].get_hive_settings).toHaveBeenCalled();
      });

      it('should call from global_hive_settings_service_.get_hive_settings() and handle response and form admin_api_key with response.admin_api_key and org_admin_api_key with response.org_admin_api_key', () => {
        reset();

        component['api_get_hive_settings_']();

        expect(component.hive_settings_form_group.get('admin_api_key').value).toEqual(MockHiveSettingsClass.admin_api_key);
        expect(component.hive_settings_form_group.get('org_admin_api_key').value).toEqual(MockHiveSettingsClass.org_admin_api_key);
      });

      it('should call from global_hive_settings_service_.get_hive_settings() and handle response and form admin_api_key with empty string and org_admin_api_key with empty string', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_hive_settings_service_'], 'get_hive_settings').and.returnValue(of({}));

        component['api_get_hive_settings_']();

        expect(component.hive_settings_form_group.get('admin_api_key').value).toEqual('');
        expect(component.hive_settings_form_group.get('org_admin_api_key').value).toEqual('');
      });

      it('should call from global_hive_settings_service_.get_hive_settings() and handle response and call set_hive_settings_form_group_()', () => {
        reset();

        component['api_get_hive_settings_']();

        expect(component['set_hive_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call global_hive_settings_service_.get_hive_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_hive_settings_service_'], 'get_hive_settings').and.returnValue(throwError(mock_http_error_response));

        component['api_get_hive_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_save_hive_settings_()', () => {
      it('should call api_save_hive_settings_()', () => {
        reset();

        component['api_save_hive_settings_'](hive_settings_interface);

        expect(component['api_save_hive_settings_']).toHaveBeenCalled();
      });

      it('should call hive_settings_service_.save_hive_settings() from api_save_hive_settings_()', () => {
        reset();

        component['api_save_hive_settings_'](hive_settings_interface);

        expect(component['hive_settings_service_'].save_hive_settings).toHaveBeenCalled();
      });

      it('should call hive_settings_service_.save_hive_settings() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_save_hive_settings_'](hive_settings_interface);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call hive_settings_service_.save_hive_settings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['hive_settings_service_'], 'save_hive_settings').and.returnValue(throwError(MockErrorMessageClass));

        component['api_save_hive_settings_'](hive_settings_interface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call hive_settings_service_.save_hive_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['hive_settings_service_'], 'save_hive_settings').and.returnValue(throwError(mock_http_error_response));

        component['api_save_hive_settings_'](hive_settings_interface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import {
  MockBackgroundJobClass,
  MockBackgroundJobClassStarted,
  MockControllerInfoClass,
  MockErrorMessageClass,
  MockGeneralSettingsClass,
  MockKitSettingsClass,
  MockKitStatusClass
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockServerStdoutMatDialogDataInterface } from '../../../../../../static-data/interface-objects';
import { COMMON_VALIDATORS } from '../../../../constants/cvah.constants';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { TestingModule } from '../../../testing-modules/testing.module';
import { SystemSettingsModule } from '../../system-settings.module';
import { GeneralSettingsComponent } from './general-settings.component';

describe('GeneralSettingsComponent', () => {
  let component: GeneralSettingsComponent;
  let fixture: ComponentFixture<GeneralSettingsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyGetTooltip: jasmine.Spy<any>;
  let spyClickButtonSave: jasmine.Spy<any>;
  let spyClickButtonOpenConsole: jasmine.Spy<any>;
  let spyOpenServerStdoutDialogWindow: jasmine.Spy<any>;
  let spyInitializeGeneralSettingsFormGroup: jasmine.Spy<any>;
  let spyCheckJob: jasmine.Spy<any>;
  let spyGatherControllerFacts: jasmine.Spy<any>;
  let spyWebsocketGetSocketOnKitStatusChange: jasmine.Spy<any>;
  let spyApiUpdateGeneralSettings: jasmine.Spy<any>;
  let spyApiJobGet: jasmine.Spy<any>;

  // Test Data
  const input_name: string = 'ip_address';
  const form_control: FormControl = new FormControl('');
  const error_message_form_control: FormControl = new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  error_message_form_control.markAsTouched();
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
    fixture = TestBed.createComponent(GeneralSettingsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyGetTooltip = spyOn(component, 'get_tooltip').and.callThrough();
    spyClickButtonSave = spyOn(component, 'click_button_save').and.callThrough();
    spyClickButtonOpenConsole = spyOn(component, 'click_button_open_console').and.callThrough();
    spyOpenServerStdoutDialogWindow = spyOn<any>(component, 'open_server_stdout_dialog_window_').and.callThrough();
    spyInitializeGeneralSettingsFormGroup = spyOn<any>(component, 'initialize_general_settings_form_group_').and.callThrough();
    spyCheckJob = spyOn<any>(component, 'check_job_').and.callThrough();
    spyGatherControllerFacts = spyOn<any>(component, 'gather_controller_facts_').and.callThrough();
    spyWebsocketGetSocketOnKitStatusChange = spyOn<any>(component, 'websocket_get_socket_on_kit_status_change').and.callThrough();
    spyApiUpdateGeneralSettings = spyOn<any>(component, 'api_update_general_settings_').and.callThrough();
    spyApiJobGet = spyOn<any>(component, 'api_job_get_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyNGOnChanges.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyGetTooltip.calls.reset();
    spyClickButtonSave.calls.reset();
    spyClickButtonOpenConsole.calls.reset();
    spyOpenServerStdoutDialogWindow.calls.reset();
    spyInitializeGeneralSettingsFormGroup.calls.reset();
    spyCheckJob.calls.reset();
    spyGatherControllerFacts.calls.reset();
    spyWebsocketGetSocketOnKitStatusChange.calls.reset();
    spyApiUpdateGeneralSettings.calls.reset();
    spyApiJobGet.calls.reset();
  };

  afterAll(() => {
    remove_styles_from_dom();
  });

  it('should create GeneralSettingsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('GeneralSettingsComponent methods', () => {

    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call websocket_get_socket_on_kit_status_change() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['websocket_get_socket_on_kit_status_change']).toHaveBeenCalled();
      });

      it('should call initialize_general_settings_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_general_settings_form_group_']).toHaveBeenCalled();
      });
    });

    describe('ngOnChanges()', () => {
      it('should call ngOnChanges()', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(undefined, undefined, false);
        simple_changes['general_settings'] = options_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component.ngOnChanges).toHaveBeenCalled();
      });

      it('should call ngOnChanges() on simple_changes[\'general_settings\'] and set job_id when general_settings?.job_id is defined', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(undefined, MockGeneralSettingsClass, true);
        simple_changes['general_settings'] = options_simple_change;

        component.general_settings = MockGeneralSettingsClass;
        component.ngOnChanges(simple_changes);

        expect(component.job_id).toEqual(MockGeneralSettingsClass.job_id);
      });

      it('should call initialize_general_settings_form_group_() from ngOnChanges() on simple_changes[\'general_settings\'] and when general_settings keys > 0', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(undefined, MockGeneralSettingsClass, true);
        simple_changes['general_settings'] = options_simple_change;

        component.general_settings = MockGeneralSettingsClass;
        component.ngOnChanges(simple_changes);

        expect(component['initialize_general_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call check_job_() from ngOnChanges() on simple_changes[\'general_settings\'] and when general_settings?.job_id is defined', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(undefined, MockGeneralSettingsClass, true);
        simple_changes['general_settings'] = options_simple_change;

        component.general_settings = MockGeneralSettingsClass;
        component.ngOnChanges(simple_changes);

        expect(component['check_job_']).toHaveBeenCalled();
      });

      it('should call ngOnChanges() on simple_changes[\'kit_status\'] and set general_settings_form_group.get(\'domain\').disable', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(undefined, MockKitStatusClass, true);
        simple_changes['kit_status'] = options_simple_change;

        component.kit_status = MockKitStatusClass;
        component['initialize_general_settings_form_group_']();
        component.ngOnChanges(simple_changes);

        expect(component.general_settings_form_group.get('domain').disabled).toBeTrue();
      });

      it('should call gather_controller_facts_() from ngOnChanges()', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(undefined, MockControllerInfoClass, true);
        simple_changes['controller_info'] = options_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component['gather_controller_facts_']).toHaveBeenCalled();
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

    describe('get_tooltip()', () => {
      it('should call get_tooltip()', () => {
        reset();

        component.get_tooltip(input_name);

        expect(component.get_tooltip).toHaveBeenCalled();
      });

      it('should call get_tooltip() and return COMMON_TOOLTIPS[input_name]', () => {
        reset();

        const return_value: string = component.get_tooltip(input_name);

        expect(return_value).toEqual(COMMON_TOOLTIPS[input_name]);
      });
    });

    describe('click_button_save()', () => {
      it('should call click_button_save()', () => {
        reset();

        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();
        component.click_button_save();

        expect(component.click_button_save).toHaveBeenCalled();
      });

      it('should call api_update_general_settings_() from click_button_save()', () => {
        reset();

        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();
        component.click_button_save();

        expect(component['api_update_general_settings_']).toHaveBeenCalled();
      });
    });

    describe('click_button_open_console()', () => {
      it('should call click_button_open_console()', () => {
        reset();

        component.click_button_open_console();

        expect(component.click_button_open_console).toHaveBeenCalled();
      });

      it('should call open_server_stdout_dialog_window_() from click_button_open_console()', () => {
        reset();

        component.click_button_open_console();

        expect(component['open_server_stdout_dialog_window_']).toHaveBeenCalled();
      });
    });

    describe('private open_server_stdout_dialog_window_()', () => {
      it('should call open_server_stdout_dialog_window_()', () => {
        reset();

        component.job_id = MockKitSettingsClass.job_id;
        component['open_server_stdout_dialog_window_']();

        expect(component['open_server_stdout_dialog_window_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_general_settings_form_group_()', () => {
      it('should call initialize_general_settings_form_group_()', () => {
        reset();

        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();

        expect(component['initialize_general_settings_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private check_job_()', () => {
      it('should call check_job_()', () => {
        reset();

        component['check_job_']();

        expect(component['check_job_']).toHaveBeenCalled();
      });

      it('should call api_job_get_() from check_job_()', () => {
        reset();

        component.job_id = MockGeneralSettingsClass.job_id;
        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();
        component['check_job_']();

        expect(component['api_job_get_']).toHaveBeenCalled();
      });
    });

    describe('private gather_controller_facts_()', () => {
      it('should call gather_controller_facts_()', () => {
        reset();

        component.job_id = MockGeneralSettingsClass.job_id;
        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();
        component['gather_controller_facts_']();

        expect(component['gather_controller_facts_']).toHaveBeenCalled();
      });

      it('should call gather_controller_facts_() and set general_settings_form_group.get(\'controller_interface\') = controller_info.ip_address', () => {
        reset();

        component.job_id = MockGeneralSettingsClass.job_id;
        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();
        component.controller_info = MockControllerInfoClass;
        component.general_settings = MockGeneralSettingsClass;
        component['gather_controller_facts_']();

        expect(component.general_settings_form_group.get('controller_interface').value).toEqual(component.controller_info.ip_address);
      });

      it('should call gather_controller_facts_() and set general_settings_form_group.get(\'gateway\') = controller_info.gateway', () => {
        reset();

        component.job_id = MockGeneralSettingsClass.job_id;
        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();
        component.controller_info = MockControllerInfoClass;
        component.general_settings = MockGeneralSettingsClass;
        component['gather_controller_facts_']();

        expect(component.general_settings_form_group.get('gateway').value).toEqual(component.controller_info.gateway);
      });

      it('should call gather_controller_facts_() and set general_settings_form_group.get(\'netmask\') = controller_info.netmask', () => {
        reset();

        component.job_id = MockGeneralSettingsClass.job_id;
        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();
        component.controller_info = MockControllerInfoClass;
        component.general_settings = MockGeneralSettingsClass;
        component['gather_controller_facts_']();

        expect(component.general_settings_form_group.get('netmask').value).toEqual(component.controller_info.netmask);
      });
    });

    describe('private websocket_get_socket_on_kit_status_change()', () => {
      it('should call websocket_get_socket_on_kit_status_change()', () => {
        reset();

        component['websocket_get_socket_on_kit_status_change']();

        expect(component['websocket_get_socket_on_kit_status_change']).toHaveBeenCalled();
      });
    });

    describe('private api_update_general_settings_()', () => {
      it('should call api_update_general_settings_()', () => {
        reset();

        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();
        component['api_update_general_settings_'](MockGeneralSettingsClass);

        expect(component['api_update_general_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_general_settings() from api_update_general_settings_()', () => {
        reset();

        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();
        component['api_update_general_settings_'](MockGeneralSettingsClass);

        expect(component['kit_settings_service_'].update_general_settings).toHaveBeenCalled();
      });

      it('should call from kit_settings_service_.update_general_settings() and handle response and call check_job_()', () => {
        reset();

        component.job_id = undefined;
        component['initialize_general_settings_form_group_']();
        component.general_settings = MockGeneralSettingsClass;
        component['api_update_general_settings_'](MockGeneralSettingsClass);

        expect(component['check_job_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_general_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_general_settings').and.returnValue(throwError(mock_http_error_response));

        component.job_id = undefined;
        component.general_settings = MockGeneralSettingsClass;
        component['initialize_general_settings_form_group_']();
        component['api_update_general_settings_'](MockGeneralSettingsClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_job_get_()', () => {
      it('should call api_job_get_()', () => {
        reset();

        component['initialize_general_settings_form_group_']();
        component['api_job_get_']();

        expect(component['api_job_get_']).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_get() from api_job_get_()', () => {
        reset();

        component['initialize_general_settings_form_group_']();
        component['api_job_get_']();

        expect(component['global_job_service_'].job_get).toHaveBeenCalled();
      });

      it('should call from global_job_service_.job_get() and handle response and set job_running = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClassStarted));

        component['initialize_general_settings_form_group_']();
        component['api_job_get_']();

        expect(component.job_running).toBeTrue();
      });

      it('should call from global_job_service_.job_get() and handle response and set button_save_tooltip = Job is running...', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClassStarted));

        component['initialize_general_settings_form_group_']();
        component['api_job_get_']();

        expect(component.button_save_tooltip).toEqual('Job is running...');
      });

      it('should call from global_job_service_.job_get() and handle response and disable kit settings form group', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClassStarted));

        component['initialize_general_settings_form_group_']();
        component['api_job_get_']();

        expect(component.general_settings_form_group.disabled).toBeTrue();
      });

      it('should call from global_job_service_.job_get() and handle response and set job_running = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClass));

        component['initialize_general_settings_form_group_']();
        component['api_job_get_']();

        expect(component.job_running).toBeFalse();
      });

      it('should call from global_job_service_.job_get() and handle response and set button_save_tooltip = empty string', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClass));

        component['initialize_general_settings_form_group_']();
        component['api_job_get_']();

        expect(component.button_save_tooltip).toEqual('');
      });

      it('should call from global_job_service_.job_get() and handle response and enable kit settings form group but disable general_settings_form_group.domain', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClass));

        component['initialize_general_settings_form_group_']();
        component.kit_status = MockKitStatusClass;
        component['api_job_get_']();

        expect(component.general_settings_form_group.get('domain').disabled).toBeTrue();
      });

      it('should call global_job_service_.job_get() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(throwError(MockErrorMessageClass));

        component['api_job_get_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_get() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(throwError(mock_http_error_response));

        component['api_job_get_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

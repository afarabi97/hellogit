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
  MockGenericJobAndKeyClass,
  MockKitSettingsClass,
  MockKitStatusClass,
  MockKitStatusClassAlt
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockKitStatusInterfaceAlt, MockServerStdoutMatDialogDataInterface } from '../../../../../../static-data/interface-objects';
import { COMMON_VALIDATORS } from '../../../../constants/cvah.constants';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { ObjectUtilitiesClass } from '../../../../classes';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { TestingModule } from '../../../testing-modules/testing.module';
import { SystemSettingsModule } from '../../system-settings.module';
import { KitSettingsComponent } from './kit-settings.component';

describe('KitSettingsComponent', () => {
  let component: KitSettingsComponent;
  let fixture: ComponentFixture<KitSettingsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyReEvaluate: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyGetTooltip: jasmine.Spy<any>;
  let spyGetKubernetesServiceRange: jasmine.Spy<any>;
  let spyCheckKubernetesServiceRange: jasmine.Spy<any>;
  let spyClickButtonSave: jasmine.Spy<any>;
  let spyClickButtonOpenConsole: jasmine.Spy<any>;
  let spyOpenPasswordDialogWindow: jasmine.Spy<any>;
  let spyOpenServerStdoutDialogWindow: jasmine.Spy<any>;
  let spyInitializeKitFormGroup: jasmine.Spy<any>;
  let spyCheckJob: jasmine.Spy<any>;
  let spyGatherControllerFacts: jasmine.Spy<any>;
  let spySetKubernetesDHCPRange: jasmine.Spy<any>;
  let spyWebsocketGetSocketOnKitStatusChange: jasmine.Spy<any>;
  let spyApiGetUsedIPAddresses: jasmine.Spy<any>;
  let spyApiUpdateKitSettings: jasmine.Spy<any>;
  let spyApiJobGet: jasmine.Spy<any>;

  // Test Data
  const input_name: string = 'ip_address';
  const form_control: FormControl = new FormControl('');
  const error_message_form_control: FormControl = new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  error_message_form_control.markAsTouched();
  const unused_ips: string[] = [ '10.40.31.0', '10.40.31.32', '10.40.31.64', '10.40.31.96', '10.40.31.128', '10.40.31.160', '10.40.31.192', '10.40.31.224' ];
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
    fixture = TestBed.createComponent(KitSettingsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyReEvaluate = spyOn(component, 're_evaluate').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyGetTooltip = spyOn(component, 'get_tooltip').and.callThrough();
    spyGetKubernetesServiceRange = spyOn(component, 'get_kubernetes_service_range').and.callThrough();
    spyCheckKubernetesServiceRange = spyOn(component, 'check_kubernetes_service_range').and.callThrough();
    spyClickButtonSave = spyOn(component, 'click_button_save').and.callThrough();
    spyClickButtonOpenConsole = spyOn(component, 'click_button_open_console').and.callThrough();
    spyOpenPasswordDialogWindow = spyOn(component, 'open_password_dialog_window').and.callThrough();
    spyOpenServerStdoutDialogWindow = spyOn<any>(component, 'open_server_stdout_dialog_window_').and.callThrough();
    spyInitializeKitFormGroup = spyOn<any>(component, 'initialize_kit_settings_form_group_').and.callThrough();
    spyCheckJob = spyOn<any>(component, 'check_job_').and.callThrough();
    spyGatherControllerFacts = spyOn<any>(component, 'gather_controller_facts_').and.callThrough();
    spySetKubernetesDHCPRange = spyOn<any>(component, 'set_kubernetes_dhcp_range_').and.callThrough();
    spyWebsocketGetSocketOnKitStatusChange = spyOn<any>(component, 'websocket_get_socket_on_kit_status_change').and.callThrough();
    spyApiGetUsedIPAddresses = spyOn<any>(component, 'api_get_used_ip_addresses_').and.callThrough();
    spyApiUpdateKitSettings = spyOn<any>(component, 'api_update_kit_settings_').and.callThrough();
    spyApiJobGet = spyOn<any>(component, 'api_job_get_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyNGOnChanges.calls.reset();
    spyReEvaluate.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyGetTooltip.calls.reset();
    spyGetKubernetesServiceRange.calls.reset();
    spyCheckKubernetesServiceRange.calls.reset();
    spyClickButtonSave.calls.reset();
    spyClickButtonOpenConsole.calls.reset();
    spyOpenPasswordDialogWindow.calls.reset();
    spyOpenServerStdoutDialogWindow.calls.reset();
    spyInitializeKitFormGroup.calls.reset();
    spyCheckJob.calls.reset();
    spyGatherControllerFacts.calls.reset();
    spySetKubernetesDHCPRange.calls.reset();
    spyWebsocketGetSocketOnKitStatusChange.calls.reset();
    spyApiGetUsedIPAddresses.calls.reset();
    spyApiUpdateKitSettings.calls.reset();
    spyApiJobGet.calls.reset();
  };

  afterAll(() => {
    remove_styles_from_dom();
  });

  it('should create KitSettingsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('KitSettingsComponent methods', () => {
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
    });

    describe('ngOnChanges()', () => {
      it('should call ngOnChanges()', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(undefined, undefined, false);
        simple_changes['kit_settings'] = options_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component.ngOnChanges).toHaveBeenCalled();
      });

      it('should call initialize_kit_settings_form_group_() from ngOnChanges()', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(undefined, MockKitSettingsClass, true);
        simple_changes['kit_settings'] = options_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component['initialize_kit_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call check_job_() from ngOnChanges()', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(undefined, MockKitSettingsClass, true);
        simple_changes['kit_settings'] = options_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component['check_job_']).toHaveBeenCalled();
      });

      it('should call check_job_() from ngOnChanges()', () => {
        reset();

        const simple_changes: SimpleChanges = new Object() as SimpleChanges;
        const options_simple_change: SimpleChange = new SimpleChange(undefined, MockKitStatusClass, true);
        simple_changes['kit_status'] = options_simple_change;

        component.ngOnChanges(simple_changes);

        expect(component['check_job_']).toHaveBeenCalled();
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

    describe('re_evaluate()', () => {
      it('should call re_evaluate_()', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
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

    describe('get_kubernetes_service_range()', () => {
      it('should call get_kubernetes_service_range()', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings_form_group.get('kubernetes_services_cidr').setValue('10.40.31.0');
        component.get_kubernetes_service_range();

        expect(component.get_kubernetes_service_range).toHaveBeenCalled();
      });

      it('should call get_kubernetes_service_range() and return empty string', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings_form_group.get('kubernetes_services_cidr').setValue('10.40.31.0');
        const return_value: string = component.get_kubernetes_service_range();

        expect(return_value).toEqual('');
      });

      it('should call get_kubernetes_service_range() and return string that starts with Kubernetes services range', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.controller_info = MockControllerInfoClass;
        component['cidr_ranges_'] = MockControllerInfoClass.cidr_ranges;
        component.kit_settings_form_group.get('kubernetes_services_cidr').setValue('10.40.31.0');

        const return_value: string = component.get_kubernetes_service_range();

        expect(return_value.includes('Kubernetes services range')).toBeTrue();
      });
    });

    describe('check_kubernetes_service_range()', () => {
      it('should call check_kubernetes_service_range()', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.check_kubernetes_service_range();

        expect(component.check_kubernetes_service_range).toHaveBeenCalled();
      });

      it('should call api_get_used_ip_addresses_() and from check_kubernetes_service_range()', () => {
        reset();

        component.controller_info = MockControllerInfoClass;
        component['cidr_ranges_'] = MockControllerInfoClass.cidr_ranges;
        component['initialize_kit_settings_form_group_']();
        component.kit_settings_form_group.get('kubernetes_services_cidr').setValue('10.40.31.0');
        component.kit_settings_form_group.get('kubernetes_services_cidr').markAsTouched();

        component.check_kubernetes_service_range();

        expect(component['api_get_used_ip_addresses_']).toHaveBeenCalled();
      });
    });

    describe('click_button_save()', () => {
      it('should call click_button_save()', () => {
        reset();

        component.kit_settings = MockKitSettingsClass;
        component['initialize_kit_settings_form_group_']();
        component.click_button_save();

        expect(component.click_button_save).toHaveBeenCalled();
      });

      it('should call api_update_kit_settings_() from click_button_save()', () => {
        reset();

        component.kit_settings = MockKitSettingsClass;
        component['initialize_kit_settings_form_group_']();
        component.click_button_save();

        expect(component['api_update_kit_settings_']).toHaveBeenCalled();
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

    describe('open_password_dialog_window()', () => {
      it('should call open_password_dialog_window()', () => {
        reset();

        component.open_password_dialog_window();

        expect(component.open_password_dialog_window).toHaveBeenCalled();
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

    describe('private initialize_kit_settings_form_group_()', () => {
      it('should call initialize_kit_settings_form_group_()', () => {
        reset();

        const deep_copy_kit_setings = ObjectUtilitiesClass.create_deep_copy(MockKitSettingsClass);
        deep_copy_kit_setings.is_gip = true;
        component.kit_settings = deep_copy_kit_setings;
        component['initialize_kit_settings_form_group_']();

        expect(component['initialize_kit_settings_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private check_job_()', () => {
      it('should call check_job_()', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings_form_group = undefined;
        component['check_job_']();

        expect(component['check_job_']).toHaveBeenCalled();
      });

      it('should call check_job_() and set job_id = null', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings = undefined;
        component['check_job_']();

        expect(component.job_id).toBeNull();
      });

      it('should call check_job_() and set job_id = kit_settings.job_id', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings = MockKitSettingsClass;
        component.kit_status = MockKitStatusInterfaceAlt;
        component['check_job_']();

        expect(component.job_id).toEqual(MockKitSettingsClass.job_id);
      });

      it('should call check_job_() and set kit settings form group as enabled', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClass));

        component['initialize_kit_settings_form_group_']();
        component.kit_settings = MockKitSettingsClass;
        component.kit_status = MockKitStatusClass;
        component['check_job_']();

        expect(component.kit_settings_form_group.enabled).toBeTrue();
      });

      it('should call api_job_get_() from check_job_()', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings = MockKitSettingsClass;
        component.kit_status = MockKitStatusClass;
        component['check_job_']();

        expect(component['check_job_']).toHaveBeenCalled();
      });

      it('should call check_job_() and set kit settings form group as disabled', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings = MockKitSettingsClass;
        component.kit_status = MockKitStatusClassAlt;
        component['check_job_']();

        expect(component.kit_settings_form_group.disabled).toBeTrue();
      });
    });

    describe('private gather_controller_facts_()', () => {
      it('should call gather_controller_facts_()', () => {
        reset();

        component['gather_controller_facts_']();

        expect(component['gather_controller_facts_']).toHaveBeenCalled();
      });

      it('should call set_kubernetes_dhcp_range_() from gather_controller_facts_()', () => {
        reset();

        component.controller_info = MockControllerInfoClass;
        component.general_settings = MockGeneralSettingsClass;
        component['gather_controller_facts_']();

        expect(component['set_kubernetes_dhcp_range_']).toHaveBeenCalled();
      });
    });

    describe('private set_kubernetes_dhcp_range_()', () => {
      it('should call set_kubernetes_dhcp_range_()', () => {
        reset();

        component['unused_ip_addresses_'] = unused_ips;
        component['set_kubernetes_dhcp_range_'](MockGeneralSettingsClass.dhcp_range);

        expect(component['set_kubernetes_dhcp_range_']).toHaveBeenCalled();
      });
    });

    describe('private websocket_get_socket_on_kit_status_change()', () => {
      it('should call websocket_get_socket_on_kit_status_change()', () => {
        reset();

        component['websocket_get_socket_on_kit_status_change']();

        expect(component['websocket_get_socket_on_kit_status_change']).toHaveBeenCalled();
      });
    });

    describe('private api_get_used_ip_addresses_()', () => {
      it('should call api_get_used_ip_addresses_()', () => {
        reset();

        component['api_get_used_ip_addresses_'](MockKitSettingsClass.kubernetes_services_cidr);

        expect(component['api_get_used_ip_addresses_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_used_ip_addresses() from api_get_used_ip_addresses_()', () => {
        reset();

        component['api_get_used_ip_addresses_'](MockKitSettingsClass.kubernetes_services_cidr);

        expect(component['kit_settings_service_'].get_used_ip_addresses).toHaveBeenCalled();
      });

      it('should call from kit_settings_service_.get_used_ip_addresses() and handle response and set kube_svc_used_ips', () => {
        reset();

        component.kube_svc_used_ips = '';
        component['api_get_used_ip_addresses_'](MockKitSettingsClass.kubernetes_services_cidr);

        expect(component.kube_svc_used_ips).not.toEqual('');
      });

      it('should call kit_settings_service_.get_used_ip_addresses() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_used_ip_addresses').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_used_ip_addresses_'](MockKitSettingsClass.kubernetes_services_cidr);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_used_ip_addresses() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_used_ip_addresses').and.returnValue(throwError(mock_http_error_response));

        component['api_get_used_ip_addresses_'](MockKitSettingsClass.kubernetes_services_cidr);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_update_kit_settings_()', () => {
      it('should call api_update_kit_settings_()', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings = MockKitSettingsClass;
        component['api_update_kit_settings_'](MockKitSettingsClass);

        expect(component['api_update_kit_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_kit_settings() from api_update_kit_settings_()', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings = MockKitSettingsClass;
        component['api_update_kit_settings_'](MockKitSettingsClass);

        expect(component['kit_settings_service_'].update_kit_settings).toHaveBeenCalled();
      });

      it('should call from kit_settings_service_.update_kit_settings() and handle response and set job_id', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.job_id = undefined;
        component.kit_settings = MockKitSettingsClass;
        component.kit_status = MockKitStatusInterfaceAlt;
        component['api_update_kit_settings_'](MockKitSettingsClass);

        expect(component.job_id).toEqual(MockGenericJobAndKeyClass.job_id);
      });

      it('should call from kit_settings_service_.update_kit_settings() and handle response and set kit_settings.job_id', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings = MockKitSettingsClass;
        component['api_update_kit_settings_'](MockKitSettingsClass);

        expect(component.kit_settings.job_id).toEqual(MockGenericJobAndKeyClass.job_id);
      });

      it('should call from kit_settings_service_.update_kit_settings() and handle response and disable kit settings form group', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings = MockKitSettingsClass;
        component['api_update_kit_settings_'](MockKitSettingsClass);

        expect(component.kit_settings_form_group.disabled).toBeTrue();
      });

      it('should call from kit_settings_service_.update_kit_settings() and handle response and call check_job_()', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component.kit_settings = MockKitSettingsClass;
        component['api_update_kit_settings_'](MockKitSettingsClass);

        expect(component['check_job_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_kit_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_kit_settings').and.returnValue(throwError(mock_http_error_response));

        component['api_update_kit_settings_'](MockKitSettingsClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_job_get_()', () => {
      it('should call api_job_get_()', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component['api_job_get_']();

        expect(component['api_job_get_']).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_get() from api_job_get_()', () => {
        reset();

        component['initialize_kit_settings_form_group_']();
        component['api_job_get_']();

        expect(component['global_job_service_'].job_get).toHaveBeenCalled();
      });

      it('should call from global_job_service_.job_get() and handle response and set kit_job_running = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClassStarted));

        component['initialize_kit_settings_form_group_']();
        component['api_job_get_']();

        expect(component.kit_job_running).toBeTrue();
      });

      it('should call from global_job_service_.job_get() and handle response and set button_save_tooltip = Job is running...', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClassStarted));

        component['initialize_kit_settings_form_group_']();
        component['api_job_get_']();

        expect(component.button_save_tooltip).toEqual('Job is running...');
      });

      it('should call from global_job_service_.job_get() and handle response and disable kit settings form group', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClassStarted));

        component['initialize_kit_settings_form_group_']();
        component['api_job_get_']();

        expect(component.kit_settings_form_group.disabled).toBeTrue();
      });

      it('should call from global_job_service_.job_get() and handle response and set kit_job_running = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClass));

        component['initialize_kit_settings_form_group_']();
        component['api_job_get_']();

        expect(component.kit_job_running).toBeFalse();
      });

      it('should call from global_job_service_.job_get() and handle response and set button_save_tooltip = empty string', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClass));

        component['initialize_kit_settings_form_group_']();
        component['api_job_get_']();

        expect(component.button_save_tooltip).toEqual('');
      });

      it('should call from global_job_service_.job_get() and handle response and enable kit settings form group', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClass));

        component['initialize_kit_settings_form_group_']();
        component['api_job_get_']();

        expect(component.kit_settings_form_group.enabled).toBeTrue();
      });

      it('should call from global_job_service_.job_get() and handle response and enable kit settings form group but disable kit_settings_form_group.kubernetes_services_cidr', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClass));

        component['initialize_kit_settings_form_group_']();
        component.kit_status = MockKitStatusClass;
        component['api_job_get_']();

        expect(component.kit_settings_form_group.get('kubernetes_services_cidr').disabled).toBeTrue();
      });

      it('should call from global_job_service_.job_get() and handle response and enable kit settings form group but disable kit_settings_form_group.password', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClass));

        component['initialize_kit_settings_form_group_']();
        component.kit_status = MockKitStatusClass;
        component['api_job_get_']();

        expect(component.kit_settings_form_group.get('password').disabled).toBeTrue();
      });

      it('should call from global_job_service_.job_get() and handle response and enable kit settings form group but disable kit_settings_form_group.re_password', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_get').and.returnValue(of(MockBackgroundJobClass));

        component['initialize_kit_settings_form_group_']();
        component.kit_status = MockKitStatusClass;
        component['api_job_get_']();

        expect(component.kit_settings_form_group.get('re_password').disabled).toBeTrue();
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

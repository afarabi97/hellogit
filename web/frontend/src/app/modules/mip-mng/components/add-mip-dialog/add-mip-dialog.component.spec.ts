import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { throwError } from 'rxjs';

import {
  MockErrorMessageClass,
  MockGeneralSettingsClass,
  MockPostValidationString,
  MockPostValidationStringArray,
  MockValidationErrorClass
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockUnusedIpAddresses } from '../../../../../../static-data/return-data';
import { BAREMETAL, VIRTUAL } from '../../../../constants/cvah.constants';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { addNodeValidators } from '../../../../validators/add-node.validator';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import { MipMngModule } from '../../mip-mng.module';
import { AddMipDialogComponent } from './add-mip-dialog.component';

describe('AddMipDialogComponent', () => {
  let component: AddMipDialogComponent;
  let fixture: ComponentFixture<AddMipDialogComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyIsVirtualDeployment: jasmine.Spy<any>;
  let spyIsBaremetalDeployment: jasmine.Spy<any>;
  let spyDeploymentTypeChange: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyGetTooltip: jasmine.Spy<any>;
  let spyCancel: jasmine.Spy<any>;
  let spyAdd: jasmine.Spy<any>;
  let spyDuplicateNodeChange: jasmine.Spy<any>;
  let spyInitializeNodeFormGroup: jasmine.Spy<any>;
  let spySetNodeFormGroup: jasmine.Spy<any>;
  let spyApiGetGeneralSettings: jasmine.Spy<any>;
  let spyApiGetUnusedIpAddresses: jasmine.Spy<any>;
  let spyApiGetNodes: jasmine.Spy<any>;
  let spyApiAddMip: jasmine.Spy<any>;

  // Test Data
  const mat_radio_change_baremetal: MatRadioChange = {
    source: {} as any,
    value: BAREMETAL
  };
  const mat_radio_change_virtual: MatRadioChange = {
    source: {} as any,
    value: VIRTUAL
  };
  const form_control_hostname: FormControl = new FormControl(null, Validators.compose([validateFromArray(addNodeValidators.hostname)]));
  form_control_hostname.markAllAsTouched();
  form_control_hostname.markAsDirty();
  const form_control_empty: FormControl = new FormControl('', Validators.compose([Validators.nullValidator]));
  const hostname: string = 'hostname';
  const mat_checkbox_changed_true: MatCheckboxChange = {
    source: {} as any,
    checked: true
  };
  const mat_checkbox_changed_false: MatCheckboxChange = {
    source: {} as any,
    checked: false
  };
  const node_form_group_virtual: FormGroup = new FormGroup({
    hostname: new FormControl('test-node'),
    ip_address: new FormControl('10.40.31.5'),
    deployment_type: new FormControl(VIRTUAL),
    mac_address: new FormControl(undefined),
    virtual_cpu: new FormControl(16),
    virtual_mem: new FormControl(32),
    virtual_os: new FormControl(100)
  });
  const node_form_group_baremetal: FormGroup = new FormGroup({
    hostname: new FormControl('test-node'),
    ip_address: new FormControl('10.40.31.5'),
    deployment_type: new FormControl(BAREMETAL),
    mac_address: new FormControl('00:0a:29:90:85:5e'),
    virtual_cpu: new FormControl(undefined),
    virtual_mem: new FormControl(undefined),
    virtual_os: new FormControl(undefined)
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
        MipMngModule,
        InjectorModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMipDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyIsVirtualDeployment = spyOn(component, 'is_virtual_deployment').and.callThrough();
    spyIsBaremetalDeployment = spyOn(component, 'is_baremetal_deployment').and.callThrough();
    spyDeploymentTypeChange = spyOn(component, 'deployment_type_change').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyGetTooltip = spyOn(component, 'get_tooltip').and.callThrough();
    spyCancel = spyOn(component, 'cancel').and.callThrough();
    spyAdd = spyOn(component, 'add').and.callThrough();
    spyDuplicateNodeChange = spyOn(component, 'duplicate_node_change').and.callThrough();
    spyInitializeNodeFormGroup = spyOn<any>(component, 'initialize_node_form_group_').and.callThrough();
    spySetNodeFormGroup = spyOn<any>(component, 'set_node_form_group_').and.callThrough();
    spyApiGetGeneralSettings = spyOn<any>(component, 'api_get_general_settings_').and.callThrough();
    spyApiGetUnusedIpAddresses = spyOn<any>(component, 'api_get_unused_ip_addresses_').and.callThrough();
    spyApiGetNodes = spyOn<any>(component, 'api_get_nodes_').and.callThrough();
    spyApiAddMip = spyOn<any>(component, 'api_add_mip_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyIsVirtualDeployment.calls.reset();
    spyIsBaremetalDeployment.calls.reset();
    spyDeploymentTypeChange.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyGetTooltip.calls.reset();
    spyCancel.calls.reset();
    spyAdd.calls.reset();
    spyDuplicateNodeChange.calls.reset();
    spyInitializeNodeFormGroup.calls.reset();
    spySetNodeFormGroup.calls.reset();
    spyApiGetGeneralSettings.calls.reset();
    spyApiGetUnusedIpAddresses.calls.reset();
    spyApiGetNodes.calls.reset();
    spyApiAddMip.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create AddMipDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('AddMipDialogComponent methods', () => {
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

      it('should call api_get_nodes_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_nodes_']).toHaveBeenCalled();
      });
    });

    describe('is_virtual_deployment()', () => {
      it('should call is_virtual_deployment()', () => {
        reset();

        component.is_virtual_deployment();

        expect(component.is_virtual_deployment).toHaveBeenCalled();
      });

      it('should call is_virtual_deployment() and return true', () => {
        reset();

        component['initialize_node_form_group_']();
        component.node_form_group.get('deployment_type').setValue(VIRTUAL);
        const return_value: boolean = component.is_virtual_deployment();

        expect(return_value).toBeTrue();
      });

      it('should call is_virtual_deployment() and return false', () => {
        reset();

        component.node_form_group = undefined;
        const return_value: boolean = component.is_virtual_deployment();

        expect(return_value).toBeFalse();
      });
    });

    describe('is_baremetal_deployment()', () => {
      it('should call is_baremetal_deployment()', () => {
        reset();

        component.is_baremetal_deployment();

        expect(component.is_baremetal_deployment).toHaveBeenCalled();
      });

      it('should call is_baremetal_deployment() and return true', () => {
        reset();

        component['initialize_node_form_group_']();
        component.node_form_group.get('deployment_type').setValue(BAREMETAL);
        const return_value: boolean = component.is_baremetal_deployment();

        expect(return_value).toBeTrue();
      });

      it('should call is_baremetal_deployment() and return false', () => {
        reset();

        component.node_form_group = undefined;
        const return_value: boolean = component.is_baremetal_deployment();

        expect(return_value).toBeFalse();
      });
    });

    describe('deployment_type_change()', () => {
      it('should call deployment_type_change()', () => {
        reset();

        component['initialize_node_form_group_']();
        component.node_form_group.get('deployment_type').setValue(VIRTUAL);

        fixture.detectChanges();

        component.deployment_type_change(mat_radio_change_virtual);
        component.deployment_type_change(mat_radio_change_baremetal);

        expect(component.deployment_type_change).toHaveBeenCalled();
      });
    });

    describe('get_error_message()', () => {
      it('should call get_error_message()', () => {
        reset();

        component.get_error_message(form_control_hostname);

        expect(component.get_error_message).toHaveBeenCalled();
      });

      it('should call get_error_message() and return error message', () => {
        reset();

        const return_value: string = component.get_error_message(form_control_hostname);

        expect(return_value).toEqual(form_control_hostname.errors.error_message);
      });

      it('should call get_error_message() and return empty string', () => {
        reset();

        const return_value: string = component.get_error_message(form_control_empty);

        expect(return_value).toEqual('');
      });
    });

    describe('get_tooltip()', () => {
      it('should call get_tooltip()', () => {
        reset();

        component.get_tooltip(hostname);

        expect(component.get_tooltip).toHaveBeenCalled();
      });

      it('should call get_tooltip() and return error message COMMON_TOOLTIP[input_name]', () => {
        reset();

        const return_value: string = component.get_tooltip(hostname);

        expect(return_value).toEqual(COMMON_TOOLTIPS[hostname]);
      });
    });

    describe('cancel()', () => {
      it('should call cancel()', () => {
        reset();

        component.cancel();

        expect(component.cancel).toHaveBeenCalled();
      });

      it('should call mat_dialog_ref_.close() from cancel()', () => {
        reset();

        component.cancel();

        expect(component['mat_dialog_ref_'].close).toHaveBeenCalled();
      });
    });

    describe('add()', () => {
      it('should call add()', () => {
        reset();

        component.add();

        expect(component.add).toHaveBeenCalled();
      });

      it('should call api_add_mip_() from add()', () => {
        reset();

        component['create_duplicate_'] = true;
        component.add();

        expect(component['api_add_mip_']).toHaveBeenCalled();
      });

      it('should call mat_dialog_ref_.close() from add()', () => {
        reset();

        component['create_duplicate_'] = false;
        component.add();

        expect(component['mat_dialog_ref_'].close).toHaveBeenCalled();
      });
    });

    describe('duplicate_node_change()', () => {
      it('should call duplicate_node_change()', () => {
        reset();

        component.duplicate_node_change(mat_checkbox_changed_true);

        expect(component.duplicate_node_change).toHaveBeenCalled();
      });

      it('should call duplicate_node_change() and should set create_duplicate_ = true', () => {
        reset();

        component.duplicate_node_change(mat_checkbox_changed_true);

        expect(component['create_duplicate_']).toBeTrue();
      });

      it('should call duplicate_node_change() and should set create_duplicate_ = false', () => {
        reset();

        component.duplicate_node_change(mat_checkbox_changed_false);

        expect(component['create_duplicate_']).toBeFalse();
      });
    });

    describe('private initialize_node_form_group_()', () => {
      it('should call initialize_node_form_group_()', () => {
        reset();

        component['initialize_node_form_group_']();

        expect(component['initialize_node_form_group_']).toHaveBeenCalled();
      });

      it('should call set_node_form_group_() from initialize_node_form_group_()', () => {
        reset();

        component['initialize_node_form_group_'](node_form_group_virtual);
        component['initialize_node_form_group_'](node_form_group_baremetal);

        expect(component['set_node_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private set_node_form_group_()', () => {
      it('should call set_node_form_group_()', () => {
        reset();

        component['set_node_form_group_'](node_form_group_baremetal);

        expect(component['set_node_form_group_']).toHaveBeenCalled();
      });

      it('should call set_node_form_group_() and set node_form_group = passed form group', () => {
        reset();

        component['set_node_form_group_'](node_form_group_baremetal);

        expect(component.node_form_group).toEqual(node_form_group_baremetal);
      });
    });

    describe('private api_get_general_settings_()', () => {
      it('should call api_get_general_settings_()', () => {
        reset();

        component['api_get_general_settings_']();

        expect(component['api_get_general_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getGeneralSettings() from api_get_general_settings_()', () => {
        reset();

        component['api_get_general_settings_']();

        expect(component['kit_settings_service_'].getGeneralSettings).toHaveBeenCalled();
      });

      it('should call from kit_settings_service_.getGeneralSettings() and handle response and set settings_ = response', () => {
        reset();

        component['api_get_general_settings_']();

        expect(component['settings_']).toEqual(MockGeneralSettingsClass);
      });

      it('should call kit_settings_service_.getGeneralSettings() and handle response and call api_get_unused_ip_addresses_()', () => {
        reset();

        component['api_get_general_settings_']();

        expect(component['api_get_unused_ip_addresses_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getGeneralSettings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'getGeneralSettings').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_general_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getGeneralSettings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'getGeneralSettings').and.returnValue(throwError(mock_http_error_response));

        component['api_get_general_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_unused_ip_addresses_()', () => {
      it('should call api_get_unused_ip_addresses_()', () => {
        reset();

        component['api_get_unused_ip_addresses_']();

        expect(component['api_get_unused_ip_addresses_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getUnusedIPAddresses() from api_get_unused_ip_addresses_()', () => {
        reset();

        component['api_get_unused_ip_addresses_']();

        expect(component['kit_settings_service_'].getUnusedIPAddresses).toHaveBeenCalled();
      });

      it('should call from kit_settings_service_.getUnusedIPAddresses() and handle response and set available_ips = response', () => {
        reset();

        component['api_get_unused_ip_addresses_']();

        expect(component.available_ips).toEqual(MockUnusedIpAddresses);
      });

      it('should call kit_settings_service_.getUnusedIPAddresses() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'getUnusedIPAddresses').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_unused_ip_addresses_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getUnusedIPAddresses() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'getUnusedIPAddresses').and.returnValue(throwError(mock_http_error_response));

        component['api_get_unused_ip_addresses_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_nodes_()', () => {
      it('should call api_get_nodes_()', () => {
        reset();

        component['api_get_nodes_']();

        expect(component['api_get_nodes_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getNodes() from api_get_nodes_()', () => {
        reset();

        component['api_get_nodes_']();

        expect(component['kit_settings_service_'].getNodes).toHaveBeenCalled();
      });

      it('should call from kit_settings_service_.getNodes() and handle response and set validation_hostnames_, validation_ips_, validation_macs_ from response', () => {
        reset();

        component['api_get_nodes_']();

        expect(component['validation_hostnames_']).not.toEqual([]);
        expect(component['validation_ips_']).not.toEqual([]);
        expect(component['validation_macs_']).not.toEqual([]);
      });

      it('should call kit_settings_service_.getNodes() and handle response and call initialize_node_form_group_() when call_initialize_node_form_group variable set to true', () => {
        reset();

        component['api_get_nodes_'](true);

        expect(component['initialize_node_form_group_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getNodes() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'getNodes').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_nodes_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getNodes() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'getNodes').and.returnValue(throwError(mock_http_error_response));

        component['api_get_nodes_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_add_mip_()', () => {
      it('should call api_add_mip_()', () => {
        reset();

        component.node_form_group = node_form_group_virtual;
        component['api_add_mip_'](hostname);

        expect(component['api_add_mip_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() from api_add_mip_()', () => {
        reset();

        component.node_form_group = node_form_group_virtual;
        component['api_add_mip_'](hostname);

        expect(component['kit_settings_service_'].addMip).toHaveBeenCalled();
      });

      it('should call from kit_settings_service_.addMip() and handle response and set filter or push variables based on node_form_group', () => {
        reset();

        component.node_form_group = node_form_group_baremetal;
        component['api_add_mip_'](hostname);

        expect(component.available_ips.includes(node_form_group_baremetal.get('ip_address').value)).toBeFalse();
        expect(component['validation_ips_'].includes(node_form_group_baremetal.get('ip_address').value)).toBeTrue();
        expect(component['validation_hostnames_'].includes(node_form_group_baremetal.get('hostname').value)).toBeTrue();
        expect(component['validation_macs_'].includes(node_form_group_baremetal.get('mac_address').value)).toBeTrue();
      });

      it('should call kit_settings_service_.addMip() and handle response and call initialize_node_form_group_() when call_initialize_node_form_group variable set to true', () => {
        reset();

        component.node_form_group = node_form_group_virtual;
        component['api_add_mip_'](hostname);

        expect(component['initialize_node_form_group_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component.node_form_group = node_form_group_virtual;
        component['api_add_mip_'](hostname);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(MockErrorMessageClass));

        component.node_form_group = node_form_group_virtual;
        component['api_add_mip_'](hostname);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error response instance ValidationErrorClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(MockValidationErrorClass));

        component.node_form_group = node_form_group_virtual;
        component['api_add_mip_'](hostname);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error response instance PostValidationClass string', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(MockPostValidationString));

        component.node_form_group = node_form_group_virtual;
        component['api_add_mip_'](hostname);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error response instance PostValidationClass string[]', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(MockPostValidationStringArray));

        component.node_form_group = node_form_group_virtual;
        component['api_add_mip_'](hostname);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(mock_http_error_response));

        component.node_form_group = node_form_group_virtual;
        component['api_add_mip_'](hostname);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

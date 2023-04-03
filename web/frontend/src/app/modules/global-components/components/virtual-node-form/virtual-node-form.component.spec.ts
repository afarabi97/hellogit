import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';

import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import {
  BAREMETAL,
  COMMON_VALIDATORS,
  CONTROL_PLANE,
  MINIO,
  MIP,
  SENSOR,
  SERVER,
  SERVICE,
  VIRTUAL
} from '../../../../constants/cvah.constants';
import { COMMON_TOOLTIPS } from '../../../../constants/tooltip.constant';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { TestingModule } from '../../../testing-modules/testing.module';
import { GlobalComponentsModule } from '../../global-components.module';
import { VirtualNodeFormComponent } from './virtual-node-form.component';

describe('VirtualNodeFormComponent', () => {
  let component: VirtualNodeFormComponent;
  let fixture: ComponentFixture<VirtualNodeFormComponent>;

  // Setup spy references
  let spyGetTooltip: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spySetDefaultValues: jasmine.Spy<any>;
  let spySetVirtualFormValidation: jasmine.Spy<any>;
  let spyHasDataDrive: jasmine.Spy<any>;
  let spySetVirtualGroupValues: jasmine.Spy<any>;

  // Test Data
  const input_name: string = 'ip_address';
  const form_control: FormControl = new FormControl('');
  const error_message_form_control: FormControl = new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  error_message_form_control.markAsTouched();
  const node_form_group_with_data: FormGroup = new FormGroup({
    hostname: new FormControl('test-node'),
    ip_address: new FormControl('10.40.31.5'),
    deployment_type: new FormControl(VIRTUAL),
    mac_address: new FormControl(undefined),
    virtual_cpu: new FormControl(undefined),
    virtual_mem: new FormControl(undefined),
    virtual_os: new FormControl(undefined),
    virtual_data: new FormControl(undefined)
  });
  const node_form_group_without_data: FormGroup = new FormGroup({
    hostname: new FormControl('test-node'),
    ip_address: new FormControl('10.40.31.5'),
    deployment_type: new FormControl(VIRTUAL),
    mac_address: new FormControl(undefined),
    virtual_cpu: new FormControl(undefined),
    virtual_mem: new FormControl(undefined),
    virtual_os: new FormControl(undefined)
  });
  const mat_radio_change_virtual: MatRadioChange = {
    source: {} as any,
    value: VIRTUAL
  };
  const mat_radio_change_baremetal: MatRadioChange = {
    source: {} as any,
    value: BAREMETAL
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GlobalComponentsModule,
        TestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualNodeFormComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyGetTooltip = spyOn(component, 'get_tooltip').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spySetDefaultValues = spyOn(component, 'set_default_values').and.callThrough();
    spySetVirtualFormValidation = spyOn(component, 'set_virtual_form_validation').and.callThrough();
    spyHasDataDrive = spyOn(component, 'has_data_drive').and.callThrough();
    spySetVirtualGroupValues = spyOn<any>(component, 'set_virtual_group_values_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyGetTooltip.calls.reset();
    spyGetErrorMessage.calls.reset();
    spySetDefaultValues.calls.reset();
    spySetVirtualFormValidation.calls.reset();
    spyHasDataDrive.calls.reset();
    spySetVirtualGroupValues.calls.reset();

    node_form_group_with_data.get('virtual_cpu').setValue(undefined);
    node_form_group_with_data.get('virtual_mem').setValue(undefined);
    node_form_group_with_data.get('virtual_os').setValue(undefined);
    node_form_group_with_data.setControl('virtual_data', new FormControl(undefined));

    node_form_group_without_data.get('virtual_cpu').setValue(undefined);
    node_form_group_without_data.get('virtual_mem').setValue(undefined);
    node_form_group_without_data.get('virtual_os').setValue(undefined);
  };

  afterAll(() => remove_styles_from_dom());

  it('should create VirtualNodeFormComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('VirtualNodeFormComponent methods', () => {
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

    describe('set_default_values()', () => {
      it('should call set_default_values()', () => {
        reset();

        component.node_form_group = node_form_group_with_data;
        component.set_default_values(SERVER);

        expect(component.set_default_values).toHaveBeenCalled();
      });

      it('should call get_error_message() and pass for each node_type passed', () => {
        reset();

        component.node_form_group = node_form_group_with_data;
        component.set_default_values(SERVER);
        component.set_default_values(SENSOR);
        component.set_default_values(SERVICE);
        component.set_default_values(MINIO);
        component.node_form_group = node_form_group_without_data;
        component.set_default_values(MIP);
        component.set_default_values(CONTROL_PLANE);

        expect(component.set_default_values).toHaveBeenCalled();
      });
    });

    describe('set_virtual_form_validation()', () => {
      it('should call set_virtual_form_validation()', () => {
        reset();

        component.node_form_group = node_form_group_with_data;
        component.set_virtual_form_validation(mat_radio_change_virtual);

        expect(component.set_virtual_form_validation).toHaveBeenCalled();
      });

      it('should call set_virtual_form_validation() and pass for each event passed', () => {
        reset();

        component.node_form_group = node_form_group_with_data;
        component.set_virtual_form_validation(mat_radio_change_virtual);
        component.set_virtual_form_validation(mat_radio_change_baremetal);
        component.node_form_group = node_form_group_without_data;
        component.set_virtual_form_validation(mat_radio_change_virtual);
        component.set_virtual_form_validation(mat_radio_change_baremetal);

        expect(component.set_virtual_form_validation).toHaveBeenCalled();
      });
    });

    describe('has_data_drive()', () => {
      it('should call has_data_drive()', () => {
        reset();

        component.node_form_group = node_form_group_with_data;
        component.has_data_drive();

        expect(component.has_data_drive).toHaveBeenCalled();
      });

      it('should call has_data_drive() and return true', () => {
        reset();

        component.node_form_group = node_form_group_with_data;
        const return_value: boolean = component.has_data_drive();

        expect(return_value).toBeTrue();
      });

      it('should call has_data_drive() and return false', () => {
        reset();

        component.node_form_group = node_form_group_without_data;
        const return_value: boolean = component.has_data_drive();

        expect(return_value).toBeFalse();
      });
    });

    describe('private set_virtual_group_values_()', () => {
      it('should call set_virtual_group_values_()', () => {
        reset();

        component.node_form_group = node_form_group_with_data;
        component['set_virtual_group_values_'](1, 1, 1, 1);

        expect(component['set_virtual_group_values_']).toHaveBeenCalled();
      });

      it('should call set_virtual_group_values_() and and set node form group virtual values', () => {
        reset();

        component.node_form_group = node_form_group_with_data;
        component['set_virtual_group_values_'](1, 1, 1, 1);

        expect(component.node_form_group.get('virtual_cpu').value).toEqual(1);
        expect(component.node_form_group.get('virtual_mem').value).toEqual(1);
        expect(component.node_form_group.get('virtual_os').value).toEqual(1);
        expect(component.node_form_group.get('virtual_data').value).toEqual(1);
      });

      it('should call set_virtual_group_values_() and and set node form group virtual values', () => {
        reset();

        component.node_form_group = node_form_group_with_data;
        component['set_virtual_group_values_'](1, 1, 1, null);

        expect(component.node_form_group.get('virtual_cpu').value).toEqual(1);
        expect(component.node_form_group.get('virtual_mem').value).toEqual(1);
        expect(component.node_form_group.get('virtual_os').value).toEqual(1);
        expect(component.node_form_group.get('virtual_data')).toBeNull();
      });
    });
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { of, throwError } from 'rxjs';

import { MockErrorMessageClass, MockHostInfoClass } from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { TestingModule } from '../../../testing-modules/testing.module';
import { PCAPFormModule } from '../../pcap-form.module';
import { ReplayPcapDialogComponent } from './replay-pcap-dialog.component';

class MatDialogMock {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  open() {
    return {
      afterClosed: () => of(null)
    };
  }
  closeAll() {
    return {
      afterClosed: () => of(null)
    };
  }
}

class MatDialogRefMock {
  close() {
    return {
      afterClosed: () => of ()
    };
  }
}

describe('ReplayPcapDialogComponent', () => {
  let component: ReplayPcapDialogComponent;
  let fixture: ComponentFixture<ReplayPcapDialogComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyShouldPreserveTimestamp: jasmine.Spy<any>;
  let spyChangePreserveTimestamp: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spySelectionChangeIFACEValue: jasmine.Spy<any>;
  let spyExecute: jasmine.Spy<any>;
  let spyCancel: jasmine.Spy<any>;
  let spyInitializePCAPFormGroup: jasmine.Spy<any>;
  let spySetPCAPFormGroup: jasmine.Spy<any>;
  let spyApiGetConfiguredIFACES: jasmine.Spy<any>;
  let spyApiGetSensorHostInfo: jasmine.Spy<any>;

  // Test Data
  const mat_checkbox_change_true: MatCheckboxChange = {
    source: null,
    checked: true
  };
  const mat_checkbox_change_false: MatCheckboxChange = {
    source: null,
    checked: false
  };
  const abstract_control_with_errors: AbstractControl = {
    errors: {
      error_message: 'abstract control error message'
    }
  } as any;
  const abstract_control_without_errors: AbstractControl = {
    errors: null
  } as any;
  const mat_select_change_with_ip: MatSelectChange = {
    value: MockHostInfoClass.management_ip
  } as any;
  const pcap_form_group: FormGroup = new FormGroup({
    pcap: new FormControl({ value: 'test pcap name', disabled: true }),
    sensor_ip: new FormControl(undefined),
    preserve_timestamp: new FormControl({ value: true, disabled: true }),
    ifaces: new FormControl(undefined)
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
        PCAPFormModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: 'test pcap name' }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplayPcapDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyShouldPreserveTimestamp = spyOn(component, 'should_preserve_timestamp').and.callThrough();
    spyChangePreserveTimestamp = spyOn(component, 'change_preserve_timestamp').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spySelectionChangeIFACEValue = spyOn(component, 'selection_change_iface_value').and.callThrough();
    spyExecute = spyOn(component, 'execute').and.callThrough();
    spyCancel = spyOn(component, 'cancel').and.callThrough();
    spyInitializePCAPFormGroup = spyOn<any>(component, 'initialize_pcap_form_group_').and.callThrough();
    spySetPCAPFormGroup = spyOn<any>(component, 'set_pcap_form_group_').and.callThrough();
    spyApiGetConfiguredIFACES = spyOn<any>(component, 'api_get_configured_ifaces_').and.callThrough();
    spyApiGetSensorHostInfo = spyOn<any>(component, 'api_get_sensor_host_info_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyShouldPreserveTimestamp.calls.reset();
    spyChangePreserveTimestamp.calls.reset();
    spyGetErrorMessage.calls.reset();
    spySelectionChangeIFACEValue.calls.reset();
    spyExecute.calls.reset();
    spyCancel.calls.reset();
    spyInitializePCAPFormGroup.calls.reset();
    spySetPCAPFormGroup.calls.reset();
    spyApiGetConfiguredIFACES.calls.reset();
    spyApiGetSensorHostInfo.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create ReplayPcapDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ReplayPcapDialogComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_sensor_host_info_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_sensor_host_info_']).toHaveBeenCalled();
      });

      it('should call initialize_pcap_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_pcap_form_group_']).toHaveBeenCalled();
      });
    });

    describe('should_preserve_timestamp()', () => {
      it('should call should_preserve_timestamp()', () => {
        reset();

        component.should_preserve_timestamp();

        expect(component.should_preserve_timestamp).toHaveBeenCalled();
      });

      it('should call should_preserve_timestamp() and return pcap_form_group.controls[preserve_timestamp].value = true', () => {
        reset();

        const return_value: boolean = component.should_preserve_timestamp();

        expect(return_value).toBeTrue();
      });

      it('should call should_preserve_timestamp() and return pcap_form_group.controls[preserve_timestamp].value = false', () => {
        reset();

        component.pcap_form_group.controls['preserve_timestamp'].setValue(false);
        const return_value: boolean = component.should_preserve_timestamp();

        expect(return_value).toBeFalse();
      });
    });

    describe('change_preserve_timestamp()', () => {
      it('should call change_preserve_timestamp()', () => {
        reset();

        component.change_preserve_timestamp(mat_checkbox_change_true);

        expect(component.change_preserve_timestamp).toHaveBeenCalled();
      });

      it('should call change_preserve_timestamp() and disable pcap_form_group.controls[ifaces]', () => {
        reset();

        component.pcap_form_group.controls['ifaces'].enable();
        component.change_preserve_timestamp(mat_checkbox_change_true);

        expect(component.pcap_form_group.controls['ifaces'].enabled).toBeFalse();
      });

      it('should call change_preserve_timestamp() and enable pcap_form_group.controls[ifaces]', () => {
        reset();

        component.pcap_form_group.controls['ifaces'].disable();
        component.change_preserve_timestamp(mat_checkbox_change_false);

        expect(component.pcap_form_group.controls['ifaces'].enabled).toBeTrue();
      });
    });

    describe('get_error_message()', () => {
      it('should call get_error_message()', () => {
        reset();

        component.get_error_message(abstract_control_with_errors);

        expect(component.get_error_message).toHaveBeenCalled();
      });

      it('should call get_error_message() and return error message', () => {
        reset();

        const return_value: string = component.get_error_message(abstract_control_with_errors);

        expect(return_value).toEqual(abstract_control_with_errors.errors.error_message);
      });

      it('should call get_error_message() and return empty string', () => {
        reset();

        const return_value: string = component.get_error_message(abstract_control_without_errors);

        expect(return_value).toEqual('');
      });
    });

    describe('selection_change_iface_value()', () => {
      it('should call selection_change_iface_value()', () => {
        reset();

        component.selection_change_iface_value(mat_select_change_with_ip);

        expect(component.selection_change_iface_value).toHaveBeenCalled();
      });

      it('should call selection_change_iface_value() and enable pcap_form_group.controls[preserve_timestamp]', () => {
        reset();

        component.pcap_form_group.controls['preserve_timestamp'].disable();
        component.selection_change_iface_value(mat_select_change_with_ip);

        expect(component.pcap_form_group.controls['preserve_timestamp'].enabled).toBeTrue();
      });

      it('should call api_get_configured_ifaces_() from selection_change_iface_value()', () => {
        reset();

        component.selection_change_iface_value(mat_select_change_with_ip);

        expect(component['api_get_configured_ifaces_']).toHaveBeenCalled();
      });

      it('should call selection_change_iface_value() and set component.pcap_form_group.controls[ifaces] = empty string', () => {
        reset();

        component.selection_change_iface_value(mat_select_change_with_ip);

        expect(component.pcap_form_group.controls['ifaces'].value).toEqual('');
      });
    });

    describe('execute()', () => {
      it('should call execute()', () => {
        reset();

        component.execute();

        expect(component.execute).toHaveBeenCalled();
      });

      it('should call execute() and set component.pcap_form_group.controls[sensor_hostname] to a sensor that matches the ip', () => {
        reset();

        component.pcap_form_group.controls['sensor_ip'].setValue(MockHostInfoClass.management_ip);
        component.execute();

        expect(component.pcap_form_group.controls['sensor_hostname'].value).toEqual(MockHostInfoClass.hostname);
      });
    });

    describe('cancel()', () => {
      it('should call cancel()', () => {
        reset();

        component.cancel();

        expect(component.cancel).toHaveBeenCalled();
      });
    });

    describe('private initialize_pcap_form_group_()', () => {
      it('should call initialize_pcap_form_group_()', () => {
        reset();

        component['initialize_pcap_form_group_']();

        expect(component['initialize_pcap_form_group_']).toHaveBeenCalled();
      });

      it('should call set_pcap_form_group_() from initialize_pcap_form_group_()', () => {
        reset();

        component['initialize_pcap_form_group_']();

        expect(component['set_pcap_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private set_pcap_form_group_()', () => {
      it('should call set_pcap_form_group_()', () => {
        reset();

        component['set_pcap_form_group_'](pcap_form_group);

        expect(component['set_pcap_form_group_']).toHaveBeenCalled();
      });

      it('should call set_pcap_form_group_() and set pcap_form_group to passed value', () => {
        reset();

        component.pcap_form_group = undefined;
        component['set_pcap_form_group_'](pcap_form_group);

        expect(component.pcap_form_group).toEqual(pcap_form_group);
      });
    });

    describe('private api_get_configured_ifaces_()', () => {
      it('should call api_get_configured_ifaces_()', () => {
        reset();

        component['api_get_configured_ifaces_'](MockHostInfoClass.hostname);

        expect(component['api_get_configured_ifaces_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_configured_ifaces() from api_get_configured_ifaces_()', () => {
        reset();

        component['api_get_configured_ifaces_'](MockHostInfoClass.hostname);

        expect(component['catalog_service_'].get_configured_ifaces).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_configured_ifaces() and set component.selectable_ifaces', () => {
        reset();

        component.selectable_ifaces = [];
        component['api_get_configured_ifaces_'](MockHostInfoClass.hostname);

        expect(component.selectable_ifaces.length > 0).toBeTrue();
      });

      it('should call catalog_service_.get_configured_ifaces() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_configured_ifaces').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_configured_ifaces_'](MockHostInfoClass.hostname);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_configured_ifaces() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_configured_ifaces').and.returnValue(throwError(mock_http_error_response));

        component['api_get_configured_ifaces_'](MockHostInfoClass.hostname);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_sensor_host_info_()', () => {
      it('should call api_get_sensor_host_info_()', () => {
        reset();

        component['api_get_sensor_host_info_']();

        expect(component['api_get_sensor_host_info_']).toHaveBeenCalled();
      });

      it('should call sensor_host_info_service_.get_sensor_host_info() from api_get_sensor_host_info_()', () => {
        reset();

        component['api_get_sensor_host_info_']();

        expect(component['sensor_host_info_service_'].get_sensor_host_info).toHaveBeenCalled();
      });

      it('should call sensor_host_info_service_.get_sensor_host_info() and set component.selectable_sensors', () => {
        reset();

        component.selectable_sensors = [];
        component['api_get_sensor_host_info_']();

        expect(component.selectable_sensors.length > 0).toBeTrue();
      });

      it('should call sensor_host_info_service_.get_sensor_host_info() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['sensor_host_info_service_'], 'get_sensor_host_info').and.returnValue(throwError(mock_http_error_response));

        component['api_get_sensor_host_info_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { of, throwError } from 'rxjs';

import { MockHostInfoClass, MockRuleSetClass } from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { SortingService } from '../../../../services/sorting.service';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import {
  ADD,
  ADD_RULE_SET_TITLE,
  EDIT,
  SURICATA,
  SURICATA_CAP_FIRST,
  ZEEK,
  ZEEK_CAP_FIRST,
  ZEEK_INTEL,
  ZEEK_SCRIPTS,
  ZEEK_SIGNATURES
} from '../../constants/policy-management.constant';
import { DialogDataInterface } from '../../interfaces';
import { PolicyManagementModule } from '../../policy-management.module';
import { RuleSetAddEditComponent } from './rule-set-add-edit.component';

class MatDialogMock {
  close() {
    return {
      afterClosed: () => of ()
    };
  }
}

const MOCK_DIALOG_DATA_ADD_RULE_SET: DialogDataInterface = {
  rule_set: undefined,
  rule: undefined,
  action: ADD
};

const MOCK_DIALOG_DATA_EDIT_RULE_SET: DialogDataInterface = {
  rule_set: MockRuleSetClass,
  rule: undefined,
  action: EDIT
};

const MOCK_DIALOG_DATA_EDIT_RULE_SET_UNDEFINED: DialogDataInterface = {
  rule_set: undefined,
  rule: undefined,
  action: EDIT
};

const MOCK_DIALOG_DATA_UNDEFINED: DialogDataInterface = {
  rule_set: undefined,
  rule: undefined,
  action: undefined
};

describe('RuleSetAddEditComponent', () => {
  let component: RuleSetAddEditComponent;
  let fixture: ComponentFixture<RuleSetAddEditComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyChangeSensorList: jasmine.Spy<any>;
  let spyIsRuleSetEnabled: jasmine.Spy<any>;
  let spySubmit: jasmine.Spy<any>;
  let spyCancel: jasmine.Spy<any>;
  let spySetTitle: jasmine.Spy<any>;
  let spyInitializeForm: jasmine.Spy<any>;
  let spySetRuleSetFormGroup: jasmine.Spy<any>;
  let spySetSensorList: jasmine.Spy<any>;
  let spySetSensorListSelection: jasmine.Spy<any>;
  let spyGetSensorType: jasmine.Spy<any>;
  let spyApiChangeSensorSelection: jasmine.Spy<any>;
  let spyApiCatalogStatus: jasmine.Spy<any>;

  // Test Data
  let form_builder: FormBuilder;
  const mock_mat_select_change: MatSelectChange = {
    source: null,
    value: SURICATA_CAP_FIRST
  };
  let rule_set_form_group: FormGroup;
  const hostnames: string[] = [MockHostInfoClass.hostname];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        InjectorModule,
        PolicyManagementModule,
        TestingModule
      ],
      providers: [
        SortingService,
        { provide: MatDialogRef, useClass: MatDialogMock },
        { provide: MAT_DIALOG_DATA, useValue: ADD }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleSetAddEditComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyChangeSensorList = spyOn(component, 'change_sensor_list').and.callThrough();
    spyIsRuleSetEnabled = spyOn(component, 'is_rule_set_enabled').and.callThrough();
    spySubmit = spyOn(component, 'submit').and.callThrough();
    spyCancel = spyOn(component, 'cancel').and.callThrough();
    spySetTitle = spyOn<any>(component, 'set_title_').and.callThrough();
    spyInitializeForm = spyOn<any>(component, 'initialize_form_').and.callThrough();
    spySetRuleSetFormGroup = spyOn<any>(component, 'set_rule_set_form_group_').and.callThrough();
    spySetSensorList = spyOn<any>(component, 'set_sensor_list_').and.callThrough();
    spySetSensorListSelection = spyOn<any>(component, 'set_sensor_list_selection_').and.callThrough();
    spyGetSensorType = spyOn<any>(component, 'get_sensor_type_').and.callThrough();
    spyApiChangeSensorSelection = spyOn<any>(component, 'api_change_sensor_selection_').and.callThrough();
    spyApiCatalogStatus = spyOn<any>(component, 'api_catalog_status_').and.callThrough();

    // Add service spies
    spyOn<any>(component['sorting_service_'], 'alphanum').and.callThrough();

    // Set Test Data
    form_builder = TestBed.inject(FormBuilder);
    rule_set_form_group = form_builder.group({
        _id: new FormControl('0'),
        name: new FormControl(''),
        clearance: new FormControl(''),
        sensors: new FormControl([MockHostInfoClass.hostname]),
        appType: new FormControl(''),
        isEnabled: new FormControl(true)
    });
    const random_dialog_data: number = Math.floor(Math.random() * (1 - 0 + 1) + 0);
    component.dialog_data = random_dialog_data === 0 ? MOCK_DIALOG_DATA_ADD_RULE_SET : MOCK_DIALOG_DATA_EDIT_RULE_SET;

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyChangeSensorList.calls.reset();
    spyIsRuleSetEnabled.calls.reset();
    spySubmit.calls.reset();
    spyCancel.calls.reset();
    spySetTitle.calls.reset();
    spyInitializeForm.calls.reset();
    spySetRuleSetFormGroup.calls.reset();
    spySetSensorList.calls.reset();
    spySetSensorListSelection.calls.reset();
    spyGetSensorType.calls.reset();
    spyApiChangeSensorSelection.calls.reset();
    spyApiCatalogStatus.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create RuleSetAddEditComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('RuleSetAddEditComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call set_title_() from ngOnInit() when dialog_data.action defined', () => {
        reset();

        expect(component['set_title_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['set_title_']).toHaveBeenCalledTimes(1);
      });

      it('should call initialize_form_() from ngOnInit() when dialog_data.action defined', () => {
        reset();

        expect(component['initialize_form_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['initialize_form_']).toHaveBeenCalledTimes(1);
      });

      it('should call get_sensor_type_() from ngOnInit() when dialog_data.action = EDIT and rule set defined', () => {
        reset();

        expect(component['get_sensor_type_']).toHaveBeenCalledTimes(0);

        component.dialog_data = MOCK_DIALOG_DATA_EDIT_RULE_SET;
        component.ngOnInit();

        expect(component['get_sensor_type_']).toHaveBeenCalledTimes(1);
      });

      it('should call cancel() from ngOnInit() when dialog_data.action = EDIT and rule set undefined', () => {
        reset();

        expect(component.cancel).toHaveBeenCalledTimes(0);

        component.dialog_data = MOCK_DIALOG_DATA_EDIT_RULE_SET_UNDEFINED;
        component.ngOnInit();

        expect(component.cancel).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.generate_return_error_snackbar_message()() from ngOnInit() when dialog_data.action = EDIT and rule set undefined', () => {
        reset();

        component.dialog_data = MOCK_DIALOG_DATA_EDIT_RULE_SET_UNDEFINED;
        component.ngOnInit();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });

      it('should call api_change_sensor_selection_() from ngOnInit() when dialog_data.action defined', () => {
        reset();

        expect(component['api_change_sensor_selection_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['api_change_sensor_selection_']).toHaveBeenCalledTimes(1);
      });

      it('should call cancel() from ngOnInit() when dialog_data.action undefined', () => {
        reset();

        expect(component.cancel).toHaveBeenCalledTimes(0);

        component.dialog_data = MOCK_DIALOG_DATA_UNDEFINED;
        component.ngOnInit();

        expect(component.cancel).toHaveBeenCalledTimes(1);
      });

      it('should call mat_snackbar_service_.generate_return_error_snackbar_message() from ngOnInit() when dialog_data.action undefined', () => {
        reset();

        component.dialog_data = MOCK_DIALOG_DATA_UNDEFINED;
        component.ngOnInit();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('change_sensor_list()', () => {
      it('should call change_sensor_list()', () => {
        reset();

        component.change_sensor_list(mock_mat_select_change);

        expect(component.change_sensor_list).toHaveBeenCalled();
      });

      it('should call get_sensor_type_() from change_sensor_list()', () => {
        reset();

        expect(component['get_sensor_type_']).toHaveBeenCalledTimes(0);

        component.change_sensor_list(mock_mat_select_change);

        expect(component['get_sensor_type_']).toHaveBeenCalledTimes(1);
      });

      it('should call api_change_sensor_selection_() from change_sensor_list()', () => {
        reset();

        expect(component['api_change_sensor_selection_']).toHaveBeenCalledTimes(0);

        component.change_sensor_list(mock_mat_select_change);

        expect(component['api_change_sensor_selection_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('is_rule_set_enabled()', () => {
      it('should call is_rule_set_enabled()', () => {
        reset();

        component.rule_set_form_group = rule_set_form_group;
        component.is_rule_set_enabled();

        expect(component.is_rule_set_enabled).toHaveBeenCalled();
      });

      it('should call is_rule_set_enabled() and return true', () => {
        reset();

        component.rule_set_form_group = rule_set_form_group;
        const return_value: boolean = component.is_rule_set_enabled();

        expect(return_value).toBeTrue();
      });

      it('should call is_rule_set_enabled() and return false', () => {
        reset();

        rule_set_form_group.get('isEnabled').setValue(false);
        component.rule_set_form_group = rule_set_form_group;
        const return_value: boolean = component.is_rule_set_enabled();

        expect(return_value).toBeFalse();
      });
    });

    describe('submit()', () => {
      it('should call submit()', () => {
        reset();

        component.rule_set_form_group = rule_set_form_group;
        component['sensor_list_'] = [];
        component.submit();

        expect(component.submit).toHaveBeenCalled();
      });

      it('should call submit() and should replace sensor values an rule_set_form_group', () => {
        reset();

        component.rule_set_form_group = rule_set_form_group;
        component['sensor_list_'] = [MockHostInfoClass];

        expect(rule_set_form_group.get('sensors').value).toEqual(component.rule_set_form_group.get('sensors').value);

        component.submit();

        expect([MockHostInfoClass]).toEqual(component.rule_set_form_group.get('sensors').value);
      });
    });

    describe('cancel()', () => {
      it('should call cancel()', () => {
        reset();

        component.cancel();

        expect(component.cancel).toHaveBeenCalled();
      });
    });

    describe('private set_title_()', () => {
      it('should call set_title_()', () => {
        reset();

        component['set_title_'](ADD_RULE_SET_TITLE);

        expect(component['set_title_']).toHaveBeenCalled();
      });

      it('should call set_title_()', () => {
        reset();

        component['set_title_'](ADD_RULE_SET_TITLE);

        expect(component.title).toEqual(ADD_RULE_SET_TITLE);
      });
    });

    describe('private initialize_form_()', () => {
      it('should call initialize_form_()', () => {
        reset();

        component['initialize_form_'](null);

        expect(component['initialize_form_']).toHaveBeenCalled();
      });

      it('should call set_rule_set_form_group_() from initialize_form_()', () => {
        reset();

        expect(component['set_rule_set_form_group_']).toHaveBeenCalledTimes(0);

        component['initialize_form_'](null);

        expect(component['set_rule_set_form_group_']).toHaveBeenCalledTimes(1);
      });

      it('should call initialize_form_() and set rule_set_form_group.sensors value when is_edit=true', () => {
        reset();

        component['initialize_form_'](MockRuleSetClass, true);

        expect(component.rule_set_form_group.get('sensors').value).toEqual([MockHostInfoClass.hostname]);
      });
    });

    describe('private set_rule_set_form_group_()', () => {
      it('should call set_rule_set_form_group_()', () => {
        reset();

        component['set_rule_set_form_group_'](rule_set_form_group);

        expect(component['set_rule_set_form_group_']).toHaveBeenCalled();
      });

      it('should call set_rule_set_form_group_() and set rule_set_form_group with passed data', () => {
        reset();

        component['set_rule_set_form_group_'](rule_set_form_group);

        expect(component.rule_set_form_group).toEqual(rule_set_form_group);
      });
    });

    describe('private set_sensor_list_()', () => {
      it('should call set_sensor_list_()', () => {
        reset();

        component['set_sensor_list_']([MockHostInfoClass]);

        expect(component['set_sensor_list_']).toHaveBeenCalled();
      });

      it('should call set_sensor_list_() and set sensor_list_ with passed data', () => {
        reset();

        component['set_sensor_list_']([MockHostInfoClass]);

        expect(component['sensor_list_']).toEqual([MockHostInfoClass]);
      });
    });

    describe('private set_sensor_list_selection_()', () => {
      it('should call set_sensor_list_selection_()', () => {
        reset();

        component['set_sensor_list_selection_'](hostnames);

        expect(component['set_sensor_list_selection_']).toHaveBeenCalled();
      });

      it('should call set_sensor_list_selection_() and set sensor_list_selection with passed data', () => {
        reset();

        component['set_sensor_list_selection_'](hostnames);

        expect(component['sensor_list_selection']).toEqual(hostnames);
      });
    });

    describe('private get_sensor_type_()', () => {
      it('should call get_sensor_type_()', () => {
        reset();

        component['get_sensor_type_'](SURICATA_CAP_FIRST);

        expect(component['get_sensor_type_']).toHaveBeenCalled();
      });

      it('should call get_sensor_type_() and return `suricata`', () => {
        reset();

        const return_value: string = component['get_sensor_type_'](SURICATA_CAP_FIRST);

        expect(return_value).toEqual(SURICATA);
      });

      it('should call get_sensor_type_() and return `zeek`', () => {
        reset();

        const return_value: string = component['get_sensor_type_'](ZEEK_CAP_FIRST);

        expect(return_value).toEqual(ZEEK);
      });

      it('should call get_sensor_type_() and return `zeek`', () => {
        reset();

        let return_value: string = component['get_sensor_type_'](ZEEK_SCRIPTS);

        expect(return_value).toEqual(ZEEK);

        return_value = component['get_sensor_type_'](ZEEK_INTEL);

        expect(return_value).toEqual(ZEEK);

        return_value = component['get_sensor_type_'](ZEEK_SIGNATURES);

        expect(return_value).toEqual(ZEEK);
      });

      it('should call get_sensor_type_() and return ``', () => {
        reset();

        const return_value: string = component['get_sensor_type_']('');

        expect(return_value).toEqual('');
      });
    });

    describe('private api_change_sensor_selection_()', () => {
      it('should call api_change_sensor_selection_()', () => {
        reset();

        component['api_change_sensor_selection_']();

        expect(component['api_change_sensor_selection_']).toHaveBeenCalled();
      });

      it('should call sensor_host_info_service_.get_sensor_host_info() from api_change_sensor_selection_()', () => {
        reset();

        component['api_change_sensor_selection_']();

        expect(component['sensor_host_info_service_'].get_sensor_host_info).toHaveBeenCalled();
      });

      it('should call set_sensor_list_() from sensor_host_info_service_.get_sensor_host_info() response', () => {
        reset();

        expect(component['set_sensor_list_']).toHaveBeenCalledTimes(0);

        component['api_change_sensor_selection_']();

        expect(component['set_sensor_list_']).toHaveBeenCalledTimes(1);
      });

      it('should call set_sensor_list_selection_() from sensor_host_info_service_.get_sensor_host_info() response', () => {
        reset();

        component['api_change_sensor_selection_']();

        expect(component['set_sensor_list_selection_']).toHaveBeenCalled();
      });

      it('should call api_catalog_status_() from sensor_host_info_service_.get_sensor_host_info() response', () => {
        reset();

        expect(component['api_catalog_status_']).toHaveBeenCalledTimes(0);

        component['api_change_sensor_selection_']();

        expect(component['api_catalog_status_']).toHaveBeenCalledTimes(1);
      });

      it('should call sensor_host_info_service_.get_sensor_host_info() and handle subscription error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['sensor_host_info_service_'], 'get_sensor_host_info').and.returnValue(throwError('Mock Error'));

        component['api_change_sensor_selection_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_catalog_status_()', () => {
      it('should call api_catalog_status_()', () => {
        reset();

        component['api_catalog_status_'](SURICATA, []);

        expect(component['api_catalog_status_']).toHaveBeenCalled();
      });

      it('should call policy_management_service_.check_catalog_status() from api_catalog_status_()', () => {
        reset();

        component['api_catalog_status_'](SURICATA, []);

        expect(component['policy_management_service_'].check_catalog_status).toHaveBeenCalled();
      });

      it('should call set_sensor_list_selection_() from policy_management_service_.check_catalog_status() response', () => {
        reset();

        expect(component['set_sensor_list_selection_']).toHaveBeenCalledTimes(0);

        component['api_catalog_status_'](SURICATA, []);

        expect(component['set_sensor_list_selection_']).toHaveBeenCalledTimes(1);
      });

      it('should call mat_snackbar_service_.displaySnackBar() from policy_management_service_.check_catalog_status() response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['policy_management_service_'], 'check_catalog_status').and.returnValue(of([]));

        component['api_catalog_status_'](SURICATA, []);
        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call policy_management_service_.check_catalog_status() and sort sensor_list_selection on response', () => {
        reset();

        expect(component['sorting_service_'].alphanum).toHaveBeenCalledTimes(0);

        component['api_catalog_status_'](SURICATA, ['MockHostName']);

        expect(component['sorting_service_'].alphanum).toHaveBeenCalledTimes(1);
      });

      it('should call policy_management_service_.check_catalog_status() and handle subscription error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['policy_management_service_'], 'check_catalog_status').and.returnValue(throwError('Mock Error'));

        component['api_catalog_status_'](SURICATA, []);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

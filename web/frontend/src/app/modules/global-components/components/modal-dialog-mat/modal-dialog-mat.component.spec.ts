import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { DialogFormControlClass, DialogFormControlConfigClass } from '../../../../classes';
import { COMMON_VALIDATORS, SAVE_DIALOG_OPTION } from '../../../../constants/cvah.constants';
import { DialogControlTypesEnum } from '../../../../enums/dialog-control-types.enum';
import { BackingObjectInterface } from '../../../../interfaces';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { GlobalComponentsModule } from '../../global-components.module';
import { ModalDialogMatComponent } from './modal-dialog-mat.component';

describe('ModalDialogMatComponent', () => {
  let component: ModalDialogMatComponent;
  let fixture: ComponentFixture<ModalDialogMatComponent>;

  // Setup spy references
  let spyGetDialogFormControls: jasmine.Spy<any>;
  let spyIsTextInput: jasmine.Spy<any>;
  let spyIsTextarea: jasmine.Spy<any>;
  let spyIsPasswordInput: jasmine.Spy<any>;
  let spyIsDropDown: jasmine.Spy<any>;
  let spyIsCheckbox: jasmine.Spy<any>;
  let spyIsDateInput: jasmine.Spy<any>;
  let spyIsTimezoneControl: jasmine.Spy<any>;
  let spyIsChips: jasmine.Spy<any>;
  let spGetErrorMessage: jasmine.Spy<any>;
  let spyAddAlertChip: jasmine.Spy<any>;
  let spyRemoveAlertChip: jasmine.Spy<any>;
  let spyCancel: jasmine.Spy<any>;
  let spySubmit: jasmine.Spy<any>;

  // Test Data
  const chips_data: string[] = [ 'data', 'new', 'test' ];
  const chips_data_for_test: string[] = [ 'data', 'test' ];
  const nameFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  nameFormControlConfig.label = 'Link Name';
  nameFormControlConfig.formState = '';
  const urlFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  urlFormControlConfig.label = 'Link URL';
  urlFormControlConfig.formState = '';
  const descriptionFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  descriptionFormControlConfig.label = 'Link Description';
  descriptionFormControlConfig.formState = '';
  const timezoneFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  timezoneFormControlConfig.label = 'timezone';
  timezoneFormControlConfig.formState = 'CST';
  const chipsFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  chipsFormControlConfig.label = 'chips';
  chipsFormControlConfig.formState = chips_data.join(',');
  chipsFormControlConfig.controlType = DialogControlTypesEnum.chips;
  const form_group: FormGroup = new FormGroup({
    name: new DialogFormControlClass(nameFormControlConfig),
    url: new DialogFormControlClass(urlFormControlConfig),
    description: new DialogFormControlClass(descriptionFormControlConfig),
    timezone: new DialogFormControlClass(timezoneFormControlConfig),
    chips: new DialogFormControlClass(chipsFormControlConfig)
  });
  const MockBackObjectInterface: BackingObjectInterface = {
    title: 'Fake Test Title',
    instructions: 'Fake Message',
    dialogForm: form_group,
    confirmBtnText: SAVE_DIALOG_OPTION
  };
  const textInputFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  textInputFormControlConfig.label = 'text input';
  textInputFormControlConfig.formState = 'text input';
  textInputFormControlConfig.controlType = DialogControlTypesEnum.text;
  const textInputFormControl: DialogFormControlClass = new DialogFormControlClass(textInputFormControlConfig);
  const textareaFromControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  textareaFromControlConfig.label = 'textarea';
  textareaFromControlConfig.formState = 'textarea';
  textareaFromControlConfig.controlType = DialogControlTypesEnum.textarea;
  const textareaFromControl: DialogFormControlClass = new DialogFormControlClass(textareaFromControlConfig);
  const passwordInputFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  passwordInputFormControlConfig.label = 'password input';
  passwordInputFormControlConfig.formState = 'password input';
  passwordInputFormControlConfig.controlType = DialogControlTypesEnum.password;
  const passwordInputFormControl: DialogFormControlClass = new DialogFormControlClass(passwordInputFormControlConfig);
  const dropDownFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  dropDownFormControlConfig.label = 'drop down';
  dropDownFormControlConfig.formState = 'dropdown';
  dropDownFormControlConfig.controlType = DialogControlTypesEnum.dropdown;
  const dropDownFormControl: DialogFormControlClass = new DialogFormControlClass(dropDownFormControlConfig);
  const checkboxFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  checkboxFormControlConfig.label = 'checkbox';
  checkboxFormControlConfig.formState = true;
  checkboxFormControlConfig.controlType = DialogControlTypesEnum.checkbox;
  const checkboxFormControl: DialogFormControlClass = new DialogFormControlClass(checkboxFormControlConfig);
  const dateInputFormControlConfig: DialogFormControlConfigClass = new DialogFormControlConfigClass();
  dateInputFormControlConfig.label = 'date input';
  dateInputFormControlConfig.formState = 'date input';
  dateInputFormControlConfig.controlType = DialogControlTypesEnum.date;
  const dateInputFormControl: DialogFormControlClass = new DialogFormControlClass(dateInputFormControlConfig);
  const chipsFormControl: DialogFormControlClass = new DialogFormControlClass(chipsFormControlConfig);
  const error_message_form_control: DialogFormControlClass = new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)])) as DialogFormControlClass;
  error_message_form_control.markAsTouched();
  const form_control: DialogFormControlClass = new FormControl('') as DialogFormControlClass;
  const test_mat_chip_input_event: MatChipInputEvent = {
    input: {} as HTMLInputElement,
    value: 'as.number'
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GlobalComponentsModule
      ],
      providers: [
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: MockBackObjectInterface }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDialogMatComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyGetDialogFormControls = spyOn(component, 'get_dialog_form_controls').and.callThrough();
    spyIsTextInput = spyOn(component, 'is_text_input').and.callThrough();
    spyIsTextarea = spyOn(component, 'is_textarea').and.callThrough();
    spyIsPasswordInput = spyOn(component, 'is_password_input').and.callThrough();
    spyIsDropDown = spyOn(component, 'is_dropdown').and.callThrough();
    spyIsCheckbox = spyOn(component, 'is_checkbox').and.callThrough();
    spyIsDateInput = spyOn(component, 'is_date_input').and.callThrough();
    spyIsTimezoneControl = spyOn(component, 'get_timezone_control').and.callThrough();
    spyIsChips = spyOn(component, 'is_chips').and.callThrough();
    spGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyAddAlertChip = spyOn(component, 'add_alert_chip').and.callThrough();
    spyRemoveAlertChip = spyOn(component, 'remove_alert_chip').and.callThrough();
    spyCancel = spyOn(component, 'cancel').and.callThrough();
    spySubmit = spyOn(component, 'submit').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyGetDialogFormControls.calls.reset();
    spyIsTextInput.calls.reset();
    spyIsTextarea.calls.reset();
    spyIsPasswordInput.calls.reset();
    spyIsDropDown.calls.reset();
    spyIsCheckbox.calls.reset();
    spyIsDateInput.calls.reset();
    spyIsTimezoneControl.calls.reset();
    spyIsChips.calls.reset();
    spGetErrorMessage.calls.reset();
    spyAddAlertChip.calls.reset();
    spyRemoveAlertChip.calls.reset();
    spyCancel.calls.reset();
    spySubmit.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create ModalDialogMatComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ModalDialogMatComponent methods', () => {
    describe('get_dialog_form_controls()', () => {
      it('should call get_dialog_form_controls()', () => {
        reset();

        component.get_dialog_form_controls(form_group);

        expect(component.get_dialog_form_controls).toHaveBeenCalled();
      });

      it('should call get_dialog_form_controls() and return array of controls', () => {
        reset();

        const return_value: DialogFormControlClass[] = component.get_dialog_form_controls(form_group);

        expect(return_value.length).toEqual(Object.keys(form_group.controls).length);
      });
    });

    describe('is_text_input()', () => {
      it('should call is_text_input()', () => {
        reset();

        component.is_text_input(textInputFormControl);

        expect(component.is_text_input).toHaveBeenCalled();
      });

      it('should call is_text_input() and return true', () => {
        reset();

        const return_value: boolean = component.is_text_input(textInputFormControl);

        expect(return_value).toBeTrue();
      });

      it('should call is_text_input() and return false', () => {
        reset();

        const return_value: boolean = component.is_text_input(textareaFromControl);

        expect(return_value).toBeFalse();
      });
    });

    describe('is_textarea()', () => {
      it('should call is_textarea()', () => {
        reset();

        component.is_textarea(textareaFromControl);

        expect(component.is_textarea).toHaveBeenCalled();
      });

      it('should call is_textarea() and return true', () => {
        reset();

        const return_value: boolean = component.is_textarea(textareaFromControl);

        expect(return_value).toBeTrue();
      });

      it('should call is_textarea() and return false', () => {
        reset();

        const return_value: boolean = component.is_textarea(textInputFormControl);

        expect(return_value).toBeFalse();
      });
    });

    describe('is_password_input()', () => {
      it('should call is_password_input()', () => {
        reset();

        component.is_password_input(passwordInputFormControl);

        expect(component.is_password_input).toHaveBeenCalled();
      });

      it('should call is_password_input() and return true', () => {
        reset();

        const return_value: boolean = component.is_password_input(passwordInputFormControl);

        expect(return_value).toBeTrue();
      });

      it('should call is_password_input() and return false', () => {
        reset();

        const return_value: boolean = component.is_password_input(textInputFormControl);

        expect(return_value).toBeFalse();
      });
    });

    describe('is_dropdown()', () => {
      it('should call is_dropdown()', () => {
        reset();

        component.is_dropdown(dropDownFormControl);

        expect(component.is_dropdown).toHaveBeenCalled();
      });

      it('should call is_dropdown() and return true', () => {
        reset();

        const return_value: boolean = component.is_dropdown(dropDownFormControl);

        expect(return_value).toBeTrue();
      });

      it('should call is_dropdown() and return false', () => {
        reset();

        const return_value: boolean = component.is_dropdown(textInputFormControl);

        expect(return_value).toBeFalse();
      });
    });

    describe('is_checkbox()', () => {
      it('should call is_checkbox()', () => {
        reset();

        component.is_checkbox(checkboxFormControl);

        expect(component.is_checkbox).toHaveBeenCalled();
      });

      it('should call is_checkbox() and return true', () => {
        reset();

        const return_value: boolean = component.is_checkbox(checkboxFormControl);

        expect(return_value).toBeTrue();
      });

      it('should call is_checkbox() and return false', () => {
        reset();

        const return_value: boolean = component.is_checkbox(textInputFormControl);

        expect(return_value).toBeFalse();
      });
    });

    describe('is_date_input()', () => {
      it('should call is_date_input()', () => {
        reset();

        component.is_date_input(dateInputFormControl);

        expect(component.is_date_input).toHaveBeenCalled();
      });

      it('should call is_date_input() and return true', () => {
        reset();

        const return_value: boolean = component.is_date_input(dateInputFormControl);

        expect(return_value).toBeTrue();
      });

      it('should call is_date_input() and return false', () => {
        reset();

        const return_value: boolean = component.is_date_input(textInputFormControl);

        expect(return_value).toBeFalse();
      });
    });

    describe('get_timezone_control()', () => {
      it('should call get_timezone_control()', () => {
        reset();

        component.get_timezone_control();

        expect(component.get_timezone_control).toHaveBeenCalled();
      });

      it('should call get_timezone_control() and form control', () => {
        reset();

        const return_value: DialogFormControlClass = component.get_timezone_control();

        expect(return_value).toBeDefined();
      });
    });

    describe('is_chips()', () => {
      it('should call is_chips()', () => {
        reset();

        component.is_chips(chipsFormControl);

        expect(component.is_chips).toHaveBeenCalled();
      });

      it('should call is_chips() and return true', () => {
        reset();

        const return_value: boolean = component.is_chips(chipsFormControl);

        expect(return_value).toBeTrue();
      });

      it('should call is_chips() and return false', () => {
        reset();

        const return_value: boolean = component.is_chips(textInputFormControl);

        expect(return_value).toBeFalse();
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

    describe('add_alert_chip()', () => {
      it('should call add_alert_chip()', () => {
        reset();

        component.add_alert_chip(test_mat_chip_input_event);

        expect(component.add_alert_chip).toHaveBeenCalled();
      });

      it('should call add_alert_chip() and add input event value to chips', () => {
        reset();

        if (component.chips.includes(test_mat_chip_input_event.value)) {
          component.chips = component.chips.filter((chip_value: string) => chip_value !== test_mat_chip_input_event.value);
        }

        component.add_alert_chip(test_mat_chip_input_event);

        expect(component.chips.includes(test_mat_chip_input_event.value)).toBeTrue();
      });
    });

    describe('remove_alert_chip()', () => {
      it('should call remove_alert_chip()', () => {
        reset();

        component.remove_alert_chip(test_mat_chip_input_event.value);

        expect(component.remove_alert_chip).toHaveBeenCalled();
      });

      it('should call remove_alert_chip() and remove input value to from chips', () => {
        reset();

        if (!component.chips.includes(test_mat_chip_input_event.value)) {
          component.chips.push(test_mat_chip_input_event.value);
        }

        component.remove_alert_chip(test_mat_chip_input_event.value);

        expect(component.chips.includes(test_mat_chip_input_event.value)).toBeFalse();
      });
    });

    describe('cancel()', () => {
      it('should call cancel()', () => {
        reset();

        component.cancel();

        expect(component.cancel).toHaveBeenCalled();
      });
    });

    describe('submit()', () => {
      it('should call submit()', () => {
        reset();

        component.submit();

        expect(component.submit).toHaveBeenCalled();
      });

      it('should call get_dialog_form_controls() from submit()', () => {
        reset();

        component.submit();

        expect(component.get_dialog_form_controls).toHaveBeenCalled();
      });

      it('should call submit() and set form control with new chip data', () => {
        reset();

        component.chips = chips_data_for_test;
        component.submit();

        expect(component.dialog_form_group.get('chips').value).toEqual(chips_data_for_test.join(','));
      });
    });
  });
});

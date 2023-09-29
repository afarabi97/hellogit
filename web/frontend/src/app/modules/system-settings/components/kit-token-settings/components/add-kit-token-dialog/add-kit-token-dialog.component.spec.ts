import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { remove_styles_from_dom } from '../../../../../../../../static-data/functions/clean-dom.function';
import { validateFromArray } from '../../../../../../validators/generic-validators.validator';
import { SystemSettingsModule } from '../../../../system-settings.module';
import { addToken } from '../../../../validators/kit-token.validator';
import { AddKitTokenDialogComponent } from './add-kit-token-dialog.component';

describe('AddKitTokenDialogComponent', () => {
  let component: AddKitTokenDialogComponent;
  let fixture: ComponentFixture<AddKitTokenDialogComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spySubmit: jasmine.Spy<any>;
  let spyClickButtonClose: jasmine.Spy<any>;
  let spyInitializeKitTokenSettingsFormGroup: jasmine.Spy<any>;
  let spySetKitTokenSettingsFormGroup: jasmine.Spy<any>;

  // Test Data
  const error_message_form_control: FormControl = new FormControl('', Validators.compose([validateFromArray(addToken.ip_address)]));
  error_message_form_control.markAsTouched();
  const form_control: FormControl = new FormControl('192.168.0.1', Validators.compose([validateFromArray(addToken.ip_address)]));
  form_control.markAsTouched();
  const test_form_group: FormGroup = new FormGroup({
                                                     ipaddress: new FormControl(null, Validators.compose([validateFromArray(addToken.ip_address)]))
                                                   });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SystemSettingsModule
      ],
      providers: [
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddKitTokenDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spySubmit = spyOn(component, 'submit').and.callThrough();
    spyClickButtonClose = spyOn(component, 'click_button_close').and.callThrough();
    spyInitializeKitTokenSettingsFormGroup = spyOn<any>(component, 'initialize_kit_token_settings_form_group_').and.callThrough();
    spySetKitTokenSettingsFormGroup = spyOn<any>(component, 'set_kit_token_settings_form_group_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyGetErrorMessage.calls.reset();
    spySubmit.calls.reset();
    spyClickButtonClose.calls.reset();
    spyInitializeKitTokenSettingsFormGroup.calls.reset();
    spySetKitTokenSettingsFormGroup.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create AddKitTokenDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('AddKitTokenDialogComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_kit_token_settings_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_kit_token_settings_form_group_']).toHaveBeenCalled();
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

        expect(return_value).toEqual(addToken.ip_address[0].error_message);
      });

      it('should call get_error_message() and return empty string', () => {
        reset();

        const return_value: string = component.get_error_message(form_control);

        expect(return_value).toEqual('');
      });
    });

    describe('submit()', () => {
      it('should call submit()', () => {
        reset();

        component.submit();

        expect(component.submit).toHaveBeenCalled();
      });

      it('should call mat_dialog_ref_.close() from submit()', () => {
        reset();

        component.submit();

        expect(component['mat_dialog_ref_'].close).toHaveBeenCalled();
      });
    });

    describe('click_button_close()', () => {
      it('should call click_button_close()', () => {
        reset();

        component.click_button_close();

        expect(component.click_button_close).toHaveBeenCalled();
      });

      it('should call mat_dialog_ref_.close() from click_button_close()', () => {
        reset();

        component.click_button_close();

        expect(component['mat_dialog_ref_'].close).toHaveBeenCalled();
      });
    });

    describe('private initialize_kit_token_settings_form_group_()', () => {
      it('should call initialize_kit_token_settings_form_group_()', () => {
        reset();

        component['initialize_kit_token_settings_form_group_']();

        expect(component['initialize_kit_token_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call set_kit_token_settings_form_group_() from initialize_kit_token_settings_form_group_()', () => {
        reset();

        component['initialize_kit_token_settings_form_group_']();

        expect(component['set_kit_token_settings_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private set_kit_token_settings_form_group_()', () => {
      it('should call set_kit_token_settings_form_group_()', () => {
        reset();

        component['set_kit_token_settings_form_group_'](test_form_group);

        expect(component['set_kit_token_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call set_kit_token_settings_form_group_() and set kit_token_settings_form_group = passed value', () => {
        reset();

        component['set_kit_token_settings_form_group_'](test_form_group);

        expect(component.kit_token_settings_form_group).toEqual(test_form_group);
      });
    });
  });
});

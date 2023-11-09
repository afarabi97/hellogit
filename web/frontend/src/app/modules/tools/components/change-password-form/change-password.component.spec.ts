import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { MockErrorMessageClass } from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { CANCEL_DIALOG_OPTION, COMMON_VALIDATORS, CONFIRM_DIALOG_OPTION } from '../../../../constants/cvah.constants';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import { ToolsModule } from '../../tools.module';
import { ChangePasswordFormComponent } from './change-password.component';

describe('ChangePasswordFormComponent', () => {
  let component: ChangePasswordFormComponent;
  let fixture: ComponentFixture<ChangePasswordFormComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyOpenPasswordRulesDialog: jasmine.Spy<any>;
  let spyReEvaluate: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyUpdateButtonClick: jasmine.Spy<any>;
  let spyInitializeChangeKitPasswordFormGroup: jasmine.Spy<any>;
  let spyApiChangeKitPassword: jasmine.Spy<any>;

  // Test Data
  const error_message_form_control: FormControl = new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  error_message_form_control.markAsTouched();
  const form_control: FormControl = new FormControl('test', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  form_control.markAsTouched();
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
        ToolsModule,
        TestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordFormComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyOpenPasswordRulesDialog = spyOn(component, 'open_password_rules_dialog').and.callThrough();
    spyReEvaluate = spyOn(component, 're_evaluate').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyUpdateButtonClick = spyOn(component, 'update_button_click').and.callThrough();
    spyInitializeChangeKitPasswordFormGroup = spyOn<any>(component, 'initialize_change_kit_password_form_group_').and.callThrough();
    spyApiChangeKitPassword = spyOn<any>(component, 'api_change_kit_password_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyOpenPasswordRulesDialog.calls.reset();
    spyReEvaluate.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyUpdateButtonClick.calls.reset();
    spyInitializeChangeKitPasswordFormGroup.calls.reset();
    spyApiChangeKitPassword.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create ChangePasswordFormComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ChangePasswordFormComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_change_kit_password_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_change_kit_password_form_group_']).toHaveBeenCalled();
      });
    });

    describe('open_password_rules_dialog()', () => {
      it('should call open_password_rules_dialog()', () => {
        reset();

        component.open_password_rules_dialog();

        expect(component.open_password_rules_dialog).toHaveBeenCalled();
      });
    });

    describe('re_evaluate()', () => {
      it('should call re_evaluate()', () => {
        reset();

        component['initialize_change_kit_password_form_group_']();
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

    describe('update_button_click()', () => {
      it('should call update_button_click()', () => {
        reset();

        component.update_button_click();

        expect(component.update_button_click).toHaveBeenCalled();
      });

      it('should call api_change_kit_password_() after mat dialog ref closed from within update_button_click()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.update_button_click();

        expect(component['api_change_kit_password_']).toHaveBeenCalled();
      });

      it('should not call api_change_kit_password_() after mat dialog ref closed from within update_button_click()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.update_button_click();

        expect(component['api_change_kit_password_']).not.toHaveBeenCalled();
      });
    });

    describe('private initialize_change_kit_password_form_group_()', () => {
      it('should call initialize_change_kit_password_form_group_()', () => {
        reset();

        component['initialize_change_kit_password_form_group_']();

        expect(component['initialize_change_kit_password_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private api_change_kit_password_()', () => {
      it('should call api_change_kit_password_()', () => {
        reset();

        component['api_change_kit_password_']();

        expect(component['api_change_kit_password_']).toHaveBeenCalled();
      });

      it('should call tools_service_.change_kit_password() from api_change_kit_password_()', () => {
        reset();

        component['api_change_kit_password_']();

        expect(component['tools_service_'].change_kit_password).toHaveBeenCalled();
      });

      it('should call tools_service_.change_kit_password() and handle response and call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_change_kit_password_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call tools_service_.change_kit_password() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'change_kit_password').and.returnValue(throwError(MockErrorMessageClass));

        component['api_change_kit_password_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call tools_service_.change_kit_password() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'change_kit_password').and.returnValue(throwError(mock_http_error_response));

        component['api_change_kit_password_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

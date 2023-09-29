import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { MockErrorMessageClass, MockKitTokenClass } from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockKitTokenInterface } from '../../../../../../static-data/interface-objects';
import { TestingModule } from '../../../testing-modules/testing.module';
import { SystemSettingsModule } from '../../system-settings.module';
import { KitTokenSettingsComponent } from './kit-token-settings.component';

describe('KitTokenSettingsComponent', () => {
  let component: KitTokenSettingsComponent;
  let fixture: ComponentFixture<KitTokenSettingsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyDisabledButtonAddKit: jasmine.Spy<any>;
  let spyClickButtonDelete: jasmine.Spy<any>;
  let spyOpenCopyTokenDialog: jasmine.Spy<any>;
  let spyOpenAddKitTokenDialog: jasmine.Spy<any>;
  let spyApiGetKitTokens: jasmine.Spy<any>;
  let spyApiCreateKitToken: jasmine.Spy<any>;
  let spyApiDeleteKitToken: jasmine.Spy<any>;

  // Test Data
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
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KitTokenSettingsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyDisabledButtonAddKit = spyOn(component, 'disabled_button_add_kit').and.callThrough();
    spyClickButtonDelete = spyOn(component, 'click_button_delete').and.callThrough();
    spyOpenCopyTokenDialog = spyOn(component, 'open_copy_token_dialog').and.callThrough();
    spyOpenAddKitTokenDialog = spyOn(component, 'open_add_kit_token_dialog').and.callThrough();
    spyApiGetKitTokens = spyOn<any>(component, 'api_get_kit_tokens_').and.callThrough();
    spyApiCreateKitToken = spyOn<any>(component, 'api_create_kit_token_').and.callThrough();
    spyApiDeleteKitToken = spyOn<any>(component, 'api_delete_kit_token_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyDisabledButtonAddKit.calls.reset();
    spyClickButtonDelete.calls.reset();
    spyOpenCopyTokenDialog.calls.reset();
    spyOpenAddKitTokenDialog.calls.reset();
    spyApiGetKitTokens.calls.reset();
    spyApiCreateKitToken.calls.reset();
    spyApiDeleteKitToken.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create KitTokenSettingsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('KitTokenSettingsComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_kit_tokens_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_kit_tokens_']).toHaveBeenCalled();
      });
    });

    describe('disabled_button_add_kit()', () => {
      it('should call disabled_button_add_kit()', () => {
        reset();

        component.disabled_button_add_kit();

        expect(component.disabled_button_add_kit).toHaveBeenCalled();
      });

      it('should call disabled_button_add_kit() and return true when gip_build = true and disable_add_kit_button = true', () => {
        reset();

        component.gip_build = true;
        component.disable_add_kit_button = true;
        const return_value: boolean = component.disabled_button_add_kit();

        expect(return_value).toBeTrue();
      });

      it('should call disabled_button_add_kit() and return true when gip_build = false and disable_add_kit_button = true', () => {
        reset();

        component.gip_build = false;
        component.disable_add_kit_button = true;
        const return_value: boolean = component.disabled_button_add_kit();

        expect(return_value).toBeTrue();
      });

      it('should call disabled_button_add_kit() and return true when gip_build = true and disable_add_kit_button = false', () => {
        reset();

        component.gip_build = false;
        component.disable_add_kit_button = false;
        const return_value: boolean = component.disabled_button_add_kit();

        expect(return_value).toBeTrue();
      });

      it('should call disabled_button_add_kit() and return false when gip_build = true and disable_add_kit_button = false', () => {
        reset();

        component.gip_build = true;
        component.disable_add_kit_button = false;
        const return_value: boolean = component.disabled_button_add_kit();

        expect(return_value).toBeFalse();
      });
    });

    describe('click_button_delete()', () => {
      it('should call click_button_delete()', () => {
        reset();

        component.click_button_delete(MockKitTokenClass);

        expect(component.click_button_delete).toHaveBeenCalled();
      });

      it('should call api_delete_kit_token_() from click_button_delete()', () => {
        reset();

        component.click_button_delete(MockKitTokenClass);

        expect(component['api_delete_kit_token_']).toHaveBeenCalled();
      });
    });

    describe('open_copy_token_dialog()', () => {
      it('should call open_copy_token_dialog()', () => {
        reset();

        component.open_copy_token_dialog(MockKitTokenClass);

        expect(component.open_copy_token_dialog).toHaveBeenCalled();
      });
    });

    describe('open_add_kit_token_dialog()', () => {
      it('should call open_add_kit_token_dialog()', () => {
        reset();

        component.open_add_kit_token_dialog();

        expect(component.open_add_kit_token_dialog).toHaveBeenCalled();
      });

      it('should call api_create_kit_token_() after mat_dialog_ref.afterClosed() from call open_add_kit_token_dialog()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(MockKitTokenInterface) } as MatDialogRef<typeof component>);

        component.open_add_kit_token_dialog();

        expect(component['api_create_kit_token_']).toHaveBeenCalled();
      });

      it('should not call api_create_kit_token_() after mat_dialog_ref.afterClosed() from call open_add_kit_token_dialog()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.open_add_kit_token_dialog();

        expect(component['api_create_kit_token_']).not.toHaveBeenCalled();
      });
    });

    describe('private api_get_kit_tokens_()', () => {
      it('should call api_get_kit_tokens_()', () => {
        reset();

        component['api_get_kit_tokens_']();

        expect(component['api_get_kit_tokens_']).toHaveBeenCalled();
      });

      it('should call kit_token_settings_service_.get_kit_tokens() from api_get_kit_tokens_()', () => {
        reset();

        component['api_get_kit_tokens_']();

        expect(component['kit_token_settings_service_'].get_kit_tokens).toHaveBeenCalled();
      });

      it('should kit_token_settings_service_.get_kit_tokens() and on success set kit_tokens = response', () => {
        reset();

        component['api_get_kit_tokens_']();

        expect(component.kit_tokens).toEqual([MockKitTokenClass]);
      });

      it('should call kit_token_settings_service_.get_kit_tokens() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_token_settings_service_'], 'get_kit_tokens').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_kit_tokens_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_token_settings_service_.get_kit_tokens() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_token_settings_service_'], 'get_kit_tokens').and.returnValue(throwError(mock_http_error_response));

        component['api_get_kit_tokens_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_create_kit_token_()', () => {
      it('should call api_create_kit_token_()', () => {
        reset();

        component['api_create_kit_token_'](MockKitTokenClass);

        expect(component['api_create_kit_token_']).toHaveBeenCalled();
      });

      it('should call kit_token_settings_service_.create_kit_token() from api_create_kit_token_()', () => {
        reset();

        component['api_create_kit_token_'](MockKitTokenClass);

        expect(component['kit_token_settings_service_'].create_kit_token).toHaveBeenCalled();
      });

      it('should kit_token_settings_service_.create_kit_token() and on success push response into kit_tokens', () => {
        reset();

        component.kit_tokens = [];
        component['api_create_kit_token_'](MockKitTokenClass);

        expect(component.kit_tokens.length > 0).toBeTrue();
      });

      it('should kit_token_settings_service_.create_kit_token() and on success and call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_create_kit_token_'](MockKitTokenClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_token_settings_service_.create_kit_token() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_token_settings_service_'], 'create_kit_token').and.returnValue(throwError(MockErrorMessageClass));

        component['api_create_kit_token_'](MockKitTokenClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_token_settings_service_.create_kit_token() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_token_settings_service_'], 'create_kit_token').and.returnValue(throwError(mock_http_error_response));

        component['api_create_kit_token_'](MockKitTokenClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_delete_kit_token_()', () => {
      it('should call api_delete_kit_token_()', () => {
        reset();

        component['api_delete_kit_token_'](MockKitTokenClass);

        expect(component['api_delete_kit_token_']).toHaveBeenCalled();
      });

      it('should call kit_token_settings_service_.delete_kit_token() from api_delete_kit_token_()', () => {
        reset();

        component['api_delete_kit_token_'](MockKitTokenClass);

        expect(component['kit_token_settings_service_'].delete_kit_token).toHaveBeenCalled();
      });

      it('should kit_token_settings_service_.delete_kit_token() and on success filter kit_token from kit_tokens', () => {
        reset();

        component.kit_tokens = [MockKitTokenClass];
        component['api_delete_kit_token_'](MockKitTokenClass);

        expect(component.kit_tokens.length === 0).toBeTrue();
      });

      it('should call kit_token_settings_service_.delete_kit_token() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_token_settings_service_'], 'delete_kit_token').and.returnValue(throwError(MockErrorMessageClass));

        component['api_delete_kit_token_'](MockKitTokenClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_token_settings_service_.delete_kit_token() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_token_settings_service_'], 'delete_kit_token').and.returnValue(throwError(mock_http_error_response));

        component['api_delete_kit_token_'](MockKitTokenClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

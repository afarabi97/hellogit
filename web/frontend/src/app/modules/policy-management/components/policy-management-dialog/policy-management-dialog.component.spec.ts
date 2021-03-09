import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as FileSaver from 'file-saver';
import { of, throwError } from 'rxjs';

import { MockRuleClass, MockRuleSetClass } from '../../../../../../static-data/class-objects-v3_6';
import {
  MockErrorMessageInterface,
  MockRuleInterface,
  MockRuleSetInterface
} from '../../../../../../static-data/interface-objects-v3_6';
import { ErrorMessageClass } from '../../../../classes';
import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION } from '../../../../constants/cvah.constants';
import { RulePCAPTestInterface } from '../../../../interfaces';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import { PolicyManagementModule } from '../../policy-management.module';
import { PolicyManagementDialogComponent } from './policy-management-dialog.component';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

interface MockFile {
  name: string;
  body: string;
  mimeType: string;
}

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

describe('PolicyManagementDialogComponent', () => {
  let component: PolicyManagementDialogComponent;
  let fixture: ComponentFixture<PolicyManagementDialogComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyIsRuleEnabled: jasmine.Spy<any>;
  let spySave: jasmine.Spy<any>;
  let spyClose: jasmine.Spy<any>;
  let spyTestRule: jasmine.Spy<any>;
  let spyValidate: jasmine.Spy<any>;
  let spyInitializeForm: jasmine.Spy<any>;
  let spySetRuleFormGroup: jasmine.Spy<any>;
  let spyCloseAndSave: jasmine.Spy<any>;
  let spyGetRuleData: jasmine.Spy<any>;
  let spyCloseEditor: jasmine.Spy<any>;
  let spyGetIsUserAdding: jasmine.Spy<any>;
  let spyApiGetPcaps: jasmine.Spy<any>;
  let spyApiGetRuleContent: jasmine.Spy<any>;
  let spyApiUpdateRule: jasmine.Spy<any>;
  let spyApiCreateRule: jasmine.Spy<any>;
  let spyApiTestRuleAgainstPcap: jasmine.Spy<any>;
  let spyApiValidateRule: jasmine.Spy<any>;

  // Test Data
  const create_mock_blob = (file: MockFile, message: boolean): Blob => {
    const blob = new Blob([file.body], { type: file.mimeType }) as any;
    blob['lastModifiedDate'] = new Date();
    blob['name'] = file.name;

    if (message) {
      blob['message'] = 'Fake Message';
    }

    return blob;
  };
  const rule_form_group: FormGroup = new FormGroup({
    ruleName: new FormControl(MockRuleInterface.ruleName),
    rule: new FormControl(MockRuleInterface.rule),
    isEnabled: new FormControl(MockRuleInterface.isEnabled),
    _id: new FormControl(MockRuleInterface._id),
    byPassValidation: new FormControl(MockRuleInterface.byPassValidation),
    rule_set_id: new FormControl(MockRuleInterface.rule_set_id)
  });
  // TODO - replace with actual mock pcap structure
  const pcap_data = {
    fake_data: 'Fake Pcap Data'
  };
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });
  const payload: RulePCAPTestInterface = {
    pcap_name: 'FakePCAPName',
    rule_content: MockRuleInterface.rule,
    ruleType: MockRuleSetInterface.appType
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        InjectorModule,
        PolicyManagementModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialog, useClass: MatDialogMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyManagementDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyIsRuleEnabled = spyOn(component, 'is_rule_enabled').and.callThrough();
    spySave = spyOn(component, 'save').and.callThrough();
    spyClose = spyOn(component, 'close').and.callThrough();
    spyTestRule = spyOn(component, 'test_rule').and.callThrough();
    spyValidate = spyOn(component, 'validate').and.callThrough();
    spyInitializeForm = spyOn<any>(component, 'initialize_form_').and.callThrough();
    spySetRuleFormGroup = spyOn<any>(component, 'set_rule_form_group_').and.callThrough();
    spyCloseAndSave = spyOn<any>(component, 'close_and_save_').and.callThrough();
    spyGetRuleData = spyOn<any>(component, 'get_rule_data_').and.callThrough();
    spyCloseEditor = spyOn<any>(component, 'close_editor_').and.callThrough();
    spyGetIsUserAdding = spyOn<any>(component, 'get_is_user_adding_').and.callThrough();
    spyApiGetPcaps = spyOn<any>(component, 'api_get_pcaps_').and.callThrough();
    spyApiGetRuleContent = spyOn<any>(component, 'api_get_rule_content_').and.callThrough();
    spyApiUpdateRule = spyOn<any>(component, 'api_update_rule_').and.callThrough();
    spyApiCreateRule = spyOn<any>(component, 'api_create_rule_').and.callThrough();
    spyApiTestRuleAgainstPcap = spyOn<any>(component, 'api_test_rule_against_pcap_').and.callThrough();
    spyApiValidateRule = spyOn<any>(component, 'api_validate_rule_').and.callThrough();

    // Add service spies
    spyOn<any>(component['pcap_service_'], 'get_pcaps').and.returnValue(of([pcap_data]));
    spyOn(FileSaver, 'saveAs').and.stub();

    // Set Test Data
    component['rules_service_'].set_edit_rule_set(MockRuleSetClass);

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyIsRuleEnabled.calls.reset();
    spySave.calls.reset();
    spyClose.calls.reset();
    spyTestRule.calls.reset();
    spyValidate.calls.reset();
    spyInitializeForm.calls.reset();
    spySetRuleFormGroup.calls.reset();
    spyCloseAndSave.calls.reset();
    spyGetRuleData.calls.reset();
    spyCloseEditor.calls.reset();
    spyGetIsUserAdding.calls.reset();
    spyApiGetPcaps.calls.reset();
    spyApiGetRuleContent.calls.reset();
    spyApiUpdateRule.calls.reset();
    spyApiCreateRule.calls.reset();
    spyApiTestRuleAgainstPcap.calls.reset();
    spyApiValidateRule.calls.reset();
  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create PolicyManagementDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('PolicyManagementDialogComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call get_is_user_adding_() from ngOnInit()', () => {
        reset();

        expect(component['get_is_user_adding_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['get_is_user_adding_']).toHaveBeenCalledTimes(1);
      });

      it('should call api_get_pcaps_() from ngOnInit()', () => {
        reset();

        expect(component['api_get_pcaps_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['api_get_pcaps_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('is_rule_enabled()', () => {
      it('should call is_rule_enabled()', () => {
        reset();

        component.is_rule_enabled();

        expect(component.is_rule_enabled).toHaveBeenCalled();
      });

      it('should call is_rule_enabled() and return boolean true', () => {
        reset();

        MockRuleInterface.isEnabled = true;

        component['initialize_form_'](MockRuleInterface);

        const return_value: boolean = component.is_rule_enabled();

        expect(return_value).toBeTrue();
      });

      it('should call is_rule_enabled() and return boolean false', () => {
        reset();

        MockRuleInterface.isEnabled = false;

        component['initialize_form_'](MockRuleInterface);

        const return_value: boolean = component.is_rule_enabled();

        expect(return_value).toBeFalse();
      });
    });

    describe('save()', () => {
      it('should call save()', () => {
        reset();

        component.save();

        expect(component.save).toHaveBeenCalled();
      });

      it('should call close_and_save_() after mat dialog ref closed from within save()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(rule_form_group) } as MatDialogRef<typeof component>);

        component.save();

        expect(component['close_and_save_']).toHaveBeenCalled();
      });

      it('should not call close_and_save_() after mat dialog ref closed from within save()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.save();

        expect(component['close_and_save_']).not.toHaveBeenCalled();
      });
    });

    describe('close()', () => {
      it('should call close()', () => {
        reset();

        component.close();

        expect(component.close).toHaveBeenCalled();
      });

      it('should call close_editor_() after mat dialog ref closed from within close()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.close();

        expect(component['close_editor_']).toHaveBeenCalled();
      });

      it('should not call close_editor_() after mat dialog ref closed from within close()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.close();

        expect(component['close_editor_']).not.toHaveBeenCalled();
      });
    });

    describe('test_rule()', () => {
      it('should call test_rule()', () => {
        reset();

        component.test_rule();

        expect(component.test_rule).toHaveBeenCalled();
      });

      it('should call rules_service_.get_edit_rule_set() from test_rule()', () => {
        reset();

        component['initialize_form_'](MockRuleInterface);
        component.test_rule();

        expect(component['rules_service_'].get_edit_rule_set).toHaveBeenCalled();
      });

      it('should call api_test_rule_against_pcap_() from test_rule()', () => {
        reset();

        expect(component['api_test_rule_against_pcap_']).toHaveBeenCalledTimes(0);

        component['initialize_form_'](MockRuleInterface);
        component.test_rule();

        expect(component['api_test_rule_against_pcap_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('validate()', () => {
      it('should call validate()', () => {
        reset();

        component.validate();

        expect(component.validate).toHaveBeenCalled();
      });

      it('should call get_rule_data_() from validate()', () => {
        reset();

        expect(component['get_rule_data_']).toHaveBeenCalledTimes(0);

        component['initialize_form_'](MockRuleInterface);
        component.validate();

        expect(component['get_rule_data_']).toHaveBeenCalledTimes(1);
      });

      it('should call api_validate_rule_() from validate()', () => {
        reset();

        expect(component['api_validate_rule_']).toHaveBeenCalledTimes(0);

        component['initialize_form_'](MockRuleInterface);
        component.validate();

        expect(component['api_validate_rule_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('private initialize_form_()', () => {
      it('should call initialize_form_()', () => {
        reset();

        component['initialize_form_'](MockRuleInterface);

        expect(component['initialize_form_']).toHaveBeenCalled();
      });

      it('should call set_rule_form_group_() from validate()', () => {
        reset();

        expect(component['set_rule_form_group_']).toHaveBeenCalledTimes(0);

        component['initialize_form_'](MockRuleInterface);

        expect(component['set_rule_form_group_']).toHaveBeenCalledTimes(1);
      });

      it('should call api_get_rule_content_() from validate()', () => {
        reset();

        expect(component['api_get_rule_content_']).toHaveBeenCalledTimes(0);

        component['initialize_form_'](MockRuleInterface);

        expect(component['api_get_rule_content_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('private set_rule_form_group_()', () => {
      it('should call set_rule_form_group_()', () => {
        reset();

        component['set_rule_form_group_'](rule_form_group);

        expect(component['set_rule_form_group_']).toHaveBeenCalled();
      });

      it('should call set_rule_form_group_() and set component.rule_form_group', () => {
        reset();

        component['set_rule_form_group_'](rule_form_group);

        expect(component.rule_form_group).toEqual(rule_form_group);
      });
    });

    describe('private close_and_save_()', () => {
      it('should call close_and_save_()', () => {
        reset();

        component['initialize_form_'](MockRuleInterface);
        component['close_and_save_']();

        expect(component['close_and_save_']).toHaveBeenCalled();
      });

      it('should call get_rule_data_() from close_and_save_()', () => {
        reset();

        component['initialize_form_'](MockRuleInterface);

        expect(component['get_rule_data_']).toHaveBeenCalledTimes(0);

        component['close_and_save_']();

        expect(component['get_rule_data_']).toHaveBeenCalledTimes(1);
      });

      it('should call api_update_rule_() from close_and_save_()', () => {
        reset();

        component['initialize_form_'](MockRuleInterface);
        component['user_adding_'] = false;

        expect(component['api_update_rule_']).toHaveBeenCalledTimes(0);

        component['close_and_save_']();

        expect(component['api_update_rule_']).toHaveBeenCalledTimes(1);
      });

      it('should call api_update_rule_() from close_and_save_()', () => {
        reset();

        component['initialize_form_'](MockRuleInterface);
        component['user_adding_'] = true;

        expect(component['api_create_rule_']).toHaveBeenCalledTimes(0);

        component['close_and_save_']();

        expect(component['api_create_rule_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('private get_rule_data_()', () => {
      it('should call get_rule_data_()', () => {
        reset();

        component['initialize_form_'](MockRuleInterface);
        component['get_rule_data_']();

        expect(component['get_rule_data_']).toHaveBeenCalled();
      });

      it('should call rules_service_.get_edit_rule_set() from get_rule_data_()', () => {
        reset();

        component['initialize_form_'](MockRuleInterface);
        component['get_rule_data_']();

        expect(component['rules_service_'].get_edit_rule_set).toHaveBeenCalled();
      });
    });

    describe('private close_editor_()', () => {
      it('should call close_editor_()', () => {
        reset();

        component['close_editor_']();

        expect(component['close_editor_']).toHaveBeenCalled();
      });

      it('should call rules_service_.set_is_user_editing() from close_editor_()', () => {
        reset();

        component['close_editor_']();

        expect(component['rules_service_'].set_is_user_editing).toHaveBeenCalled();
      });
    });

    describe('private get_is_user_adding_()', () => {
      it('should call get_is_user_adding_()', () => {
        reset();

        component['get_is_user_adding_']();

        expect(component['get_is_user_adding_']).toHaveBeenCalled();
      });

      it('should call get_is_user_adding_() and set component.user_adding_ = false', () => {
        reset();

        component['get_is_user_adding_']();

        expect(component['user_adding_']).toBeFalse();
      });

      it('should call get_is_user_adding_() and set component.user_adding_ = true', () => {
        reset();

        component['rules_service_'].set_is_user_adding(true);
        component['get_is_user_adding_']();

        expect(component['user_adding_']).toBeTrue();
      });

      it('should call rules_service_.get_edit_rule() when response false', () => {
        reset();

        component['get_is_user_adding_']();

        expect(component['rules_service_'].get_is_user_adding).toHaveBeenCalled();
      });

      it('should call initialize_form_() when response false and rule_form_group defined', () => {
        reset();

        component['get_is_user_adding_']();

        expect(component['initialize_form_']).toHaveBeenCalled();
      });

      it('should call initialize_form_() when response true and rule_form_group undefined', () => {
        reset();

        component.rule_form_group = undefined;
        component['rules_service_'].set_is_user_adding(true);
        component['get_is_user_adding_']();

        expect(component['initialize_form_']).toHaveBeenCalled();
      });

      it('should call initialize_form_() when response true', () => {
        reset();

        component['rules_service_'].set_is_user_adding(true);
        component['get_is_user_adding_']();

        expect(component['initialize_form_']).toHaveBeenCalled();
      });
    });

    describe('private api_get_pcaps_()', () => {
      it('should call api_get_pcaps_()', () => {
        reset();

        component['api_get_pcaps_']();

        expect(component['api_get_pcaps_']).toHaveBeenCalled();
      });

      it('should call pcap_service_.get_pcaps() from api_get_pcaps_()', () => {
        reset();

        component['api_get_pcaps_']();

        expect(component['pcap_service_'].get_pcaps).toHaveBeenCalled();
      });

      it('should call pcap_service_.get_pcaps() and set component.pcaps = response', () => {
        reset();

        component['api_get_pcaps_']();

        expect(component.pcaps.length).toEqual(1);
        expect(component.pcaps[0]).toEqual(pcap_data);
      });

      it('should call pcap_service_.get_pcaps() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['pcap_service_'], 'get_pcaps').and.returnValue(throwError(mock_http_error_response));
        component['api_get_pcaps_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_rule_content_()', () => {
      it('should call api_get_rule_content_()', () => {
        reset();

        component['api_get_rule_content_'](MockRuleInterface);

        expect(component['api_get_rule_content_']).toHaveBeenCalled();
      });

      it('should call rules_service_.get_rule_content() from api_get_rule_content_()', () => {
        reset();

        component['api_get_rule_content_'](MockRuleInterface);

        expect(component['rules_service_'].get_rule_content).toHaveBeenCalled();
      });

      it('should call rules_service_.get_rule_content() and set component.rule_form_group.rule value = response.rule', () => {
        reset();

        component['initialize_form_'](MockRuleInterface);
        component.rule_form_group.get('rule').setValue('');

        expect(component.rule_form_group.get('rule').value).toEqual('');

        component['api_get_rule_content_'](MockRuleInterface);

        expect(component.rule_form_group.get('rule').value).toEqual(MockRuleClass.rule);
      });

      it('should call rules_service_.get_rule_content() and handle unintended response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'get_rule_content').and.returnValue(of(null));

        component['api_get_rule_content_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.get_rule_content() and handle error response instanceof ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'get_rule_content').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_get_rule_content_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.get_rule_content() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'get_rule_content').and.returnValue(throwError(mock_http_error_response));

        component['api_get_rule_content_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_update_rule_()', () => {
      it('should call api_update_rule_()', () => {
        reset();

        component['api_update_rule_'](MockRuleInterface);

        expect(component['api_update_rule_']).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule() from api_update_rule_()', () => {
        reset();

        component['api_update_rule_'](MockRuleInterface);

        expect(component['rules_service_'].update_rule).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule() and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_update_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule() and call close_editor_()', () => {
        reset();

        expect(component['close_editor_']).toHaveBeenCalledTimes(0);

        component['api_update_rule_'](MockRuleInterface);

        expect(component['close_editor_']).toHaveBeenCalledTimes(1);
      });

      it('should call rules_service_.update_rule() and handle unintended response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'update_rule').and.returnValue(of(null));

        component['api_update_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule() and handle error response instanceof ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'update_rule').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_update_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'update_rule').and.returnValue(throwError(mock_http_error_response));

        component['api_update_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_create_rule_()', () => {
      it('should call api_create_rule_()', () => {
        reset();

        component['api_create_rule_'](MockRuleInterface);

        expect(component['api_create_rule_']).toHaveBeenCalled();
      });

      it('should call rules_service_.create_rule() from api_create_rule_()', () => {
        reset();

        component['api_create_rule_'](MockRuleInterface);

        expect(component['rules_service_'].create_rule).toHaveBeenCalled();
      });

      it('should call rules_service_.create_rule() and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_create_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.create_rule() and call close_editor_()', () => {
        reset();

        expect(component['close_editor_']).toHaveBeenCalledTimes(0);

        component['api_create_rule_'](MockRuleInterface);

        expect(component['close_editor_']).toHaveBeenCalledTimes(1);
      });

      it('should call rules_service_.create_rule() and handle unintended response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'create_rule').and.returnValue(of(null));

        component['api_create_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.create_rule() and handle error response instanceof ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'create_rule').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_create_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.create_rule() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'create_rule').and.returnValue(throwError(mock_http_error_response));

        component['api_create_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_test_rule_against_pcap_()', () => {
      it('should call api_test_rule_against_pcap_()', () => {
        reset();

        component['api_test_rule_against_pcap_'](payload);

        expect(component['api_test_rule_against_pcap_']).toHaveBeenCalled();
      });

      it('should call rules_service_.test_rule_against_pcap() from api_test_rule_against_pcap_()', () => {
        reset();

        component['api_test_rule_against_pcap_'](payload);

        expect(component['rules_service_'].test_rule_against_pcap).toHaveBeenCalled();
      });

      it('should call rules_service_.test_rule_against_pcap() and handle response.message', () => {
        reset();

        const mock_file: MockFile = {
          name: 'FakeFileName.zip',
          body: 'FakeFileBody',
          mimeType: 'application/zip'
        };

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'test_rule_against_pcap').and.returnValue(of(create_mock_blob(mock_file, true)));

        component['api_test_rule_against_pcap_'](payload);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.test_rule_against_pcap() and handle response.type = application/tar+gzip', () => {
        reset();

        const mock_file: MockFile = {
          name: 'FakeFileName.zip',
          body: 'FakeFileBody',
          mimeType: 'application/tar+gzip'
        };

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'test_rule_against_pcap').and.returnValue(of(create_mock_blob(mock_file, false)));

        component['api_test_rule_against_pcap_'](payload);

        expect(FileSaver.saveAs).toHaveBeenCalled();
      });

      it('should call rules_service_.test_rule_against_pcap() and handle response.type = application/zip', () => {
        reset();

        const mock_file: MockFile = {
          name: 'FakeFileName.zip',
          body: 'FakeFileBody',
          mimeType: 'application/zip'
        };

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'test_rule_against_pcap').and.returnValue(of(create_mock_blob(mock_file, false)));

        component['api_test_rule_against_pcap_'](payload);

        expect(FileSaver.saveAs).toHaveBeenCalled();
      });

      it('should call rules_service_.test_rule_against_pcap() and handle response.type = application/json', () => {
        reset();

        const mock_file: MockFile = {
          name: 'FakeFileName.zip',
          body: 'FakeFileBody',
          mimeType: 'application/json'
        };

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'test_rule_against_pcap').and.returnValue(of(create_mock_blob(mock_file, false)));

        component['api_test_rule_against_pcap_'](payload);

        expect(FileSaver.saveAs).toHaveBeenCalled();
      });

      it('should call rules_service_.test_rule_against_pcap() and handle error.status = 501', () => {
        reset();

        const mock_http_error_response_501: HttpErrorResponse = new HttpErrorResponse({
            error: 'Fake Error',
          status: 501,
          statusText: 'Internal Server Error',
          url: 'http://fake-url'
        });

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'test_rule_against_pcap').and.returnValue(throwError(mock_http_error_response_501));

        component['api_test_rule_against_pcap_'](payload);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.test_rule_against_pcap() and handle error.error message', () => {
        reset();

        const mock_http_error_response_500: HttpErrorResponse = new HttpErrorResponse({
          error: 'Fake Error',
          status: 500,
          statusText: 'Internal Server Error',
          url: 'http://fake-url'
        });

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'test_rule_against_pcap').and.returnValue(throwError(mock_http_error_response_500));

        component['api_test_rule_against_pcap_'](payload);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.test_rule_against_pcap() and handle error.error.error_message', () => {
        reset();

        const mock_http_error_response_500: HttpErrorResponse = new HttpErrorResponse({
          error: {
            error_message: 'Fake Error'
          },
          status: 500,
          statusText: 'Internal Server Error',
          url: 'http://fake-url'
        });

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'test_rule_against_pcap').and.returnValue(throwError(mock_http_error_response_500));

        component['api_test_rule_against_pcap_'](payload);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.test_rule_against_pcap() and handle unintended error', () => {
        reset();

        const mock_http_error_response_alt: HttpErrorResponse = new HttpErrorResponse({
          status: 500,
          statusText: 'Internal Server Error',
          url: 'http://fake-url'
        });

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'test_rule_against_pcap').and.returnValue(throwError(mock_http_error_response_alt));

        component['api_test_rule_against_pcap_'](payload);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_validate_rule_()', () => {
      it('should call api_validate_rule_()', () => {
        reset();

        component['api_validate_rule_'](MockRuleInterface);

        expect(component['api_validate_rule_']).toHaveBeenCalled();
      });

      it('should call rules_service_.validate_rule() from api_validate_rule_()', () => {
        reset();

        component['api_validate_rule_'](MockRuleInterface);

        expect(component['rules_service_'].validate_rule).toHaveBeenCalled();
      });

      it('should call rules_service_.validate_rule() and handle response instanceof SuccessMessageClass', () => {
        reset();

        component['api_validate_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.validate_rule() and handle unintended response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'validate_rule').and.returnValue(of(null));

        component['api_validate_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.validate_rule() and handle error response instanceof ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'validate_rule').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_validate_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.validate_rule() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'validate_rule').and.returnValue(throwError(mock_http_error_response));

        component['api_validate_rule_'](MockRuleInterface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { throwError } from 'rxjs';

import { MockErrorMessageClass } from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockRepoSettingsSnapshotInterface } from '../../../../../../static-data/interface-objects';
import { COMMON_VALIDATORS } from '../../../../constants/cvah.constants';
import { validateFromArray } from '../../../../validators/generic-validators.validator';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import { ToolsModule } from '../../tools.module';
import { RepositorySettingsComponent } from './repository-settings.component';

describe('RepositorySettingsComponent', () => {
  let component: RepositorySettingsComponent;
  let fixture: ComponentFixture<RepositorySettingsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyUpdateButtonClick: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyInititalizeRepositorySettingsFormGroup: jasmine.Spy<any>;
  let spySetRepositorySettingsFormGroup: jasmine.Spy<any>;
  let spySetupWebsocketOnbroadcast: jasmine.Spy<any>;
  let spyApiRepoSettingsSnapshot: jasmine.Spy<any>;

  // Test Data
  const error_message_form_control: FormControl = new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  error_message_form_control.markAsTouched();
  const form_control: FormControl = new FormControl('test', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  form_control.markAsTouched();
  const repository_settings_keys: string[] = Object.keys(MockRepoSettingsSnapshotInterface);
  const repository_settings_form_group: FormGroup = new FormGroup({});
  repository_settings_keys.forEach((key: string) => {
    repository_settings_form_group.addControl(key, new FormControl(MockRepoSettingsSnapshotInterface[key]));
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
        InjectorModule,
        ToolsModule,
        TestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepositorySettingsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyUpdateButtonClick = spyOn(component, 'update_button_click').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyInititalizeRepositorySettingsFormGroup = spyOn<any>(component, 'initialize_repository_settings_form_group_').and.callThrough();
    spySetRepositorySettingsFormGroup = spyOn<any>(component, 'set_repositiry_settings_form_group_').and.callThrough();
    spySetupWebsocketOnbroadcast = spyOn<any>(component, 'setup_websocket_onbroadcast_').and.callThrough();
    spyApiRepoSettingsSnapshot = spyOn<any>(component, 'api_repo_settings_snapshot_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyUpdateButtonClick.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyInititalizeRepositorySettingsFormGroup.calls.reset();
    spySetRepositorySettingsFormGroup.calls.reset();
    spySetupWebsocketOnbroadcast.calls.reset();
    spyApiRepoSettingsSnapshot.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create RepositorySettingsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('RepositorySettingsComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call setup_websocket_onbroadcast_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['setup_websocket_onbroadcast_']).toHaveBeenCalled();
      });

      it('should call initialize_repository_settings_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_repository_settings_form_group_']).toHaveBeenCalled();
      });
    });

    describe('update_button_click()', () => {
      it('should call update_button_click()', () => {
        reset();

        component.repository_settings_form_group = repository_settings_form_group;
        component.update_button_click();

        expect(component.update_button_click).toHaveBeenCalled();
      });

      it('should call update_button_click() and set component.update_allowed = false', () => {
        reset();

        component.update_allowed = true;
        component.repository_settings_form_group = repository_settings_form_group;
        component.update_button_click();

        expect(component.update_allowed).toBeFalse();
      });

      it('should call api_repo_settings_snapshot_() from update_button_click()', () => {
        reset();

        component.repository_settings_form_group = repository_settings_form_group;
        component.update_button_click();

        expect(component['api_repo_settings_snapshot_']).toHaveBeenCalled();
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

    describe('private initialize_repository_settings_form_group_()', () => {
      it('should call initialize_repository_settings_form_group_()', () => {
        reset();

        component['initialize_repository_settings_form_group_']();

        expect(component['initialize_repository_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call set_repositiry_settings_form_group_() from initialize_repository_settings_form_group_()', () => {
        reset();

        component['initialize_repository_settings_form_group_']();

        expect(component['set_repositiry_settings_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private set_repositiry_settings_form_group_()', () => {
      it('should call set_repositiry_settings_form_group_()', () => {
        reset();

        component['set_repositiry_settings_form_group_'](repository_settings_form_group);

        expect(component['set_repositiry_settings_form_group_']).toHaveBeenCalled();
      });

      it('should call set_repositiry_settings_form_group_() and set repository_settings_form_group with passed value', () => {
        reset();

        component['set_repositiry_settings_form_group_'](repository_settings_form_group);

        expect(component.repository_settings_form_group).toEqual(repository_settings_form_group);
      });
    });

    // TODO - Update when websocket has been flushed out
    describe('private setup_websocket_onbroadcast_()', () => {
      it('should call setup_websocket_onbroadcast_()', () => {
        reset();

        component['setup_websocket_onbroadcast_']();

        expect(component['setup_websocket_onbroadcast_']).toHaveBeenCalled();
      });
    });

    describe('private api_repo_settings_snapshot_()', () => {
      it('should call api_repo_settings_snapshot_()', () => {
        reset();

        component['api_repo_settings_snapshot_'](MockRepoSettingsSnapshotInterface);

        expect(component['api_repo_settings_snapshot_']).toHaveBeenCalled();
      });

      it('should call tools_service_.repo_settings_snapshot() from api_repo_settings_snapshot_()', () => {
        reset();

        component['api_repo_settings_snapshot_'](MockRepoSettingsSnapshotInterface);

        expect(component['tools_service_'].repo_settings_snapshot).toHaveBeenCalled();
      });

      it('should call tools_service_.repo_settings_snapshot() and handle response and call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_repo_settings_snapshot_'](MockRepoSettingsSnapshotInterface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call tools_service_.repo_settings_snapshot() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'repo_settings_snapshot').and.returnValue(throwError(MockErrorMessageClass));

        component['api_repo_settings_snapshot_'](MockRepoSettingsSnapshotInterface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call tools_service_.repo_settings_snapshot() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'repo_settings_snapshot').and.returnValue(throwError(mock_http_error_response));

        component['api_repo_settings_snapshot_'](MockRepoSettingsSnapshotInterface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

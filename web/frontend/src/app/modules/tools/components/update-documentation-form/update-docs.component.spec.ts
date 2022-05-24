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
import { UpdateDocsFormComponent } from './update-docs.component';

interface MockFile {
  name: string;
  body: string;
  mimeType: string;
}

const create_file_from_mock_file = (file: MockFile): File => {
  const blob = new Blob([file.body], { type: file.mimeType }) as any;
  blob['lastModifiedDate'] = new Date();
  blob['name'] = file.name;

  return blob as File;
};

const create_mock_file_list = (files: MockFile[]) => {
  const file_list: FileList = {
    length: files.length,
    item(index: number): File {
      return file_list[index];
    }
  };
  files.forEach((file, index) => file_list[index] = create_file_from_mock_file(file));

  return file_list;
};

describe('UpdateDocsFormComponent', () => {
  let component: UpdateDocsFormComponent;
  let fixture: ComponentFixture<UpdateDocsFormComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyOpenUpdateDocumentationMessageDialog: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyUploadButtonClick: jasmine.Spy<any>;
  let spyHandleZipFileInput: jasmine.Spy<any>;
  let spyInitializeSpaceNameFormControl: jasmine.Spy<any>;
  let spyInitializeFileNameFormControl: jasmine.Spy<any>;
  let spySetSpaceNameFormControl: jasmine.Spy<any>;
  let spySetFileNameFormControl: jasmine.Spy<any>;
  let spyApiUploadDocumentation: jasmine.Spy<any>;

  // Test Data
  const error_message_form_control: FormControl = new FormControl('', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  error_message_form_control.markAsTouched();
  const form_control: FormControl = new FormControl('test', Validators.compose([validateFromArray(COMMON_VALIDATORS.required)]));
  form_control.markAsTouched();
  const generic_form_control: FormControl = new FormControl('');
  generic_form_control.markAsTouched();
  const repository_settings_keys: string[] = Object.keys(MockRepoSettingsSnapshotInterface);
  const repository_settings_form_group: FormGroup = new FormGroup({});
  repository_settings_keys.forEach((key: string) => {
    repository_settings_form_group.addControl(key, new FormControl(MockRepoSettingsSnapshotInterface[key]));
  });
  const mock_file: MockFile = {
    name: 'FakeFileName.zip',
    body: 'FakeFileBody',
    mimeType: 'application/zip'
  };
  const mock_file_list: FileList = create_mock_file_list([mock_file]);
  const zip_upload_form_data: FormData = new FormData();
  zip_upload_form_data.append('upload_file', create_file_from_mock_file(mock_file), mock_file.name);
  zip_upload_form_data.append('upload_file', 'test');
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
    fixture = TestBed.createComponent(UpdateDocsFormComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyOpenUpdateDocumentationMessageDialog = spyOn(component, 'open_update_documentation_message_dialog').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyUploadButtonClick = spyOn(component, 'upload_button_click').and.callThrough();
    spyHandleZipFileInput = spyOn(component, 'handle_zip_file_input').and.callThrough();
    spyInitializeSpaceNameFormControl = spyOn<any>(component, 'initialize_space_name_form_control_').and.callThrough();
    spyInitializeFileNameFormControl = spyOn<any>(component, 'initialize_file_name_form_control_').and.callThrough();
    spySetSpaceNameFormControl = spyOn<any>(component, 'set_space_name_form_control_').and.callThrough();
    spySetFileNameFormControl = spyOn<any>(component, 'set_file_name_form_control_').and.callThrough();
    spyApiUploadDocumentation = spyOn<any>(component, 'api_upload_documentation_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyOpenUpdateDocumentationMessageDialog.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyUploadButtonClick.calls.reset();
    spyHandleZipFileInput.calls.reset();
    spyInitializeSpaceNameFormControl.calls.reset();
    spyInitializeFileNameFormControl.calls.reset();
    spySetSpaceNameFormControl.calls.reset();
    spySetFileNameFormControl.calls.reset();
    spyApiUploadDocumentation.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create UpdateDocsFormComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('UpdateDocsFormComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_space_name_form_control_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_space_name_form_control_']).toHaveBeenCalled();
      });

      it('should call initialize_file_name_form_control_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_file_name_form_control_']).toHaveBeenCalled();
      });
    });

    describe('open_update_documentation_message_dialog()', () => {
      it('should call open_update_documentation_message_dialog()', () => {
        reset();

        component.open_update_documentation_message_dialog();

        expect(component.open_update_documentation_message_dialog).toHaveBeenCalled();
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

    describe('upload_button_click()', () => {
      it('should call upload_button_click()', () => {
        reset();

        component.zip_for_upload = create_file_from_mock_file(mock_file);
        component.space_name_form_control = new FormControl('Test');
        component.upload_button_click();

        expect(component.upload_button_click).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from upload_button_click()', () => {
        reset();

        component.zip_for_upload = create_file_from_mock_file(mock_file);
        component.space_name_form_control = new FormControl('Test');
        component.upload_button_click();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call api_upload_documentation_() from upload_button_click()', () => {
        reset();

        component.zip_for_upload = create_file_from_mock_file(mock_file);
        component.space_name_form_control = new FormControl('Test');
        component.upload_button_click();

        expect(component['api_upload_documentation_']).toHaveBeenCalled();
      });
    });

    describe('handle_zip_file_input()', () => {
      it('should call handle_zip_file_input()', () => {
        reset();

        component.handle_zip_file_input(mock_file_list);

        expect(component.handle_zip_file_input).toHaveBeenCalled();
      });

      it('should call handle_zip_file_input() and set component.zip_for_upload from pased file list', () => {
        reset();

        component.handle_zip_file_input(mock_file_list);

        expect(component.zip_for_upload).toBeDefined();
      });

      it('should call handle_zip_file_input() and set component.file_name_form_control from component.zip_for_upload.name', () => {
        reset();

        component.handle_zip_file_input(mock_file_list);

        expect(component.file_name_form_control.value).toEqual(component.zip_for_upload.name);
      });
    });

    describe('private initialize_space_name_form_control_()', () => {
      it('should call initialize_space_name_form_control_()', () => {
        reset();

        component['initialize_space_name_form_control_']();

        expect(component['initialize_space_name_form_control_']).toHaveBeenCalled();
      });

      it('should call set_space_name_form_control_() from set_space_name_form_control_()', () => {
        reset();

        component['initialize_space_name_form_control_']();

        expect(component['set_space_name_form_control_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_file_name_form_control_()', () => {
      it('should call initialize_file_name_form_control_()', () => {
        reset();

        component['initialize_file_name_form_control_']();

        expect(component['initialize_file_name_form_control_']).toHaveBeenCalled();
      });

      it('should call set_file_name_form_control_() from initialize_file_name_form_control_()', () => {
        reset();

        component['initialize_file_name_form_control_']();

        expect(component['set_file_name_form_control_']).toHaveBeenCalled();
      });
    });

    describe('private set_space_name_form_control_()', () => {
      it('should call set_space_name_form_control_()', () => {
        reset();

        component['set_space_name_form_control_'](generic_form_control);

        expect(component['set_space_name_form_control_']).toHaveBeenCalled();
      });

      it('should call set_space_name_form_control_() and set space_name_form_control with passed value', () => {
        reset();

        component['set_space_name_form_control_'](generic_form_control);

        expect(component.space_name_form_control).toEqual(generic_form_control);
      });
    });

    describe('private set_file_name_form_control_()', () => {
      it('should call set_file_name_form_control_()', () => {
        reset();

        component['set_file_name_form_control_'](generic_form_control);

        expect(component['set_file_name_form_control_']).toHaveBeenCalled();
      });

      it('should call set_file_name_form_control_() and set file_name_form_control with passed value', () => {
        reset();

        component['set_file_name_form_control_'](generic_form_control);

        expect(component.file_name_form_control).toEqual(generic_form_control);
      });
    });

    describe('private api_upload_documentation_()', () => {
      it('should call api_upload_documentation_()', () => {
        reset();

        component['api_upload_documentation_'](zip_upload_form_data);

        expect(component['api_upload_documentation_']).toHaveBeenCalled();
      });

      it('should call tools_service_.upload_documentation() from api_upload_documentation_()', () => {
        reset();

        component['api_upload_documentation_'](zip_upload_form_data);

        expect(component['tools_service_'].upload_documentation).toHaveBeenCalled();
      });

      it('should call tools_service_.upload_documentation() and handle response and set component.zip_for_upload = null', () => {
        reset();

        component.zip_for_upload = create_file_from_mock_file(mock_file);
        component['api_upload_documentation_'](zip_upload_form_data);

        expect(component.zip_for_upload).toBeNull();
      });

      it('should call tools_service_.upload_documentation() and handle response and reset component.space_name_form_control', () => {
        reset();

        component.space_name_form_control = new FormControl('Test');
        component['api_upload_documentation_'](zip_upload_form_data);

        expect(component.space_name_form_control.value).toBeNull();
      });

      it('should call tools_service_.upload_documentation() and handle response and reset component.file_name_form_control', () => {
        reset();

        component.file_name_form_control = new FormControl('Test');
        component['api_upload_documentation_'](zip_upload_form_data);

        expect(component.file_name_form_control.value).toBeNull();
      });

      it('should call tools_service_.upload_documentation() and handle response and call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_upload_documentation_'](zip_upload_form_data);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call tools_service_.upload_documentation() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'upload_documentation').and.returnValue(throwError(MockErrorMessageClass));

        component['api_upload_documentation_'](zip_upload_form_data);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call tools_service_.upload_documentation() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'upload_documentation').and.returnValue(throwError(mock_http_error_response));

        component['api_upload_documentation_'](zip_upload_form_data);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

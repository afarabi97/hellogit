import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { throwError } from 'rxjs';

import { MockElasticLicenseClass, MockErrorMessageClass } from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import * as mock_elastic_license from '../../../../../../static-data/json/elastic_license_for_test.json';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import { ToolsModule } from '../../tools.module';
import { UpdateEsLicenseComponent } from './update-es-license-form.component';

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

describe('UpdateEsLicenseComponent', () => {
  let component: UpdateEsLicenseComponent;
  let fixture: ComponentFixture<UpdateEsLicenseComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyUploadButtonClick: jasmine.Spy<any>;
  let spyHandleJsonFileInput: jasmine.Spy<any>;
  let spyInitializeFileNameFormControl: jasmine.Spy<any>;
  let spySetFileNameFormControl: jasmine.Spy<any>;
  let spyApiGetElasticLicense: jasmine.Spy<any>;
  let spyApiUploadElasticLicense: jasmine.Spy<any>;

  // Test Data
  const generic_form_control: FormControl = new FormControl('');
  generic_form_control.markAsTouched();

  const mock_file: MockFile = {
    name: 'FakeFileName.json',
    body: JSON.stringify(mock_elastic_license),
    mimeType: 'application/json'
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
    fixture = TestBed.createComponent(UpdateEsLicenseComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyUploadButtonClick = spyOn(component, 'upload_button_click').and.callThrough();
    spyHandleJsonFileInput = spyOn(component, 'handle_json_file_input').and.callThrough();
    spyInitializeFileNameFormControl = spyOn<any>(component, 'initialize_file_name_form_control_').and.callThrough();
    spySetFileNameFormControl = spyOn<any>(component, 'set_file_name_form_control_').and.callThrough();
    spyApiGetElasticLicense = spyOn<any>(component, 'api_get_elastic_license_').and.callThrough();
    spyApiUploadElasticLicense = spyOn<any>(component, 'api_upload_elastic_license_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyUploadButtonClick.calls.reset();
    spyHandleJsonFileInput.calls.reset();
    spyInitializeFileNameFormControl.calls.reset();
    spySetFileNameFormControl.calls.reset();
    spyApiGetElasticLicense.calls.reset();
    spyApiUploadElasticLicense.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create UpdateEsLicenseComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('UpdateEsLicenseComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_file_name_form_control_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_file_name_form_control_']).toHaveBeenCalled();
      });

      it('should call api_get_elastic_license_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_elastic_license_']).toHaveBeenCalled();
      });
    });

    describe('upload_button_click()', () => {
      it('should call upload_button_click()', () => {
        reset();

        component.json_for_upload = create_file_from_mock_file(mock_file);
        component.upload_button_click();

        expect(component.upload_button_click).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from upload_button_click()', () => {
        reset();

        component.json_for_upload = create_file_from_mock_file(mock_file);
        component.upload_button_click();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });
    });

    describe('handle_json_file_input()', () => {
      it('should call handle_json_file_input()', () => {
        reset();

        component.handle_json_file_input(mock_file_list);

        expect(component.handle_json_file_input).toHaveBeenCalled();
      });

      it('should call handle_json_file_input() and set component.json_for_upload from pased file list', () => {
        reset();

        component.handle_json_file_input(mock_file_list);

        expect(component.json_for_upload).toBeDefined();
      });

      it('should call handle_zip_file_input() and set component.file_name_form_control from component.json_for_upload.name', () => {
        reset();

        component.handle_json_file_input(mock_file_list);

        expect(component.file_name_form_control.value).toEqual(component.json_for_upload.name);
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

    describe('private api_get_elastic_license_()', () => {
      it('should call api_get_elastic_license_()', () => {
        reset();

        component['api_get_elastic_license_']();

        expect(component['api_get_elastic_license_']).toHaveBeenCalled();
      });

      it('should call tools_service_.get_elastic_license() from api_get_elastic_license_()', () => {
        reset();

        component['api_get_elastic_license_']();

        expect(component['tools_service_'].get_elastic_license).toHaveBeenCalled();
      });

      it('should call tools_service_.get_elastic_license() and handle response and set component.elastic_license = response', () => {
        reset();

        component['api_get_elastic_license_']();

        expect(component.elastic_license).toEqual(MockElasticLicenseClass);
      });

      it('should call tools_service_.get_elastic_license() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'get_elastic_license').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_elastic_license_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call tools_service_.get_elastic_license() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'get_elastic_license').and.returnValue(throwError(mock_http_error_response));

        component['api_get_elastic_license_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_upload_elastic_license_()', () => {
      it('should call api_upload_elastic_license_()', () => {
        reset();

        component['api_upload_elastic_license_'](mock_elastic_license);

        expect(component['api_upload_elastic_license_']).toHaveBeenCalled();
      });

      it('should call tools_service_.upload_elastic_license() from api_upload_elastic_license_()', () => {
        reset();

        component['api_upload_elastic_license_'](mock_elastic_license);

        expect(component['tools_service_'].upload_elastic_license).toHaveBeenCalled();
      });

      it('should call tools_service_.upload_elastic_license() and handle response and set component.json_for_upload = null', () => {
        reset();

        component.json_for_upload = create_file_from_mock_file(mock_file);
        component['api_upload_elastic_license_'](mock_elastic_license);

        expect(component.json_for_upload).toBeNull();
      });

      it('should call tools_service_.upload_elastic_license() and handle response and reset component.file_name_form_control', () => {
        reset();

        component.file_name_form_control = new FormControl('Test');
        component['api_upload_elastic_license_'](mock_elastic_license);

        expect(component.file_name_form_control.value).toBeNull();
      });

      it('should call tools_service_.upload_elastic_license() and handle response and call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_upload_elastic_license_'](mock_elastic_license);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call tools_service_.upload_elastic_license() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'upload_elastic_license').and.returnValue(throwError(MockErrorMessageClass));

        component['api_upload_elastic_license_'](mock_elastic_license);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call tools_service_.upload_elastic_license() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['tools_service_'], 'upload_elastic_license').and.returnValue(throwError(mock_http_error_response));

        component['api_upload_elastic_license_'](mock_elastic_license);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

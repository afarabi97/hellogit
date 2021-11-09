import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import {
  MockErrorMessageClass,
  MockFilebeatModuleClassApache,
  MockFilebeatModuleClassWindowsEventLogs,
  MockStatusClass_LogstashDeployed,
  MockWinlogbeatConfigurationClass,
  MockWinlogbeatConfigurationClassDefault
} from '../../../../static-data/class-objects';
import { TestingModule } from '../testing-modules/testing.module';
import { InjectorModule } from '../utilily-modules/injector.module';
import { ColdLogIngestComponent } from './cold-log-ingest.component';
import { ElasticsearchColdLogIngestModule } from './elasticsearch-cold-log-ingest.module';

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

describe('ColdLogIngestComponent', () => {
  let component: ColdLogIngestComponent;
  let fixture: ComponentFixture<ColdLogIngestComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyFileInputChange: jasmine.Spy<any>;
  let spyUpload: jasmine.Spy<any>;
  let spyIsFileSetsEmpty: jasmine.Spy<any>;
  let spyModuleChange: jasmine.Spy<any>;
  let spySetupWinlogbeat: jasmine.Spy<any>;
  let spyInitializeFormGroup: jasmine.Spy<any>;
  let spySetFormGroup: jasmine.Spy<any>;
  let spyInitializeFormControl: jasmine.Spy<any>;
  let spySetFormControl: jasmine.Spy<any>;
  let spyOpenWinlogbeatSetupDialog: jasmine.Spy<any>;
  let spyApiPostColdLogFile: jasmine.Spy<any>;
  let spyApiGetWinlogbeatConfiguration: jasmine.Spy<any>;
  let spyApiPostWinlogbeat: jasmine.Spy<any>;
  let spyApiGetModuleInfo: jasmine.Spy<any>;
  let spyApiCheckLogstashInstalled: jasmine.Spy<any>;

  // Test Error
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  // Test Data
  const mock_file: MockFile = {
    name: 'FakeFileName.zip',
    body: 'FakeFileBody',
    mimeType: 'application/zip'
  };
  const mock_file_list: FileList = create_mock_file_list([mock_file]);
  const mock_module_select: MatSelectChange = new MatSelectChange(null, MockFilebeatModuleClassApache.value);
  const cold_log_file: File = create_file_from_mock_file(mock_file);
  const cold_log_form: FormGroup = new FormGroup({
    module: new FormControl(''),
    index_suffix: new FormControl('cold-log'),
    send_to_logstash: new FormControl(false),
    file_set: new FormControl('')
  });
  const mock_form_control: FormControl = new FormControl('fake');
  const winlogbeat_form_group: FormGroup = new FormGroup({});
  const winlogbeat_configuration_keys: string[] = Object.keys(MockWinlogbeatConfigurationClass);
  winlogbeat_configuration_keys.forEach((k: string) => {
    winlogbeat_form_group.addControl(k, new FormControl(MockWinlogbeatConfigurationClass[k]));
  });
  winlogbeat_form_group.markAllAsTouched();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        InjectorModule,
        ElasticsearchColdLogIngestModule,
        TestingModule
      ],
      providers: [
        Title,
        { provide: MatDialog, useClass: MatDialogMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColdLogIngestComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyFileInputChange = spyOn(component, 'file_input_change').and.callThrough();
    spyUpload = spyOn(component, 'upload').and.callThrough();
    spyIsFileSetsEmpty = spyOn(component, 'is_file_sets_empty').and.callThrough();
    spyModuleChange = spyOn(component, 'module_change').and.callThrough();
    spySetupWinlogbeat = spyOn(component, 'setup_winlogbeat').and.callThrough();
    spyInitializeFormGroup = spyOn<any>(component, 'initialize_form_group_').and.callThrough();
    spySetFormGroup = spyOn<any>(component, 'set_form_group_').and.callThrough();
    spyInitializeFormControl = spyOn<any>(component, 'initialize_form_control_').and.callThrough();
    spySetFormControl = spyOn<any>(component, 'set_form_control_').and.callThrough();
    spyOpenWinlogbeatSetupDialog = spyOn<any>(component, 'open_winlogbeat_setup_dialog_').and.callThrough();
    spyApiPostColdLogFile = spyOn<any>(component, 'api_post_cold_log_file').and.callThrough();
    spyApiGetWinlogbeatConfiguration = spyOn<any>(component, 'api_get_winlogbeat_configuration_').and.callThrough();
    spyApiPostWinlogbeat = spyOn<any>(component, 'api_post_winlogbeat_').and.callThrough();
    spyApiGetModuleInfo = spyOn<any>(component, 'api_get_module_info_').and.callThrough();
    spyApiCheckLogstashInstalled = spyOn<any>(component, 'api_check_logstash_installed_').and.callThrough();

    // Set spyon service until implemented later
    spyOn<any>(component['catalog_service_'], 'checkLogStashInstalled').and.returnValue(of([MockStatusClass_LogstashDeployed]));

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyFileInputChange.calls.reset();
    spyUpload.calls.reset();
    spyIsFileSetsEmpty.calls.reset();
    spyModuleChange.calls.reset();
    spySetupWinlogbeat.calls.reset();
    spyInitializeFormGroup.calls.reset();
    spySetFormGroup.calls.reset();
    spyInitializeFormControl.calls.reset();
    spySetFormControl.calls.reset();
    spyOpenWinlogbeatSetupDialog.calls.reset();
    spyApiPostColdLogFile.calls.reset();
    spyApiGetWinlogbeatConfiguration.calls.reset();
    spyApiPostWinlogbeat.calls.reset();
    spyApiGetModuleInfo.calls.reset();
    spyApiCheckLogstashInstalled.calls.reset();
  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create ColdLogIngestComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ColdLogIngestComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_form_group_']).toHaveBeenCalled();
      });

      it('should call initialize_form_control_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_form_control_']).toHaveBeenCalled();
      });

      it('should call api_get_module_info_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_module_info_']).toHaveBeenCalled();
      });

      it('should call api_check_logstash_installed_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_check_logstash_installed_']).toHaveBeenCalled();
      });
    });

    describe('file_input_change()', () => {
      it('should call file_input_change()', () => {
        reset();

        component.file_input_change(mock_file_list);

        expect(component.file_input_change).toHaveBeenCalled();
      });

      it('should call file_input_change() and set cold log file from passed value', () => {
        reset();

        component.file_input_change(mock_file_list);

        expect(component.cold_log_file).toEqual(mock_file_list.item(0));
      });

      it('should call file_input_change() and set file_name_form_control from passed file.name', () => {
        reset();

        component.file_input_change(mock_file_list);

        expect(component.file_name_form_control.value).toEqual(mock_file_list.item(0).name);
      });
    });

    describe('upload()', () => {
      it('should call upload()', () => {
        reset();

        component.cold_log_file = cold_log_file;
        component.cold_log_ingest_form_group = cold_log_form;
        component.upload();

        expect(component.upload).toHaveBeenCalled();
      });

      it('should call api_post_cold_log_file() from upload()', () => {
        reset();

        component.cold_log_file = cold_log_file;
        component.cold_log_ingest_form_group = cold_log_form;
        component.upload();

        expect(component['api_post_cold_log_file']).toHaveBeenCalled();
      });
    });

    describe('is_file_sets_empty()', () => {
      it('should call is_file_sets_empty()', () => {
        reset();

        component.is_file_sets_empty();

        expect(component.is_file_sets_empty).toHaveBeenCalled();
      });

      it('should call is_file_sets_empty() and return true', () => {
        reset();

        component.file_sets = MockFilebeatModuleClassWindowsEventLogs.filesets;
        const return_value: boolean = component.is_file_sets_empty();

        expect(return_value).toBeTrue();
      });

      it('should call is_file_sets_empty() and return false', () => {
        reset();

        component.file_sets = MockFilebeatModuleClassApache.filesets;
        const return_value: boolean = component.is_file_sets_empty();

        expect(return_value).toBeFalse();
      });
    });

    describe('module_change()', () => {
      it('should call module_change()', () => {
        reset();

        component.module_change(mock_module_select);

        expect(component.module_change).toHaveBeenCalled();
      });

      it('should call module_change() and and set file sets to event selected module file sets', () => {
        reset();

        component.file_sets = [];
        component.module_change(mock_module_select);

        expect(component.file_sets).toEqual(MockFilebeatModuleClassApache.filesets);
      });
    });

    describe('setup_winlogbeat()', () => {
      it('should call setup_winlogbeat()', () => {
        reset();

        component.setup_winlogbeat();

        expect(component.setup_winlogbeat).toHaveBeenCalled();
      });

      it('should call api_get_winlogbeat_configuration_() from setup_winlogbeat()', () => {
        reset();

        component.setup_winlogbeat();

        expect(component['api_get_winlogbeat_configuration_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_form_group_()', () => {
      it('should call initialize_form_group_()', () => {
        reset();

        component['initialize_form_group_']();

        expect(component['initialize_form_group_']).toHaveBeenCalled();
      });

      it('should call set_form_group_() from initialize_form_group_()', () => {
        reset();

        component['initialize_form_group_']();

        expect(component['set_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private set_form_group_()', () => {
      it('should call set_form_group_()', () => {
        reset();

        component['set_form_group_'](cold_log_form);

        expect(component['set_form_group_']).toHaveBeenCalled();
      });

      it('should call set_form_group_() and set cold_log_ingest_form_group = passed form group', () => {
        reset();

        component['set_form_group_'](cold_log_form);

        const form_group_keys: string[] = Object.keys(cold_log_form.value);
        form_group_keys.forEach((k: string) => {
          expect(component.cold_log_ingest_form_group.get(k).value).toEqual(cold_log_form.get(k).value);
        });
      });
    });

    describe('private initialize_form_control_()', () => {
      it('should call initialize_form_control_()', () => {
        reset();

        component['initialize_form_control_']();

        expect(component['initialize_form_control_']).toHaveBeenCalled();
      });

      it('should call set_form_control_() from initialize_form_control_()', () => {
        reset();

        component['initialize_form_control_']();

        expect(component['set_form_control_']).toHaveBeenCalled();
      });
    });

    describe('private set_form_control_()', () => {
      it('should call set_form_control_()', () => {
        reset();

        component['set_form_control_'](mock_form_control);

        expect(component['set_form_control_']).toHaveBeenCalled();
      });

      it('should call set_form_control_() and set file_name_form_control = passed form control', () => {
        reset();

        component['set_form_control_'](mock_form_control);

        expect(component.file_name_form_control.value).toEqual(mock_form_control.value);
      });
    });

    describe('private open_winlogbeat_setup_dialog_()', () => {
      it('should call open_winlogbeat_setup_dialog_()', () => {
        reset();

        // Used default so it gets into else ternary operators
        component['open_winlogbeat_setup_dialog_'](MockWinlogbeatConfigurationClassDefault);

        expect(component['open_winlogbeat_setup_dialog_']).toHaveBeenCalled();
      });

      it('should call api_post_winlogbeat_() after mat dialog ref closed from within open_winlogbeat_setup_dialog_(), note: component.status = true', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(winlogbeat_form_group) } as MatDialogRef<typeof component>);

        component['open_winlogbeat_setup_dialog_'](MockWinlogbeatConfigurationClass);

        expect(component['api_post_winlogbeat_']).toHaveBeenCalled();
      });
    });

    describe('private api_post_cold_log_file()', () => {
      it('should call api_post_cold_log_file()', () => {
        reset();

        component.cold_log_file = cold_log_file;
        component.cold_log_ingest_form_group = cold_log_form;
        component['api_post_cold_log_file']();

        expect(component['api_post_cold_log_file']).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.post_cold_log_file() from api_post_cold_log_file()', () => {
        reset();

        component.cold_log_file = cold_log_file;
        component.cold_log_ingest_form_group = cold_log_form;
        component['api_post_cold_log_file']();

        expect(component['cold_log_ingest_service_'].post_cold_log_file).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.post_cold_log_file() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component.cold_log_file = cold_log_file;
        component.cold_log_ingest_form_group = cold_log_form;
        component['api_post_cold_log_file']();

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.post_cold_log_file() and handle error response instanceof ErrorMessageClass for enabling_rule_set = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['cold_log_ingest_service_'], 'post_cold_log_file').and.returnValue(throwError(MockErrorMessageClass));

        component['api_post_cold_log_file']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.post_cold_log_file() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['cold_log_ingest_service_'], 'post_cold_log_file').and.returnValue(throwError(mock_http_error_response));

        component['api_post_cold_log_file']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_winlogbeat_configuration_()', () => {
      it('should call api_get_winlogbeat_configuration_()', () => {
        reset();

        component['api_get_winlogbeat_configuration_']();

        expect(component['api_get_winlogbeat_configuration_']).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.get_winlogbeat_configuration() from api_get_winlogbeat_configuration_()', () => {
        reset();

        component['api_get_winlogbeat_configuration_']();

        expect(component['cold_log_ingest_service_'].get_winlogbeat_configuration).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.get_winlogbeat_configuration() and handle response and call open_winlogbeat_setup_dialog_()', () => {
        reset();

        component['api_get_winlogbeat_configuration_']();

        expect(component['open_winlogbeat_setup_dialog_']).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.get_winlogbeat_configuration() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['cold_log_ingest_service_'], 'get_winlogbeat_configuration').and.returnValue(throwError(mock_http_error_response));

        component['api_get_winlogbeat_configuration_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_post_winlogbeat_()', () => {
      it('should call api_post_winlogbeat_()', () => {
        reset();

        component['api_post_winlogbeat_'](winlogbeat_form_group);

        expect(component['api_post_winlogbeat_']).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.post_winlogbeat() from api_post_winlogbeat_()', () => {
        reset();

        component['api_post_winlogbeat_'](winlogbeat_form_group);

        expect(component['cold_log_ingest_service_'].post_winlogbeat).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.post_winlogbeat() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_post_winlogbeat_'](winlogbeat_form_group);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.post_winlogbeat() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['cold_log_ingest_service_'], 'post_winlogbeat').and.returnValue(throwError(mock_http_error_response));

        component['api_post_winlogbeat_'](winlogbeat_form_group);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_module_info_()', () => {
      it('should call api_get_module_info_()', () => {
        reset();

        component['api_get_module_info_']();

        expect(component['api_get_module_info_']).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.get_module_info() from api_get_module_info_()', () => {
        reset();

        component['api_get_module_info_']();

        expect(component['cold_log_ingest_service_'].get_module_info).toHaveBeenCalled();
      });

      it('should call cold_log_ingest_service_.get_module_info() and handle response and set component.modules = response', () => {
        reset();

        component['api_get_module_info_']();

        expect(component.modules.length > 0).toBeTrue();
      });

      it('should call cold_log_ingest_service_.get_module_info() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['cold_log_ingest_service_'], 'get_module_info').and.returnValue(throwError(mock_http_error_response));

        component['api_get_module_info_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_check_logstash_installed_()', () => {
      it('should call api_check_logstash_installed_()', () => {
        reset();

        component['api_check_logstash_installed_']();

        expect(component['api_check_logstash_installed_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.checkLogStashInstalled() from api_check_logstash_installed_()', () => {
        reset();

        component['api_check_logstash_installed_']();

        expect(component['catalog_service_'].checkLogStashInstalled).toHaveBeenCalled();
      });

      it('should call catalog_service_.checkLogStashInstalled() and handle response and set logstash_deployed = true', () => {
        reset();

        component['api_check_logstash_installed_']();

        expect(component.logstash_deployed).toBeTrue();
      });

      it('should call catalog_service_.checkLogStashInstalled() and handle response and set logstash_deployed = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'checkLogStashInstalled').and.returnValue(of([]));

        component['api_check_logstash_installed_']();

        expect(component.logstash_deployed).toBeFalse();
      });

      it('should call catalog_service_.checkLogStashInstalled() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'checkLogStashInstalled').and.returnValue(throwError(mock_http_error_response));

        component['api_check_logstash_installed_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

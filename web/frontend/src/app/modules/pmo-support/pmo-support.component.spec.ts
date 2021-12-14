import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import * as FileSaver from 'file-saver';
import { of, throwError } from 'rxjs';

import { MockGenericJobAndKeyClass, MockSystemVersionClass } from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { WebsocketService } from '../../services/websocket.service';
import { TestingModule } from '../testing-modules/testing.module';
import { PmoSupportComponent } from './pmo-support.component';
import { PmoSupportModule } from './pmo-support.module';

class MockSocket {
  getSocket() {
    return {'on': () => {}};
  }
}

interface MockFile {
  name: string;
  body: string;
  mimeType: string;
}

const create_mock_blob = (file: MockFile): Blob => {
  const blob = new Blob([file.body], { type: file.mimeType }) as any;
  blob['lastModifiedDate'] = new Date();
  blob['name'] = file.name;

  return blob;
};

describe('PmoSupportComponent', () => {
  let component: PmoSupportComponent;
  let fixture: ComponentFixture<PmoSupportComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyIsSystemVersionDefined: jasmine.Spy<any>;
  let spyIsRunningDiagnosticsScriptDefined: jasmine.Spy<any>;
  let spyIsDiagnosticsDownloadProgressDefined: jasmine.Spy<any>;
  let spyIsDiagnosticsJobIdDefined: jasmine.Spy<any>;
  let spyDiagnostics: jasmine.Spy<any>;
  let spySetupWebsocketDiagnosticsFinished: jasmine.Spy<any>;
  let spyApiGetSystemVersion: jasmine.Spy<any>;
  let spyApiDiagnostics: jasmine.Spy<any>;
  let spyApiDownloadDiagnostics: jasmine.Spy<any>;

  // Test Data
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });
  const mock_file: MockFile = {
    name: 'FakeFileName.zip',
    body: 'FakeFileBody',
    mimeType: 'application/zip'
  };
  const mock_blob: Blob = create_mock_blob(mock_file);
  const mock_http_event_type_response: HttpResponse<any> = new HttpResponse({ body: mock_blob });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        PmoSupportModule,
        TestingModule
      ],
      providers: [
        { provide: WebsocketService, useClass: MockSocket }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PmoSupportComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyIsSystemVersionDefined = spyOn(component, 'is_system_version_defined').and.callThrough();
    spyIsRunningDiagnosticsScriptDefined = spyOn(component, 'is_running_diagnostics_script_defined').and.callThrough();
    spyIsDiagnosticsDownloadProgressDefined = spyOn(component, 'is_diagnostics_download_progress_defined').and.callThrough();
    spyIsDiagnosticsJobIdDefined = spyOn(component, 'is_diagnostics_job_id_defined').and.callThrough();
    spyDiagnostics = spyOn(component, 'diagnostics').and.callThrough();
    spySetupWebsocketDiagnosticsFinished = spyOn<any>(component, 'setup_websocket_diagnostics_finished_').and.callThrough();
    spyApiGetSystemVersion = spyOn<any>(component, 'api_get_system_version_').and.callThrough();
    spyApiDiagnostics = spyOn<any>(component, 'api_diagnostics_').and.callThrough();
    spyApiDownloadDiagnostics = spyOn<any>(component, 'api_download_diagnostics_').and.callThrough();

    // Add service spies
    spyOn(FileSaver, 'saveAs').and.stub();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyIsSystemVersionDefined.calls.reset();
    spyIsRunningDiagnosticsScriptDefined.calls.reset();
    spyIsDiagnosticsDownloadProgressDefined.calls.reset();
    spyIsDiagnosticsJobIdDefined.calls.reset();
    spyDiagnostics.calls.reset();
    spySetupWebsocketDiagnosticsFinished.calls.reset();
    spyApiGetSystemVersion.calls.reset();
    spyApiDiagnostics.calls.reset();
    spyApiDownloadDiagnostics.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create PmoSupportComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('PmoSupportComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call setup_websocket_diagnostics_finished_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['setup_websocket_diagnostics_finished_']).toHaveBeenCalled();
      });

      it('should call api_get_system_version_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_system_version_']).toHaveBeenCalled();
      });
    });

    describe('is_system_version_defined()', () => {
      it('should call is_system_version_defined()', () => {
        reset();

        component.is_system_version_defined();

        expect(component.is_system_version_defined).toHaveBeenCalled();
      });

      it('should call is_system_version_defined() and return true', () => {
        reset();

        component.system_version = MockSystemVersionClass;
        const return_value: boolean = component.is_system_version_defined();

        expect(return_value).toBeTrue();
      });

      it('should call is_system_version_defined() and return false', () => {
        reset();

        component.system_version = null;
        const return_value: boolean = component.is_system_version_defined();

        expect(return_value).toBeFalse();
      });
    });

    describe('is_running_diagnostics_script_defined()', () => {
      it('should call is_running_diagnostics_script_defined()', () => {
        reset();

        component.is_running_diagnostics_script_defined();

        expect(component.is_running_diagnostics_script_defined).toHaveBeenCalled();
      });

      it('should call is_running_diagnostics_script_defined() and return true', () => {
        reset();

        component.running_diagnostics_script = true;
        const return_value: boolean = component.is_running_diagnostics_script_defined();

        expect(return_value).toBeTrue();
      });

      it('should call is_running_diagnostics_script_defined() and return false', () => {
        reset();

        component.running_diagnostics_script = null;
        const return_value: boolean = component.is_running_diagnostics_script_defined();

        expect(return_value).toBeFalse();
      });
    });

    describe('is_diagnostics_download_progress_defined()', () => {
      it('should call is_diagnostics_download_progress_defined()', () => {
        reset();

        component.is_diagnostics_download_progress_defined();

        expect(component.is_diagnostics_download_progress_defined).toHaveBeenCalled();
      });

      it('should call is_diagnostics_download_progress_defined() and return true', () => {
        reset();

        component.diagnostics_download_progress = 90;
        const return_value: boolean = component.is_diagnostics_download_progress_defined();

        expect(return_value).toBeTrue();
      });

      it('should call is_diagnostics_download_progress_defined() and return false', () => {
        reset();

        component.diagnostics_download_progress = null;
        const return_value: boolean = component.is_diagnostics_download_progress_defined();

        expect(return_value).toBeFalse();
      });
    });

    describe('is_diagnostics_job_id_defined()', () => {
      it('should call is_diagnostics_job_id_defined()', () => {
        reset();

        component.is_diagnostics_job_id_defined();

        expect(component.is_diagnostics_job_id_defined).toHaveBeenCalled();
      });

      it('should call is_diagnostics_job_id_defined() and return true', () => {
        reset();

        component.diagnostics_job_id = '1';
        const return_value: boolean = component.is_diagnostics_job_id_defined();

        expect(return_value).toBeTrue();
      });

      it('should call is_diagnostics_job_id_defined() and return false', () => {
        reset();

        component.diagnostics_job_id = null;
        const return_value: boolean = component.is_diagnostics_job_id_defined();

        expect(return_value).toBeFalse();
      });
    });

    describe('diagnostics()', () => {
      it('should call diagnostics()', () => {
        reset();

        component.diagnostics();

        expect(component.diagnostics).toHaveBeenCalled();
      });

      it('should call api_diagnostics_() from diagnostics()', () => {
        reset();

        component.diagnostics();

        expect(component['api_diagnostics_']).toHaveBeenCalled();
      });
    });

    // TODO - Update when websocket has been flushed out
    describe('private setup_websocket_diagnostics_finished_()', () => {
      it('should call setup_websocket_diagnostics_finished_()', () => {
        reset();

        component['setup_websocket_diagnostics_finished_']();

        expect(component['setup_websocket_diagnostics_finished_']).toHaveBeenCalled();
      });
    });

    describe('private api_get_system_version_()', () => {
      it('should call api_get_system_version_()', () => {
        reset();

        component['api_get_system_version_']();

        expect(component['api_get_system_version_']).toHaveBeenCalled();
      });

      it('should call system_version_service_.get_system_version() from api_diagnostics_()', () => {
        reset();

        component['api_get_system_version_']();

        expect(component['system_version_service_'].get_system_version).toHaveBeenCalled();
      });

      it('should call api_get_system_version_() and set component.system_version', () => {
        reset();

        component['api_get_system_version_']();

        expect(component.system_version).toEqual(MockSystemVersionClass);
      });

      it('should call system_version_service_.get_system_version() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['system_version_service_'], 'get_system_version').and.returnValue(throwError(mock_http_error_response));

        component['api_get_system_version_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_diagnostics_()', () => {
      it('should call api_diagnostics_()', () => {
        reset();

        component['api_diagnostics_']();

        expect(component['api_diagnostics_']).toHaveBeenCalled();
      });

      it('should call diagnostics_service_.diagnostics() from api_diagnostics_()', () => {
        reset();

        component['api_diagnostics_']();

        expect(component['diagnostics_service_'].diagnostics).toHaveBeenCalled();
      });

      it('should call diagnostics_service_.diagnostics() and handle response and set diagnostics_job_id', () => {
        reset();

        component.diagnostics_job_id = null;

        expect (component.diagnostics_job_id).toBeNull();

        component['api_diagnostics_']();

        expect(component.diagnostics_job_id).toEqual(MockGenericJobAndKeyClass.job_id);
      });

      it('should call diagnostics_service_.diagnostics() and handle response and set running_diagnostics_script = true', () => {
        reset();

        component.running_diagnostics_script = null;

        expect (component.running_diagnostics_script).toBeNull();

        component['api_diagnostics_']();

        expect(component.running_diagnostics_script).toBeTrue();
      });

      it('should call diagnostics_service_.diagnostics() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['diagnostics_service_'], 'diagnostics').and.returnValue(throwError(mock_http_error_response));

        component['api_diagnostics_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_download_diagnostics_()', () => {
      it('should call api_download_diagnostics_()', () => {
        reset();

        component.diagnostics_job_id = '1';
        component['api_download_diagnostics_']();

        expect(component['api_download_diagnostics_']).toHaveBeenCalled();
      });

      it('should call diagnostics_service_.download_diagnostics() from api_download_diagnostics_()', () => {
        reset();

        component.diagnostics_job_id = '1';
        component['api_download_diagnostics_']();

        expect(component['diagnostics_service_'].download_diagnostics).toHaveBeenCalled();
      });

      it('should call diagnostics_service_.download_diagnostics() and handle response.type = DownloadProgress, and set diagnostics_download_progress', () => {
        reset();

        // service call by default will return download progress

        component.diagnostics_job_id = '1';
        component['api_download_diagnostics_']();

        expect(component.diagnostics_download_progress).toBeDefined();
      });

      it('should call diagnostics_service_.download_diagnostics() and handle response.type = Response, and call saveAs', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['diagnostics_service_'], 'download_diagnostics').and.returnValue(of(mock_http_event_type_response));

        component.diagnostics_job_id = '1';
        component['api_download_diagnostics_']();

        expect(FileSaver.saveAs).toHaveBeenCalled();
      });

      it('should call diagnostics_service_.download_diagnostics() and handle response.type = Response, and set diagnostics_job_id = null', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['diagnostics_service_'], 'download_diagnostics').and.returnValue(of(mock_http_event_type_response));

        component.diagnostics_job_id = '1';
        component['api_download_diagnostics_']();

        expect(component.diagnostics_job_id).toBeNull();
      });

      it('should call diagnostics_service_.download_diagnostics() and handle response.type = Response, and set diagnostics_download_progress = null', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['diagnostics_service_'], 'download_diagnostics').and.returnValue(of(mock_http_event_type_response));

        component.diagnostics_job_id = '1';
        component.diagnostics_download_progress = 90;
        component['api_download_diagnostics_']();

        expect(component.diagnostics_download_progress).toBeNull();
      });

      it('should call diagnostics_service_.download_diagnostics() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['diagnostics_service_'], 'download_diagnostics').and.returnValue(throwError(mock_http_error_response));

        component.diagnostics_job_id = '1';
        component['api_download_diagnostics_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

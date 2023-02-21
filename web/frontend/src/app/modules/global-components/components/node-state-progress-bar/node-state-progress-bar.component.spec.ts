import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { MockErrorMessageClass, MockNodeServerClass } from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { JobClass } from '../../../../classes';
import { CANCEL, COMPLETE, ERROR, IN_PROGRESS, PENDING, UNKNOWN } from '../../../../constants/cvah.constants';
import { MipManagementComponent } from '../../../../modules/mip-mng/mip-mng.component';
import { NodeManagementComponent } from '../../../../modules/node-mng/node-mng.component';
import { TestingModule } from '../../../testing-modules/testing.module';
import {
  CHECK_CIRCLE,
  RADIO_BUTTON_CHECKED,
  RETRY,
  RETRY_DISABLED,
  TIMELAPSE
} from '../../constants/global-components.constant';
import { GlobalComponentsModule } from '../../global-components.module';
import { NodeStateProgressBarComponent } from './node-state-progress-bar.component';

describe('NodeStateProgressBarComponent', () => {
  let component: NodeStateProgressBarComponent;
  let fixture: ComponentFixture<NodeStateProgressBarComponent>;

  // Setup spy references
  let spyGetClasses: jasmine.Spy<any>;
  let spyGetStatus: jasmine.Spy<any>;
  let spyClickJobState: jasmine.Spy<any>;
  let spyGetIcon: jasmine.Spy<any>;
  let spyValidateDropDownJob: jasmine.Spy<any>;
  let spyOpenJobServerStdOutConsole: jasmine.Spy<any>;
  let retry_button_tooltip: jasmine.Spy<any>;
  let spyRetry: jasmine.Spy<any>;
  let spyCloseDropDown: jasmine.Spy<any>;
  let spyApiJobRetry: jasmine.Spy<any>;

  // Test Data
  const job_error: JobClass = {
    error: true,
    complete: false,
    inprogress: false,
    pending: false
  } as JobClass;
  const job_complete: JobClass = {
    error: false,
    complete: true,
    inprogress: false,
    pending: false
  } as JobClass;
  const job_inprogress: JobClass = {
    error: false,
    complete: false,
    inprogress: true,
    pending: false
  } as JobClass;
  const job_pending: JobClass = {
    error: false,
    complete: false,
    inprogress: false,
    pending: true
  } as JobClass;
  const job_unknown: JobClass = {
    error: false,
    complete: false,
    inprogress: false,
    pending: false
  } as JobClass;
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        GlobalComponentsModule,
        TestingModule
      ],
      providers: [
        MipManagementComponent,
        NodeManagementComponent
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeStateProgressBarComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyGetClasses = spyOn(component, 'get_classes').and.callThrough();
    spyGetStatus = spyOn(component, 'get_status').and.callThrough();
    spyClickJobState = spyOn(component, 'click_job_state').and.callThrough();
    spyGetIcon = spyOn(component, 'get_icon').and.callThrough();
    spyValidateDropDownJob = spyOn(component, 'validate_drop_down_job').and.callThrough();
    spyOpenJobServerStdOutConsole = spyOn(component, 'open_job_server_std_out_console').and.callThrough();
    retry_button_tooltip = spyOn(component, 'retry_button_tooltip').and.callThrough();
    spyRetry = spyOn(component, 'retry').and.callThrough();
    spyCloseDropDown = spyOn<any>(component, 'close_drop_down_').and.callThrough();
    spyApiJobRetry = spyOn<any>(component, 'api_job_retry_').and.callThrough();

    // Extra Spies
    spyOn<any>(component['node_management_component_'], 'open_job_server_std_out_console').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyGetClasses.calls.reset();
    spyGetStatus.calls.reset();
    spyClickJobState.calls.reset();
    spyGetIcon.calls.reset();
    spyValidateDropDownJob.calls.reset();
    spyOpenJobServerStdOutConsole.calls.reset();
    retry_button_tooltip.calls.reset();
    spyRetry.calls.reset();
    spyCloseDropDown.calls.reset();
    spyApiJobRetry.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create NodeStateProgressBarComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('NodeStateProgressBarComponent methods', () => {
    describe('get_classes()', () => {
      it('should call get_classes()', () => {
        reset();

        component.get_classes(job_error);

        expect(component.get_classes).toHaveBeenCalled();
      });

      it('should call get_classes() and return string array with job status included', () => {
        reset();

        const return_value: string[] = component.get_classes(job_error);

        expect(return_value.includes(ERROR.toLowerCase())).toBeTrue();
      });
    });

    describe('get_status()', () => {
      it('should call get_status()', () => {
        reset();

        component.get_status(job_error);

        expect(component.get_status).toHaveBeenCalled();
      });

      it('should call get_status() and return ERROR', () => {
        reset();

        const return_value: string = component.get_status(job_error);

        expect(return_value).toEqual(ERROR);
      });

      it('should call get_status() and return COMPLETE', () => {
        reset();

        const return_value: string = component.get_status(job_complete);

        expect(return_value).toEqual(COMPLETE);
      });

      it('should call get_status() and return IN_PROGRESS', () => {
        reset();

        const return_value: string = component.get_status(job_inprogress);

        expect(return_value).toEqual(IN_PROGRESS);
      });

      it('should call get_status() and return PENDING', () => {
        reset();

        const return_value: string = component.get_status(job_pending);

        expect(return_value).toEqual(PENDING);
      });

      it('should call get_status() and return UNKNOWN', () => {
        reset();

        const return_value: string = component.get_status(job_unknown);

        expect(return_value).toEqual(UNKNOWN);
      });
    });

    describe('click_job_state()', () => {
      it('should call click_job_state()', () => {
        reset();

        component.click_job_state(MockNodeServerClass.jobs[0]);

        expect(component.click_job_state).toHaveBeenCalled();
      });

      it('should call click_job_state() and set toggle_drop_down = !toggle_drop_down', () => {
        reset();

        component.toggle_drop_down = true;
        component.click_job_state(MockNodeServerClass.jobs[0]);

        expect(component.toggle_drop_down).toBeFalse();
      });

      it('should call click_job_state() and set current_toggle_job_ = empty string', () => {
        reset();

        component['current_toggle_job_'] = MockNodeServerClass.jobs[0]._id;
        component.toggle_drop_down = true;
        component.click_job_state(MockNodeServerClass.jobs[0]);

        expect(component['current_toggle_job_']).toEqual('');
      });

      it('should call click_job_state() and set current_toggle_job_ = job._id', () => {
        reset();

        component['current_toggle_job_'] = '';
        component.toggle_drop_down = false;
        component.click_job_state(MockNodeServerClass.jobs[0]);

        expect(component['current_toggle_job_']).toEqual(MockNodeServerClass.jobs[0]._id);
      });
    });

    describe('get_icon()', () => {
      it('should call get_icon()', () => {
        reset();

        component.get_icon(job_error);

        expect(component.get_icon).toHaveBeenCalled();
      });

      it('should call get_icon() and return CANCEL', () => {
        reset();

        const return_value: string = component.get_icon(job_error);

        expect(return_value).toEqual(CANCEL);
      });

      it('should call get_icon() and return CHECK_CIRCLE', () => {
        reset();

        const return_value: string = component.get_icon(job_complete);

        expect(return_value).toEqual(CHECK_CIRCLE);
      });

      it('should call get_icon() and return TIMELAPSE', () => {
        reset();

        const return_value: string = component.get_icon(job_inprogress);

        expect(return_value).toEqual(TIMELAPSE);
      });

      it('should call get_icon() and return RADIO_BUTTON_CHECKED', () => {
        reset();

        const return_value: string = component.get_icon(job_pending);

        expect(return_value).toEqual(RADIO_BUTTON_CHECKED);
      });
    });

    describe('validate_drop_down_job()', () => {
      it('should call validate_drop_down_job()', () => {
        reset();

        component.validate_drop_down_job(MockNodeServerClass.jobs[0]);

        expect(component.validate_drop_down_job).toHaveBeenCalled();
      });

      it('should call validate_drop_down_job() and return false', () => {
        reset();

        const return_value: boolean = component.validate_drop_down_job(MockNodeServerClass.jobs[0]);

        expect(return_value).toBeFalse();
      });

      it('should call validate_drop_down_job() and return true', () => {
        reset();

        component['current_toggle_job_'] = MockNodeServerClass.jobs[0]._id;
        const return_value: boolean = component.validate_drop_down_job(MockNodeServerClass.jobs[0]);

        expect(return_value).toBeTrue();
      });
    });

    describe('open_job_server_std_out_console()', () => {
      it('should call open_job_server_std_out_console()', () => {
        reset();

        component.open_job_server_std_out_console(new JobClass({} as any));

        expect(component.open_job_server_std_out_console).toHaveBeenCalled();
      });

      it('should call node_management_component_.open_job_server_std_out_console() from open_job_server_std_out_console()', () => {
        reset();

        component.open_job_server_std_out_console(MockNodeServerClass.jobs[0]);

        expect(component['node_management_component_'].open_job_server_std_out_console).toHaveBeenCalled();
      });
    });

    describe('retry_button_tooltip()', () => {
      it('should call retry_button_tooltip()', () => {
        reset();

        component.retry_button_tooltip(job_error);

        expect(component.retry_button_tooltip).toHaveBeenCalled();
      });

      it('should call retry_button_tooltip() and return RETRY_DISABLED', () => {
        reset();

        const return_value: string = component.retry_button_tooltip(job_error);

        expect(return_value).toEqual(RETRY_DISABLED);
      });

      it('should call retry_button_tooltip() and return RETRY', () => {
        reset();

        const return_value: string = component.retry_button_tooltip(job_complete);

        expect(return_value).toEqual(RETRY);
      });
    });

    describe('retry()', () => {
      it('should call retry()', () => {
        reset();

        component.retry(MockNodeServerClass.jobs[0]);

        expect(component.retry).toHaveBeenCalled();
      });

      it('should call api_job_retry_() from retry()', () => {
        reset();

        component.retry(MockNodeServerClass.jobs[0]);

        expect(component['api_job_retry_']).toHaveBeenCalled();
      });
    });

    describe('private close_drop_down_()', () => {
      it('should call close_drop_down_()', () => {
        reset();

        component['close_drop_down_']();

        expect(component['close_drop_down_']).toHaveBeenCalled();
      });

      it('should call close_drop_down_() and set toggle_drop_down = false', () => {
        reset();

        component.toggle_drop_down = true;
        component['close_drop_down_']();

        expect(component.toggle_drop_down).toBeFalse();
      });
    });

    describe('private api_job_retry_()', () => {
      it('should call api_job_retry_()', () => {
        reset();

        component['api_job_retry_'](MockNodeServerClass.jobs[0]);

        expect(component['api_job_retry_']).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_retry() from api_job_retry_()', () => {
        reset();

        component['api_job_retry_'](MockNodeServerClass.jobs[0]);

        expect(component['global_job_service_'].job_retry).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_retry() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_job_retry_'](MockNodeServerClass.jobs[0]);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_retry() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_retry').and.returnValue(throwError(MockErrorMessageClass));

        component['api_job_retry_'](MockNodeServerClass.jobs[0]);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call global_job_service_.job_retry() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_job_service_'], 'job_retry').and.returnValue(throwError(mock_http_error_response));

        component['api_job_retry_'](MockNodeServerClass.jobs[0]);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

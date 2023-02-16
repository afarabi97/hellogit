import { HttpErrorResponse } from '@angular/common/http';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { throwError } from 'rxjs';

import {
  MockDescribePodNodeClass,
  MockErrorMessageClass,
  MockKitTokenClass,
  MockKitTokenClassAlt,
  MockPodLogClassArray,
  MockPodStatusClassArray
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockPodMetricsInterface } from '../../../../../../static-data/interface-objects';
import {
  POD_STATUS_VALUES,
  RUNNING,
  STATE_REASON,
  STATUS_COMPLETED,
  STATUS_CONTAINER_CREATING,
  STATUS_ERROR,
  STATUS_FAILED,
  STATUS_NOT_READY,
  STATUS_PENDING,
  STATUS_RUNNING,
  STATUS_SUCCEEDED,
  STATUS_TERMINATING,
  STATUS_UNKNOWN,
  TERMINATED,
  WAITING
} from '../../../../constants/cvah.constants';
import {
  ModalDialogDisplayMatComponent
} from '../../../global-components/components/modal-dialog-display-mat/modal-dialog-display-mat.component';
import { TestingModule } from '../../../testing-modules/testing.module';
import { COLUMN_DEFINITIONS_PODS } from '../../constants/health-dashboard.constant';
import { HealthDashboardModule } from '../../health-dashboard.module';
import { ColumnDefinitionsInterface, GroupDataInterface } from '../../interfaces';
import { HealthDashboardPodTableComponent } from './pod-table.component';

describe('HealthDashboardPodTableComponent', () => {
  let component: HealthDashboardPodTableComponent;
  let fixture: ComponentFixture<HealthDashboardPodTableComponent>;

  // Setup spy references
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyPodDisplayedCols: jasmine.Spy<any>;
  let spyTogglePodsCard: jasmine.Spy<any>;
  let spyDescribePod: jasmine.Spy<any>;
  let spyPodLogs: jasmine.Spy<any>;
  let spySetExpandedGroup: jasmine.Spy<any>;
  let spyGetGroup: jasmine.Spy<any>;
  let spyGetContainerStatus: jasmine.Spy<any>;
  let spyReload: jasmine.Spy<any>;
  let spyGenerateGroups: jasmine.Spy<any>;
  let spyGenerateGroupStatus: jasmine.Spy<any>;
  let spyGetPodIconStatus: jasmine.Spy<any>;
  let spyIsPodErrorState: jasmine.Spy<any>;
  let spyOpenDialogWindow: jasmine.Spy<any>;
  let spyOpenPodLogsDialogWindow: jasmine.Spy<any>;
  let spyApiDescribePod: jasmine.Spy<any>;
  let spyApiPodLogs: jasmine.Spy<any>;
  let spyApiGetPodStatus: jasmine.Spy<any>;

  // Test Data
  const simple_changes: SimpleChanges = new Object() as SimpleChanges;
  const options_simple_change: SimpleChange = new SimpleChange(null, MockKitTokenClassAlt, true);
  simple_changes['token'] = options_simple_change;
  const simple_changes_alt: SimpleChanges = new Object() as SimpleChanges;
  const options_simple_change_alt: SimpleChange = new SimpleChange(MockKitTokenClass, MockKitTokenClassAlt, false);
  simple_changes_alt['token'] = options_simple_change_alt;
  const columns_all: string[] = COLUMN_DEFINITIONS_PODS.map((cd: ColumnDefinitionsInterface) => cd.def);
  const columns_all_remote_access: string[] = COLUMN_DEFINITIONS_PODS.filter((cd: ColumnDefinitionsInterface) => cd.remote_access)
                                                                     .map((cd: ColumnDefinitionsInterface) => cd.def);
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HealthDashboardModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) },
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthDashboardPodTableComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyPodDisplayedCols = spyOn(component, 'pod_displayed_cols').and.callThrough();
    spyTogglePodsCard = spyOn(component, 'toggle_pods_card').and.callThrough();
    spyDescribePod = spyOn(component, 'describe_pod').and.callThrough();
    spyPodLogs = spyOn(component, 'pod_logs').and.callThrough();
    spySetExpandedGroup = spyOn(component, 'set_expanded_group').and.callThrough();
    spyGetGroup = spyOn(component, 'get_group').and.callThrough();
    spyGetContainerStatus = spyOn(component, 'get_container_status').and.callThrough();
    spyReload = spyOn(component, 'reload').and.callThrough();
    spyGenerateGroups = spyOn<any>(component, 'generate_groups_').and.callThrough();
    spyGenerateGroupStatus = spyOn<any>(component, 'generate_group_status_').and.callThrough();
    spyGetPodIconStatus = spyOn<any>(component, 'get_pod_icon_status_').and.callThrough();
    spyIsPodErrorState = spyOn<any>(component, 'is_pod_error_state_').and.callThrough();
    spyOpenDialogWindow = spyOn<any>(component, 'open_dialog_window_').and.callThrough();
    spyOpenPodLogsDialogWindow = spyOn<any>(component, 'open_pod_logs_dialog_window_').and.callThrough();
    spyApiDescribePod = spyOn<any>(component, 'api_describe_pod_').and.callThrough();
    spyApiPodLogs = spyOn<any>(component, 'api_pod_logs_').and.callThrough();
    spyApiGetPodStatus = spyOn<any>(component, 'api_get_pod_status_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnChanges.calls.reset();
    spyPodDisplayedCols.calls.reset();
    spyTogglePodsCard.calls.reset();
    spyDescribePod.calls.reset();
    spyPodLogs.calls.reset();
    spySetExpandedGroup.calls.reset();
    spyGetGroup.calls.reset();
    spyGetContainerStatus.calls.reset();
    spyReload.calls.reset();
    spyGenerateGroups.calls.reset();
    spyGenerateGroupStatus.calls.reset();
    spyGetPodIconStatus.calls.reset();
    spyIsPodErrorState.calls.reset();
    spyOpenDialogWindow.calls.reset();
    spyOpenPodLogsDialogWindow.calls.reset();
    spyApiDescribePod.calls.reset();
    spyApiPodLogs.calls.reset();
    spyApiGetPodStatus.calls.reset();
  };

  afterAll(() => {
    remove_styles_from_dom();
  });

  it('should create HealthDashboardPodTableComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('HealthDashboardPodTableComponent methods', () => {
    describe('ngOnChanges()', () => {
      it('should call ngOnChanges()', () => {
        reset();

        component.ngOnChanges(simple_changes);

        expect(component.ngOnChanges).toHaveBeenCalled();
      });

      it('should call reload() from ngOnChanges()', () => {
        reset();

        component.ngOnChanges(simple_changes_alt);

        expect(component.reload).toHaveBeenCalled();
      });
    });

    describe('pod_displayed_cols()', () => {
      it('should call pod_displayed_cols()', () => {
        reset();

        component.pod_displayed_cols();

        expect(component.pod_displayed_cols).toHaveBeenCalled();
      });

      it('should call pod_displayed_cols() and return ', () => {
        reset();

        const return_value: string[] = component.pod_displayed_cols();

        expect(return_value).toEqual(columns_all);
      });

      it('should call pod_displayed_cols() and return ', () => {
        reset();

        component.token = MockKitTokenClass;
        const return_value: string[] = component.pod_displayed_cols();

        expect(return_value).toEqual(columns_all_remote_access);
      });
    });

    describe('toggle_pods_card()', () => {
      it('should call toggle_pods_card()', () => {
        reset();

        component.is_pods_visible = false;
        component.toggle_pods_card();

        expect(component.toggle_pods_card).toHaveBeenCalled();
      });

      it('should call toggle_pods_card() and set is_pods_visible = !is_pods_visible', () => {
        reset();

        component.is_pods_visible = true;
        component.toggle_pods_card();

        expect(component.is_pods_visible).toBeFalse();
      });
    });

    describe('describe_pod()', () => {
      it('should call describe_pod()', () => {
        reset();

        component.describe_pod(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component.describe_pod).toHaveBeenCalled();
      });

      it('should call api_describe_pod_() from describe_pod()', () => {
        reset();

        component.describe_pod(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component['api_describe_pod_']).toHaveBeenCalled();
      });
    });

    describe('pod_logs()', () => {
      it('should call pod_logs()', () => {
        reset();

        component.pod_logs(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component.pod_logs).toHaveBeenCalled();
      });

      it('should call api_pod_logs_() from pod_logs()', () => {
        reset();

        component.pod_logs(MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component['api_pod_logs_']).toHaveBeenCalled();
      });
    });

    describe('set_expanded_group()', () => {
      it('should call set_expanded_group()', () => {
        reset();

        component.set_expanded_group(MockPodMetricsInterface.name);

        expect(component.set_expanded_group).toHaveBeenCalled();
      });

      it('should call set_expanded_group() and set expanded_group = null', () => {
        reset();

        component.expanded_group = MockPodMetricsInterface.name;
        component.set_expanded_group(MockPodMetricsInterface.name);

        expect(component.expanded_group).toBeNull();
      });

      it('should call set_expanded_group() and set expanded_group = pod_name', () => {
        reset();

        component.expanded_group = null;
        component.set_expanded_group(MockPodMetricsInterface.name);

        expect(component.expanded_group).toEqual(MockPodMetricsInterface.name);
      });
    });

    describe('get_group()', () => {
      it('should call get_group()', () => {
        reset();

        component.get_group(MockPodStatusClassArray[0].node_name);

        expect(component.get_group).toHaveBeenCalled();
      });

      it('should call get_group() and return group', () => {
        reset();

        component['generate_groups_'](MockPodStatusClassArray);
        const return_value: GroupDataInterface = component.get_group(MockPodStatusClassArray[0].node_name);

        expect(return_value).toBeDefined();
      });

      it('should call get_group() and return nothing', () => {
        reset();

        component['generate_groups_'](MockPodStatusClassArray);
        const return_value: GroupDataInterface = component.get_group('wrong-name');

        expect(return_value).toBeUndefined();
      });
    });

    describe('get_container_status()', () => {
      it('should call get_container_status()', () => {
        reset();

        component.get_container_status(MockPodStatusClassArray[0].status.container_statuses[0]);

        expect(component.get_container_status).toHaveBeenCalled();
      });

      it('should call get_container_status() and return RUNNING', () => {
        reset();

        const return_value: string = component.get_container_status(MockPodStatusClassArray[0].status.container_statuses[0]);

        expect(return_value).toEqual(RUNNING);
      });

      it('should call get_container_status() and return TERMINATED: bad process', () => {
        reset();

        const return_value: string = component.get_container_status(MockPodStatusClassArray[1].status.container_statuses[0]);

        expect(return_value).toEqual(`${TERMINATED}: ${MockPodStatusClassArray[1].status.container_statuses[0].state[TERMINATED][STATE_REASON]}`);
      });

      it('should call get_container_status() and return TERMINATED', () => {
        reset();

        const return_value: string = component.get_container_status(MockPodStatusClassArray[2].status.container_statuses[0]);

        expect(return_value).toEqual(TERMINATED);
      });

      it('should call get_container_status() and return WAITING: just executed', () => {
        reset();

        const return_value: string = component.get_container_status(MockPodStatusClassArray[3].status.container_statuses[0]);

        expect(return_value).toEqual(`${WAITING}: ${MockPodStatusClassArray[3].status.container_statuses[0].state[WAITING][STATE_REASON]}`);
      });

      it('should call get_container_status() and return WAITING', () => {
        reset();

        const return_value: string = component.get_container_status(MockPodStatusClassArray[4].status.container_statuses[0]);

        expect(return_value).toEqual(WAITING);
      });

      it('should call get_container_status() and return empty string', () => {
        reset();

        const return_value: string = component.get_container_status(MockPodStatusClassArray[5].status.container_statuses[0]);

        expect(return_value).toEqual('');
      });
    });

    describe('reload()', () => {
      it('should call reload()', () => {
        reset();

        component.reload();

        expect(component.reload).toHaveBeenCalled();
      });

      it('should call generate_groups_() from reload()', () => {
        reset();

        component.token = MockKitTokenClassAlt;
        component.reload();

        expect(component['generate_groups_']).toHaveBeenCalled();
      });

      it('should call api_get_pod_status_() from reload()', () => {
        reset();

        component.token = MockKitTokenClass;
        component.reload();

        expect(component['api_get_pod_status_']).toHaveBeenCalled();
      });
    });

    describe('private generate_groups_()', () => {
      it('should call generate_groups_()', () => {
        reset();

        component['generate_groups_'](undefined);

        expect(component['generate_groups_']).toHaveBeenCalled();
      });

      it('should call generate_groups_() and set group_data = []', () => {
        reset();

        component['generate_groups_'](undefined);

        expect(component.group_data).toEqual([]);
      });

      it('should call generate_groups_() and set filtered_group_data = []', () => {
        reset();

        component['generate_groups_'](undefined);

        expect(component.filtered_group_data).toEqual([]);
      });

      it('should call generate_groups_() and set group_data', () => {
        reset();

        component['generate_groups_'](MockPodStatusClassArray);

        expect(component.group_data.length > 0).toBeTrue();
      });

      it('should call generate_groups_() and set filtered_group_data', () => {
        reset();

        component['generate_groups_'](MockPodStatusClassArray);

        expect(component.filtered_group_data.length > 0).toBeTrue();
      });
    });

    describe('private generate_group_status_()', () => {
      it('should call generate_group_status_()', () => {
        reset();

        component['generate_groups_'](MockPodStatusClassArray);
        component['generate_group_status_'](0);

        expect(component['generate_group_status_']).toHaveBeenCalled();
      });

      it('should call get_pod_icon_status_() from generate_group_status_()', () => {
        reset();

        component['generate_groups_'](MockPodStatusClassArray);
        component['generate_group_status_'](1);

        expect(component['get_pod_icon_status_']).toHaveBeenCalled();
      });

      it('should call generate_group_status_() and return sync_problem', () => {
        reset();

        component['generate_groups_'](MockPodStatusClassArray);
        const return_value: string = component['generate_group_status_'](1);

        expect(return_value).toEqual(POD_STATUS_VALUES[4]);
      });

      it('should call get_pod_icon_status_() from generate_group_status_() different index', () => {
        reset();

        component['generate_groups_'](MockPodStatusClassArray);
        component['generate_group_status_'](0);

        expect(component['get_pod_icon_status_']).toHaveBeenCalled();
      });

      it('should call generate_group_status_() and return check_circle', () => {
        reset();

        component['generate_groups_'](MockPodStatusClassArray);
        const return_value: string = component['generate_group_status_'](0);

        expect(return_value).toEqual(POD_STATUS_VALUES[0]);
      });
    });

    describe('private get_pod_icon_status_()', () => {
      it('should call get_pod_icon_status_()', () => {
        reset();

        component['get_pod_icon_status_'](STATUS_RUNNING);

        expect(component['get_pod_icon_status_']).toHaveBeenCalled();
      });

      it('should call get_pod_icon_status_() and return check_circle', () => {
        reset();

        let return_value: string = component['get_pod_icon_status_'](STATUS_RUNNING);

        expect(return_value).toEqual(POD_STATUS_VALUES[0]);

        return_value = component['get_pod_icon_status_'](STATUS_SUCCEEDED);

        expect(return_value).toEqual(POD_STATUS_VALUES[0]);

        return_value = component['get_pod_icon_status_'](STATUS_COMPLETED);

        expect(return_value).toEqual(POD_STATUS_VALUES[0]);
      });

      it('should call get_pod_icon_status_() and return warning', () => {
        reset();

        let return_value: string = component['get_pod_icon_status_'](STATUS_PENDING);

        expect(return_value).toEqual(POD_STATUS_VALUES[2]);

        return_value = component['get_pod_icon_status_'](STATUS_CONTAINER_CREATING);

        expect(return_value).toEqual(POD_STATUS_VALUES[2]);
      });

      it('should call get_pod_icon_status_() and return circle', () => {
        reset();

        const return_value: string = component['get_pod_icon_status_'](STATUS_TERMINATING);

        expect(return_value).toEqual(POD_STATUS_VALUES[1]);
      });

      it('should call get_pod_icon_status_() and return error', () => {
        reset();

        let return_value: string = component['get_pod_icon_status_'](STATUS_FAILED);

        expect(return_value).toEqual(POD_STATUS_VALUES[3]);

        return_value = component['get_pod_icon_status_'](STATUS_ERROR);

        expect(return_value).toEqual(POD_STATUS_VALUES[3]);

        return_value = component['get_pod_icon_status_'](undefined, 1);

        expect(return_value).toEqual(POD_STATUS_VALUES[3]);
      });

      it('should call get_pod_icon_status_() and return sync_problem', () => {
        reset();

        const return_value: string = component['get_pod_icon_status_'](undefined);

        expect(return_value).toEqual(POD_STATUS_VALUES[4]);
      });

      it('should call is_pod_error_state_() from get_pod_icon_status_()', () => {
        reset();

        component['get_pod_icon_status_'](STATUS_FAILED);

        expect(component['is_pod_error_state_']).toHaveBeenCalled();
      });
    });

    describe('private is_pod_error_state_()', () => {
      it('should call is_pod_error_state_()', () => {
        reset();

        component['is_pod_error_state_'](STATUS_PENDING);

        expect(component['is_pod_error_state_']).toHaveBeenCalled();
      });

      it('should call is_pod_error_state_() and return true', () => {
        reset();

        let return_value: boolean = component['is_pod_error_state_'](STATUS_FAILED);

        expect(return_value).toBeTrue();

        return_value = component['is_pod_error_state_'](STATUS_ERROR);

        expect(return_value).toBeTrue();

        return_value = component['is_pod_error_state_'](undefined, 1);

        expect(return_value).toBeTrue();
      });

      it('should call is_pod_error_state_() and return false', () => {
        reset();

        let return_value: boolean = component['is_pod_error_state_'](STATUS_PENDING);

        expect(return_value).toBeFalse();

        return_value = component['is_pod_error_state_'](STATUS_NOT_READY);

        expect(return_value).toBeFalse();

        return_value = component['is_pod_error_state_'](STATUS_TERMINATING);

        expect(return_value).toBeFalse();

        return_value = component['is_pod_error_state_'](STATUS_UNKNOWN);

        expect(return_value).toBeFalse();

        return_value = component['is_pod_error_state_'](STATUS_CONTAINER_CREATING);

        expect(return_value).toBeFalse();
      });
    });

    describe('private open_dialog_window_()', () => {
      it('should call open_dialog_window_()', () => {
        reset();

        component['open_dialog_window_'](MockPodMetricsInterface.name, MockDescribePodNodeClass.stdout);

        expect(component['open_dialog_window_']).toHaveBeenCalled();
      });
    });

    describe('private open_pod_logs_dialog_window_()', () => {
      it('should call open_pod_logs_dialog_window_()', () => {
        reset();

        component['open_pod_logs_dialog_window_'](ModalDialogDisplayMatComponent, MockPodMetricsInterface.name, MockPodLogClassArray);

        expect(component['open_pod_logs_dialog_window_']).toHaveBeenCalled();
      });
    });

    describe('private api_describe_pod_()', () => {
      it('should call api_describe_pod_()', () => {
        reset();

        component['api_describe_pod_'](MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component['api_describe_pod_']).toHaveBeenCalled();
      });

      it('should call health_service_.describe_pod() from api_describe_pod_()', () => {
        reset();

        component['api_describe_pod_'](MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component['health_service_'].describe_pod).toHaveBeenCalled();
      });

      it('should call health_service_.describe_pod() and on success call open_dialog_window_()', () => {
        reset();

        component['api_describe_pod_'](MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component['open_dialog_window_']).toHaveBeenCalled();
      });

      it('should call health_service_.describe_pod() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'describe_pod').and.returnValue(throwError(mock_http_error_response));

        component['api_describe_pod_'](MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_pod_logs_()', () => {
      it('should call api_pod_logs_()', () => {
        reset();

        component['api_pod_logs_'](MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component['api_pod_logs_']).toHaveBeenCalled();
      });

      it('should call health_service_.pod_logs() from api_pod_logs_()', () => {
        reset();

        component['api_pod_logs_'](MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component['health_service_'].pod_logs).toHaveBeenCalled();
      });

      it('should call health_service_.pod_logs() and on success call open_pod_logs_dialog_window_()', () => {
        reset();

        component['api_pod_logs_'](MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component['open_pod_logs_dialog_window_']).toHaveBeenCalled();
      });

      it('should call health_service_.pod_logs() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'pod_logs').and.returnValue(throwError(mock_http_error_response));

        component['api_pod_logs_'](MockPodMetricsInterface.name, MockPodMetricsInterface.namespace);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_pod_status_()', () => {
      it('should call api_get_pod_status_()', () => {
        reset();

        component['api_get_pod_status_']();

        expect(component['api_get_pod_status_']).toHaveBeenCalled();
      });

      it('should call health_service_.get_pods_status() from api_get_pod_status_()', () => {
        reset();

        component['api_get_pod_status_']();

        expect(component['health_service_'].get_pods_status).toHaveBeenCalled();
      });

      it('should health_service_.get_pods_status() and on success call generate_groups_()', () => {
        reset();

        component['api_get_pod_status_']();

        expect(component['generate_groups_']).toHaveBeenCalled();
      });

      it('should call health_service_.get_pods_status() and handle error and call generate_groups_()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'get_pods_status').and.returnValue(throwError(mock_http_error_response));

        component['api_get_pod_status_']();

        expect(component['generate_groups_']).toHaveBeenCalled();
      });

      it('should call health_service_.get_pods_status() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'get_pods_status').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_pod_status_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call health_service_.get_pods_status() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'get_pods_status').and.returnValue(throwError(mock_http_error_response));

        component['api_get_pod_status_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

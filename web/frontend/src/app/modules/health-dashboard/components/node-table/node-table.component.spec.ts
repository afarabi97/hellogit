import { HttpErrorResponse } from '@angular/common/http';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';

import {
  MockDescribePodNodeClass,
  MockElasticseachObjectWriteRejectsClassArray,
  MockErrorMessageClass,
  MockKitTokenClass,
  MockKitTokenClassAlt,
  MockNodeStatusClassArray,
  MockPacketStatClassArraySuricata,
  MockPacketStatClassArrayZeek
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { MockNodeMetricsInterface } from '../../../../../../static-data/interface-objects';
import { SERVER } from '../../../../constants/cvah.constants';
import { TestingModule } from '../../../testing-modules/testing.module';
import { NodeStatusClass } from '../../classes';
import { COLUMN_DEFINITIONS_NODES } from '../../constants/health-dashboard.constant';
import { HealthDashboardModule } from '../../health-dashboard.module';
import { ColumnDefinitionsInterface } from '../../interfaces';
import { HealthDashboardNodeTableComponent } from './node-table.component';

describe('HealthDashboardNodeTableComponent', () => {
  let component: HealthDashboardNodeTableComponent;
  let fixture: ComponentFixture<HealthDashboardNodeTableComponent>;

  // Setup spy references
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyNodeDisplayedCols: jasmine.Spy<any>;
  let spyDescribeNode: jasmine.Spy<any>;
  let spyToggleNodesCard: jasmine.Spy<any>;
  let spyReload: jasmine.Spy<any>;
  let spyUpdateNodeStatuses: jasmine.Spy<any>;
  let spyOpenDialogWindow: jasmine.Spy<any>;
  let spyApiDescribeNode: jasmine.Spy<any>;
  let spyApiGetNodeStatus: jasmine.Spy<any>;
  let spyApiWriteRejects: jasmine.Spy<any>;
  let spyApiSuricataPcktStats: jasmine.Spy<any>;
  let spyApiZeekPcktStats: jasmine.Spy<any>;

  // Test Data
  const simple_changes: SimpleChanges = new Object() as SimpleChanges;
  const options_simple_change: SimpleChange = new SimpleChange(MockKitTokenClass, MockKitTokenClassAlt, true);
  simple_changes['token'] = options_simple_change;
  const simple_changes_alt: SimpleChanges = new Object() as SimpleChanges;
  const options_simple_change_alt: SimpleChange = new SimpleChange(MockKitTokenClass, MockKitTokenClassAlt, false);
  simple_changes_alt['token'] = options_simple_change_alt;
  const columns_all: string[] = COLUMN_DEFINITIONS_NODES.map((cd: ColumnDefinitionsInterface) => cd.def);
  const columns_all_remote_access: string[] = COLUMN_DEFINITIONS_NODES.filter((cd: ColumnDefinitionsInterface) => cd.remote_access)
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
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthDashboardNodeTableComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyNodeDisplayedCols = spyOn(component, 'node_displayed_cols').and.callThrough();
    spyDescribeNode = spyOn(component, 'describe_node').and.callThrough();
    spyToggleNodesCard = spyOn(component, 'toggle_nodes_card').and.callThrough();
    spyReload = spyOn(component, 'reload').and.callThrough();
    spyUpdateNodeStatuses = spyOn<any>(component, 'update_node_statuses_').and.callThrough();
    spyOpenDialogWindow = spyOn<any>(component, 'open_dialog_window_').and.callThrough();
    spyApiDescribeNode = spyOn<any>(component, 'api_describe_node_').and.callThrough();
    spyApiGetNodeStatus = spyOn<any>(component, 'api_get_node_status_').and.callThrough();
    spyApiWriteRejects = spyOn<any>(component, 'api_write_rejects_').and.callThrough();
    spyApiSuricataPcktStats = spyOn<any>(component, 'api_suricata_pckt_stats_').and.callThrough();
    spyApiZeekPcktStats = spyOn<any>(component, 'api_zeek_pckt_stats_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnChanges.calls.reset();
    spyNodeDisplayedCols.calls.reset();
    spyDescribeNode.calls.reset();
    spyToggleNodesCard.calls.reset();
    spyReload.calls.reset();
    spyUpdateNodeStatuses.calls.reset();
    spyOpenDialogWindow.calls.reset();
    spyApiDescribeNode.calls.reset();
    spyApiGetNodeStatus.calls.reset();
    spyApiWriteRejects.calls.reset();
    spyApiSuricataPcktStats.calls.reset();
    spyApiZeekPcktStats.calls.reset();
  };

  afterAll(() => {
    remove_styles_from_dom();
  });

  it('should create HealthDashboardNodeTableComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('HealthDashboardNodeTableComponent methods', () => {
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

    describe('node_displayed_cols()', () => {
      it('should call node_displayed_cols()', () => {
        reset();

        component.node_displayed_cols();

        expect(component.node_displayed_cols).toHaveBeenCalled();
      });

      it('should call node_displayed_cols() and return ', () => {
        reset();

        const return_value: string[] = component.node_displayed_cols();

        expect(return_value).toEqual(columns_all);
      });

      it('should call node_displayed_cols() and return ', () => {
        reset();

        component.token = MockKitTokenClass;
        const return_value: string[] = component.node_displayed_cols();

        expect(return_value).toEqual(columns_all_remote_access);
      });
    });

    describe('describe_node()', () => {
      it('should call describe_node()', () => {
        reset();

        component.describe_node(MockNodeMetricsInterface.name);

        expect(component.describe_node).toHaveBeenCalled();
      });

      it('should call api_describe_node_() from describe_node()', () => {
        reset();

        component.describe_node(MockNodeMetricsInterface.name);

        expect(component['api_describe_node_']).toHaveBeenCalled();
      });
    });

    describe('toggle_nodes_card()', () => {
      it('should call toggle_nodes_card()', () => {
        reset();

        component.is_nodes_visible = false;
        component.toggle_nodes_card();

        expect(component.toggle_nodes_card).toHaveBeenCalled();
      });

      it('should call toggle_nodes_card() and set is_nodes_visible = !is_nodes_visible', () => {
        reset();

        component.is_nodes_visible = true;
        component.toggle_nodes_card();

        expect(component.is_nodes_visible).toBeFalse();
      });
    });

    describe('reload()', () => {
      it('should call reload()', () => {
        reset();

        component.reload();

        expect(component.reload).toHaveBeenCalled();
      });

      it('should call reload() and set nodes = []', () => {
        reset();

        component.nodes = MockNodeStatusClassArray;
        component.token = MockKitTokenClassAlt;
        component.reload();

        expect(component.nodes).toEqual([]);
      });

      it('should call api_get_node_status_() from reload()', () => {
        reset();

        component.token = MockKitTokenClass;
        component.reload();

        expect(component['api_get_node_status_']).toHaveBeenCalled();
      });
    });

    describe('private update_node_statuses_()', () => {
      it('should call update_node_statuses_()', () => {
        reset();

        component.nodes = MockNodeStatusClassArray;
        component['update_node_statuses_']();

        expect(component['update_node_statuses_']).toHaveBeenCalled();
      });

      it('should call update_node_statuses_() and set nodes', () => {
        reset();

        component['write_rejects_'] = MockElasticseachObjectWriteRejectsClassArray;
        component.nodes = MockNodeStatusClassArray;
        component['update_node_statuses_']();

        const test_node_statuses: NodeStatusClass[] = component.nodes.filter((ns: NodeStatusClass) => ns.type === SERVER.toLowerCase());

        expect(test_node_statuses[0].write_rejects.length > 0).toBeTrue();
        expect(component.nodes).toEqual(MockNodeStatusClassArray);
      });

      it('should call update_node_statuses_() and set nodes with app_data and write_rejects_', () => {
        reset();

        component['suricata_data_'] = MockPacketStatClassArraySuricata;
        component['zeek_data_'] = MockPacketStatClassArrayZeek;
        component.nodes = MockNodeStatusClassArray;
        component['update_node_statuses_']();

        const test_node_statuses: NodeStatusClass[] = component.nodes.filter((ns: NodeStatusClass) => ns.name === MockPacketStatClassArraySuricata[0].node_name);

        expect(test_node_statuses[0].app_data.length > 0).toBeTrue();
      });
    });

    describe('private open_dialog_window_()', () => {
      it('should call open_dialog_window_()', () => {
        reset();

        component['open_dialog_window_'](MockNodeMetricsInterface.name, MockDescribePodNodeClass.stdout);

        expect(component['open_dialog_window_']).toHaveBeenCalled();
      });
    });

    describe('private api_describe_node_()', () => {
      it('should call api_describe_node_()', () => {
        reset();

        component['api_describe_node_'](MockNodeMetricsInterface.name);

        expect(component['api_describe_node_']).toHaveBeenCalled();
      });

      it('should call health_service_.describe_node() from api_describe_node_()', () => {
        reset();

        component['api_describe_node_'](MockNodeMetricsInterface.name);

        expect(component['health_service_'].describe_node).toHaveBeenCalled();
      });

      it('should call health_service_.describe_node() and on success call open_dialog_window_()', () => {
        reset();

        component['api_describe_node_'](MockNodeMetricsInterface.name);

        expect(component['open_dialog_window_']).toHaveBeenCalled();
      });

      it('should call health_service_.describe_node() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'describe_node').and.returnValue(throwError(mock_http_error_response));

        component['api_describe_node_'](MockNodeMetricsInterface.name);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_node_status_()', () => {
      it('should call api_get_node_status_()', () => {
        reset();

        component['api_get_node_status_']();

        expect(component['api_get_node_status_']).toHaveBeenCalled();
      });

      it('should call health_service_.get_nodes_status() from api_get_node_status_()', () => {
        reset();

        component['api_get_node_status_']();

        expect(component['health_service_'].get_nodes_status).toHaveBeenCalled();
      });

      it('should health_service_.get_nodes_status() and on success set nodes = response', () => {
        reset();

        component.nodes = [];
        component['api_get_node_status_']();

        expect(component.nodes).toEqual(MockNodeStatusClassArray);
      });

      it('should health_service_.get_nodes_status() and on success call api_write_rejects_()', () => {
        reset();

        component['api_get_node_status_']();

        expect(component['api_write_rejects_']).toHaveBeenCalled();
      });

      it('should call health_service_.get_nodes_status() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'get_nodes_status').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_node_status_']();

        expect(component.nodes).toEqual([]);
        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call health_service_.get_nodes_status() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'get_nodes_status').and.returnValue(throwError(mock_http_error_response));

        component['api_get_node_status_']();

        expect(component.nodes).toEqual([]);
        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_write_rejects_()', () => {
      it('should call api_write_rejects_()', () => {
        reset();

        component.nodes = [];
        component['api_write_rejects_']();

        expect(component['api_write_rejects_']).toHaveBeenCalled();
      });

      it('should call health_service_.write_rejects() from api_write_rejects_()', () => {
        reset();

        component.nodes = [];
        component['api_write_rejects_']();

        expect(component['health_service_'].write_rejects).toHaveBeenCalled();
      });

      it('should health_service_.write_rejects() and on success set write_rejects_ = response', () => {
        reset();

        component.nodes = [];
        component['write_rejects_'] = [];
        component['api_write_rejects_']();

        expect(component['write_rejects_']).toEqual(MockElasticseachObjectWriteRejectsClassArray);
      });

      it('should health_service_.write_rejects() and on success call api_suricata_pckt_stats_()', () => {
        reset();

        component.nodes = [];
        component['api_write_rejects_']();

        expect(component['api_suricata_pckt_stats_']).toHaveBeenCalled();
      });

      it('should call health_service_.write_rejects() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'write_rejects').and.returnValue(throwError(MockErrorMessageClass));

        component.nodes = [];
        component['api_write_rejects_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call health_service_.write_rejects() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'write_rejects').and.returnValue(throwError(mock_http_error_response));

        component.nodes = [];
        component['api_write_rejects_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_suricata_pckt_stats_()', () => {
      it('should call api_suricata_pckt_stats_()', () => {
        reset();

        component.nodes = [];
        component['api_suricata_pckt_stats_']();

        expect(component['api_suricata_pckt_stats_']).toHaveBeenCalled();
      });

      it('should call health_service_.suricata_pckt_stats() from api_suricata_pckt_stats_()', () => {
        reset();

        component.nodes = [];
        component['api_suricata_pckt_stats_']();

        expect(component['health_service_'].suricata_pckt_stats).toHaveBeenCalled();
      });

      it('should health_service_.suricata_pckt_stats() and on success set suricata_data_ = response', () => {
        reset();

        component.nodes = [];
        component['suricata_data_'] = [];
        component['api_suricata_pckt_stats_']();

        expect(component['suricata_data_']).toEqual(MockPacketStatClassArraySuricata);
      });

      it('should health_service_.suricata_pckt_stats() and on success call api_zeek_pckt_stats_()', () => {
        reset();

        component.nodes = [];
        component['api_suricata_pckt_stats_']();

        expect(component['api_zeek_pckt_stats_']).toHaveBeenCalled();
      });

      it('should call health_service_.suricata_pckt_stats() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'suricata_pckt_stats').and.returnValue(throwError(MockErrorMessageClass));

        component.nodes = [];
        component['api_suricata_pckt_stats_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call health_service_.suricata_pckt_stats() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'suricata_pckt_stats').and.returnValue(throwError(mock_http_error_response));

        component.nodes = [];
        component['api_suricata_pckt_stats_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_zeek_pckt_stats_()', () => {
      it('should call api_zeek_pckt_stats_()', () => {
        reset();

        component.nodes = [];
        component['api_zeek_pckt_stats_']();

        expect(component['api_zeek_pckt_stats_']).toHaveBeenCalled();
      });

      it('should call health_service_.zeek_pckt_stats() from api_zeek_pckt_stats_()', () => {
        reset();

        component.nodes = [];
        component['api_zeek_pckt_stats_']();

        expect(component['health_service_'].zeek_pckt_stats).toHaveBeenCalled();
      });

      it('should health_service_.zeek_pckt_stats() and on success set zeek_data_ = response', () => {
        reset();

        component.nodes = [];
        component['zeek_data_'] = [];
        component['api_zeek_pckt_stats_']();

        expect(component['zeek_data_']).toEqual(MockPacketStatClassArrayZeek);
      });

      it('should health_service_.zeek_pckt_stats() and on success call update_node_statuses_()', () => {
        reset();

        component.nodes = [];
        component['api_zeek_pckt_stats_']();

        expect(component['update_node_statuses_']).toHaveBeenCalled();
      });

      it('should call health_service_.zeek_pckt_stats() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'zeek_pckt_stats').and.returnValue(throwError(MockErrorMessageClass));

        component.nodes = [];
        component['api_zeek_pckt_stats_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call health_service_.zeek_pckt_stats() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['health_service_'], 'zeek_pckt_stats').and.returnValue(throwError(mock_http_error_response));

        component.nodes = [];
        component['api_zeek_pckt_stats_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

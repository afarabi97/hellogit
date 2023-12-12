import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import {
  MockAppClassArray,
  MockErrorMessageClass,
  MockGenericJobAndKeyClass,
  MockKitSettingsClass,
  MockKitStatusClass,
  MockNodeClassArray,
  MockNodeSensorClass,
  MockNodeServerClass
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { NodeClass, ObjectUtilitiesClass } from '../../classes';
import { BAREMETAL, CONFIRM_DIALOG_OPTION, CONTROL_PLANE, ISO, MINIO, SERVICE } from '../../constants/cvah.constants';
import { ApiService } from '../../services/abstract/api.service';
import { MipManagementComponent } from '../mip-mng/mip-mng.component';
import { TestingModule } from '../testing-modules/testing.module';
import { NodeManagementComponent } from './node-mng.component';
import { NodeMngModule } from './node-mng.module';

describe('NodeManagementComponent', () => {
  let component: NodeManagementComponent;
  let fixture: ComponentFixture<NodeManagementComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyDisableRefreshKitButton: jasmine.Spy<any>;
  let spyDisableSetupControlPlaneButton: jasmine.Spy<any>;
  let spyDisableAddNodeButton: jasmine.Spy<any>;
  let spyDisableDeployKitButton: jasmine.Spy<any>;
  let spyCanRefreshDeviceFacts: jasmine.Spy<any>;
  let spyRefreshDeviceFacts: jasmine.Spy<any>;
  let spyIsIsoButtonGroup: jasmine.Spy<any>;
  let spyIsIsoNodeDeployed: jasmine.Spy<any>;
  let spyCanDeleteNode: jasmine.Spy<any>;
  let spyOpenNodeInfoDialogWindow: jasmine.Spy<any>;
  let spyOpenAddNodeDialogWindow: jasmine.Spy<any>;
  let spyDownloadIso: jasmine.Spy<any>;
  let spyDownloadOpenVPNCerts: jasmine.Spy<any>;
  let spyGetVPNStatus: jasmine.Spy<any>;
  let spyOpenJobServerStdOutConsole: jasmine.Spy<any>;
  let spyDeployKit: jasmine.Spy<any>;
  let spySetupControlPlane: jasmine.Spy<any>;
  let spyDeleteNode: jasmine.Spy<any>;
  let spyRefreshKit: jasmine.Spy<any>;
  let spyRedeployKit: jasmine.Spy<any>;
  let spyOpenDeleteNodeDialogWindow: jasmine.Spy<any>;
  let spyUpdateNodesData: jasmine.Spy<any>;
  let spySetNodes: jasmine.Spy<any>;
  let spySetSetupNodes: jasmine.Spy<any>;
  let spySetIsoSensorDetected: jasmine.Spy<any>;
  let spySetupWebsocketGetSocketOnNodeStateChange: jasmine.Spy<any>;
  let spySetupWebsocketGetSocketOnKitStatusChange: jasmine.Spy<any>;
  let spyApiGetNodes: jasmine.Spy<any>;
  let spyApiGetKitStatus: jasmine.Spy<any>;
  let spyApiGetKitSettings: jasmine.Spy<any>;
  let spyApiUpdateDeviceFacts: jasmine.Spy<any>;
  let spyApiGetOpenVPNCerts: jasmine.Spy<any>;
  let spyApiDeployKit: jasmine.Spy<any>;
  let spyApiRefreshKit: jasmine.Spy<any>;
  let spyApiSetupControlPlane: jasmine.Spy<any>;
  let spyApiDeleteNode: jasmine.Spy<any>;
  let spyApiGetCatalogApps: jasmine.Spy<any>;

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
        NodeMngModule,
        TestingModule
      ],
      providers: [
        MipManagementComponent,
        ApiService,
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) },
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeManagementComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyDisableRefreshKitButton = spyOn(component, 'disable_refresh_kit_button').and.callThrough();
    spyDisableSetupControlPlaneButton = spyOn(component, 'disable_setup_control_plane_button').and.callThrough();
    spyDisableAddNodeButton = spyOn(component, 'disable_add_node_button').and.callThrough();
    spyDisableDeployKitButton = spyOn(component, 'disable_deploy_kit_button').and.callThrough();
    spyCanRefreshDeviceFacts = spyOn(component, 'can_refresh_device_facts').and.callThrough();
    spyRefreshDeviceFacts = spyOn(component, 'refresh_device_facts').and.callThrough();
    spyIsIsoButtonGroup = spyOn(component, 'is_iso_button_group').and.callThrough();
    spyIsIsoNodeDeployed = spyOn(component, 'is_iso_node_deployed').and.callThrough();
    spyCanDeleteNode = spyOn(component, 'can_delete_node').and.callThrough();
    spyOpenNodeInfoDialogWindow = spyOn(component, 'open_node_info_dialog_window').and.callThrough();
    spyOpenAddNodeDialogWindow = spyOn(component, 'open_add_node_dialog_window').and.callThrough();
    spyDownloadIso = spyOn(component, 'download_iso').and.callThrough();
    spyDownloadOpenVPNCerts = spyOn(component, 'download_open_vpn_certs').and.callThrough();
    spyGetVPNStatus = spyOn(component, 'get_vpn_status').and.callThrough();
    spyOpenJobServerStdOutConsole = spyOn(component, 'open_job_server_std_out_console').and.callThrough();
    spyDeployKit = spyOn(component, 'deploy_kit').and.callThrough();
    spySetupControlPlane = spyOn(component, 'setup_control_plane').and.callThrough();
    spyDeleteNode = spyOn(component, 'delete_node').and.callThrough();
    spyRefreshKit = spyOn(component, 'refresh_kit').and.callThrough();
    spyRedeployKit = spyOn<any>(component, 'redeploy_kit_').and.callThrough();
    spyOpenDeleteNodeDialogWindow = spyOn<any>(component, 'open_delete_node_dialog_window_').and.callThrough();
    spyUpdateNodesData = spyOn<any>(component, 'update_nodes_data_').and.callThrough();
    spySetNodes = spyOn<any>(component, 'set_nodes_').and.callThrough();
    spySetSetupNodes = spyOn<any>(component, 'set_setup_nodes_').and.callThrough();
    spySetIsoSensorDetected = spyOn<any>(component, 'set_iso_sensor_detected_').and.callThrough();
    spySetupWebsocketGetSocketOnNodeStateChange = spyOn<any>(component, 'setup_websocket_get_socket_on_node_state_change_').and.callThrough();
    spySetupWebsocketGetSocketOnKitStatusChange = spyOn<any>(component, 'setup_websocket_get_socket_on_kit_status_change_').and.callThrough();
    spyApiGetNodes = spyOn<any>(component, 'api_get_nodes_').and.callThrough();
    spyApiGetKitStatus = spyOn<any>(component, 'api_get_kit_status_').and.callThrough();
    spyApiGetKitSettings = spyOn<any>(component, 'api_get_kit_settings_').and.callThrough();
    spyApiUpdateDeviceFacts = spyOn<any>(component, 'api_update_device_facts_').and.callThrough();
    spyApiGetOpenVPNCerts = spyOn<any>(component, 'api_get_open_vpn_certs_').and.callThrough();
    spyApiDeployKit = spyOn<any>(component, 'api_deploy_kit_').and.callThrough();
    spyApiRefreshKit = spyOn<any>(component, 'api_refresh_kit_').and.callThrough();
    spyApiSetupControlPlane = spyOn<any>(component, 'api_setup_control_plane_').and.callThrough();
    spyApiDeleteNode = spyOn<any>(component, 'api_delete_node_').and.callThrough();
    spyApiGetCatalogApps = spyOn<any>(component, 'api_get_catalog_apps_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyDisableRefreshKitButton.calls.reset();
    spyDisableSetupControlPlaneButton.calls.reset();
    spyDisableAddNodeButton.calls.reset();
    spyDisableDeployKitButton.calls.reset();
    spyCanRefreshDeviceFacts.calls.reset();
    spyRefreshDeviceFacts.calls.reset();
    spyIsIsoButtonGroup.calls.reset();
    spyIsIsoNodeDeployed.calls.reset();
    spyCanDeleteNode.calls.reset();
    spyOpenNodeInfoDialogWindow.calls.reset();
    spyOpenAddNodeDialogWindow.calls.reset();
    spyDownloadIso.calls.reset();
    spyDownloadOpenVPNCerts.calls.reset();
    spyGetVPNStatus.calls.reset();
    spyOpenJobServerStdOutConsole.calls.reset();
    spyDeployKit.calls.reset();
    spySetupControlPlane.calls.reset();
    spyDeleteNode.calls.reset();
    spyRefreshKit.calls.reset();
    spyRedeployKit.calls.reset();
    spyOpenDeleteNodeDialogWindow.calls.reset();
    spyUpdateNodesData.calls.reset();
    spySetNodes.calls.reset();
    spySetSetupNodes.calls.reset();
    spySetIsoSensorDetected.calls.reset();
    spySetupWebsocketGetSocketOnNodeStateChange.calls.reset();
    spySetupWebsocketGetSocketOnKitStatusChange.calls.reset();
    spyApiGetNodes.calls.reset();
    spyApiGetKitStatus.calls.reset();
    spyApiGetKitSettings.calls.reset();
    spyApiUpdateDeviceFacts.calls.reset();
    spyApiGetOpenVPNCerts.calls.reset();
    spyApiDeployKit .calls.reset();
    spyApiRefreshKit.calls.reset();
    spyApiSetupControlPlane.calls.reset();
    spyApiDeleteNode.calls.reset();
    spyApiGetCatalogApps.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create NodeManagementComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('NodeManagementComponent methods', () => {

    describe('ngOnInit()', () => {

      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call setup_websocket_get_socket_on_node_state_change_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['setup_websocket_get_socket_on_node_state_change_']).toHaveBeenCalled();
      });

      it('should call setup_websocket_get_socket_on_kit_status_change_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['setup_websocket_get_socket_on_kit_status_change_']).toHaveBeenCalled();
      });

      it('should call api_get_nodes_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_nodes_']).toHaveBeenCalled();
      });

      it('should call api_get_kit_status_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_kit_status_']).toHaveBeenCalled();
      });

      it('should call api_get_kit_settings_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_kit_settings_']).toHaveBeenCalled();
      });
    });

    describe('disable_refresh_kit_button()', () => {

      it('should call disable_refresh_kit_button()', () => {
        reset();

        component['kit_status_'] = {
          base_kit_deployed: false,
          jobs_running: true
        };
        component.disable_refresh_kit_button();

        expect(component.disable_refresh_kit_button).toHaveBeenCalled();
      });

      it('should call disable_refresh_kit_button() and return true when kit_status_.base_kit_deployed = false, kit_status_.jobs_running = true', () => {
        reset();

        component['kit_status_'] = {
          base_kit_deployed: false,
          jobs_running: true
        };
        const returnValue: boolean = component.disable_refresh_kit_button();

        expect(returnValue).toBeTrue();
      });

      it('should call disable_refresh_kit_button() and return false when kit_status_.base_kit_deployed = false', () => {
        reset();

        component['kit_status_'] = {
          base_kit_deployed: false,
          jobs_running: false
        };
        const returnValue: boolean = component.disable_refresh_kit_button();

        expect(returnValue).toBeTrue();
      });

      it('should call disable_refresh_kit_button() and return false when kit_status_.base_kit_deployed = true', () => {
        reset();

        component['kit_status_'] = {
          base_kit_deployed: true,
          jobs_running: false
        };
        const returnValue: boolean = component.disable_refresh_kit_button();

        expect(returnValue).toBeFalse();
      });
    });

    describe('disable_setup_control_plane_button()', () => {

      it('should call disable_setup_control_plane_button()', () => {
        reset();

        component['kit_status_'] = {
          control_plane_deployed: false,
          esxi_settings_configured: true,
          kit_settings_configured: true,
          jobs_running: false
        };
        component.disable_setup_control_plane_button();

        expect(component.disable_setup_control_plane_button).toHaveBeenCalled();
      });

      it('should call disable_setup_control_plane_button() and return false when kit_status_.control_plane_deployed = false, ' +
         'kit_status_.esxi_settings_configured = true, kit_status_.kit_settings_configured = true, kit_status_.jobs_running = false', () => {
        reset();

        component['kit_status_'] = {
          control_plane_deployed: false,
          esxi_settings_configured: true,
          kit_settings_configured: true,
          jobs_running: false
        };
        const returnValue: boolean = component.disable_setup_control_plane_button();

        expect(returnValue).toBeFalse();
      });

      it('should call disable_setup_control_plane_button() and return true by setting either kit_status_.control_plane_deployed, kit_status_.jobs_running to = true or ' +
         'setting either kit_status_.esxi_settings_configured, kit_status_.kit_settings_configured = false', () => {
        reset();

        component['kit_status_'] = {
          control_plane_deployed: false,
          esxi_settings_configured: false,
          kit_settings_configured: true,
          jobs_running: false
        };
        const returnValue: boolean = component.disable_setup_control_plane_button();

        expect(returnValue).toBeTrue();
      });
    });

    describe('disable_add_node_button()', () => {

      it('should call disable_add_node_button()', () => {
        reset();

        component['kit_status_'] = {
          deploy_kit_running: true
        };
        component.disable_add_node_button();

        expect(component.disable_add_node_button).toHaveBeenCalled();
      });

      it('should call disable_add_node_button() and return true', () => {
        reset();

        component['kit_status_'] = {
          deploy_kit_running: true
        };
        const returnValue: boolean = component.disable_add_node_button();

        expect(returnValue).toBeTrue();
      });

      it('should call disable_add_node_button() and return false', () => {
        reset();

        component['kit_status_'] = {
          deploy_kit_running: false
        };
        const returnValue: boolean = component.disable_add_node_button();

        expect(returnValue).toBeFalse();
      });
    });

    describe('disable_deploy_kit_button()', () => {

      it('should call disable_deploy_kit_button()', () => {
        reset();

        component['kit_status_'] = {
          jobs_running: true,
          ready_to_deploy: false
        };
        component.disable_deploy_kit_button();

        expect(component.disable_deploy_kit_button).toHaveBeenCalled();
      });

      it('should call disable_deploy_kit_button() and return true when kit_status_.jobs_running = true and kit_status_.ready_to_deploy = false', () => {
        reset();

        component['kit_status_'] = {
          jobs_running: true,
          ready_to_deploy: false
        };
        const returnValue: boolean = component.disable_deploy_kit_button();

        expect(returnValue).toBeTrue();
      });

      it('should call disable_deploy_kit_button() and return true when kit_status_.jobs_running = false and kit_status_.ready_to_deploy = false', () => {
        reset();

        component['kit_status_'] = {
          jobs_running: false,
          ready_to_deploy: false
        };
        const returnValue: boolean = component.disable_deploy_kit_button();

        expect(returnValue).toBeTrue();
      });

      it('should call disable_deploy_kit_button() and return true when kit_status_.jobs_running = true and kit_status_.ready_to_deploy = true', () => {
        reset();

        component['kit_status_'] = {
          jobs_running: true,
          ready_to_deploy: true
        };
        const returnValue: boolean = component.disable_deploy_kit_button();

        expect(returnValue).toBeTrue();
      });

      it('should call disable_deploy_kit_button() and return false when kit_status_.jobs_running = false and kit_status_.ready_to_deploy = true', () => {
        reset();

        component['kit_status_'] = {
          jobs_running: false,
          ready_to_deploy: true
        };
        const returnValue: boolean = component.disable_deploy_kit_button();

        expect(returnValue).toBeFalse();
      });
    });

    describe('can_refresh_device_facts()', () => {

      it('should call can_refresh_device_facts()', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeServerClass);
        mock_Node_class_copy.isDeployed = true;
        component.can_refresh_device_facts(mock_Node_class_copy);

        expect(component.can_refresh_device_facts).toHaveBeenCalled();
      });

      it('should call can_refresh_device_facts() and return true', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeServerClass);
        mock_Node_class_copy.isDeployed = true;
        const returnValue: boolean = component.can_refresh_device_facts(mock_Node_class_copy);

        expect(returnValue).toBeTrue();
      });

      it('should call can_refresh_device_facts() and return false', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeServerClass);
        mock_Node_class_copy.isDeployed = false;
        const returnValue: boolean = component.can_refresh_device_facts(mock_Node_class_copy);

        expect(returnValue).toBeFalse();
      });
    });

    describe('refresh_device_facts()', () => {

      it('should call refresh_device_facts()', () => {
        reset();

        component.refresh_device_facts(MockNodeServerClass);

        expect(component.refresh_device_facts).toHaveBeenCalled();
      });

      it('should call api_update_device_facts_() from refresh_device_facts()', () => {
        reset();

        component.refresh_device_facts(MockNodeServerClass);

        expect(component['api_update_device_facts_']).toHaveBeenCalled();
      });
    });

    describe('is_iso_button_group()', () => {

      it('should call is_iso_button_group()', () => {
        reset();

        component.is_iso_button_group(MockNodeSensorClass);

        expect(component.is_iso_button_group).toHaveBeenCalled();
      });

      it('should call is_iso_button_group() and return true when node.node_type = SENSOR && node.deployment_type = ISO', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeSensorClass);
        mock_Node_class_copy.deployment_type = ISO;
        const returnValue: boolean = component.is_iso_button_group(mock_Node_class_copy);

        expect(returnValue).toBeTrue();
      });

      it('should call is_iso_button_group() and return false when node.node_type != SENSOR | node.deployment_type != ISO', () => {
        reset();

        const returnValue: boolean = component.is_iso_button_group(MockNodeServerClass);

        expect(returnValue).toBeFalse();
      });
    });

    describe('is_iso_node_deployed()', () => {

      it('should call is_iso_node_deployed()', () => {
        reset();

        component.is_iso_node_deployed(MockNodeSensorClass);

        expect(component.is_iso_node_deployed).toHaveBeenCalled();
      });

      it('should call is_iso_node_deployed() and return true', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeSensorClass);
        mock_Node_class_copy.deployment_type = ISO;
        mock_Node_class_copy.isDeployed = true;
        const returnValue: boolean = component.is_iso_node_deployed(mock_Node_class_copy);

        expect(returnValue).toBeTrue();
      });

      it('should call is_iso_node_deployed() and return false', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeSensorClass);
        mock_Node_class_copy.deployment_type = ISO;
        mock_Node_class_copy.isDeployed = false;
        const returnValue: boolean = component.is_iso_node_deployed(mock_Node_class_copy);

        expect(returnValue).toBeFalse();
      });
    });

    describe('can_delete_node()', () => {

      it('should call can_delete_node()', () => {
        reset();

        component.can_delete_node(MockNodeSensorClass);

        expect(component.can_delete_node).toHaveBeenCalled();
      });

      it('should call can_delete_node() and return true when node.node_type = SENSOR', () => {
        reset();

        const returnValue: boolean = component.can_delete_node(MockNodeSensorClass);

        expect(returnValue).toBeTrue();
      });

      it('should call can_delete_node() and return true when node.node_type = SERVICE', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeSensorClass);
        mock_Node_class_copy.node_type = SERVICE;
        const returnValue: boolean = component.can_delete_node(MockNodeSensorClass);

        expect(returnValue).toBeTrue();
      });

      it('should call can_delete_node() and return true when node.node_type = MINIO', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeSensorClass);
        mock_Node_class_copy.node_type = MINIO;
        const returnValue: boolean = component.can_delete_node(MockNodeSensorClass);

        expect(returnValue).toBeTrue();
      });

      it('should call can_delete_node() and return true when node.node_type = SERVER and node.isDeployed = false', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeServerClass);
        mock_Node_class_copy.isDeployed = false;
        const returnValue: boolean = component.can_delete_node(mock_Node_class_copy);

        expect(returnValue).toBeTrue();
      });

      it('should call can_delete_node() and return true when node.node_type != SENSOR | SERVICE | MINIO', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeServerClass);
        mock_Node_class_copy.node_type = CONTROL_PLANE;
        const returnValue: boolean = component.can_delete_node(mock_Node_class_copy);

        expect(returnValue).toBeFalse();
      });

      it('should call can_delete_node() and return true when node.node_type = SERVER and node.isDeployed = true', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeServerClass);
        mock_Node_class_copy.isDeployed = true;
        const returnValue: boolean = component.can_delete_node(mock_Node_class_copy);

        expect(returnValue).toBeFalse();
      });
    });

    describe('open_node_info_dialog_window()', () => {

      it('should call open_node_info_dialog_window()', () => {
        reset();

        component.open_node_info_dialog_window(MockNodeSensorClass);

        expect(component.open_node_info_dialog_window).toHaveBeenCalled();
      });
    });

    describe('open_add_node_dialog_window()', () => {

      it('should call open_add_node_dialog_window()', () => {
        reset();

        component.open_add_node_dialog_window();

        expect(component.open_add_node_dialog_window).toHaveBeenCalled();
      });
    });

    describe('download_iso()', () => {

      it('should call download_iso()', () => {
        reset();

        component.download_iso();

        expect(component.download_iso).toHaveBeenCalled();
      });
    });

    describe('download_open_vpn_certs()', () => {

      it('should call download_open_vpn_certs()', () => {
        reset();

        component.download_open_vpn_certs(MockNodeServerClass);

        expect(component.download_open_vpn_certs).toHaveBeenCalled();
      });

      it('should call api_get_open_vpn_certs_() from download_open_vpn_certs()', () => {
        reset();

        component.download_open_vpn_certs(MockNodeServerClass);

        expect(component['api_get_open_vpn_certs_']).toHaveBeenCalled();
      });
    });

    describe('get_vpn_status()', () => {

      it('should call get_vpn_status()', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeSensorClass);
        mock_Node_class_copy.deployment_type = ISO;
        component.get_vpn_status(mock_Node_class_copy);

        expect(component.get_vpn_status).toHaveBeenCalled();
      });

      it('should call can_delete_node() and return true when node.node_type = SENSOR && node.deployment_type = ISO and node.vpn_status = defined', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeSensorClass);
        mock_Node_class_copy.deployment_type = ISO;
        mock_Node_class_copy.vpn_status = 'test';
        const returnValue: boolean = component.get_vpn_status(mock_Node_class_copy);

        expect(returnValue).toBeTrue();
      });

      it('should call can_delete_node() and return false when node.node_type = SENSOR && node.deployment_type = ISO and node.vpn_status = undefined', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeSensorClass);
        mock_Node_class_copy.deployment_type = ISO;
        const returnValue: boolean = component.get_vpn_status(mock_Node_class_copy);

        expect(returnValue).toBeFalse();
      });

      it('should call can_delete_node() and return false when node.node_type = SENSOR && node.deployment_type != ISO', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeSensorClass);
        mock_Node_class_copy.deployment_type = BAREMETAL;
        const returnValue: boolean = component.get_vpn_status(mock_Node_class_copy);

        expect(returnValue).toBeFalse();
      });

      it('should call can_delete_node() and return false when node.node_type != SENSOR && node.deployment_type = ISO', () => {
        reset();

        const mock_Node_class_copy: NodeClass = ObjectUtilitiesClass.create_deep_copy(MockNodeServerClass);
        mock_Node_class_copy.deployment_type = ISO;
        const returnValue: boolean = component.get_vpn_status(mock_Node_class_copy);

        expect(returnValue).toBeFalse();
      });
    });

    describe('open_job_server_std_out_console()', () => {

      it('should call open_job_server_std_out_console()', () => {
        reset();

        component.open_job_server_std_out_console(MockGenericJobAndKeyClass.job_id);

        expect(component.open_job_server_std_out_console).toHaveBeenCalled();
      });
    });

    describe('deploy_kit()', () => {

      it('should call deploy_kit()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of() } as MatDialogRef<typeof component>);

        component['kit_status_'] = {
          base_kit_deployed: true
        };
        component.deploy_kit();

        expect(component.deploy_kit).toHaveBeenCalled();
      });

      it('should call redeploy_kit_() from deploy_kit() when kit_status_.base_kit_deployed = true', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of() } as MatDialogRef<typeof component>);

        component['kit_status_'] = {
          base_kit_deployed: true
        };
        component.deploy_kit();

        expect(component['redeploy_kit_']).toHaveBeenCalled();
      });

      it('should call api_deploy_kit_() from deploy_kit() when kit_status_.base_kit_deployed = false', () => {
        reset();

        component['kit_status_'] = {
          base_kit_deployed: false
        };
        component.deploy_kit();

        expect(component['api_deploy_kit_']).toHaveBeenCalled();
      });
    });

    describe('setup_control_plane()', () => {

      it('should call setup_control_plane()', () => {
        reset();

        component.setup_control_plane();

        expect(component.setup_control_plane).toHaveBeenCalled();
      });

      it('should call api_setup_control_plane_() from setup_control_plane()', () => {
        reset();

        component.setup_control_plane();

        expect(component['api_setup_control_plane_']).toHaveBeenCalled();
      });
    });

    describe('delete_node()', () => {

      it('should call delete_node()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of() } as MatDialogRef<typeof component>);

        component.delete_node(MockNodeSensorClass);

        expect(component.delete_node).toHaveBeenCalled();
      });

      it('should call api_get_catalog_apps_() from delete_node()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of() } as MatDialogRef<typeof component>);

        component.delete_node(MockNodeSensorClass);

        expect(component['api_get_catalog_apps_']).toHaveBeenCalled();
      });
    });

    describe('refresh_kit()', () => {

      it('should call refresh_kit()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.refresh_kit();

        expect(component.refresh_kit).toHaveBeenCalled();
      });

      it('should call api_refresh_kit_() after mat dialog ref closed from within refresh_kit()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.refresh_kit();

        expect(component['api_refresh_kit_']).toHaveBeenCalled();
      });

      it('should not call api_refresh_kit_() after mat dialog ref closed from within refresh_kit()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of() } as MatDialogRef<typeof component>);

        component.refresh_kit();

        expect(component['api_refresh_kit_']).not.toHaveBeenCalled();
      });
    });

    describe('private redeploy_kit_()', () => {

      it('should call redeploy_kit_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component['redeploy_kit_']();

        expect(component['redeploy_kit_']).toHaveBeenCalled();
      });

      it('should call api_deploy_kit_() after mat dialog ref closed from within redeploy_kit_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component['redeploy_kit_']();

        expect(component['api_deploy_kit_']).toHaveBeenCalled();
      });

      it('should not call api_deploy_kit_() after mat dialog ref closed from within redeploy_kit_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['redeploy_kit_']();

        expect(component['api_deploy_kit_']).not.toHaveBeenCalled();
      });
    });

    describe('private open_delete_node_dialog_window_()', () => {

      it('should call open_delete_node_dialog_window_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of() } as MatDialogRef<typeof component>);

        component['open_delete_node_dialog_window_'](MockNodeSensorClass, MockAppClassArray);

        expect(component['open_delete_node_dialog_window_']).toHaveBeenCalled();
      });

      it('should call api_delete_node_() after mat dialog ref closed from within open_delete_node_dialog_window_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component['open_delete_node_dialog_window_'](MockNodeSensorClass, MockAppClassArray);

        expect(component['api_delete_node_']).toHaveBeenCalled();
      });

      it('should not call api_delete_node_() after mat dialog ref closed from within open_delete_node_dialog_window_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of() } as MatDialogRef<typeof component>);

        component['open_delete_node_dialog_window_'](MockNodeSensorClass, MockAppClassArray);

        expect(component['api_delete_node_']).not.toHaveBeenCalled();
      });
    });

    describe('private update_nodes_data_()', () => {

      it('should call update_nodes_data_()', () => {
        reset();

        component['update_nodes_data_'](MockNodeClassArray);

        expect(component['update_nodes_data_']).toHaveBeenCalled();
      });

      it('should call set_nodes_() from update_nodes_data_()', () => {
        reset();

        component['update_nodes_data_'](MockNodeClassArray);

        expect(component['set_nodes_']).toHaveBeenCalled();
      });

      it('should call set_setup_nodes_() from update_nodes_data_()', () => {
        reset();

        component['update_nodes_data_'](MockNodeClassArray);

        expect(component['set_setup_nodes_']).toHaveBeenCalled();
      });

      it('should call set_iso_sensor_detected_() from update_nodes_data_()', () => {
        reset();

        component['update_nodes_data_'](MockNodeClassArray);

        expect(component['set_iso_sensor_detected_']).toHaveBeenCalled();
      });
    });

    describe('private set_nodes_()', () => {

      it('should call set_nodes_()', () => {
        reset();

        component['set_nodes_'](MockNodeClassArray);

        expect(component['set_nodes_']).toHaveBeenCalled();
      });

      it('should call set_nodes_() and set nodes = passed value', () => {
        reset();

        component['set_nodes_'](MockNodeClassArray);

        expect(component.nodes).toEqual(MockNodeClassArray);
      });
    });

    describe('private set_setup_nodes_()', () => {

      it('should call set_setup_nodes_()', () => {
        reset();

        component['set_setup_nodes_']([MockNodeClassArray[0]]);

        expect(component['set_setup_nodes_']).toHaveBeenCalled();
      });

      it('should call set_setup_nodes_() and set setup_nodes = passed value', () => {
        reset();

        component['set_setup_nodes_']([MockNodeClassArray[0]]);

        expect(component.setup_nodes).toEqual([MockNodeClassArray[0]]);
      });
    });

    describe('private set_iso_sensor_detected_()', () => {

      it('should call set_iso_sensor_detected_()', () => {
        reset();

        component.iso_sensor_detected = false;
        component['set_iso_sensor_detected_'](true);

        expect(component['set_iso_sensor_detected_']).toHaveBeenCalled();
      });

      it('should call set_iso_sensor_detected_() and set iso_sensor_detected = true', () => {
        reset();

        component.iso_sensor_detected = false;
        component['set_iso_sensor_detected_'](true);

        expect(component.iso_sensor_detected).toBeTrue();
      });

      it('should call set_iso_sensor_detected_() and set iso_sensor_detected = false', () => {
        reset();

        component.iso_sensor_detected = true;
        component['set_iso_sensor_detected_'](false);

        expect(component.iso_sensor_detected).toBeFalse();
      });
    });

    describe('private setup_websocket_get_socket_on_node_state_change_()', () => {

      it('should call setup_websocket_get_socket_on_node_state_change_()', () => {
        reset();

        component['setup_websocket_get_socket_on_node_state_change_']();

        expect(component['setup_websocket_get_socket_on_node_state_change_']).toHaveBeenCalled();
      });
    });

    describe('private setup_websocket_get_socket_on_kit_status_change_()', () => {

      it('should call setup_websocket_get_socket_on_kit_status_change_()', () => {
        reset();

        component['setup_websocket_get_socket_on_kit_status_change_']();

        expect(component['setup_websocket_get_socket_on_kit_status_change_']).toHaveBeenCalled();
      });
    });

    describe('private api_get_nodes_()', () => {

      it('should call api_get_nodes_()', () => {
        reset();

        component['api_get_nodes_']();

        expect(component['api_get_nodes_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_nodes() from api_get_nodes_()', () => {
        reset();

        component['api_get_nodes_']();

        expect(component['kit_settings_service_'].get_nodes).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_nodes() and handle response and call update_nodes_data_()', () => {
        reset();

        component['api_get_nodes_']();

        expect(component['update_nodes_data_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_nodes() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_nodes').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_nodes_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_nodes() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_nodes').and.returnValue(throwError(mock_http_error_response));

        component['api_get_nodes_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_kit_status_()', () => {

      it('should call api_get_kit_status_()', () => {
        reset();

        component['api_get_kit_status_']();

        expect(component['api_get_kit_status_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_status() from api_get_kit_status_()', () => {
        reset();

        component['api_get_kit_status_']();

        expect(component['kit_settings_service_'].get_kit_status).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_status() and handle response and kit_status_ with response', () => {
        reset();

        component['api_get_kit_status_']();

        expect(component['kit_status_']).toEqual(MockKitStatusClass);
      });

      it('should call kit_settings_service_.get_kit_status() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_kit_status').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_kit_status_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_status() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_kit_status').and.returnValue(throwError(mock_http_error_response));

        component['api_get_kit_status_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_kit_settings_()', () => {

      it('should call api_get_kit_settings_()', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component['api_get_kit_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_settings() from api_get_kit_settings_()', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component['kit_settings_service_'].get_kit_settings).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_settings() and handle response and kit_settings_ with response', () => {
        reset();

        component['api_get_kit_settings_']();

        expect(component['kit_settings_']).toEqual(MockKitSettingsClass);
      });

      it('should call kit_settings_service_.get_kit_settings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_kit_settings').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_kit_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_kit_settings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_kit_settings').and.returnValue(throwError(mock_http_error_response));

        component['api_get_kit_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_update_device_facts_()', () => {

      it('should call api_update_device_facts_()', () => {
        reset();

        component['api_update_device_facts_'](MockNodeSensorClass);

        expect(component['api_update_device_facts_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_device_facts() from api_update_device_facts_()', () => {
        reset();

        component['api_update_device_facts_'](MockNodeSensorClass);

        expect(component['kit_settings_service_'].update_device_facts).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_device_facts() and handle response and call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_update_device_facts_'](MockNodeSensorClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_device_facts() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_device_facts').and.returnValue(throwError(MockErrorMessageClass));

        component['api_update_device_facts_'](MockNodeSensorClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.update_device_facts() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'update_device_facts').and.returnValue(throwError(mock_http_error_response));

        component['api_update_device_facts_'](MockNodeSensorClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_open_vpn_certs_()', () => {

      it('should call api_get_open_vpn_certs_()', () => {
        reset();

        component['api_get_open_vpn_certs_'](MockNodeSensorClass);

        expect(component['api_get_open_vpn_certs_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_open_vpn_certs() from api_get_open_vpn_certs_()', () => {
        reset();

        component['api_get_open_vpn_certs_'](MockNodeSensorClass);

        expect(component['kit_settings_service_'].get_open_vpn_certs).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_open_vpn_certs() and handle response and call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_get_open_vpn_certs_'](MockNodeSensorClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_open_vpn_certs() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_open_vpn_certs').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_open_vpn_certs_'](MockNodeSensorClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.get_open_vpn_certs() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'get_open_vpn_certs').and.returnValue(throwError(mock_http_error_response));

        component['api_get_open_vpn_certs_'](MockNodeSensorClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_deploy_kit_()', () => {

      it('should call api_deploy_kit_()', () => {
        reset();

        component['api_deploy_kit_']();

        expect(component['api_deploy_kit_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.deploy_kit() from api_deploy_kit_()', () => {
        reset();

        component['api_deploy_kit_']();

        expect(component['kit_settings_service_'].deploy_kit).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.deploy_kit() and handle response and call open_job_server_std_out_console()', () => {
        reset();

        component['api_deploy_kit_']();

        expect(component.open_job_server_std_out_console).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.deploy_kit() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'deploy_kit').and.returnValue(throwError(MockErrorMessageClass));

        component['api_deploy_kit_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.deploy_kit() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'deploy_kit').and.returnValue(throwError(mock_http_error_response));

        component['api_deploy_kit_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_refresh_kit_()', () => {

      it('should call api_refresh_kit_()', () => {
        reset();

        component['api_refresh_kit_']();

        expect(component['api_refresh_kit_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.refresh_kit() from api_refresh_kit_()', () => {
        reset();

        component['api_refresh_kit_']();

        expect(component['kit_settings_service_'].refresh_kit).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.refresh_kit() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_refresh_kit_']();

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.refresh_kit() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'refresh_kit').and.returnValue(throwError(mock_http_error_response));

        component['api_refresh_kit_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_setup_control_plane_()', () => {

      it('should call api_setup_control_plane_()', () => {
        reset();

        component['api_setup_control_plane_']();

        expect(component['api_setup_control_plane_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.setup_control_plane() from api_setup_control_plane_()', () => {
        reset();

        component['api_setup_control_plane_']();

        expect(component['kit_settings_service_'].setup_control_plane).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.setup_control_plane() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_setup_control_plane_']();

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.setup_control_plane() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'setup_control_plane').and.returnValue(throwError(mock_http_error_response));

        component['api_setup_control_plane_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_delete_node_()', () => {

      it('should call api_delete_node_()', () => {
        reset();

        component['api_delete_node_'](MockNodeSensorClass);

        expect(component['api_delete_node_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.delete_node() from api_delete_node_()', () => {
        reset();

        component['api_delete_node_'](MockNodeSensorClass);

        expect(component['kit_settings_service_'].delete_node).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.delete_node() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_delete_node_'](MockNodeSensorClass);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.delete_node() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'delete_node').and.returnValue(throwError(MockErrorMessageClass));

        component['api_delete_node_'](MockNodeSensorClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.delete_node() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'delete_node').and.returnValue(throwError(mock_http_error_response));

        component['api_delete_node_'](MockNodeSensorClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_catalog_apps_()', () => {

      it('should call api_get_catalog_apps_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of() } as MatDialogRef<typeof component>);

        component['api_get_catalog_apps_'](MockNodeSensorClass);

        expect(component['api_get_catalog_apps_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_installed_apps() from api_get_catalog_apps_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of() } as MatDialogRef<typeof component>);

        component['api_get_catalog_apps_'](MockNodeSensorClass);

        expect(component['catalog_service_'].get_installed_apps).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_installed_apps() and handle response and call open_delete_node_dialog_window_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of() } as MatDialogRef<typeof component>);

        component['api_get_catalog_apps_'](MockNodeSensorClass);

        expect(component['open_delete_node_dialog_window_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_installed_apps() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_installed_apps').and.returnValue(throwError(mock_http_error_response));

        component['api_get_catalog_apps_'](MockNodeSensorClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';

import {
  MockKitSettingsClass,
  MockKitStatusClass,
  MockKitStatusClassAlt,
  MockNodeClassArray
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { NodeClass } from '../../../../classes';
import { CONTROL_PLANE, DEPLOYMENT_OPTIONS_NODE, MINIO, SENSOR, VIRTUAL } from '../../../../constants/cvah.constants';
import { TestingModule } from '../../../testing-modules/testing.module';
import { AddNodeMatDialogDataInterface } from '../../interfaces/add-node-mat-dialog-data.interface';
import { NodeMngModule } from '../../node-mng.module';
import { AddNodeDialogComponent } from './add-node-dialog.component';

describe('AddNodeDialogComponent', () => {
  let component: AddNodeDialogComponent;
  let fixture: ComponentFixture<AddNodeDialogComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyChangeNodeType: jasmine.Spy<any>;
  let spyChangeDeploymentType: jasmine.Spy<any>;
  let spyIsBaremetalDeployment: jasmine.Spy<any>;
  let spyIsVirtualMachineDeployment: jasmine.Spy<any>;
  let spyIsIsoSensorDeployment: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyGetTooltip: jasmine.Spy<any>;
  let spyCancel: jasmine.Spy<any>;
  let spyAdd: jasmine.Spy<any>;
  let spyCheckNotNodeType: jasmine.Spy<any>;
  let spyChangeDuplicateNode: jasmine.Spy<any>;
  let spyInitializeNodeFormGroup: jasmine.Spy<any>;
  let spySetNodeFormGroup: jasmine.Spy<any>;
  let spyUpdateNodeTypeRadioOptions: jasmine.Spy<any>;
  let spySetBaremetalValidation: jasmine.Spy<any>;
  let spyConstructPostValidationErrorMessage: jasmine.Spy<any>;
  let spySaveK8Ips: jasmine.Spy<any>;
  let spyUpdateAvailableHostanmeIpAndMacAddresses: jasmine.Spy<any>;
  let spyUpdateValidationRefs: jasmine.Spy<any>;
  let spyApiGetKitStatus: jasmine.Spy<any>;
  let spyApiGetGeneralSettings: jasmine.Spy<any>;
  let spyApiGetUnusedIpAddresses: jasmine.Spy<any>;
  let spyApiAddNode: jasmine.Spy<any>;

  // Test Data
  const MOCK_DIALOG_DATA__ADD_NODE_MAT_DIALOG_DATA: AddNodeMatDialogDataInterface = {
    kit_settings: MockKitSettingsClass,
    nodes: MockNodeClassArray.filter((node: NodeClass) => node.node_type !== CONTROL_PLANE),
    setup_nodes: MockNodeClassArray.filter((node: NodeClass) => node.node_type === CONTROL_PLANE)
  };
  const mat_radio_change_sensor: MatRadioChange = {
    source: {} as any,
    value: SENSOR
  };
  const mat_radio_change_control_plane: MatRadioChange = {
    source: {} as any,
    value: CONTROL_PLANE
  };
  const mat_radio_change_minio: MatRadioChange = {
    source: {} as any,
    value: MINIO
  };
  // Will need LTAC added
  // const mat_radio_change_ltac: MatRadioChange = {
  //   source: {} as any,
  //   value: LTAC
  // };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NodeMngModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) },
        { provide: MAT_DIALOG_DATA, useValue: MOCK_DIALOG_DATA__ADD_NODE_MAT_DIALOG_DATA }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNodeDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyChangeNodeType = spyOn(component, 'change_node_type').and.callThrough();
    spyChangeDeploymentType = spyOn(component, 'change_deployment_type').and.callThrough();
    spyIsBaremetalDeployment = spyOn(component, 'is_baremetal_deployment').and.callThrough();
    spyIsVirtualMachineDeployment = spyOn(component, 'is_virtual_machine_deployment').and.callThrough();
    spyIsIsoSensorDeployment = spyOn(component, 'is_iso_sensor_deployment').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyGetTooltip = spyOn(component, 'get_tooltip').and.callThrough();
    spyCancel = spyOn(component, 'cancel').and.callThrough();
    spyAdd = spyOn(component, 'add').and.callThrough();
    spyCheckNotNodeType = spyOn(component, 'check_not_node_type').and.callThrough();
    spyChangeDuplicateNode = spyOn(component, 'change_duplicate_node').and.callThrough();
    spyInitializeNodeFormGroup = spyOn<any>(component, 'initialize_node_form_group_').and.callThrough();
    spySetNodeFormGroup = spyOn<any>(component, 'set_node_form_group_').and.callThrough();
    spyUpdateNodeTypeRadioOptions = spyOn<any>(component, 'update_node_type_radio_options_').and.callThrough();
    spySetBaremetalValidation = spyOn<any>(component, 'set_baremetal_validation_').and.callThrough();
    spyConstructPostValidationErrorMessage = spyOn<any>(component, 'construct_post_validation_error_message_').and.callThrough();
    spySaveK8Ips = spyOn<any>(component, 'save_k8_ips_').and.callThrough();
    spyUpdateAvailableHostanmeIpAndMacAddresses = spyOn<any>(component, 'update_available_hostname_ip_and_mac_addresses_').and.callThrough();
    spyUpdateValidationRefs = spyOn<any>(component, 'update_validation_refs_').and.callThrough();
    spyApiGetKitStatus = spyOn<any>(component, 'api_get_kit_status_').and.callThrough();
    spyApiGetGeneralSettings = spyOn<any>(component, 'api_get_general_settings_').and.callThrough();
    spyApiGetUnusedIpAddresses = spyOn<any>(component, 'api_get_unused_ip_addresses_').and.callThrough();
    spyApiAddNode = spyOn<any>(component, 'api_add_node_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyChangeNodeType.calls.reset();
    spyChangeDeploymentType.calls.reset();
    spyIsBaremetalDeployment.calls.reset();
    spyIsVirtualMachineDeployment.calls.reset();
    spyIsIsoSensorDeployment.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyGetTooltip.calls.reset();
    spyCancel.calls.reset();
    spyAdd.calls.reset();
    spyCheckNotNodeType.calls.reset();
    spyChangeDuplicateNode.calls.reset();
    spyInitializeNodeFormGroup.calls.reset();
    spySetNodeFormGroup.calls.reset();
    spyUpdateNodeTypeRadioOptions.calls.reset();
    spySetBaremetalValidation.calls.reset();
    spyConstructPostValidationErrorMessage.calls.reset();
    spySaveK8Ips.calls.reset();
    spyUpdateAvailableHostanmeIpAndMacAddresses.calls.reset();
    spyUpdateValidationRefs.calls.reset();
    spyApiGetKitStatus.calls.reset();
    spyApiGetGeneralSettings.calls.reset();
    spyApiGetUnusedIpAddresses.calls.reset();
    spyApiAddNode.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create AddNodeDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('AddNodeDialogComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call update_node_type_radio_options_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['update_node_type_radio_options_']).toHaveBeenCalled();
      });

      it('should call api_get_kit_status_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_kit_status_']).toHaveBeenCalled();
      });
    });

    describe('change_node_type()', () => {
      it('should call change_node_type()', () => {
        reset();

        component['kit_status_'] = MockKitStatusClass;
        component.change_node_type(mat_radio_change_sensor);

        expect(component.change_node_type).toHaveBeenCalled();
      });

      it('should call change_node_type() and set node_type from event.value', () => {
        reset();

        component.node_type = undefined;
        component['kit_status_'] = MockKitStatusClass;
        component.change_node_type(mat_radio_change_sensor);

        expect(component.node_type).toEqual(mat_radio_change_sensor.value);
      });

      it('should call change_node_type() and push proper options into deployment_options', () => {
        reset();

        component['kit_status_'] = MockKitStatusClass;
        component.change_node_type(mat_radio_change_minio);

        expect(component.deployment_options).toContain(DEPLOYMENT_OPTIONS_NODE[0]);
        expect(component.deployment_options).toContain(DEPLOYMENT_OPTIONS_NODE[1]);
        expect(component.deployment_options).not.toContain(DEPLOYMENT_OPTIONS_NODE[2]);
        expect(component.deployment_options).not.toContain(DEPLOYMENT_OPTIONS_NODE[3]);

        component['kit_status_'] = MockKitStatusClassAlt;
        component.change_node_type(mat_radio_change_sensor);

        expect(component.deployment_options).toContain(DEPLOYMENT_OPTIONS_NODE[0]);
        expect(component.deployment_options).not.toContain(DEPLOYMENT_OPTIONS_NODE[1]);
        expect(component.deployment_options).toContain(DEPLOYMENT_OPTIONS_NODE[2]);
        expect(component.deployment_options).toContain(DEPLOYMENT_OPTIONS_NODE[3]);
      });

      it('should call change_node_type() and set create_duplicate_ = false if event.value = CONTROL_PLANE | MINIO | LTAC', () => {
        reset();

        component['create_duplicate_'] = true;
        component['kit_status_'] = MockKitStatusClass;
        component.change_node_type(mat_radio_change_control_plane);

        expect(component['create_duplicate_']).toBeFalse();

        // Will need LTAC added
        // component['create_duplicate_'] = true;
        // component.change_node_type(mat_radio_change_ltac);

        // expect(component['create_duplicate_']).toBeFalse();

        component['create_duplicate_'] = true;
        component.change_node_type(mat_radio_change_minio);

        expect(component['create_duplicate_']).toBeFalse();
      });

      it('should call is_virtual_machine_deployment() from change_node_type()', () => {
        reset();

        component['kit_status_'] = MockKitStatusClass;
        component.node_form_group.get('node_type').setValue('Server');
        component.node_form_group.get('deployment_type').setValue(VIRTUAL);
        component.change_node_type(mat_radio_change_sensor);

        expect(component['is_virtual_machine_deployment']).toHaveBeenCalled();
      });
    });
  });
});

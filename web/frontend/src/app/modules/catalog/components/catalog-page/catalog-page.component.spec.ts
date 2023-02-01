import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import {
  MockChartInfoClassArkime,
  MockChartInfoClassArkimeViewerReinstallorUninstall,
  MockChartInfoClassMisp,
  MockChartInfoClassSuricata,
  MockErrorMessageClass,
  MockFormControlClassCheckbox,
  MockFormControlClassErrorType,
  MockFormControlClassInterface,
  MockFormControlClassInvisible,
  MockFormControlClassRegexandRequired,
  MockFormControlClassServiceNodeCheckbox,
  MockFormControlClassSuricataList,
  MockFormControlClassTextbox,
  MockFormControlClassTextinput,
  MockFormControlClassTextinputlist,
  MockFormControlClassZeekList,
  MockFormControlValueObject,
  MockIfaceStateClassENS192,
  MockIfaceStateClassENS224,
  MockNodeClassArray,
  MockSavedValueClassArkime,
  MockSavedValueClassArkimeViewer,
  MockSavedValueClassSuricata,
  MockSavedValueClassSuricata2,
  MockStatusClassArkimeViewer,
  MockStatusClassArkimeViewerDeployed,
  MockStatusClassSuricataDeployed
} from '../../../../../../static-data/class-objects';
import { MockChartInterfaceArray } from '../../../../../../static-data/interface-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import { FormControlClass, NodeClass, ObjectUtilitiesClass, SavedValueClass, StatusClass } from '../../../../classes';
import { CONTINUE_DIALOG_OPTION, TAKE_ME_BACK_DIALOG_OPTION } from '../../../../constants/cvah.constants';
import { CatalogHelmActionInterface, ProcessFromFormGroupInterface, SelectedNodeInterface } from '../../../../interfaces';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import { CatalogModule } from '../../catalog.module';
import {
  DEPLOYED,
  INSTALL,
  NODE_TYPE_CONTROL_PLANE,
  PROCESS_LIST,
  REINSTALL,
  ROUTER_CATALOG,
  SENSOR_VALUE,
  SERVER_ANY_VALUE,
  UNINSTALL,
  UNKNOWN
} from '../../constants/catalog.constants';
import { CheckboxDependentApp, FormControlDependentApps, ProcessInterface } from '../../interfaces';
import { CatalogPageComponent } from './catalog-page.component';

describe('CatalogPageComponent', () => {
  let component: CatalogPageComponent;
  let fixture: ComponentFixture<CatalogPageComponent>;
  let router: Router;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyNavigateToCatalog: jasmine.Spy<any>;
  let spySelectionChangeStepper: jasmine.Spy<any>;
  let spySelectionChangeProcess: jasmine.Spy<any>;
  let spyFilterNodesByProcess: jasmine.Spy<any>;
  let spyCheckboxValue: jasmine.Spy<any>;
  let spyCheckboxSetValue: jasmine.Spy<any>;
  let spyIsFormControlInvalid: jasmine.Spy<any>;
  let spyIsConfigReady: jasmine.Spy<any>;
  let spyCheckInterface: jasmine.Spy<any>;
  let spyCheckFormGroup: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyGetIfaceStates: jasmine.Spy<any>;
  let spyGetLabelOrPlaceholder: jasmine.Spy<any>;
  let spyGetValueFormGroupJsonObject: jasmine.Spy<any>;
  let spyOpenTextEditor: jasmine.Spy<any>;
  let spyRunChartAction: jasmine.Spy<any>;
  let spyServerAnyValueCheck: jasmine.Spy<any>;
  let spyMakeValuesArray: jasmine.Spy<any>;
  let spyResetConfigFormGroup: jasmine.Spy<any>;
  let spyHandleCheckboxDependentApps: jasmine.Spy<any>;
  let spyGetDeploymentName: jasmine.Spy<any>;
  let spyGetFormControl: jasmine.Spy<any>;
  let spyGetValidators: jasmine.Spy<any>;
  let spyGetValuesFile: jasmine.Spy<any>;
  let spyInitializeProcessFormGroup: jasmine.Spy<any>;
  let spyInitializeConfigFormGroup: jasmine.Spy<any>;
  let spyInitializeConfigFormControl: jasmine.Spy<any>;
  let spySetProcessFormGroup: jasmine.Spy<any>;
  let spySetValueFormGroup: jasmine.Spy<any>;
  let spySetDeploymentName: jasmine.Spy<any>;
  let spySetProcessListChildren: jasmine.Spy<any>;
  let spySetChildren: jasmine.Spy<any>;
  let spyCompareValues: jasmine.Spy<any>;
  let spyOpenConfirmMatDialog: jasmine.Spy<any>;
  let spyApiGetCatalogNodes: jasmine.Spy<any>;
  let spyApiGetChartInfo: jasmine.Spy<any>;
  let spyApiGetChartStatuses: jasmine.Spy<any>;
  let spyApiGetSavedValues: jasmine.Spy<any>;
  let spyApiGenerateValuesFile: jasmine.Spy<any>;
  let spyApiCatalogInstall: jasmine.Spy<any>;
  let spyApiCatalogReinstall: jasmine.Spy<any>;
  let spyApiCatalogUninstall: jasmine.Spy<any>;
  let spyApiGetIfaceStates: jasmine.Spy<any>;

  // Router Spy
  let spyRouter: jasmine.Spy<any>;

  // Test Data
  const stepper_selection_event_0: StepperSelectionEvent = new Object({
    selectedIndex: 0
  }) as StepperSelectionEvent;
  const stepper_selection_event_1: StepperSelectionEvent = new Object({
    selectedIndex: 1
  }) as StepperSelectionEvent;
  const stepper_selection_event_2: StepperSelectionEvent = new Object({
    selectedIndex: 2
  }) as StepperSelectionEvent;
  const test_form_group_undefined: FormGroup = undefined;
  const test_form_group_no_form_controls: FormGroup = new FormGroup({});
  const test_form_group: FormGroup = new FormGroup({
    'selectedProcess': new FormControl('')
  });
  const hostname_server: string = 'server';
  const hostname_fake_sensor: string = 'fake-sensor3.fake';
  const checkbox_dependent_apps: CheckboxDependentApp = {
    cortexIntegration: 'cortex'
  };
  const application_arkime: string = 'arkime';
  const application_arkime_viewer: string = 'arkime-viewer';
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });
  const test_form_control_name: string = 'test';
  const fake_form_group: FormGroup = new FormGroup({});
  fake_form_group.addControl(test_form_control_name, new FormControl(true));
  const process_from_form_group: ProcessFromFormGroupInterface = {
    selectedProcess: REINSTALL,
    selectedNodes: MockNodeClassArray.map((n: NodeClass) => n as SelectedNodeInterface),
    node_affinity:SERVER_ANY_VALUE
  };
  const catalog_helm_action: CatalogHelmActionInterface = {
    role: MockChartInfoClassSuricata.id,
    process: process_from_form_group
  };


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        InjectorModule,
        CatalogModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogPageComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyNavigateToCatalog = spyOn(component, 'navigate_to_catalog').and.callThrough();
    spySelectionChangeStepper = spyOn(component, 'selection_change_stepper').and.callThrough();
    spySelectionChangeProcess = spyOn(component, 'selection_change_process').and.callThrough();
    spyFilterNodesByProcess = spyOn(component, 'filter_nodes_by_process').and.callThrough();
    spyCheckboxValue = spyOn(component, 'checkbox_value').and.callThrough();
    spyCheckboxSetValue = spyOn(component, 'checkbox_set_value').and.callThrough();
    spyIsFormControlInvalid = spyOn(component, 'is_form_control_invalid').and.callThrough();
    spyIsConfigReady = spyOn(component, 'is_config_ready').and.callThrough();
    spyCheckInterface = spyOn(component, 'check_interface').and.callThrough();
    spyCheckFormGroup = spyOn(component, 'check_form_group').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyGetIfaceStates = spyOn(component, 'get_iface_states').and.callThrough();
    spyGetLabelOrPlaceholder = spyOn(component, 'get_label_or_placeholder').and.callThrough();
    spyGetValueFormGroupJsonObject = spyOn(component, 'get_value_form_group_json_object').and.callThrough();
    spyOpenTextEditor = spyOn(component, 'open_text_editor').and.callThrough();
    spyRunChartAction = spyOn(component, 'run_chart_action').and.callThrough();
    spyServerAnyValueCheck = spyOn<any>(component, 'server_any_value_check_').and.callThrough();
    spyMakeValuesArray = spyOn<any>(component, 'make_values_array_').and.callThrough();
    spyResetConfigFormGroup = spyOn<any>(component, 'reset_config_form_group_').and.callThrough();
    spyHandleCheckboxDependentApps = spyOn<any>(component, 'handle_checkbox_dependent_apps_').and.callThrough();
    spyGetDeploymentName = spyOn<any>(component, 'get_deployment_name_').and.callThrough();
    spyGetFormControl = spyOn<any>(component, 'get_form_control_').and.callThrough();
    spyGetValidators = spyOn<any>(component, 'get_validators_').and.callThrough();
    spyGetValuesFile = spyOn<any>(component, 'get_values_file_').and.callThrough();
    spyInitializeProcessFormGroup = spyOn<any>(component, 'initialize_process_form_group_').and.callThrough();
    spyInitializeConfigFormGroup = spyOn<any>(component, 'initialize_config_form_group_').and.callThrough();
    spyInitializeConfigFormControl = spyOn<any>(component, 'initialize_config_form_control').and.callThrough();
    spySetProcessFormGroup = spyOn<any>(component, 'set_process_form_group_').and.callThrough();
    spySetValueFormGroup = spyOn<any>(component, 'set_value_form_group_').and.callThrough();
    spySetDeploymentName = spyOn<any>(component, 'set_deployment_name_').and.callThrough();
    spySetProcessListChildren = spyOn<any>(component, 'set_process_list_children_').and.callThrough();
    spySetChildren = spyOn<any>(component, 'set_children_').and.callThrough();
    spyCompareValues = spyOn<any>(component, 'compare_values_').and.callThrough();
    spyOpenConfirmMatDialog = spyOn<any>(component, 'open_confirm_mat_dialog_').and.callThrough();
    spyApiGetCatalogNodes = spyOn<any>(component, 'api_get_catalog_nodes_').and.callThrough();
    spyApiGetChartInfo = spyOn<any>(component, 'api_get_chart_info_').and.callThrough();
    spyApiGetChartStatuses = spyOn<any>(component, 'api_get_chart_statuses_').and.callThrough();
    spyApiGetSavedValues = spyOn<any>(component, 'api_get_saved_values_').and.callThrough();
    spyApiGetSavedValues = spyOn<any>(component, 'check_chart_dependencies_').and.callThrough();
    spyApiGenerateValuesFile = spyOn<any>(component, 'api_generate_values_file_').and.callThrough();
    spyApiCatalogInstall = spyOn<any>(component, 'api_catalog_install_').and.callThrough();
    spyApiCatalogReinstall = spyOn<any>(component, 'api_catalog_reinstall_').and.callThrough();
    spyApiCatalogUninstall = spyOn<any>(component, 'api_catalog_uninstall_').and.callThrough();
    spyApiGetIfaceStates = spyOn<any>(component, 'api_get_iface_states_').and.callThrough();

    // Router spy
    spyRouter = spyOn(router, 'navigate');
    const mockUrlTree = router.parseUrl('/application/arkime');
    // @ts-ignore: force this private property value for testing.
    router.currentUrlTree = mockUrlTree;

    component.chart_info = MockChartInfoClassSuricata;
    component['initialize_process_form_group_']();
    component['statuses_'] = [MockStatusClassSuricataDeployed];

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyNavigateToCatalog.calls.reset();
    spySelectionChangeStepper.calls.reset();
    spySelectionChangeProcess.calls.reset();
    spyFilterNodesByProcess.calls.reset();
    spyCheckboxValue.calls.reset();
    spyCheckboxSetValue.calls.reset();
    spyIsFormControlInvalid.calls.reset();
    spyIsConfigReady.calls.reset();
    spyCheckInterface.calls.reset();
    spyCheckFormGroup.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyGetIfaceStates.calls.reset();
    spyGetLabelOrPlaceholder.calls.reset();
    spyGetValueFormGroupJsonObject.calls.reset();
    spyOpenTextEditor.calls.reset();
    spyRunChartAction.calls.reset();
    spyServerAnyValueCheck.calls.reset();
    spyMakeValuesArray.calls.reset();
    spyResetConfigFormGroup.calls.reset();
    spyHandleCheckboxDependentApps.calls.reset();
    spyGetDeploymentName.calls.reset();
    spyGetFormControl.calls.reset();
    spyGetValidators.calls.reset();
    spyGetValuesFile.calls.reset();
    spyInitializeProcessFormGroup.calls.reset();
    spyInitializeConfigFormGroup.calls.reset();
    spyInitializeConfigFormControl.calls.reset();
    spySetProcessFormGroup.calls.reset();
    spySetValueFormGroup.calls.reset();
    spySetDeploymentName.calls.reset();
    spySetProcessListChildren.calls.reset();
    spySetChildren.calls.reset();
    spyCompareValues.calls.reset();
    spyOpenConfirmMatDialog.calls.reset();
    spyApiGetCatalogNodes.calls.reset();
    spyApiGetChartInfo.calls.reset();
    spyApiGetChartStatuses.calls.reset();
    spyApiGetSavedValues.calls.reset();
    spyApiGenerateValuesFile.calls.reset();
    spyApiCatalogInstall.calls.reset();
    spyApiCatalogReinstall.calls.reset();
    spyApiCatalogUninstall.calls.reset();
    spyApiGetIfaceStates.calls.reset();

    fake_form_group.controls[test_form_control_name].setValue(true);
    fake_form_group.controls[test_form_control_name].enable();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create CatalogPageComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('CatalogPageComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call navigate_to_catalog() from ngOnInit() when application = null', () => {
        reset();

        const mock_url_tree: UrlTree = router.parseUrl('');
        // @ts-ignore: force this private property value for testing.
        router.currentUrlTree = mock_url_tree;

        component.ngOnInit();

        expect(component['navigate_to_catalog']).toHaveBeenCalled();
      });

      it('should call api_get_chart_info_() from ngOnInit() when application.length != 0', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_chart_info_']).toHaveBeenCalled();
      });
    });

    describe('navigate_to_catalog()', () => {
      it('should call navigate_to_catalog()', () => {
        reset();

        component.navigate_to_catalog();

        expect(component.navigate_to_catalog).toHaveBeenCalled();
      });

      it('should call router_.navigate() from navigate_to_catalog()', () => {
        reset();

        component.navigate_to_catalog();

        expect(spyRouter).toHaveBeenCalledWith([ROUTER_CATALOG]);
      });
    });

    describe('selection_change_stepper()', () => {
      it('should call selection_change_stepper()', () => {
        reset();

        component.selection_change_stepper(stepper_selection_event_1);

        expect(component.selection_change_stepper).toHaveBeenCalled();
      });

      it('should call server_any_value_check_() from navigate_to_catalog()', () => {
        reset();

        component.selection_change_stepper(stepper_selection_event_1);

        expect(component['server_any_value_check_']).toHaveBeenCalled();
      });

      it('should call is_config_ready() from navigate_to_catalog()', () => {
        reset();

        component.selection_change_stepper(stepper_selection_event_1);

        expect(component.is_config_ready).toHaveBeenCalled();
      });

      it('should call initialize_config_form_group_() from navigate_to_catalog() when is_config_ready() returns true', () => {
        reset();

        component['initialize_process_form_group_']();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component.selection_change_stepper(stepper_selection_event_1);

        expect(component['initialize_config_form_group_']).toHaveBeenCalled();
      });

      it('should call get_values_file_() from navigate_to_catalog()', () => {
        reset();

        component['initialize_process_form_group_']();
        component['initialize_config_form_group_']();
        component.selection_change_stepper(stepper_selection_event_2);

        expect(component['get_values_file_']).toHaveBeenCalled();
      });

      it('should call initialize_process_form_group_() from navigate_to_catalog()', () => {
        reset();

        component.selection_change_stepper(stepper_selection_event_0);

        expect(component['initialize_process_form_group_']).toHaveBeenCalled();
      });
    });

    describe('selection_change_process()', () => {
      it('should call selection_change_process()', () => {
        reset();

        // calling initialize_process_form_group_() and setting the value for selected
        // process will allow this test to go though both if statements
        component['initialize_process_form_group_']();
        component.process_form_group.controls['selectedProcess'].setValue(INSTALL);
        component.selection_change_process();

        expect(component.selection_change_process).toHaveBeenCalled();
      });

      it('should call selection_change_process() and process_form_group.controls[selectedNodes].enable()', () => {
        reset();

        // calling initialize_process_form_group_() and setting the value for selected
        // process will allow this test to go though both if statements
        component['initialize_process_form_group_']();
        component.process_form_group.controls['selectedProcess'].setValue(INSTALL);
        component.process_form_group.controls['selectedProcess'].enable();
        component.selection_change_process();

        expect(component.process_form_group.controls['selectedNodes'].enabled).toBeTrue();
      });

      it('should call selection_change_process() and process_form_group.controls[selectedNodes].setValidators([Validators.required])', () => {
        reset();

        // calling initialize_process_form_group_() and setting the value for selected
        // process will allow this test to go though both if statements
        component['initialize_process_form_group_']();
        component.process_form_group.controls['selectedProcess'].setValue(INSTALL);
        component.process_form_group.controls['selectedProcess'].enable();
        component.process_form_group.controls['node_affinity'].setValue(SENSOR_VALUE);
        component.selection_change_process();

        expect(component.process_form_group.controls['selectedNodes'].invalid).toBeTrue();
      });
    });

    describe('filter_nodes_by_process()', () => {
      it('should call filter_nodes_by_process()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['statuses_'] = [MockStatusClassArkimeViewerDeployed];
        component['api_get_catalog_nodes_']();
        component.filter_nodes_by_process(REINSTALL);

        expect(component.filter_nodes_by_process).toHaveBeenCalled();
      });

      it('should call filter_nodes_by_process() and set node_list = process.children', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['statuses_'] = [MockStatusClassArkimeViewerDeployed];
        component['api_get_catalog_nodes_']();
        component.filter_nodes_by_process(REINSTALL);

        expect(component.node_list).toEqual(component.process_list[0].children);
      });

      it('should call filter_nodes_by_process() and return node_list', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['api_get_catalog_nodes_']();
        const return_value: NodeClass[] = component.filter_nodes_by_process(INSTALL);

        expect(return_value).toEqual(component.node_list);
      });
    });

    describe('checkbox_value()', () => {
      it('should call checkbox_value()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component.checkbox_value(component.process_form_group.controls['selectedNodes'].value[0], MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0]);

        expect(component.checkbox_value).toHaveBeenCalled();
      });

      it('should call checkbox_value() and return true', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component['service_node_available_'] = true;
        const return_value: boolean = component.checkbox_value(component.process_form_group.controls['selectedNodes'].value[0], MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0]);

        expect(return_value).toBeTrue();
      });

      it('should call checkbox_value() and return false', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component['service_node_available_'] = true;
        (component.config_form_group.controls[component.process_form_group.controls['selectedNodes'].value[0].hostname] as FormGroup).controls[MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0].name].setValue(false);
        const return_value: boolean = component.checkbox_value(component.process_form_group.controls['selectedNodes'].value[0], MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0]);

        expect(return_value).toBeFalse();
      });
    });

    describe('checkbox_set_value()', () => {
      it('should call checkbox_set_value()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component.checkbox_set_value(component.process_form_group.controls['selectedNodes'].value[0], MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0]);

        expect(component.checkbox_set_value).toHaveBeenCalled();
      });

      it('should call checkbox_set_value() and set form control value to trueValue', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component['service_node_available_'] = true;
        (component.config_form_group.controls[component.process_form_group.controls['selectedNodes'].value[0].hostname] as FormGroup).controls[MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0].name].setValue(true);
        component.checkbox_set_value(component.process_form_group.controls['selectedNodes'].value[0], MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0]);

        expect((component.config_form_group.controls[component.process_form_group.controls['selectedNodes'].value[0].hostname] as FormGroup).controls[MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0].name].value).toEqual(MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0].trueValue);
      });

      it('should call checkbox_set_value() and set form control value to falseValue', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component['service_node_available_'] = true;
        (component.config_form_group.controls[component.process_form_group.controls['selectedNodes'].value[0].hostname] as FormGroup).controls[MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0].name].setValue(false);
        component.checkbox_set_value(component.process_form_group.controls['selectedNodes'].value[0], MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0]);

        expect((component.config_form_group.controls[component.process_form_group.controls['selectedNodes'].value[0].hostname] as FormGroup).controls[MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0].name].value).toEqual(MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0].falseValue);
      });
    });

    describe('is_form_control_invalid()', () => {
      it('should call is_form_control_invalid()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component.is_form_control_invalid(component.process_form_group.controls['selectedNodes'].value[0], MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[0]);

        expect(component.is_form_control_invalid).toHaveBeenCalled();
      });

      it('should call is_form_control_invalid() and return true', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component['service_node_available_'] = true;
        (component.config_form_group.controls[component.process_form_group.controls['selectedNodes'].value[0].hostname] as FormGroup).controls[MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[1].name].setValue(null);
        const return_value: boolean = component.is_form_control_invalid(component.process_form_group.controls['selectedNodes'].value[0], MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[1]);

        expect(return_value).toBeTrue();
      });

      it('should call is_form_control_invalid() and return false', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component['service_node_available_'] = true;
        (component.config_form_group.controls[component.process_form_group.controls['selectedNodes'].value[0].hostname] as FormGroup).controls[MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[1].name].setValue('test');
        const return_value: boolean = component.is_form_control_invalid(component.process_form_group.controls['selectedNodes'].value[0], MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[1]);

        expect(return_value).toBeFalse();
      });
    });

    describe('is_config_ready()', () => {
      it('should call is_config_ready()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.is_config_ready();

        expect(component.is_config_ready).toHaveBeenCalled();
      });

      it('should call is_config_ready() and return true', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue([]);
        const return_value: boolean = component.is_config_ready();

        expect(return_value).toBeTrue();
      });

      it('should call is_config_ready() and return false', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(UNINSTALL);
        const return_value: boolean = component.is_config_ready();

        expect(return_value).toBeFalse();
      });
    });

    describe('check_interface()', () => {
      it('should call check_interface()', () => {
        reset();

        component['api_get_iface_states_'](MockNodeClassArray[1]);
        component.check_interface(MockNodeClassArray[1].hostname, MockIfaceStateClassENS224.name);

        expect(component.check_interface).toHaveBeenCalled();
      });

      it('should call check_interface() and return true', () => {
        reset();

        component['api_get_iface_states_'](MockNodeClassArray[1]);
        const return_value: boolean = component.check_interface(MockNodeClassArray[1].hostname, MockIfaceStateClassENS192.name);

        expect(return_value).toBeTrue();
      });

      it('should call check_interface() and return false', () => {
        reset();

        component['api_get_iface_states_'](MockNodeClassArray[1]);
        const return_value: boolean = component.check_interface(MockNodeClassArray[1].hostname, MockIfaceStateClassENS224.name);

        expect(return_value).toBeFalse();
      });
    });

    describe('check_form_group()', () => {
      it('should call check_form_group()', () => {
        reset();

        component.check_form_group(test_form_group);

        expect(component.check_form_group).toHaveBeenCalled();
      });

      it('should call check_form_group() and return false when form group undefined', () => {
        reset();

        const return_value: boolean = component.check_form_group(test_form_group_undefined);

        expect(return_value).toBeFalse();
      });

      it('should call check_form_group() and return false when form group no controls', () => {
        reset();

        const return_value: boolean = component.check_form_group(test_form_group_no_form_controls);

        expect(return_value).toBeFalse();
      });

      it('should call check_form_group() and return true when form group', () => {
        reset();

        const return_value: boolean = component.check_form_group(test_form_group);

        expect(return_value).toBeTrue();
      });
    });

    describe('get_error_message()', () => {
      it('should call get_error_message()', () => {
        reset();

        component.get_error_message(MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[1]);

        expect(component.get_error_message).toHaveBeenCalled();
      });

      it('should call get_error_message() and return error_message', () => {
        reset();

        const return_value: string = component.get_error_message(MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[1]);

        expect(return_value).toEqual(MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[1].error_message);
      });
    });

    describe('get_iface_states()', () => {
      it('should call get_iface_states()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkime;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.get_iface_states();

        expect(component.get_iface_states).toHaveBeenCalled();
      });

      it('should call api_get_iface_states_() and from get_iface_states()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkime;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(INSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray);
        component.get_iface_states();

        expect(component['api_get_iface_states_']).toHaveBeenCalled();
      });
    });

    describe('get_label_or_placeholder()', () => {
      it('should call get_label_or_placeholder()', () => {
        reset();

        component.get_label_or_placeholder(MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[1].name);

        expect(component.get_label_or_placeholder).toHaveBeenCalled();
      });

      it('should call get_label_or_placeholder() and return error_message', () => {
        reset();

        const return_value: string = component.get_label_or_placeholder(MockChartInfoClassArkimeViewerReinstallorUninstall.formControls[1].name);

        expect(return_value).toEqual('Username');
      });
    });

    describe('get_value_form_group_json_object()', () => {
      it('should call get_value_form_group_json_object()', () => {
        reset();

        const deep_copy_node_class: NodeClass[] = MockNodeClassArray.map((n: NodeClass) => ObjectUtilitiesClass.create_deep_copy<NodeClass>(n));
        deep_copy_node_class[1].deployment_name = 'Arkime-viewer';
        const deployment_name_object: string = JSON.stringify({
          test: 'test'
        }, undefined, 2);
        const deployment_name: string = 'Arkime-viewer';
        component.value_form_group = new FormGroup({});
        component.value_form_group.addControl(deployment_name, new FormControl(deployment_name_object));
        component.get_value_form_group_json_object(deep_copy_node_class[1]);

        expect(component.get_value_form_group_json_object).toHaveBeenCalled();
      });

      it('should call get_value_form_group_json_object() and return string', () => {
        reset();

        const deep_copy_node_class: NodeClass[] = MockNodeClassArray.map((n: NodeClass) => ObjectUtilitiesClass.create_deep_copy<NodeClass>(n));
        deep_copy_node_class[1].deployment_name = 'Arkime-viewer';
        const deployment_name_object: string = JSON.stringify({
          test: 'test'
        }, undefined, 2);
        const deployment_name: string = 'Arkime-viewer';
        component.value_form_group = new FormGroup({});
        component.value_form_group.addControl(deployment_name, new FormControl(deployment_name_object));
        const return_value: string = component.get_value_form_group_json_object(deep_copy_node_class[1]);

        expect(return_value).toEqual(deployment_name_object);
      });
    });

    describe('open_text_editor()', () => {
      it('should call open_text_editor()', () => {
        reset();

        const deep_copy_node_class: NodeClass[] = MockNodeClassArray.map((n: NodeClass) => ObjectUtilitiesClass.create_deep_copy<NodeClass>(n));
        deep_copy_node_class[1].deployment_name = 'Arkime-viewer';
        const deployment_name_object: string = JSON.stringify({
          test: 'test'
        }, undefined, 2);
        const deployment_name_object_reponse: string = JSON.stringify({
          test: 'test change'
        }, undefined, 2);
        const deployment_name: string = 'Arkime-viewer';

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(deployment_name_object_reponse) } as MatDialogRef<typeof component>);

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component.value_form_group = new FormGroup({});
        component.value_form_group.addControl(deployment_name, new FormControl(deployment_name_object));
        component.open_text_editor(deep_copy_node_class[1]);

        expect(component.open_text_editor).toHaveBeenCalled();
      });

      it('should call get_value_form_group_json_object() from open_text_editor()', () => {
        reset();

        const deep_copy_node_class: NodeClass[] = MockNodeClassArray.map((n: NodeClass) => ObjectUtilitiesClass.create_deep_copy<NodeClass>(n));
        deep_copy_node_class[1].deployment_name = 'Arkime-viewer';
        const deployment_name_object: string = JSON.stringify({
          test: 'test'
        }, undefined, 2);
        const deployment_name_object_reponse: string = JSON.stringify({
          test: 'test change'
        }, undefined, 2);
        const deployment_name: string = 'Arkime-viewer';

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(deployment_name_object_reponse) } as MatDialogRef<typeof component>);

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component.value_form_group = new FormGroup({});
        component.value_form_group.addControl(deployment_name, new FormControl(deployment_name_object));
        component.open_text_editor(deep_copy_node_class[1]);

        expect(component['get_value_form_group_json_object']).toHaveBeenCalled();
      });

      it('should call set value_form_group.controls[node.deployment_name] with return response after mat dialog ref closed from within open_text_editor_()', () => {
        reset();

        const deep_copy_node_class: NodeClass[] = MockNodeClassArray.map((n: NodeClass) => ObjectUtilitiesClass.create_deep_copy<NodeClass>(n));
        deep_copy_node_class[1].deployment_name = 'Arkime-viewer';
        const deployment_name_object: string = JSON.stringify({
          test: 'test'
        }, undefined, 2);
        const deployment_name_object_reponse: string = JSON.stringify({
          test: 'test change'
        }, undefined, 2);
        const deployment_name: string = 'Arkime-viewer';

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(deployment_name_object_reponse) } as MatDialogRef<typeof component>);

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component.value_form_group = new FormGroup({});
        component.value_form_group.addControl(deployment_name, new FormControl(deployment_name_object));
        component.open_text_editor(deep_copy_node_class[1]);

        expect(component.value_form_group.controls[deep_copy_node_class[1].deployment_name].value).toEqual(deployment_name_object_reponse);
      });
    });

    describe('run_chart_action()', () => {
      it('should call run_chart_action()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(INSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component.get_iface_states();
        component.selection_change_stepper(stepper_selection_event_2);
        component.run_chart_action();

        expect(component.run_chart_action).toHaveBeenCalled();
      });

      it('should call make_values_array_() from run_chart_action() when process_form_group.selectedProcess = INSTALL', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(INSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component.get_iface_states();
        component.selection_change_stepper(stepper_selection_event_2);
        component.run_chart_action();

        expect(component['make_values_array_']).toHaveBeenCalled();
      });

      it('should call api_catalog_install_() from run_chart_action() when process_form_group.selectedProcess = INSTALL', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(INSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component.get_iface_states();
        component.selection_change_stepper(stepper_selection_event_2);
        component.run_chart_action();

        expect(component['api_catalog_install_']).toHaveBeenCalled();
      });

      it('should call make_values_array_() from run_chart_action() when process_form_group.selectedProcess = REINSTALL', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component.get_iface_states();
        component.selection_change_stepper(stepper_selection_event_2);
        component.run_chart_action();

        expect(component['make_values_array_']).toHaveBeenCalled();
      });

      it('should call api_catalog_reinstall_() from run_chart_action() when process_form_group.selectedProcess = REINSTALL', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.selection_change_stepper(stepper_selection_event_1);
        component.get_iface_states();
        component.selection_change_stepper(stepper_selection_event_2);
        component.run_chart_action();

        expect(component['api_catalog_reinstall_']).toHaveBeenCalled();
      });

      it('should call server_any_value_check_() from run_chart_action() when process_form_group.selectedProcess = UNINSTALL', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(UNINSTALL);
        component.run_chart_action();

        expect(component['server_any_value_check_']).toHaveBeenCalled();
      });

      it('should call set_deployment_name_() from run_chart_action() when process_form_group.selectedProcess = UNINSTALL', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(UNINSTALL);
        component.run_chart_action();

        expect(component['set_deployment_name_']).toHaveBeenCalled();
      });

      it('should call api_catalog_uninstall_() from run_chart_action() when process_form_group.selectedProcess = UNINSTALL', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(UNINSTALL);
        component.run_chart_action();

        expect(component['api_catalog_uninstall_']).toHaveBeenCalled();
      });

      it('should call navigate_to_catalog() from run_chart_action() when process_form_group.selectedProcess = undefined / null', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.process_form_group.controls['selectedProcess'].setValue(null);
        component.run_chart_action();

        expect(component['navigate_to_catalog']).toHaveBeenCalled();
      });
    });

    describe('private server_any_value_check_()', () => {
      it('should call server_any_value_check_()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(INSTALL);
        component.nodes = MockNodeClassArray;
        component['server_any_value_check_']();

        expect(component['server_any_value_check_']).toHaveBeenCalled();
      });

      it('should call server_any_value_check_() and set process_form_group.selectedNodes when node type = Control-Plane', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(INSTALL);
        component.nodes = MockNodeClassArray;
        component['server_any_value_check_']();

        expect(component.process_form_group.controls['selectedNodes'].value.length).toEqual(1);
      });
    });

    describe('private make_values_array_()', () => {
      it('should call make_values_array_()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.nodes = MockNodeClassArray;
        component.selection_change_stepper(stepper_selection_event_1);
        component.selection_change_stepper(stepper_selection_event_2);
        component['saved_values_'] = MockSavedValueClassArkimeViewer;
        component['get_values_file_']();
        component['make_values_array_']();

        expect(component['make_values_array_']).toHaveBeenCalled();
      });

      it('should call make_values_array_() and return object from value_form_group', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.nodes = MockNodeClassArray;
        component.selection_change_stepper(stepper_selection_event_1);
        component.selection_change_stepper(stepper_selection_event_2);
        component['saved_values_'] = MockSavedValueClassArkimeViewer;
        component['get_values_file_']();
        const return_value: Object = component['make_values_array_']();

        expect(return_value['Arkime-viewer']).toEqual(component.value_form_group.controls['Arkime-viewer']);
      });
    });

    describe('private reset_config_form_group_()', () => {
      it('should call reset_config_form_group_()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.nodes = MockNodeClassArray;
        component.selection_change_stepper(stepper_selection_event_1);
        component['reset_config_form_group_']();

        expect(component['reset_config_form_group_']).toHaveBeenCalled();
      });

      it('should call reset_config_form_group_() and reset config_form_group', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.nodes = MockNodeClassArray;
        component.selection_change_stepper(stepper_selection_event_1);
        component['reset_config_form_group_']();

        expect(component.config_form_group.pristine).toBeTrue();
      });

      it('should call reset_config_form_group_() and set config_form_group as new FormGroup', () => {
        reset();

        component['reset_config_form_group_']();

        expect(Object.keys(component.config_form_group.controls).length).toEqual(0);
      });
    });

    describe('private handle_checkbox_dependent_apps_()', () => {
      it('should call handle_checkbox_dependent_apps_()', () => {
        reset();

        component.config_form_group = new FormGroup({});
        const form_control_group: FormGroup = new FormGroup({});
        MockChartInfoClassMisp.formControls.forEach((form_control: FormControlClass) => form_control_group.addControl(form_control.name, new FormControl(form_control.default_value)));
        component.config_form_group.addControl(hostname_server, form_control_group);
        component['handle_checkbox_dependent_apps_'](hostname_server, checkbox_dependent_apps);

        expect(component['handle_checkbox_dependent_apps_']).toHaveBeenCalled();
      });

      it('should call check_chart_dependencies_() from handle_checkbox_dependent_apps_()', () => {
        reset();

        component.config_form_group = new FormGroup({});
        const form_control_group: FormGroup = new FormGroup({});
        MockChartInfoClassMisp.formControls.forEach((form_control: FormControlClass) => form_control_group.addControl(form_control.name, new FormControl(form_control.default_value)));
        component.config_form_group.addControl(hostname_server, form_control_group);
        component['handle_checkbox_dependent_apps_'](hostname_server, checkbox_dependent_apps);

        expect(component['check_chart_dependencies_']).toHaveBeenCalled();
      });
    });

    describe('private get_deployment_name_()', () => {
      it('should call get_deployment_name_()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['get_deployment_name_'](application_arkime_viewer, hostname_server);

        expect(component['get_deployment_name_']).toHaveBeenCalled();
      });

      it('should call get_deployment_name_() and return deployment_name = application', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: string = component['get_deployment_name_'](application_arkime_viewer, hostname_server);

        expect(return_value).toEqual(application_arkime_viewer);
      });

      it('should call get_deployment_name_() and return fake-sensor3-arkime', () => {
        reset();

        component.chart_info = MockChartInfoClassArkime;
        const return_value: string = component['get_deployment_name_'](application_arkime, hostname_fake_sensor);

        expect(return_value).toEqual('fake-sensor3-arkime');
      });

      it('should call get_deployment_name_() and return value.deployment_name', () => {
        reset();

        const fake_value_object: Object = {
          deployment_name: 'fake-sensor-arkime'
        };

        component.chart_info = MockChartInfoClassArkime;
        const return_value: string = component['get_deployment_name_'](application_arkime, hostname_fake_sensor, fake_value_object);

        expect(return_value).toEqual(fake_value_object['deployment_name']);
      });
    });

    describe('private get_form_control_()', () => {
      it('should call get_form_control_()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassTextinput, hostname_server);

        expect(component['get_form_control_']).toHaveBeenCalled();
        expect(return_value instanceof FormControl).toBeTrue();
      });

      it('should call get_validators_() from get_form_control_()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['get_form_control_'](MockFormControlClassTextinput, hostname_server);

        expect(component['get_validators_']).toHaveBeenCalled();
      });

      it('should call get_form_control_() and return textinput formcontrol default_value', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassTextinput, hostname_server);

        expect(return_value.value).toEqual(MockFormControlClassTextinput.default_value);
      });

      it('should call get_form_control_() and return textinput formcontrol with value[form_control.name]', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassTextinput, hostname_server, MockFormControlValueObject);

        expect(return_value.value).toEqual(MockFormControlValueObject[MockFormControlClassTextinput.name]);
      });

      it('should call get_form_control_() and return textbox formcontrol default_value', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassTextbox, hostname_server);

        expect(return_value.value).toEqual(MockFormControlClassTextbox.default_value);
      });

      it('should call get_form_control_() and return textbox formcontrol with value[form_control.name]', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassTextbox, hostname_server, MockFormControlValueObject);

        expect(return_value.value).toEqual(MockFormControlValueObject[MockFormControlClassTextbox.name]);
      });

      it('should call get_form_control_() and return textinputlist formcontrol default_value', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassTextinputlist, hostname_server);

        expect(return_value.value).toEqual(MockFormControlClassTextinputlist.default_value);
      });

      it('should call get_form_control_() and return textinputlist formcontrol with value[form_control.name]', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassTextinputlist, hostname_server, MockFormControlValueObject);

        expect(return_value.value).toEqual(MockFormControlValueObject[MockFormControlClassTextinputlist.name]);
      });

      it('should call get_form_control_() and return invisible formcontrol hostname', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassInvisible, hostname_server);

        expect(return_value.value).toEqual(hostname_server);
      });

      it('should call get_form_control_() and return invisible formcontrol with value[form_control.name]', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassInvisible, hostname_server, MockFormControlValueObject);

        expect(return_value.value).toEqual(MockFormControlValueObject[MockFormControlClassInvisible.name]);
      });

      it('should call get_form_control_() and return checkbox formcontrol default_value', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassCheckbox, hostname_server);

        expect(return_value.value).toEqual(MockFormControlClassCheckbox.default_value);
      });

      it('should call get_form_control_() and return checkbox formcontrol with value[form_control.name]', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassCheckbox, hostname_server, MockFormControlValueObject);

        expect(return_value.value).toEqual(MockFormControlValueObject[MockFormControlClassCheckbox.name]);
      });

      it('should call get_form_control_() and return interface formcontrol []', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassInterface, hostname_server);

        expect(return_value.value).toEqual([]);
      });

      it('should call get_form_control_() and return interface formcontrol with value[form_control.name]', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassInterface, hostname_server, MockFormControlValueObject);

        expect(return_value.value).toEqual(MockFormControlValueObject[MockFormControlClassInterface.name]);
      });

      it('should call get_form_control_() and return suricata-list formcontrol default_value', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassSuricataList, hostname_server);

        expect(return_value.value).toEqual(MockFormControlClassSuricataList.default_value);
      });

      it('should call get_form_control_() and return suricata-list formcontrol with value[form_control.name]', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassSuricataList, hostname_server, MockFormControlValueObject);

        expect(return_value.value).toEqual(MockFormControlValueObject[MockFormControlClassSuricataList.name]);
      });

      it('should call get_form_control_() and return zeek-list formcontrol default_value', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassZeekList, hostname_server);

        expect(return_value.value).toEqual(MockFormControlClassZeekList.default_value);
      });

      it('should call get_form_control_() and return zeek-list formcontrol with value[form_control.name]', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassZeekList, hostname_server, MockFormControlValueObject);

        expect(return_value.value).toEqual(MockFormControlValueObject[MockFormControlClassZeekList.name]);
      });

      it('should call get_form_control_() and return service-node-checkbox formcontrol service_node_available_', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassServiceNodeCheckbox, hostname_server);

        expect(return_value.value).toEqual(component['service_node_available_']);
      });

      it('should call get_form_control_() and return service-node-checkbox formcontrol with value[form_control.name]', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassServiceNodeCheckbox, hostname_server, MockFormControlValueObject);

        expect(return_value.value).toEqual(MockFormControlValueObject[MockFormControlClassServiceNodeCheckbox.name]);
      });

      it('should call get_form_control_() and return default formcontrol service_node_available_', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        const return_value: FormControl = component['get_form_control_'](MockFormControlClassErrorType, hostname_server);

        expect(return_value.value).toEqual([]);
      });
    });

    describe('private get_validators_()', () => {
      it('should call get_validators_()', () => {
        reset();

        component['get_validators_'](MockFormControlClassErrorType);

        expect(component['get_validators_']).toHaveBeenCalled();
      });

      it('should call get_validators_() and return ValidatorFn', () => {
        reset();

        const return_value: ValidatorFn = component['get_validators_'](MockFormControlClassRegexandRequired);

        expect(return_value).toBeDefined();
      });
    });

    describe('private get_values_file_()', () => {
      it('should call get_values_file_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component.selection_change_stepper(stepper_selection_event_1);
        component['get_values_file_']();

        expect(component['get_values_file_']).toHaveBeenCalled();
      });

      it('should call get_values_file_() and set config_array with config_form_group raw values', () => {
        reset();

        component['config_array_'] = null;
        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component.selection_change_stepper(stepper_selection_event_1);
        component['get_values_file_']();

        expect(component['config_array_']).toBeDefined();
      });

      it('should call get_values_file_() and set config_array with config_form_group raw values and only perform jason_parse on home_net and external_net if not empty string', () => {
        reset();

        const saved_values_suricata: SavedValueClass[] = MockSavedValueClassSuricata.map((sv: SavedValueClass) => ObjectUtilitiesClass.create_deep_copy(sv));
        saved_values_suricata[0].values['external_net'] = [
          '192.168.0.0/24'
        ];

        component['config_array_'] = null;
        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = saved_values_suricata;
        component.selection_change_stepper(stepper_selection_event_1);
        component['get_values_file_']();

        expect(component['config_array_']).toBeDefined();
      });

      it('should call compare_values_() from get_values_file_()', () => {
        reset();

        component['config_array_'] = null;
        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component.selection_change_stepper(stepper_selection_event_1);
        component['get_values_file_']();

        expect(component['compare_values_']).toHaveBeenCalled();
      });

      it('should call api_generate_values_file_() from get_values_file_() when saved_values_ is defined', () => {
        reset();

        component['config_array_'] = null;
        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata.map((sv: SavedValueClass) => ObjectUtilitiesClass.create_deep_copy<SavedValueClass>(sv));
        component.selection_change_stepper(stepper_selection_event_1);
        component['saved_values_'].forEach((saved_value: SavedValueClass) => saved_value.values['node_hostname'] += '-dev');
        component['get_values_file_']();

        expect(component['api_generate_values_file_']).toHaveBeenCalled();
      });

      it('should call api_generate_values_file_() from get_values_file_() when saved_values_ is undefined', () => {
        reset();

        component['config_array_'] = null;
        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component.selection_change_stepper(stepper_selection_event_1);
        component['saved_values_'] = undefined;
        component['get_values_file_']();

        expect(component['api_generate_values_file_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_process_form_group_()', () => {
      it('should call initialize_process_form_group_()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();

        expect(component['initialize_process_form_group_']).toHaveBeenCalled();
      });

      it('should call set_process_form_group_() from initialize_process_form_group_()', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();

        expect(component['set_process_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_config_form_group_()', () => {
      it('should call initialize_config_form_group_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component['initialize_config_form_group_']();

        expect(component['initialize_config_form_group_']).toHaveBeenCalled();
      });

      it('should call reset_config_form_group_() from initialize_config_form_group_()', () => {
        reset();

        component['config_array_'] = null;
        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component['initialize_config_form_group_']();

        expect(component['reset_config_form_group_']).toHaveBeenCalled();
      });

      it('should call initialize_config_form_control() from initialize_config_form_group_() when saved_values_ defined and saved_value.values[node_hostname] === node.hostname', () => {
        reset();

        component['config_array_'] = null;
        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component['initialize_config_form_group_']();

        expect(component['initialize_config_form_control']).toHaveBeenCalled();
      });

      it('should call initialize_config_form_control() from initialize_config_form_group_() when saved_values_ defined and saved_value.values[node_hostname] !== node.hostname', () => {
        reset();

        component['config_array_'] = null;
        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata2;
        component['initialize_config_form_group_']();

        expect(component['initialize_config_form_control']).toHaveBeenCalled();
      });

      it('should call initialize_config_form_control() from initialize_config_form_group_() when saved_values_ undefined', () => {
        reset();

        component['config_array_'] = null;
        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = undefined;
        component['initialize_config_form_group_']();

        expect(component['initialize_config_form_control']).toHaveBeenCalled();
      });

      it('should call handle_checkbox_dependent_apps_() from initialize_config_form_group_()', () => {
        reset();

        component['config_array_'] = null;
        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = undefined;
        component['initialize_config_form_group_']();

        expect(component['handle_checkbox_dependent_apps_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_config_form_control()', () => {
      it('should call initialize_config_form_control()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component['initialize_config_form_control'](component.process_form_group.controls['selectedNodes'].value[0].hostname);

        expect(component['initialize_config_form_control']).toHaveBeenCalled();
      });

      it('should call get_form_control_() from initialize_config_form_control()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component['initialize_config_form_control'](component.process_form_group.controls['selectedNodes'].value[0].hostname, MockSavedValueClassSuricata);

        expect(component['get_form_control_']).toHaveBeenCalled();
      });

      it('should call initialize_config_form_control() and return FormControlDependentApps object', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        const return_value: FormControlDependentApps = component['initialize_config_form_control'](component.process_form_group.controls['selectedNodes'].value[0].hostname, MockSavedValueClassSuricata);

        expect(return_value.checkbox_dependent_apps).toBeDefined();
        expect(return_value.form_controls_form_group).toBeDefined();
      });
    });

    describe('private set_process_form_group_()', () => {
      it('should call set_process_form_group_()', () => {
        reset();

        component.process_form_group = undefined;
        component['set_process_form_group_'](new FormGroup({}));

        expect(component['set_process_form_group_']).toHaveBeenCalled();
      });

      it('should call set_process_form_group_() and set process_form_group = passed value', () => {
        reset();

        component.process_form_group = undefined;
        component['set_process_form_group_'](new FormGroup({}));

        expect(component.process_form_group).toBeDefined();
      });
    });

    describe('private initialize_config_form_control()', () => {
      it('should call initialize_config_form_control()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component['initialize_config_form_control'](component.process_form_group.controls['selectedNodes'].value[0].hostname);

        expect(component['initialize_config_form_control']).toHaveBeenCalled();
      });

      it('should call get_form_control_() from initialize_config_form_control()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        component['initialize_config_form_control'](component.process_form_group.controls['selectedNodes'].value[0].hostname, MockSavedValueClassSuricata);

        expect(component['get_form_control_']).toHaveBeenCalled();
      });

      it('should call initialize_config_form_control() and return FormControlDependentApps object', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['saved_values_'] = MockSavedValueClassSuricata;
        const return_value: FormControlDependentApps = component['initialize_config_form_control'](component.process_form_group.controls['selectedNodes'].value[0].hostname, MockSavedValueClassSuricata);

        expect(return_value.checkbox_dependent_apps).toBeDefined();
        expect(return_value.form_controls_form_group).toBeDefined();
      });
    });

    describe('private set_value_form_group_()', () => {
      it('should call set_value_form_group_()', () => {
        reset();

        const node: NodeClass[] = MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE);
        component['set_value_form_group_'](MockSavedValueClassSuricata[0], node[0]);

        expect(component['set_value_form_group_']).toHaveBeenCalled();
      });

      it('should call get_form_control_() and add hostname_object to value_form_group with object.deployment_name', () => {
        reset();

        component.value_form_group = new FormGroup({});

        const node: NodeClass[] = MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE);
        component['set_value_form_group_'](MockSavedValueClassSuricata[0], node[0]);

        expect(Object.keys(component.value_form_group.controls).length).toBeGreaterThan(0);
      });

      it('should call get_form_control_() and set hostname_object to value_form_group.deployment_name with new object', () => {
        reset();

        component.value_form_group = new FormGroup({});
        const deployment_name: string = MockSavedValueClassSuricata[0].deployment_name;
        component.value_form_group.addControl(deployment_name, new FormControl(''));

        expect(component.value_form_group.controls[deployment_name].value.length).toEqual(0);

        const node: NodeClass[] = MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE);
        component['set_value_form_group_'](MockSavedValueClassSuricata[0], node[0]);

        expect(component.value_form_group.controls[deployment_name].value.length).toBeGreaterThan(0);
      });

      it('should call set_value_form_group_() and set value_form_group', () => {
        reset();

        component.value_form_group = undefined;

        const node: NodeClass[] = MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE);
        component['set_value_form_group_'](MockSavedValueClassSuricata[0], node[0]);

        expect(component.value_form_group).toBeDefined();
      });
    });

    describe('private set_deployment_name_()', () => {
      it('should call set_deployment_name_()', () => {
        reset();

        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['set_deployment_name_']();

        expect(component['set_deployment_name_']).toHaveBeenCalled();
      });

      it('should call set_deployment_name_() and set process_form_group.selectedNodes deployment_name = status.deployment_name when status.hostname === node.hostname', () => {
        reset();

        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['set_deployment_name_']();

        const nodes: NodeClass[] = component.process_form_group.getRawValue().selectedNodes.filter((n: NodeClass) => n.node_type === SENSOR_VALUE);

        expect(nodes[0].deployment_name).toEqual(MockStatusClassSuricataDeployed.deployment_name);
      });

      it('should call set_deployment_name_() and set process_form_group.selectedNodes deployment_name = status.deployment_name when status.hostname === null', () => {
        reset();

        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));

        const status: StatusClass =  ObjectUtilitiesClass.create_deep_copy<StatusClass>(MockStatusClassSuricataDeployed);
        status.hostname = null;

        component['statuses_'] = [status];
        component['set_deployment_name_']();

        component.process_form_group.getRawValue().selectedNodes.filter((n: NodeClass) => {
          expect(n.deployment_name).toEqual(MockStatusClassSuricataDeployed.deployment_name);
        });
      });
    });

    describe('private set_process_list_children_()', () => {
      it('should call set_process_list_children_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        component['set_process_list_children_'](MockNodeClassArray);

        expect(component['set_process_list_children_']).toHaveBeenCalled();
      });

      it('should call set_children_() from set_process_list_children_() when chart_info.node_affinity.includes(node.node_type)', () => {
        reset();

        component.chart_info = MockChartInfoClassArkime;
        component['statuses_'] = [MockStatusClassArkimeViewerDeployed];
        component['set_process_list_children_'](MockNodeClassArray);

        expect(component['set_children_']).toHaveBeenCalled();
      });

      it('should call set_children_() from set_process_list_children_() when (this.chart_info.node_affinity === this.server_any_value && node.node_type === this.server_value)', () => {
        reset();

        component.chart_info = MockChartInfoClassArkime;
        component['statuses_'] = [MockStatusClassArkimeViewerDeployed];
        component['set_process_list_children_'](MockNodeClassArray);

        expect(component['set_children_']).toHaveBeenCalled();
      });

      it('should call set_process_list_children_() and set service_node_available_ if node.node_type === SERVICE_VALUE', () => {
        reset();

        component.nodes = [];
        component.chart_info = MockChartInfoClassSuricata;
        component['set_process_list_children_'](MockNodeClassArray);

        expect(component['service_node_available_']).toBeTrue();
      });

      it('should call set_process_list_children_() and return process_list', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['statuses_'] = [MockStatusClassSuricataDeployed];
        const return_value: ProcessInterface[] = component['set_process_list_children_'](MockNodeClassArray);

        expect(return_value).toEqual(component.process_list);
      });
    });

    describe('private set_children_()', () => {
      it('should call set_children_()', () => {
        reset();

        component.process_list = PROCESS_LIST.map((process: ProcessInterface) => ObjectUtilitiesClass.create_deep_copy<ProcessInterface>(process));
        component['set_children_']('test', MockNodeClassArray[0]);

        expect(component['set_children_']).toHaveBeenCalled();
      });

      it('should call set_children_() and add passed node to each process !== INSTALL', () => {
        reset();

        component.process_list = PROCESS_LIST.map((process: ProcessInterface) => ObjectUtilitiesClass.create_deep_copy<ProcessInterface>(process));
        component['set_children_'](DEPLOYED, MockNodeClassArray[0]);

        const process_list: ProcessInterface[] = component.process_list.filter((p: ProcessInterface) => p.process !== INSTALL);

        process_list.forEach((p: ProcessInterface) => expect(p.children[0]).toBeDefined());
      });

      it('should call set_children_() and add passed node to each process !== REINSTALL || UNINSTALL', () => {
        reset();

        component.process_list = PROCESS_LIST.map((process: ProcessInterface) => ObjectUtilitiesClass.create_deep_copy<ProcessInterface>(process));
        component['set_children_'](UNKNOWN, MockNodeClassArray[0]);

        expect(component.process_list[0].children.length).toBeGreaterThan(0);
        expect(component.process_list[0].process).toEqual(INSTALL);
      });

      it('should call set_children_() and add node to each process.children in process_list', () => {
        reset();

        component.process_list = PROCESS_LIST.map((process: ProcessInterface) => ObjectUtilitiesClass.create_deep_copy<ProcessInterface>(process));
        component['set_children_']('test', MockNodeClassArray[0]);

        component.process_list.forEach((p: ProcessInterface) => expect(p.children.length).toBeGreaterThan(0));
      });
    });

    describe('private compare_values_()', () => {
      it('should call compare_values_()', () => {
        reset();

        component['compare_values_']();

        expect(component['compare_values_']).toHaveBeenCalled();
      });

      it('should call set_value_form_group_() from compare_values_() when (config[node.hostname] !== undefined && (config[node.hostname].node_hostname === saved_value.values[node_hostname] && saved_value.values[node_hostname] === node.hostname && node.hostname === config[node.hostname].node_hostname ))', () => {
        reset();

        component.chart_info = MockChartInfoClassArkime;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((n: NodeClass) => n.node_type === SENSOR_VALUE));
        component.nodes = MockNodeClassArray;
        component['saved_values_'] = MockSavedValueClassArkime;
        component.selection_change_stepper(stepper_selection_event_1);
        component['get_values_file_']();
        component['compare_values_']();

        expect(component['set_value_form_group_']).toHaveBeenCalled();
      });

      it('should call set_value_form_group_() from compare_values_() when chart_info.node_affinity === server_any_value', () => {
        reset();

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((n: NodeClass) => n.node_type === NODE_TYPE_CONTROL_PLANE));
        component.nodes = MockNodeClassArray;
        component['saved_values_'] = MockSavedValueClassArkimeViewer;
        component.selection_change_stepper(stepper_selection_event_1);

        const saved_value: SavedValueClass[] = MockSavedValueClassArkimeViewer.map((sv: SavedValueClass) => {
          const new_sv: SavedValueClass = ObjectUtilitiesClass.create_deep_copy(sv);
          new_sv.values['node_hostname'] = 'test';
          return new_sv;
        });
        component['saved_values_'] = saved_value;
        component['get_values_file_']();
        component['compare_values_']();

        expect(component['set_value_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private open_confirm_mat_dialog_()', () => {
      it('should call open_confirm_mat_dialog_()', () => {
        reset();

        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(TAKE_ME_BACK_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['open_confirm_mat_dialog_']();

        expect(component['open_confirm_mat_dialog_']).toHaveBeenCalled();
      });

      it('should call navigate_to_catalog() with return response === TAKE_ME_BACK_DIALOG_OPTION after mat dialog ref closed from within open_confirm_mat_dialog_()', () => {
        reset();

        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(TAKE_ME_BACK_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['open_confirm_mat_dialog_']();

        expect(component['navigate_to_catalog']).toHaveBeenCalled();
      });

      it('should call api_get_chart_statuses_() with return response !== TAKE_ME_BACK_DIALOG_OPTION after mat dialog ref closed from within open_confirm_mat_dialog_()', () => {
        reset();

        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONTINUE_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.chart_info = MockChartInfoClassArkimeViewerReinstallorUninstall;
        component['open_confirm_mat_dialog_']();

        expect(component['api_get_chart_statuses_']).toHaveBeenCalled();
      });
    });

    describe('private api_get_catalog_nodes_()', () => {
      it('should call api_get_catalog_nodes_()', () => {
        reset();

        component['api_get_catalog_nodes_']();

        expect(component['api_get_catalog_nodes_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_catalog_nodes() from api_get_catalog_nodes_()', () => {
        reset();

        component['api_get_catalog_nodes_']();

        expect(component['catalog_service_'].get_catalog_nodes).toHaveBeenCalled();
      });

      it('should call set_process_list_children_() from catalog_service_.get_catalog_nodes()', () => {
        reset();

        component['api_get_catalog_nodes_']();

        expect(component['set_process_list_children_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_catalog_nodes() and handle response and set process_list = set_process_list_children_(response)', () => {
        reset();

        component['api_get_catalog_nodes_']();

        expect(component.process_list).toEqual(component['set_process_list_children_'](MockNodeClassArray));
      });

      it('should call catalog_service_.get_catalog_nodes() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_catalog_nodes').and.returnValue(throwError(mock_http_error_response));

        component['api_get_catalog_nodes_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_chart_info_()', () => {
      it('should call api_get_chart_info_()', () => {
        reset();

        component['api_get_chart_info_'](MockChartInfoClassSuricata.id);

        expect(component['api_get_chart_info_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_chart_info() from api_get_chart_info_()', () => {
        reset();

        component['api_get_chart_info_'](MockChartInfoClassSuricata.id);

        expect(component['catalog_service_'].get_chart_info).toHaveBeenCalled();
      });

      it('should call api_get_chart_statuses_() from catalog_service_.get_chart_info() if chart_info.devDependent is defined', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_chart_info').and.returnValue(of(MockChartInfoClassArkime));

        component['api_get_chart_info_'](MockChartInfoClassSuricata.id);

        expect(component['api_get_chart_statuses_']).toHaveBeenCalled();
      });

      it('should call api_get_chart_statuses_() from catalog_service_.get_chart_info() if chart_info.devDependent is undefined / null', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['api_get_chart_info_'](MockChartInfoClassSuricata.id);

        expect(component['api_get_chart_statuses_']).toHaveBeenCalled();
      });

      it('should call initialize_process_form_group_() from catalog_service_.get_chart_info()', () => {
        reset();

        component['api_get_chart_info_'](MockChartInfoClassSuricata.id);

        expect(component['initialize_process_form_group_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_chart_info() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_chart_info').and.returnValue(throwError(mock_http_error_response));

        component['api_get_chart_info_'](MockChartInfoClassSuricata.id);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_chart_statuses_()', () => {
      it('should call api_get_chart_statuses_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['api_get_chart_statuses_']();

        expect(component['api_get_chart_statuses_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_chart_statuses() from api_get_chart_statuses_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['api_get_chart_statuses_']();

        expect(component['catalog_service_'].get_chart_statuses).toHaveBeenCalled();
      });

      it('should call open_confirm_mat_dialog_() from catalog_service_.get_chart_statuses() if chart_info_dev_dependent && response.length === 0', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_chart_statuses').and.returnValue(of([]));

        component['api_get_chart_statuses_'](true);

        expect(component['open_confirm_mat_dialog_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_chart_statuses() and set statuses_ = response', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['statuses_'] = null;
        component['api_get_chart_statuses_']();

        expect(component['statuses_']).toEqual(MockStatusClassArkimeViewer);
      });

      it('should call api_get_chart_statuses_() from catalog_service_.get_chart_statuses()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['api_get_chart_statuses_']();

        expect(component['api_get_catalog_nodes_']).toHaveBeenCalled();
      });

      it('should call api_get_saved_values_() from catalog_service_.get_chart_statuses()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['api_get_chart_statuses_']();

        expect(component['api_get_saved_values_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_chart_statuses() and handle error', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_chart_statuses').and.returnValue(throwError(mock_http_error_response));

        component['api_get_chart_statuses_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_saved_values_()', () => {

      it('should call api_get_saved_values_()', () => {
        reset();

        component['api_get_saved_values_']();

        expect(component['api_get_saved_values_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_saved_values) from api_get_saved_values_()', () => {
        reset();

        component['api_get_saved_values_']();

        expect(component['catalog_service_'].get_saved_values).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_saved_values() and set saved_values = response', () => {
        reset();

        component['api_get_saved_values_']();

        expect(component['saved_values_']).toEqual(MockSavedValueClassArkimeViewer);
      });

    });

    describe('private check_chart_dependencies_()', () => {
      it('should call catalog_service_.get_all_application_statuses() and hostname_form_group.controls[key].enable() when key, checkbox_dependent_app, hostname_form_group all defined and response.length > 0', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_all_application_statuses').and.returnValue(of(MockChartInterfaceArray));

        component['check_chart_dependencies_'](test_form_control_name, 'cortex', fake_form_group);

        expect(fake_form_group.controls[test_form_control_name].disabled).toBeFalse();
        expect(fake_form_group.controls[test_form_control_name].enabled).toBeTrue();
      });

      it('should call catalog_service_.get_all_application_statuses() and hostname_form_group.controls[key].setValue(false) when key, checkbox_dependent_app, hostname_form_group all defined', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_all_application_statuses').and.returnValue(of([]));

        component['check_chart_dependencies_'](test_form_control_name, 'fake', fake_form_group);

        expect(fake_form_group.controls[test_form_control_name].value).toBeFalse();
      });

      it('should call catalog_service_.get_all_application_statuses() and hostname_form_group.controls[key].disable() when key, checkbox_dependent_app, hostname_form_group all defined', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_all_application_statuses').and.returnValue(of([]));

        component['check_chart_dependencies_'](test_form_control_name, 'fake', fake_form_group);

        expect(fake_form_group.controls[test_form_control_name].disabled).toBeTrue();
        expect(fake_form_group.controls[test_form_control_name].enabled).toBeFalse();
      });

      it('should call catalog_service_.get_saved_values() and set saved_values = null', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_saved_values').and.returnValue(of([]));

        component['api_get_saved_values_']();

        expect(component['saved_values_']).toBeNull();
      });

      it('should call catalog_service_.get_saved_values() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_saved_values').and.returnValue(throwError(mock_http_error_response));

        component['api_get_saved_values_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_generate_values_file_()', () => {
      it('should call api_generate_values_file_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['api_generate_values_file_']();

        expect(component['api_generate_values_file_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.generate_values_file() from api_generate_values_file_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['api_generate_values_file_']();

        expect(component['catalog_service_'].generate_values_file).toHaveBeenCalled();
      });

      it('should call set_value_form_group_() from catalog_service_.generate_values_file()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['initialize_process_form_group_']();
        component.selection_change_process();
        component.process_form_group.controls['selectedProcess'].setValue(REINSTALL);
        component.process_form_group.controls['selectedNodes'].setValue(MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE));
        component['api_generate_values_file_']();

        expect(component['set_value_form_group_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.generate_values_file() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'generate_values_file').and.returnValue(throwError(mock_http_error_response));

        component['api_generate_values_file_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_catalog_install_()', () => {
      it('should call api_catalog_install_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_install_'](catalog_helm_action);

        expect(component['api_catalog_install_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_install() from api_catalog_install_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_install_'](catalog_helm_action);

        expect(component['catalog_service_'].catalog_install).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_install() and handle response', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_install_'](catalog_helm_action);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call navigate_to_catalog() from catalog_service_.catalog_install()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_install_'](catalog_helm_action);

        expect(component['navigate_to_catalog']).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_install() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'catalog_install').and.returnValue(throwError(MockErrorMessageClass));

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_install_'](catalog_helm_action);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_install() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'catalog_install').and.returnValue(throwError(mock_http_error_response));

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_install_'](catalog_helm_action);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_catalog_reinstall_()', () => {
      it('should call api_catalog_reinstall_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_reinstall_'](catalog_helm_action);

        expect(component['api_catalog_reinstall_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_reinstall() from api_catalog_reinstall_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_reinstall_'](catalog_helm_action);

        expect(component['catalog_service_'].catalog_reinstall).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_reinstall() and handle response', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_reinstall_'](catalog_helm_action);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call navigate_to_catalog() from catalog_service_.catalog_reinstall()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_reinstall_'](catalog_helm_action);

        expect(component['navigate_to_catalog']).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_reinstall() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'catalog_reinstall').and.returnValue(throwError(MockErrorMessageClass));

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_reinstall_'](catalog_helm_action);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_reinstall() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'catalog_reinstall').and.returnValue(throwError(mock_http_error_response));

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_reinstall_'](catalog_helm_action);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_catalog_uninstall_()', () => {
      it('should call api_catalog_uninstall_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_uninstall_'](catalog_helm_action);

        expect(component['api_catalog_uninstall_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_uninstall() from api_catalog_uninstall_()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_uninstall_'](catalog_helm_action);

        expect(component['catalog_service_'].catalog_uninstall).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_uninstall() and handle response', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_uninstall_'](catalog_helm_action);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call navigate_to_catalog() from catalog_service_.catalog_uninstall()', () => {
        reset();

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_uninstall_'](catalog_helm_action);

        expect(component['navigate_to_catalog']).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_uninstall() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'catalog_uninstall').and.returnValue(throwError(MockErrorMessageClass));

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_uninstall_'](catalog_helm_action);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call catalog_service_.catalog_uninstall() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'catalog_uninstall').and.returnValue(throwError(mock_http_error_response));

        component.chart_info = MockChartInfoClassSuricata;
        component['api_catalog_uninstall_'](catalog_helm_action);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_iface_states_()', () => {
      it('should call api_get_iface_states_()', () => {
        reset();

        component['api_get_iface_states_'](MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE)[0]);

        expect(component['api_get_iface_states_']).toHaveBeenCalled();
      });

      it('should call global_tools_service_.get_iface_states() from api_get_iface_states_()', () => {
        reset();

        component['api_get_iface_states_'](MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE)[0]);

        expect(component['global_tools_service_'].get_iface_states).toHaveBeenCalled();
      });

      it('should call global_tools_service_.get_iface_states() and set sensor_interface_states_[node.hostname] = ifaces', () => {
        reset();

        component['sensor_interface_states_'] = {};
        component['api_get_iface_states_'](MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE)[0]);

        expect(Object.keys(component['sensor_interface_states_']).length).toBeGreaterThan(0);
      });

      it('should call global_tools_service_.get_iface_states() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['global_tools_service_'], 'get_iface_states').and.returnValue(throwError(mock_http_error_response));

        component['api_get_iface_states_'](MockNodeClassArray.filter((v: NodeClass) => v.node_type === SENSOR_VALUE)[0]);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});




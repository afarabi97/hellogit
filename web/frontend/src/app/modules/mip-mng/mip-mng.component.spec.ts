import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import {
  MockErrorMessageClass,
  MockMipSettingsClass,
  MockNodeClassArray,
  MockNodeSensorClass,
  MockNodeSensorClassNoJobs,
  MockNodeServerClass,
  MockNodeServerClassCreateAlt,
  MockPostValidationObject,
  MockPostValidationStringArray,
  MockValidationErrorClass
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { NodeClass, PostValidationClass } from '../../classes';
import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION, VIRTUAL } from '../../constants/cvah.constants';
import { ApiService } from '../../services/abstract/api.service';
import { NodeManagementComponent } from '../node-mng/node-mng.component';
import { TestingModule } from '../testing-modules/testing.module';
import { InjectorModule } from '../utilily-modules/injector.module';
import { MipManagementComponent } from './mip-mng.component';
import { MipMngModule } from './mip-mng.module';

describe('MipManagementComponent', () => {
  let component: MipManagementComponent;
  let fixture: ComponentFixture<MipManagementComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyOpenMipInfoDialogWindow: jasmine.Spy<any>;
  let spyCanDeleteNode: jasmine.Spy<any>;
  let spyOpenDeleteNodeConfirmDialogWindow: jasmine.Spy<any>;
  let spyDisableAddMipButton: jasmine.Spy<any>;
  let spyOpenAddMipDialogWindow: jasmine.Spy<any>;
  let spyUpdateMipsData: jasmine.Spy<any>;
  let spySetMips: jasmine.Spy<any>;
  let spyConstructPostValidationErrorMessage: jasmine.Spy<any>;
  let spyWebsocketGetSocketOnNodeStateChange: jasmine.Spy<any>;
  let spyApiGetNodes: jasmine.Spy<any>;
  let spyApiGetMipSettings: jasmine.Spy<any>;
  let spyApiAddMip: jasmine.Spy<any>;
  let spyApiDeleteNode: jasmine.Spy<any>;

  // Test Data
  const post_validation_keys: string[] = Object.keys(MockPostValidationObject.post_validation);
  const node_form_group_virtual: FormGroup = new FormGroup({
    hostname: new FormControl('test-node'),
    ip_address: new FormControl('10.40.31.5'),
    deployment_type: new FormControl(VIRTUAL),
    mac_address: new FormControl(undefined),
    virtual_cpu: new FormControl(16),
    virtual_mem: new FormControl(32),
    virtual_os: new FormControl(100)
  });
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
        TestingModule,
        MipMngModule,
      ],
      providers: [
        NodeManagementComponent,
        ApiService,
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) },
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MipManagementComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyOpenMipInfoDialogWindow = spyOn(component, 'open_mip_info_dialog_window').and.callThrough();
    spyCanDeleteNode = spyOn(component, 'can_delete_node').and.callThrough();
    spyOpenDeleteNodeConfirmDialogWindow = spyOn(component, 'open_delete_node_confirm_dialog_window').and.callThrough();
    spyDisableAddMipButton = spyOn(component, 'disable_add_mip_button').and.callThrough();
    spyOpenAddMipDialogWindow = spyOn(component, 'open_add_mip_dialog_window').and.callThrough();
    spyUpdateMipsData = spyOn<any>(component, 'update_mips_data_').and.callThrough();
    spySetMips = spyOn<any>(component, 'set_mips_').and.callThrough();
    spyConstructPostValidationErrorMessage = spyOn<any>(component, 'construct_post_validation_error_message_').and.callThrough();
    spyWebsocketGetSocketOnNodeStateChange = spyOn<any>(component, 'websocket_get_socket_on_node_state_change_').and.callThrough();
    spyApiGetNodes = spyOn<any>(component, 'api_get_nodes_').and.callThrough();
    spyApiGetMipSettings = spyOn<any>(component, 'api_get_mip_settings_').and.callThrough();
    spyApiAddMip = spyOn<any>(component, 'api_add_mip_').and.callThrough();
    spyApiDeleteNode = spyOn<any>(component, 'api_delete_node_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyOpenMipInfoDialogWindow.calls.reset();
    spyCanDeleteNode.calls.reset();
    spyOpenDeleteNodeConfirmDialogWindow.calls.reset();
    spyDisableAddMipButton.calls.reset();
    spyOpenAddMipDialogWindow.calls.reset();
    spyUpdateMipsData.calls.reset();
    spySetMips.calls.reset();
    spyConstructPostValidationErrorMessage.calls.reset();
    spyWebsocketGetSocketOnNodeStateChange.calls.reset();
    spyApiGetNodes.calls.reset();
    spyApiGetMipSettings.calls.reset();
    spyApiAddMip.calls.reset();
    spyApiDeleteNode.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create MipManagementComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('MipManagementComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call websocket_get_socket_on_node_state_change_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['websocket_get_socket_on_node_state_change_']).toHaveBeenCalled();
      });

      it('should call api_get_nodes_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_nodes_']).toHaveBeenCalled();
      });

      it('should call api_get_mip_settings_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_mip_settings_']).toHaveBeenCalled();
      });
    });

    describe('open_mip_info_dialog_window()', () => {
      it('should call open_mip_info_dialog_window()', () => {
        reset();

        component.open_mip_info_dialog_window(MockNodeServerClass);

        expect(component.open_mip_info_dialog_window).toHaveBeenCalled();
      });
    });

    describe('can_delete_node()', () => {
      it('should call can_delete_node()', () => {
        reset();

        component.can_delete_node(MockNodeServerClass);

        expect(component.can_delete_node).toHaveBeenCalled();
      });

      it('should call can_delete_node() and return true because a job is create and complete', () => {
        reset();

        const return_value: boolean = component.can_delete_node(MockNodeServerClass);

        expect(return_value).toBeTrue();
      });

      it('should call can_delete_node() and return true because a job is create and error', () => {
        reset();

        const return_value: boolean = component.can_delete_node(MockNodeSensorClass);

        expect(return_value).toBeTrue();
      });

      it('should call can_delete_node() and return false because a job is create and both error and complete are false', () => {
        reset();

        const return_value: boolean = component.can_delete_node(MockNodeServerClassCreateAlt);

        expect(return_value).toBeFalse();
      });

      it('should call can_delete_node() and return true', () => {
        reset();

        const return_value: boolean = component.can_delete_node(MockNodeSensorClassNoJobs);

        expect(return_value).toBeTrue();
      });
    });

    describe('open_delete_node_confirm_dialog_window()', () => {
      it('should call open_delete_node_confirm_dialog_window()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.open_delete_node_confirm_dialog_window(MockNodeServerClass);

        expect(component.open_delete_node_confirm_dialog_window).toHaveBeenCalled();
      });

      it('should call api_delete_node_() after mat dialog ref closed from within open_delete_node_confirm_dialog_window()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.open_delete_node_confirm_dialog_window(MockNodeServerClass);

        expect(component['api_delete_node_']).toHaveBeenCalled();
      });

      it('should not call api_delete_node_() after mat dialog ref closed from within open_delete_node_confirm_dialog_window()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.open_delete_node_confirm_dialog_window(MockNodeServerClass);

        expect(component['api_delete_node_']).not.toHaveBeenCalled();
      });
    });

    describe('disable_add_mip_button()', () => {
      it('should call disable_add_mip_button()', () => {
        reset();

        component.disable_add_mip_button();

        expect(component.disable_add_mip_button).toHaveBeenCalled();
      });

      it('should call disable_add_mip_button() and return false from mip_settings_', () => {
        reset();

        const return_value: boolean = component.disable_add_mip_button();

        expect(return_value).toBeFalse();
      });

      it('should call disable_add_mip_button() and return true from mip_settings_', () => {
        reset();

        component['mip_settings_'] = {};
        const return_value: boolean = component.disable_add_mip_button();

        expect(return_value).toBeTrue();
      });

      it('should call disable_add_mip_button() and return true when mip_settings_ is undefined', () => {
        reset();

        component['mip_settings_'] = undefined;
        const return_value: boolean = component.disable_add_mip_button();

        expect(return_value).toBeTrue();
      });
    });

    describe('open_add_mip_dialog_window()', () => {
      it('should call open_add_mip_dialog_window()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.open_add_mip_dialog_window();

        expect(component.open_add_mip_dialog_window).toHaveBeenCalled();
      });

      it('should call api_add_mip_() after mat dialog ref closed from within open_add_mip_dialog_window()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(node_form_group_virtual) } as MatDialogRef<typeof component>);

        component.open_add_mip_dialog_window();

        expect(component['api_add_mip_']).toHaveBeenCalled();
      });

      it('should not call api_add_mip_() after mat dialog ref closed from within open_add_mip_dialog_window()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.open_add_mip_dialog_window();

        expect(component['api_add_mip_']).not.toHaveBeenCalled();
      });
    });

    describe('private update_mips_data_()', () => {
      it('should call update_mips_data_()', () => {
        reset();

        component['update_mips_data_'](MockNodeClassArray);

        expect(component['update_mips_data_']).toHaveBeenCalled();
      });

      it('should call set_mips_() from update_mips_data_()', () => {
        reset();

        component['update_mips_data_'](MockNodeClassArray);

        expect(component['set_mips_']).toHaveBeenCalled();
      });
    });

    describe('private set_mips_()', () => {
      it('should call set_mips_()', () => {
        reset();

        component['set_mips_']([]);

        expect(component['set_mips_']).toHaveBeenCalled();
      });

      it('should call set_mips_() and set mips = passed mips value', () => {
        reset();

        component['update_mips_data_'](MockNodeClassArray);
        const mips: NodeClass[] = component.mips;
        component.mips = [];
        component['set_mips_'](mips);

        expect(component.mips).toEqual(mips);
      });
    });

    describe('private construct_post_validation_error_message_()', () => {
      it('should call construct_post_validation_error_message_()', () => {
        reset();

        component['construct_post_validation_error_message_'](MockPostValidationObject.post_validation, post_validation_keys);

        expect(component['construct_post_validation_error_message_']).toHaveBeenCalled();
      });

      it('should call construct_post_validation_error_message_() and return error message', () => {
        reset();

        const return_value: string = component['construct_post_validation_error_message_'](MockPostValidationObject.post_validation, post_validation_keys);

        expect(return_value.length > 0).toBeTrue();
      });
    });

    describe('private websocket_get_socket_on_node_state_change_()', () => {
      it('should call websocket_get_socket_on_node_state_change_()', () => {
        reset();

        component['websocket_get_socket_on_node_state_change_']();

        expect(component['websocket_get_socket_on_node_state_change_']).toHaveBeenCalled();
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

      it('should call kit_settings_service_.get_nodes() and handle response and call update_mips_data_()', () => {
        reset();

        component['api_get_nodes_']();

        expect(component['update_mips_data_']).toHaveBeenCalled();
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

    describe('private api_get_mip_settings_()', () => {
      it('should call api_get_mip_settings_()', () => {
        reset();

        component['api_get_mip_settings_']();

        expect(component['api_get_mip_settings_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getMipSettings() from api_get_mip_settings_()', () => {
        reset();

        component['api_get_mip_settings_']();

        expect(component['kit_settings_service_'].getMipSettings).toHaveBeenCalled();
      });

      it('should call from kit_settings_service_.getMipSettings() and handle response and set mip_settings_ = response', () => {
        reset();

        component['mip_settings_'] = {};
        component['api_get_mip_settings_']();

        expect(component['mip_settings_']).toEqual(MockMipSettingsClass);
      });

      it('should call kit_settings_service_.getMipSettings() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'getMipSettings').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_mip_settings_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.getMipSettings() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'getMipSettings').and.returnValue(throwError(mock_http_error_response));

        component['api_get_mip_settings_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_add_mip_()', () => {
      it('should call api_add_mip_()', () => {
        reset();

        component['api_add_mip_'](node_form_group_virtual);

        expect(component['api_add_mip_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() from api_add_mip_()', () => {
        reset();

        component['api_add_mip_'](node_form_group_virtual);

        expect(component['kit_settings_service_'].addMip).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_add_mip_'](node_form_group_virtual);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(MockErrorMessageClass));

        component['api_add_mip_'](node_form_group_virtual);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error response instance ValidationErrorClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(MockValidationErrorClass));

        component['api_add_mip_'](node_form_group_virtual);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error response instance PostValidationClass string', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(new PostValidationClass('im a string error' as any)));

        component['api_add_mip_'](node_form_group_virtual);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error response instance PostValidationClass string[]', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(MockPostValidationStringArray));

        component['api_add_mip_'](node_form_group_virtual);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error response instance PostValidationClass object and call construct_post_validation_error_message_()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(MockPostValidationObject));

        component['api_add_mip_'](node_form_group_virtual);

        expect(component['construct_post_validation_error_message_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error response instance PostValidationClass object', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(MockPostValidationObject));

        component['api_add_mip_'](node_form_group_virtual);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.addMip() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'addMip').and.returnValue(throwError(mock_http_error_response));

        component['api_add_mip_'](node_form_group_virtual);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_delete_node_()', () => {
      it('should call api_delete_node_()', () => {
        reset();

        component['api_delete_node_'](MockNodeServerClass);

        expect(component['api_delete_node_']).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.delete_node() from api_delete_node_()', () => {
        reset();

        component['api_delete_node_'](MockNodeServerClass);

        expect(component['kit_settings_service_'].delete_node).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.delete_node() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_delete_node_'](MockNodeServerClass);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.delete_node() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'delete_node').and.returnValue(throwError(MockErrorMessageClass));

        component['api_delete_node_'](MockNodeServerClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call kit_settings_service_.delete_node() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['kit_settings_service_'], 'delete_node').and.returnValue(throwError(mock_http_error_response));

        component['api_delete_node_'](MockNodeServerClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

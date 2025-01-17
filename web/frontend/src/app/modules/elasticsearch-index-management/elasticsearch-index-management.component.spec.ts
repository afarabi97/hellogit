import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { throwError } from 'rxjs';

import { MockErrorMessageClass } from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { MockIndexManagementOptionInterfaceDeleteIndices } from '../../../../static-data/interface-objects';
import { MockClosedIndices } from '../../../../static-data/return-data';
import { ErrorMessageClass } from '../../classes';
import { MatOptionAltInterface } from '../../interfaces';
import { TestingModule } from '../testing-modules/testing.module';
import { BACKUP_INDICES, CLOSE_INDICES, DELETE_INDICES } from './constants/index-management.constant';
import { ElasticsearchIndexManagementComponent } from './elasticsearch-index-management.component';
import { ElasticsearchIndexManagementModule } from './elasticsearch-index-management.module';

describe('ElasticsearchIndexManagementComponent', () => {
  let component: ElasticsearchIndexManagementComponent;
  let fixture: ComponentFixture<ElasticsearchIndexManagementComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyIsIndexListEmpty: jasmine.Spy<any>;
  let spyStepperChange: jasmine.Spy<any>;
  let spyBack: jasmine.Spy<any>;
  let spyNext: jasmine.Spy<any>;
  let spyUpdate: jasmine.Spy<any>;
  let spySetBackupOption: jasmine.Spy<any>;
  let spyInitilaizeFormGroups: jasmine.Spy<any>;
  let spySetIndexManagementActionsFormGroup: jasmine.Spy<any>;
  let spySetIndexManagementListFormGroup: jasmine.Spy<any>;
  let spyRestForm: jasmine.Spy<any>;
  let spyIndexcesReturnAction: jasmine.Spy<any>;
  let spyApiIndexManagement: jasmine.Spy<any>;
  let spyApiGetClosedIndices: jasmine.Spy<any>;
  let spyApiMinioCheck: jasmine.Spy<any>;
  let spyApiGetAllIndices: jasmine.Spy<any>;

  // Test Error
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  // Test Data
  const mat_stepper_change_index_1: StepperSelectionEvent = {
    selectedIndex: 1
  } as any;
  const index_management_actions_form_group: FormGroup = new FormGroup({});
  index_management_actions_form_group.addControl('action', new FormControl(null, Validators.required));
  const index_management_list_form_group: FormGroup = new FormGroup({});
  index_management_list_form_group.addControl('index_list', new FormControl([], Validators.required));
  const error_message: ErrorMessageClass = new ErrorMessageClass({error_message: 'foo bar'});

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ElasticsearchIndexManagementModule,
        TestingModule
      ],
      providers: [
        Title
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElasticsearchIndexManagementComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyIsIndexListEmpty = spyOn(component, 'is_index_list_empty').and.callThrough();
    spyStepperChange = spyOn(component, 'stepper_change').and.callThrough();
    spyBack = spyOn(component, 'back').and.callThrough();
    spyNext = spyOn(component, 'next').and.callThrough();
    spyUpdate = spyOn(component, 'update').and.callThrough();
    spySetBackupOption = spyOn<any>(component, 'set_backup_option_').and.callThrough();
    spyInitilaizeFormGroups = spyOn<any>(component, 'initialize_form_groups_').and.callThrough();
    spySetIndexManagementActionsFormGroup = spyOn<any>(component, 'set_index_management_actions_form_group_').and.callThrough();
    spySetIndexManagementListFormGroup = spyOn<any>(component, 'set_index_management_list_form_group_').and.callThrough();
    spyRestForm = spyOn<any>(component, 'reset_form_').and.callThrough();
    spyIndexcesReturnAction = spyOn<any>(component, 'indices_return_actions_').and.callThrough();
    spyApiIndexManagement = spyOn<any>(component, 'api_index_management_').and.callThrough();
    spyApiGetClosedIndices = spyOn<any>(component, 'api_get_closed_indices_').and.callThrough();
    spyApiMinioCheck = spyOn<any>(component, 'api_minio_check_').and.callThrough();
    spyApiGetAllIndices = spyOn<any>(component, 'api_get_all_indices_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const grab_action_for_test = () => {
    let action_for_test: MatOptionAltInterface;
    component.actions.forEach((action: MatOptionAltInterface) => {
      if (action.value === BACKUP_INDICES) {
        action_for_test = action;
      }
    });

    return action_for_test;
  };

  const reset = () => {
    component['mat_stepper_'].selectedIndex = 1;

    spyNGOnInit.calls.reset();
    spyIsIndexListEmpty.calls.reset();
    spyStepperChange.calls.reset();
    spyBack.calls.reset();
    spyNext.calls.reset();
    spyUpdate.calls.reset();
    spySetBackupOption.calls.reset();
    spyInitilaizeFormGroups.calls.reset();
    spySetIndexManagementActionsFormGroup.calls.reset();
    spySetIndexManagementListFormGroup.calls.reset();
    spyRestForm.calls.reset();
    spyIndexcesReturnAction.calls.reset();
    spyApiIndexManagement.calls.reset();
    spyApiGetClosedIndices.calls.reset();
    spyApiMinioCheck.calls.reset();
    spyApiGetAllIndices.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create ElasticsearchIndexManagementComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ElasticsearchIndexManagementComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_form_groups_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_form_groups_']).toHaveBeenCalled();
      });

      it('should call api_minio_check_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_minio_check_']).toHaveBeenCalled();
      });

      it('should call set_backup_option_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['set_backup_option_']).toHaveBeenCalled();
      });
    });

    describe('is_index_list_empty()', () => {
      it('should call is_index_list_empty()', () => {
        reset();

        component.is_index_list_empty();

        expect(component.is_index_list_empty).toHaveBeenCalled();
      });

      it('should call is_index_list_empty() and return value = true', () => {
        reset();

        component.index_management_list_form_group.get('index_list').setValue([]);
        const return_value: boolean = component.is_index_list_empty();

        expect(return_value).toBeTrue();
      });

      it('should call is_index_list_empty() and return value = false', () => {
        reset();

        component.index_management_list_form_group.get('index_list').setValue(MockClosedIndices);
        const return_value: boolean = component.is_index_list_empty();

        expect(return_value).toBeFalse();
      });
    });

    describe('stepper_change()', () => {
      it('should call stepper_change()', () => {
        reset();

        component.stepper_change(mat_stepper_change_index_1);

        expect(component.stepper_change).toHaveBeenCalled();
      });

      it('should call stepper_change() and call next()', () => {
        reset();

        component.stepper_change(mat_stepper_change_index_1);

        expect(component.next).toHaveBeenCalled();
      });

      it('should call stepper_change() and set next_triggered_ = false', () => {
        reset();

        component['next_triggered_'] = true;
        component.stepper_change(mat_stepper_change_index_1);

        expect(component['next_triggered_']).toBeFalse();
      });
    });

    describe('back()', () => {
      it('should call back()', () => {
        reset();

        component.back();

        expect(component.back).toHaveBeenCalled();
      });

      it('should call reset_form_() from back()', () => {
        reset();

        component.back();

        expect(component['reset_form_']).toHaveBeenCalled();
      });
    });

    describe('next()', () => {
      it('should call next()', () => {
        reset();

        component.index_management_actions_form_group.get('action').setValue(DELETE_INDICES);
        component.next();

        expect(component.next).toHaveBeenCalled();
      });

      it('should call api_get_closed_indices_() from next()', () => {
        reset();

        component.index_management_actions_form_group.get('action').setValue(DELETE_INDICES);
        component.next();

        expect(component['api_get_closed_indices_']).toHaveBeenCalled();
      });

      it('should call api_get_all_indices_() from next()', () => {
        reset();

        component.index_management_actions_form_group.get('action').setValue(CLOSE_INDICES);
        component.next();

        expect(component['api_get_all_indices_']).toHaveBeenCalled();
      });

      it('should call reset_form_() from next()', () => {
        reset();

        component.index_management_actions_form_group.get('action').setValue('');
        component.next();

        expect(component['reset_form_']).toHaveBeenCalled();
      });
    });

    describe('update()', () => {
      it('should call update()', () => {
        reset();

        component.update();

        expect(component.update).toHaveBeenCalled();
      });

      it('should call api_index_management_() from update()', () => {
        reset();

        component.index_management_actions_form_group.get('action').setValue(DELETE_INDICES);
        component.index_management_list_form_group.get('index_list').setValue(MockClosedIndices);
        component.update();

        expect(component['api_index_management_']).toHaveBeenCalled();
      });
    });

    describe('private set_backup_option_()', () => {
      it('should call set_backup_option_()', () => {
        reset();

        component['set_backup_option_'](true, error_message);

        expect(component['set_backup_option_']).toHaveBeenCalled();
      });

      it('should call set_backup_option_() and set component.actions[i].isDisabled with passed value = false', () => {
        reset();

        component['set_backup_option_'](false);

        const action_for_test: MatOptionAltInterface = grab_action_for_test();

        expect(action_for_test.isDisabled).toBeFalse();
      });

      it('should call set_backup_option_() and set component.actions[i].tooltip with passed error_message', () => {
        reset();

        component['set_backup_option_'](false, error_message);

        const action_for_test: MatOptionAltInterface = grab_action_for_test();

        expect(action_for_test.toolTip).toEqual(error_message.error_message);
      });

      it('should call set_backup_option_() and set component.actions[i].tooltip to empty string', () => {
        reset();

        component['set_backup_option_'](false);

        const action_for_test: MatOptionAltInterface = grab_action_for_test();

        expect(action_for_test.toolTip).toEqual('');
      });

      it('should call set_backup_option_() and set component.actions[i].isDisabled with passed value = true', () => {
        reset();

        component['set_backup_option_'](true, error_message);

        const action_for_test: MatOptionAltInterface = grab_action_for_test();

        expect(action_for_test.isDisabled).toBeTrue();
      });
    });

    describe('private initialize_form_groups_()', () => {
      it('should call initialize_form_groups_()', () => {
        reset();

        component['initialize_form_groups_']();

        expect(component['initialize_form_groups_']).toHaveBeenCalled();
      });

      it('should call set_index_management_actions_form_group_() from initialize_form_groups_()', () => {
        reset();

        component['initialize_form_groups_']();

        expect(component['set_index_management_actions_form_group_']).toHaveBeenCalled();
      });

      it('should call set_index_management_list_form_group_() from initialize_form_groups_()', () => {
        reset();

        component['initialize_form_groups_']();

        expect(component['set_index_management_list_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private set_index_management_actions_form_group_()', () => {
      it('should call set_index_management_actions_form_group_()', () => {
        reset();

        component['set_index_management_actions_form_group_'](index_management_actions_form_group);

        expect(component['set_index_management_actions_form_group_']).toHaveBeenCalled();
      });

      it('should call set_index_management_actions_form_group_() and set actions form group equal to passed form group', () => {
        reset();

        component.index_management_actions_form_group = undefined;
        component['set_index_management_actions_form_group_'](index_management_actions_form_group);

        expect(component.index_management_actions_form_group).toBeDefined();
      });
    });

    describe('private set_index_management_list_form_group_()', () => {
      it('should call set_index_management_list_form_group_()', () => {
        reset();

        component['set_index_management_list_form_group_'](index_management_list_form_group);

        expect(component['set_index_management_list_form_group_']).toHaveBeenCalled();
      });

      it('should call set_index_management_list_form_group_() and set list form group equal to passed form group', () => {
        reset();

        component.index_management_list_form_group = undefined;
        component['set_index_management_list_form_group_'](index_management_list_form_group);

        expect(component.index_management_list_form_group).toBeDefined();
      });
    });

    describe('private reset_form_()', () => {
      it('should call reset_form_()', () => {
        reset();

        component['reset_form_']();

        expect(component['reset_form_']).toHaveBeenCalled();
      });

      it('should call reset_form_() and set is_loading = false', () => {
        reset();

        component.is_loading = true;
        component['reset_form_']();

        expect(component.is_loading).toBeFalse();
      });

      it('should call reset_form_() and set indices = []', () => {
        reset();

        component.indices = MockClosedIndices;
        component['reset_form_']();

        expect(component.indices.length).toEqual(0);
      });

      it('should call initialize_form_groups_() from reset_form_()', () => {
        reset();

        component['reset_form_']();

        expect(component['initialize_form_groups_']).toHaveBeenCalled();
      });

      it('should call reset_form_() and reset form groups', () => {
        reset();

        component.index_management_actions_form_group.get('action').setValue(DELETE_INDICES);
        component.index_management_list_form_group.get('index_list').setValue(MockClosedIndices);
        component['reset_form_']();

        fixture.detectChanges();

        expect(component.index_management_actions_form_group.get('action').value).toBeNull();
        expect(component.index_management_list_form_group.get('index_list').value).toEqual([]);
      });
    });

    describe('private indices_return_actions_()', () => {
      it('should call indices_return_actions_()', () => {
        reset();

        component['indices_return_actions_'](MockClosedIndices);

        expect(component['indices_return_actions_']).toHaveBeenCalled();
      });

      it('should call indices_return_actions_() and set indices = passed value', () => {
        reset();

        component.indices = [];
        component['indices_return_actions_'](MockClosedIndices);

        expect(component.indices).toEqual(MockClosedIndices);
      });

      it('should call indices_return_actions_() and set is_loading = false', () => {
        reset();

        component.is_loading = true;
        component['indices_return_actions_'](MockClosedIndices);

        expect(component.is_loading).toBeFalse();
      });
    });

    describe('private api_index_management_()', () => {
      it('should call api_index_management_()', () => {
        reset();

        component['api_index_management_'](MockIndexManagementOptionInterfaceDeleteIndices);

        expect(component['api_index_management_']).toHaveBeenCalled();
      });

      it('should call index_management_service_.index_management() from api_index_management_()', () => {
        reset();

        component['api_index_management_'](MockIndexManagementOptionInterfaceDeleteIndices);

        expect(component['index_management_service_'].index_management).toHaveBeenCalled();
      });

      it('should call index_management_service_.index_management() and handle response and call mat_snackbar_service_.displaySnackBar()', () => {
        reset();

        component['api_index_management_'](MockIndexManagementOptionInterfaceDeleteIndices);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call index_management_service_.index_management() and handle response and call reset_form_()', () => {
        reset();

        component['api_index_management_'](MockIndexManagementOptionInterfaceDeleteIndices);

        expect(component['reset_form_']).toHaveBeenCalled();
      });

      it('should call index_management_service_.index_management() and handle error response instanceof ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['index_management_service_'], 'index_management').and.returnValue(throwError(MockErrorMessageClass));

        component['api_index_management_'](MockIndexManagementOptionInterfaceDeleteIndices);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call index_management_service_.index_management() and handle error response instanceof HttpErrorResponse', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['index_management_service_'], 'index_management').and.returnValue(throwError(mock_http_error_response));

        component['api_index_management_'](MockIndexManagementOptionInterfaceDeleteIndices);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_closed_indices_()', () => {
      it('should call api_get_closed_indices_()', () => {
        reset();

        component['api_get_closed_indices_']();

        expect(component['api_get_closed_indices_']).toHaveBeenCalled();
      });

      it('should call index_management_service_.get_closed_indices() from api_get_closed_indices_()', () => {
        reset();

        component['api_get_closed_indices_']();

        expect(component['index_management_service_'].get_closed_indices).toHaveBeenCalled();
      });

      it('should call index_management_service_.get_closed_indices() and handle response and call indices_return_actions_()', () => {
        reset();

        component['api_get_closed_indices_']();

        expect(component['indices_return_actions_']).toHaveBeenCalled();
      });

      it('should call index_management_service_.get_closed_indices() and handle error response instanceof ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['index_management_service_'], 'get_closed_indices').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_closed_indices_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call index_management_service_.get_closed_indices() and handle error response instanceof HttpErrorResponse', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['index_management_service_'], 'get_closed_indices').and.returnValue(throwError(mock_http_error_response));

        component['api_get_closed_indices_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_minio_check_()', () => {
      it('should call api_minio_check_()', () => {
        reset();

        component['api_minio_check_']();

        expect(component['api_minio_check_']).toHaveBeenCalled();
      });

      it('should call index_management_service_.minio_check() from api_minio_check_()', () => {
        reset();

        component['api_minio_check_']();

        expect(component['index_management_service_'].minio_check).toHaveBeenCalled();
      });

      it('should call index_management_service_.minio_check() and handle response and call set_backup_option_()', () => {
        reset();

        component['api_minio_check_']();

        expect(component['set_backup_option_']).toHaveBeenCalled();
      });

      it('should call index_management_service_.minio_check() and handle error response instanceof ErrorMessageClass and call set_backup_option_()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['index_management_service_'], 'minio_check').and.returnValue(throwError(MockErrorMessageClass));

        component['api_minio_check_']();

        expect(component['set_backup_option_']).toHaveBeenCalled();
      });

      it('should call index_management_service_.minio_check() and handle error response instanceof ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['index_management_service_'], 'minio_check').and.returnValue(throwError(MockErrorMessageClass));

        component['api_minio_check_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call index_management_service_.minio_check() and handle error response instanceof HttpErrorResponse', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['index_management_service_'], 'minio_check').and.returnValue(throwError(mock_http_error_response));

        component['api_minio_check_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_all_indices_()', () => {
      it('should call api_get_all_indices_()', () => {
        reset();

        component['api_get_all_indices_']();

        expect(component['api_get_all_indices_']).toHaveBeenCalled();
      });

      it('should call index_management_service_.get_all_indices() from api_get_all_indices_()', () => {
        reset();

        component['api_get_all_indices_']();

        expect(component['index_management_service_'].get_all_indices).toHaveBeenCalled();
      });

      it('should call index_management_service_.get_all_indices() and handle response and call indices_return_actions_()', () => {
        reset();

        component['api_get_all_indices_']();

        expect(component['indices_return_actions_']).toHaveBeenCalled();
      });

      it('should call index_management_service_.get_all_indices() and handle error response instanceof ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['index_management_service_'], 'get_all_indices').and.returnValue(throwError(MockErrorMessageClass));

        component['api_get_all_indices_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call index_management_service_.get_all_indices() and handle error response instanceof HttpErrorResponse', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['index_management_service_'], 'get_all_indices').and.returnValue(throwError(mock_http_error_response));

        component['api_get_all_indices_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

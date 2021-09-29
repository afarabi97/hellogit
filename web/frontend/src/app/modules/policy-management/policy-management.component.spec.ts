import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import {
  MockArrayRuleSetClass,
  MockJobClass,
  MockJobStatusDoneClass,
  MockRuleClass,
  MockRuleForDeleteClass,
  MockRuleForToggleClass,
  MockRuleForToggleDisabledClass,
  MockRuleSetClass,
  MockRuleSetForDeleteClass
} from '../../../../static-data/class-objects';
import {
  MockErrorMessageInterface,
  MockRuleInterface,
  MockRuleSetDisabledInterface,
  MockRuleSetInterface
} from '../../../../static-data/interface-objects';
import { ErrorMessageClass, RuleClass, RuleSetClass } from '../../classes';
import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION } from '../../constants/cvah.constants';
import { RuleSetInterface } from '../../interfaces';
import { ApiService } from '../../services/abstract/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { TestingModule } from '../testing-modules/testing.module';
import { InjectorModule } from '../utilily-modules/injector.module';
import { RulesGroupUploadInterface } from './interfaces';
import { PolicyManagementComponent } from './policy-management.component';
import { PolicyManagementModule } from './policy-management.module';

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

class MockSocket {
  getSocket() {
    return {'on': () => {}};
  }
}

describe('PolicyManagementComponent', () => {
  let component: PolicyManagementComponent;
  let fixture: ComponentFixture<PolicyManagementComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyNGAfterViewInit: jasmine.Spy<any>;
  let spyNGOnChanges: jasmine.Spy<any>;
  let spyApplyFilter: jasmine.Spy<any>;
  let spyGetRules: jasmine.Spy<any>;
  let spyRulesVisible: jasmine.Spy<any>;
  let spyEditRule: jasmine.Spy<any>;
  let spyEnableRuleSet: jasmine.Spy<any>;
  let spyIsRuleEnabled: jasmine.Spy<any>;
  let spyEnableRule: jasmine.Spy<any>;
  let spyDeleteRuleConfirmDialog: jasmine.Spy<any>;
  let spyDeleteRuleSetConfirmDialog: jasmine.Spy<any>;
  let spyEditRuleSet: jasmine.Spy<any>;
  let spyAddRule: jasmine.Spy<any>;
  let spyDoesRuleSetHaveRules: jasmine.Spy<any>;
  let spyIsArray: jasmine.Spy<any>;
  let spyRuleSync: jasmine.Spy<any>;
  let spyAddRuleSet: jasmine.Spy<any>;
  let spyUploadRulesFile: jasmine.Spy<any>;
  let spySetTableAttributes: jasmine.Spy<any>;
  let spyNestedFilterCheck: jasmine.Spy<any>;
  let spyCheckRuleSyncStatus: jasmine.Spy<any>;
  let spySocketRefreshBoadcast: jasmine.Spy<any>;
  let spySocketRefreshRuleSetChange: jasmine.Spy<any>;
  let spyGetRuleSetIndex: jasmine.Spy<any>;
  let spyGetRuleIndex: jasmine.Spy<any>;
  let spyApiSyncRuleSets: jasmine.Spy<any>;
  let spyApiGetRuleSets: jasmine.Spy<any>;
  let spyApiGetRules: jasmine.Spy<any>;
  let spyApiCreateRuleSet: jasmine.Spy<any>;
  let spyApiUpdateRuleSet: jasmine.Spy<any>;
  let spyApiUploadRuleFile: jasmine.Spy<any>;
  let spyApiToggleRule: jasmine.Spy<any>;
  let spyApiDeleteRule: jasmine.Spy<any>;
  let spyApiDeleteRuleSet: jasmine.Spy<any>;
  let spyApiCheckCatalogStatusSuricata: jasmine.Spy<any>;
  let spyApiCheckCatalogStatusZeek: jasmine.Spy<any>;
  let spyApiGetJobs: jasmine.Spy<any>;

  // Test Data
  const create_file_from_mock_file = (file: MockFile): File => {
    const blob = new Blob([file.body], { type: file.mimeType }) as any;
    blob['lastModifiedDate'] = new Date();
    blob['name'] = file.name;

    return blob as File;
  };
  const rule_set_form_group: FormGroup = new FormGroup({
    _id: new FormControl(MockRuleSetInterface._id),
    rules: new FormControl([]),
    appType: new FormControl(MockRuleSetInterface.appType),
    clearance: new FormControl(MockRuleSetInterface.clearance),
    name: new FormControl(MockRuleSetInterface.name),
    sensors: new FormControl([]),
    state: new FormControl(MockRuleSetInterface.state),
    createdDate: new FormControl(MockRuleSetInterface.createdDate),
    lastModifiedDate: new FormControl(MockRuleSetInterface.lastModifiedDate),
    isEnabled: new FormControl(MockRuleSetInterface.isEnabled)
  });
  const mock_file: MockFile = {
    name: 'fake.txt',
    body: 'fake body',
    mimeType: 'text/plain'
  };
  const form_data = new FormData();
  form_data.append('upload_file', create_file_from_mock_file(mock_file), mock_file.name);
  form_data.append('ruleSetForm', JSON.stringify(MockRuleSetInterface as RuleSetInterface));
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });
  const rules_group_upload: RulesGroupUploadInterface = {
    form_group: rule_set_form_group,
    file_to_upload: create_file_from_mock_file(mock_file)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        InjectorModule,
        PolicyManagementModule,
        TestingModule
      ],
      providers: [
        ApiService,
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: WebsocketService, useClass: MockSocket }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyManagementComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyNGAfterViewInit = spyOn(component, 'ngAfterViewInit').and.callThrough();
    spyNGOnChanges = spyOn(component, 'ngOnChanges').and.callThrough();
    spyApplyFilter = spyOn(component, 'apply_filter').and.callThrough();
    spyGetRules = spyOn(component, 'get_rules').and.callThrough();
    spyRulesVisible = spyOn(component, 'rules_visible').and.callThrough();
    spyEditRule = spyOn(component, 'edit_rule').and.callThrough();
    spyEnableRuleSet = spyOn(component, 'enable_rule_set').and.callThrough();
    spyIsRuleEnabled = spyOn(component, 'is_rule_enabled').and.callThrough();
    spyEnableRule = spyOn(component, 'enable_rule').and.callThrough();
    spyDeleteRuleConfirmDialog = spyOn(component, 'delete_rule_confirm_dialog').and.callThrough();
    spyDeleteRuleSetConfirmDialog = spyOn(component, 'delete_rule_set_confirm_dialog').and.callThrough();
    spyEditRuleSet = spyOn(component, 'edit_rule_set').and.callThrough();
    spyAddRule = spyOn(component, 'add_rule').and.callThrough();
    spyDoesRuleSetHaveRules = spyOn(component, 'does_rule_set_contain_rules').and.callThrough();
    spyIsArray = spyOn(component, 'is_array').and.callThrough();
    spyRuleSync = spyOn(component, 'rule_sync').and.callThrough();
    spyAddRuleSet = spyOn(component, 'add_rule_set').and.callThrough();
    spyUploadRulesFile = spyOn(component, 'upload_rules_file').and.callThrough();
    spySetTableAttributes = spyOn<any>(component, 'set_table_attributes_').and.callThrough();
    spyNestedFilterCheck = spyOn<any>(component, 'nested_filter_check_').and.callThrough();
    spyCheckRuleSyncStatus = spyOn<any>(component, 'check_rule_sync_status_').and.callThrough();
    spySocketRefreshBoadcast = spyOn<any>(component, 'socket_refresh_broadcast_').and.callThrough();
    spySocketRefreshRuleSetChange = spyOn<any>(component, 'socket_refresh_rule_set_change_').and.callThrough();
    spyGetRuleSetIndex = spyOn<any>(component, 'get_rule_set_index_').and.callThrough();
    spyGetRuleIndex = spyOn<any>(component, 'get_rule_index_').and.callThrough();
    spyApiSyncRuleSets = spyOn<any>(component, 'api_sync_rule_sets_').and.callThrough();
    spyApiGetRuleSets = spyOn<any>(component, 'api_get_rule_sets_').and.callThrough();
    spyApiGetRules = spyOn<any>(component, 'api_get_rules_').and.callThrough();
    spyApiCreateRuleSet = spyOn<any>(component, 'api_create_rule_set_').and.callThrough();
    spyApiUpdateRuleSet = spyOn<any>(component, 'api_update_rule_set_').and.callThrough();
    spyApiUploadRuleFile = spyOn<any>(component, 'api_upload_rule_file_').and.callThrough();
    spyApiToggleRule = spyOn<any>(component, 'api_toggle_rule_').and.callThrough();
    spyApiDeleteRule = spyOn<any>(component, 'api_delete_rule_').and.callThrough();
    spyApiDeleteRuleSet = spyOn<any>(component, 'api_delete_rule_set_').and.callThrough();
    spyApiCheckCatalogStatusSuricata = spyOn<any>(component, 'api_check_catalog_status_suricata_').and.callThrough();
    spyApiCheckCatalogStatusZeek = spyOn<any>(component, 'api_check_catalog_status_zeek_').and.callThrough();
    spyApiGetJobs = spyOn<any>(component, 'api_get_jobs_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyNGAfterViewInit.calls.reset();
    spyNGOnChanges.calls.reset();
    spyApplyFilter.calls.reset();
    spyGetRules.calls.reset();
    spyRulesVisible.calls.reset();
    spyEditRule.calls.reset();
    spyEnableRuleSet.calls.reset();
    spyIsRuleEnabled.calls.reset();
    spyEnableRule.calls.reset();
    spyDeleteRuleConfirmDialog.calls.reset();
    spyDeleteRuleSetConfirmDialog.calls.reset();
    spyEditRuleSet.calls.reset();
    spyAddRule.calls.reset();
    spyDoesRuleSetHaveRules.calls.reset();
    spyIsArray.calls.reset();
    spyRuleSync.calls.reset();
    spyAddRuleSet.calls.reset();
    spyUploadRulesFile.calls.reset();
    spySetTableAttributes.calls.reset();
    spyNestedFilterCheck.calls.reset();
    spyCheckRuleSyncStatus.calls.reset();
    spySocketRefreshBoadcast.calls.reset();
    spySocketRefreshRuleSetChange.calls.reset();
    spyGetRuleSetIndex.calls.reset();
    spyGetRuleIndex.calls.reset();
    spyApiSyncRuleSets.calls.reset();
    spyApiGetRuleSets.calls.reset();
    spyApiGetRules.calls.reset();
    spyApiCreateRuleSet.calls.reset();
    spyApiUpdateRuleSet.calls.reset();
    spyApiUploadRuleFile.calls.reset();
    spyApiToggleRule.calls.reset();
    spyApiDeleteRule.calls.reset();
    spyApiDeleteRuleSet.calls.reset();
    spyApiCheckCatalogStatusSuricata.calls.reset();
    spyApiCheckCatalogStatusZeek.calls.reset();
    spyApiGetJobs.calls.reset();
  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create PolicyManagementComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('PolicyManagementComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.rule_sets_data_source.data = MockArrayRuleSetClass;
        component.rule_sets_data_source.filter = 'test';
        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call check_rule_sync_status_() from ngOnInit()', () => {
        reset();

        expect(component['check_rule_sync_status_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['check_rule_sync_status_']).toHaveBeenCalledTimes(1);
      });

      it('should call set_table_attributes_() from ngOnInit()', () => {
        reset();

        expect(component['set_table_attributes_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['set_table_attributes_']).toHaveBeenCalledTimes(1);
      });

      it('should call api_get_rule_sets_() from ngOnInit()', () => {
        reset();

        expect(component['api_get_rule_sets_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['api_get_rule_sets_']).toHaveBeenCalledTimes(1);
      });

      it('should call api_check_catalog_status_suricata_() from ngOnInit()', () => {
        reset();

        expect(component['api_check_catalog_status_suricata_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['api_check_catalog_status_suricata_']).toHaveBeenCalledTimes(1);
      });

      it('should call socket_refresh_rule_set_change_() from ngOnInit()', () => {
        reset();

        expect(component['socket_refresh_rule_set_change_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['socket_refresh_rule_set_change_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('ngAfterViewInit()', () => {
      it('should call ngAfterViewInit()', () => {
        reset();

        component.ngAfterViewInit();

        expect(component.ngAfterViewInit).toHaveBeenCalled();
      });

      it('should call set_table_attributes_() from ngAfterViewInit()', () => {
        reset();

        expect(component['set_table_attributes_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['set_table_attributes_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('ngOnChanges()', () => {
      it('should call ngOnChanges()', () => {
        reset();

        component.ngOnChanges();

        expect(component.ngOnChanges).toHaveBeenCalled();
      });
    });

    describe('apply_filter()', () => {
      it('should call apply_filter()', () => {
        reset();

        component.apply_filter('');

        expect(component.apply_filter).toHaveBeenCalled();
      });
    });

    describe('get_rules()', () => {
      it('should call get_rules()', () => {
        reset();

        component.get_rules(MockRuleSetClass);

        expect(component.get_rules).toHaveBeenCalled();
      });

      it('should call get_rule_set_index_() from get_rules()', () => {
        reset();

        expect(component['get_rule_set_index_']).toHaveBeenCalledTimes(0);

        component.get_rules(MockRuleSetClass);

        expect(component['get_rule_set_index_']).toHaveBeenCalledTimes(1);
      });

      it('should call get_rules() and set rules visible for index of passed rule set', () => {
        reset();

        component.get_rules(MockRuleSetClass);

        const rule_set_index: number = component['get_rule_set_index_'](MockRuleSetClass);

        expect(component['rules_visible_'][rule_set_index]).toBeTrue();
      });

      it('should call api_get_rules_() from get_rules()', () => {
        reset();

        expect(component['api_get_rules_']).toHaveBeenCalledTimes(0);

        component.get_rules(MockRuleSetClass);

        expect(component['api_get_rules_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('rules_visible()', () => {
      it('should call rules_visible()', () => {
        reset();

        component.rules_visible(MockRuleSetClass);

        expect(component.rules_visible).toHaveBeenCalled();
      });

      it('should call get_rule_set_index_() from rules_visible()', () => {
        reset();

        expect(component['get_rule_set_index_']).toHaveBeenCalledTimes(0);

        component.rules_visible(MockRuleSetClass);

        expect(component['get_rule_set_index_']).toHaveBeenCalledTimes(1);
      });

      it('should call rules_visible() and return boolean false', () => {
        reset();

        const rule_set_index: number = component['get_rule_set_index_'](MockRuleSetClass);

        component['rules_visible_'][rule_set_index] = false;

        const return_value: boolean = component.rules_visible(MockRuleSetClass);

        expect(return_value).toBeFalse();
      });

      it('should call rules_visible() and return boolean true', () => {
        reset();

        const rule_set_index: number = component['get_rule_set_index_'](MockRuleSetClass);

        component['rules_visible_'][rule_set_index] = true;

        const return_value: boolean = component.rules_visible(MockRuleSetClass);

        expect(return_value).toBeTrue();
      });
    });

    describe('edit_rule()', () => {
      it('should call edit_rule()', () => {
        reset();

        component.edit_rule(MockRuleSetClass, MockRuleClass);

        expect(component.edit_rule).toHaveBeenCalled();
      });

      it('should call get_rule_index_() after mat dialog ref closed from within edit_rule()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(MockRuleClass) } as MatDialogRef<typeof component>);

        MockRuleSetClass.rules = [MockRuleClass];

        component.edit_rule(MockRuleSetClass, MockRuleClass);

        expect(component['get_rule_index_']).toHaveBeenCalled();
      });
    });

    describe('enable_rule_set()', () => {
      it('should call enable_rule_set()', () => {
        reset();

        const mock_rule_set: RuleSetClass = new RuleSetClass(MockRuleSetInterface);

        component.enable_rule_set(mock_rule_set);

        expect(component.enable_rule_set).toHaveBeenCalled();
      });

      it('should call api_update_rule_set_() from edit_rule()', () => {
        reset();

        const mock_rule_set: RuleSetClass = new RuleSetClass(MockRuleSetInterface);

        expect(component['api_update_rule_set_']).toHaveBeenCalledTimes(0);

        component.enable_rule_set(mock_rule_set);

        expect(component['api_update_rule_set_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('is_rule_enabled()', () => {
      it('should call is_rule_enabled()', () => {
        reset();

        component.is_rule_enabled(MockRuleClass);

        expect(component.is_rule_enabled).toHaveBeenCalled();
      });

      it('should call is_rule_enabled() and return boolean true', () => {
        reset();

        const return_value: boolean = component.is_rule_enabled(MockRuleClass);

        expect(return_value).toBeTrue();
      });

      it('should call is_rule_enabled() and return boolean false', () => {
        reset();

        const mock_rule: RuleClass = new RuleClass(MockRuleInterface);
        mock_rule.isEnabled = false;
        const return_value: boolean = component.is_rule_enabled(mock_rule);

        expect(return_value).toBeFalse();
      });
    });

    describe('enable_rule()', () => {
      it('should call enable_rule()', () => {
        reset();

        const mock_rule: RuleClass = new RuleClass(MockRuleInterface);
        const mock_rule_set: RuleSetClass = new RuleSetClass(MockRuleSetInterface);

        component.enable_rule(mock_rule, mock_rule_set);

        expect(component.enable_rule).toHaveBeenCalled();
      });

      it('should call api_toggle_rule_() from enable_rule()', () => {
        reset();

        const mock_rule: RuleClass = new RuleClass(MockRuleInterface);
        const mock_rule_set: RuleSetClass = new RuleSetClass(MockRuleSetInterface);

        component.enable_rule(mock_rule, mock_rule_set);

        expect(component['api_toggle_rule_']).toHaveBeenCalled();
      });
    });

    describe('delete_rule_confirm_dialog()', () => {
      it('should call delete_rule_confirm_dialog()', () => {
        reset();

        component.delete_rule_confirm_dialog(MockRuleForToggleDisabledClass, MockRuleSetClass);

        expect(component.delete_rule_confirm_dialog).toHaveBeenCalled();
      });

      it('should call api_toggle_rule_() after mat dialog ref closed from within delete_rule_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        MockRuleSetClass.rules = [MockRuleClass];

        component.delete_rule_confirm_dialog(MockRuleClass, MockRuleSetClass);

        expect(component['api_delete_rule_']).toHaveBeenCalled();
      });

      it('should not call api_toggle_rule_() after mat dialog ref closed from within delete_rule_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.delete_rule_confirm_dialog(MockRuleClass, MockRuleSetClass);

        expect(component['api_delete_rule_']).not.toHaveBeenCalled();
      });
    });

    describe('delete_rule_set_confirm_dialog()', () => {
      it('should call delete_rule_set_confirm_dialog()', () => {
        reset();

        component.delete_rule_set_confirm_dialog(MockRuleSetClass);

        expect(component.delete_rule_set_confirm_dialog).toHaveBeenCalled();
      });

      it('should call api_delete_rule_set_() after mat dialog ref closed from within delete_rule_set_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.delete_rule_set_confirm_dialog(MockRuleSetClass);

        expect(component['api_delete_rule_set_']).toHaveBeenCalled();
      });

      it('should not call api_delete_rule_set_() after mat dialog ref closed from within delete_rule_set_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.delete_rule_set_confirm_dialog(MockRuleSetClass);

        expect(component['api_delete_rule_set_']).not.toHaveBeenCalled();
      });
    });

    describe('edit_rule_set()', () => {
      it('should call edit_rule_set()', () => {
        reset();

        component.edit_rule_set(MockRuleSetClass);

        expect(component.edit_rule_set).toHaveBeenCalled();
      });

      it('should call api_update_rule_set_() after mat dialog ref closed from within edit_rule_set()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(rule_set_form_group) } as MatDialogRef<typeof component>);

        component.edit_rule_set(MockRuleSetClass);

        expect(component['api_update_rule_set_']).toHaveBeenCalled();
      });

      it('should not call api_update_rule_set_() after mat dialog ref closed from within edit_rule_set()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.delete_rule_set_confirm_dialog(MockRuleSetClass);

        expect(component['api_update_rule_set_']).not.toHaveBeenCalled();
      });
    });

    describe('add_rule()', () => {
      it('should call add_rule()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(MockRuleClass) } as MatDialogRef<typeof component>);

        component.add_rule(MockRuleSetClass);

        expect(component.add_rule).toHaveBeenCalled();
      });
    });

    describe('does_rule_set_contain_rules()', () => {
      it('should call does_rule_set_contain_rules()', () => {
        reset();

        component.does_rule_set_contain_rules();

        expect(component.does_rule_set_contain_rules).toHaveBeenCalled();
      });

      it('should call does_rule_set_contain_rules() and return false', () => {
        reset();

        component.rules_data_source.data = [];
        const return_value: boolean = component.does_rule_set_contain_rules();

        expect(return_value).toBeFalse();
      });

      it('should call does_rule_set_contain_rules() and return true', () => {
        reset();

        component.rules_data_source.data = [MockRuleClass];
        const return_value: boolean = component.does_rule_set_contain_rules();

        expect(return_value).toBeTrue();
      });
    });

    describe('is_array()', () => {
      it('should call is_array()', () => {
        reset();

        component.is_array([]);

        expect(component.is_array).toHaveBeenCalled();
      });

      it('should call is_array() and return false when undefined variable passed', () => {
        reset();

        const return_value: boolean = component.is_array(undefined);

        expect(return_value).toBeFalse();
      });

      it('should call is_array() and return false when null variable passed', () => {
        reset();

        const return_value: boolean = component.is_array(null);

        expect(return_value).toBeFalse();
      });

      it('should call is_array() and return false when non array variable passed', () => {
        reset();

        const return_value: boolean = component.is_array('');

        expect(return_value).toBeFalse();
      });

      it('should call is_array() and return true when array variable passed', () => {
        reset();

        const return_value: boolean = component.is_array([]);

        expect(return_value).toBeTrue();
      });
    });

    describe('rule_sync()', () => {
      it('should call rule_sync()', () => {
        reset();

        component.rule_sync();

        expect(component.rule_sync).toHaveBeenCalled();
      });

      it('should call rule_sync() and and set component.rule_sync = true', () => {
        reset();

        expect(component.job_status).toBeFalse();

        component.rule_sync();

        expect(component.job_status).toBeTrue();
      });

      it('should call api_sync_rule_sets_() from rule_sync()', () => {
        reset();

        expect(component['api_sync_rule_sets_']).toHaveBeenCalledTimes(0);

        component.rule_sync();

        expect(component['api_sync_rule_sets_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('add_rule_set()', () => {
      it('should call add_rule_set()', () => {
        reset();

        component.add_rule_set();

        expect(component.add_rule_set).toHaveBeenCalled();
      });

      it('should call api_create_rule_set_() after mat dialog ref closed from within add_rule_set()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(rule_set_form_group) } as MatDialogRef<typeof component>);

        component.add_rule_set();

        expect(component['api_create_rule_set_']).toHaveBeenCalled();
      });

      it('should not call api_create_rule_set_() after mat dialog ref closed from within add_rule_set()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.add_rule_set();

        expect(component['api_create_rule_set_']).not.toHaveBeenCalled();
      });
    });

    describe('upload_rules_file()', () => {
      it('should call upload_rules_file()', () => {
        reset();

        component.upload_rules_file(MockRuleSetClass);

        expect(component.upload_rules_file).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() after mat dialog ref closed from within upload_rules_file()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(rules_group_upload) } as MatDialogRef<typeof component>);

        component.upload_rules_file(MockRuleSetClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call api_upload_rule_file_() after mat dialog ref closed from within upload_rules_file()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(rules_group_upload) } as MatDialogRef<typeof component>);

        component.upload_rules_file(MockRuleSetClass);

        expect(component['api_upload_rule_file_']).toHaveBeenCalled();
      });

      it('should not call api_upload_rule_file_() after mat dialog ref closed from within upload_rules_file()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.upload_rules_file(MockRuleSetClass);

        expect(component['api_upload_rule_file_']).not.toHaveBeenCalled();
      });
    });

    describe('private set_table_attributes_()', () => {
      it('should call set_table_attributes_()', () => {
        reset();

        component['set_table_attributes_']();

        expect(component['set_table_attributes_']).toHaveBeenCalled();
      });
    });

    describe('private nested_filter_check_()', () => {
      it('should call nested_filter_check_()', () => {
        reset();

        const search = '';

        component['nested_filter_check_'](search, MockRuleSetClass, '');

        expect(component['nested_filter_check_']).toHaveBeenCalled();
      });

      it('should call nested_filter_check_() from nested_filter_check_()', () => {
        reset();

        const search: string = 'test';
        const rule_set_keys: string[] = Object.keys(MockRuleSetClass);

        rule_set_keys.forEach((key: string) => {
          const return_value: string = component['nested_filter_check_'](search, MockRuleSetClass, key);

          expect(typeof return_value === 'string').toBeTrue();
          expect(component['nested_filter_check_']).toHaveBeenCalled();
        });
      });

      it('should call nested_filter_check_() and return value starting with initial search string', () => {
        reset();

        const search: string = 'test';
        const rule_set_keys: string[] = Object.keys(MockRuleSetClass);

        rule_set_keys.forEach((key: string) => {
          const return_value: string = component['nested_filter_check_'](search, MockRuleSetClass, key);

          expect(return_value.startsWith(search)).toBeTrue();
          expect(component['nested_filter_check_']).toHaveBeenCalled();
        });
      });
    });

    describe('private check_rule_sync_status_()', () => {
      it('should call check_rule_sync_status_()', () => {
        reset();

        component['check_rule_sync_status_']();

        expect(component['check_rule_sync_status_']).toHaveBeenCalled();
      });

      it('should call api_get_jobs_() from check_rule_sync_status_()', () => {
        reset();

        component['check_rule_sync_status_']();

        expect(component['api_get_jobs_']).toHaveBeenCalled();
      });

      it('should call socket_refresh_broadcast_() from check_rule_sync_status_()', () => {
        reset();

        component['check_rule_sync_status_']();

        expect(component['socket_refresh_broadcast_']).toHaveBeenCalled();
      });
    });

    // TODO - Update when websocket has been flushed out
    describe('private socket_refresh_broadcast_()', () => {
      it('should call socket_refresh_broadcast_()', () => {
        reset();

        component['socket_refresh_broadcast_']();

        expect(component['socket_refresh_broadcast_']).toHaveBeenCalled();
      });
    });

    // TODO - Update when websocket has been flushed out
    describe('private socket_refresh_rule_set_change_()', () => {
      it('should call socket_refresh_rule_set_change_()', () => {
        reset();

        component['socket_refresh_rule_set_change_']();

        expect(component['socket_refresh_rule_set_change_']).toHaveBeenCalled();
      });
    });

    describe('private get_rule_set_index_()', () => {
      it('should call get_rule_set_index_()', () => {
        reset();

        component['get_rule_set_index_'](MockRuleSetClass);

        expect(component['get_rule_set_index_']).toHaveBeenCalled();
      });

      it('should call get_rule_set_index_() and return index for rule set from rule set source data', () => {
        reset();

        const return_value: number = component['get_rule_set_index_'](MockRuleSetClass);
        const rule_set_index: number = component.rule_sets_data_source.data.findIndex((rs: RuleSetClass) => rs._id === MockRuleSetClass._id);

        expect(return_value).toEqual(rule_set_index);
      });
    });

    describe('private get_rule_index_()', () => {
      it('should call get_rule_index_()', () => {
        reset();

        component.rules_data_source.data = [MockRuleClass];
        component['get_rule_index_'](MockRuleClass);

        expect(component['get_rule_index_']).toHaveBeenCalled();
      });

      it('should call get_rule_index_() and return index for rule set from rule set source data', () => {
        reset();

        component.rules_data_source.data = [MockRuleClass];
        const return_value: number = component['get_rule_index_'](MockRuleClass);
        const rule_index: number = component.rules_data_source.data.findIndex((r: RuleClass) => r._id === MockRuleClass._id);

        expect(return_value).toEqual(rule_index);
      });
    });

    describe('private api_sync_rule_sets_()', () => {
      it('should call api_sync_rule_sets_()', () => {
        reset();

        component['api_sync_rule_sets_']();

        expect(component['api_sync_rule_sets_']).toHaveBeenCalled();
      });

      it('should call rules_service_.sync_rule_sets() from api_sync_rule_sets_()', () => {
        reset();

        component['api_sync_rule_sets_']();

        expect(component['rules_service_'].sync_rule_sets).toHaveBeenCalled();
      });

      it('should call rules_service_.sync_rule_sets() and handle void response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'sync_rule_sets').and.returnValue(of(null));

        component['api_sync_rule_sets_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.sync_rule_sets() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'sync_rule_sets').and.returnValue(throwError(mock_http_error_response));

        component['api_sync_rule_sets_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_rule_sets_()', () => {
      it('should call api_get_rule_sets_()', () => {
        reset();

        component['api_get_rule_sets_']();

        expect(component['api_get_rule_sets_']).toHaveBeenCalled();
      });

      it('should call rules_service_.get_rule_sets() from api_get_rule_sets_()', () => {
        reset();

        component['api_get_rule_sets_']();

        expect(component['rules_service_'].get_rule_sets).toHaveBeenCalled();
      });

      it('should call rules_service_.get_rule_sets() and handle response', () => {
        reset();

        expect(component.rule_sets_data_source.data.length > 0).toBeTrue();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'get_rule_sets').and.returnValue(of([]));

        component['api_get_rule_sets_']();

        expect(component.rule_sets_data_source.data.length > 0).toBeFalse();
      });

      it('should call rules_service_.get_rule_sets() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'get_rule_sets').and.returnValue(throwError(mock_http_error_response));

        component['api_get_rule_sets_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_rules_()', () => {
      it('should call api_get_rules_()', () => {
        reset();

        const rule_set_index: number = component['get_rule_set_index_'](MockRuleSetClass);

        component['api_get_rules_'](MockRuleSetClass, rule_set_index);

        expect(component['api_get_rules_']).toHaveBeenCalled();
      });

      it('should call rules_service_.get_rules() from api_get_rules_()', () => {
        reset();

        const rule_set_index: number = component['get_rule_set_index_'](MockRuleSetClass);

        component['api_get_rules_'](MockRuleSetClass, rule_set_index);

        expect(component['rules_service_'].get_rules).toHaveBeenCalled();
      });

      it('should call rules_service_.get_rules() and handle response', () => {
        reset();

        const rule_set_index: number = component['get_rule_set_index_'](MockRuleSetClass);

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'get_rules').and.returnValue(of([MockRuleClass]));

        component['api_get_rules_'](MockRuleSetClass, rule_set_index);

        expect(component.rules_data_source.data.length).toEqual(1);
      });

      it('should call rules_service_.get_rules() and handle error', () => {
        reset();

        const rule_set_index: number = component['get_rule_set_index_'](MockRuleSetClass);

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'get_rules').and.returnValue(throwError(mock_http_error_response));

        component['api_get_rules_'](MockRuleSetClass, rule_set_index);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_create_rule_set_()', () => {
      it('should call api_create_rule_set_()', () => {
        reset();

        component['api_create_rule_set_'](MockRuleSetInterface);

        expect(component['api_create_rule_set_']).toHaveBeenCalled();
      });

      it('should call rules_service_.create_rule_set() from api_create_rule_set_()', () => {
        reset();

        component['api_create_rule_set_'](MockRuleSetInterface);

        expect(component['rules_service_'].create_rule_set).toHaveBeenCalled();
      });

      it('should call rules_service_.create_rule_set() and handle response and call api_get_rule_sets_()', () => {
        reset();

        component['api_create_rule_set_'](MockRuleSetInterface);

        expect(component['api_get_rule_sets_']).toHaveBeenCalled();
      });

      it('should call rules_service_.create_rule_set() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_create_rule_set_'](MockRuleSetInterface);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.create_rule_set() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'create_rule_set').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_create_rule_set_'](MockRuleSetInterface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.create_rule_set() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'create_rule_set').and.returnValue(throwError(mock_http_error_response));

        component['api_create_rule_set_'](MockRuleSetInterface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_update_rule_set_()', () => {
      it('should call api_update_rule_set_()', () => {
        reset();

        component['api_update_rule_set_'](MockRuleSetDisabledInterface, false);

        expect(component['api_update_rule_set_']).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() from api_update_rule_set_()', () => {
        reset();

        component['api_update_rule_set_'](MockRuleSetInterface, false);

        expect(component['rules_service_'].update_rule_set).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() and handle response and call get_rule_set_index_() when enabling_rule_set = true', () => {
        reset();

        component['api_update_rule_set_'](MockRuleSetInterface, true);

        expect(component['get_rule_set_index_']).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() and handle response and call api_get_rule_sets_() when enabling_rule_set = false', () => {
        reset();

        component['api_update_rule_set_'](MockRuleSetInterface, false);

        expect(component['api_get_rule_sets_']).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message() for enabling_rule_set = false', () => {
        reset();

        component['api_update_rule_set_'](MockRuleSetInterface, false);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message() for enabling_rule_set = true', () => {
        reset();

        component['api_update_rule_set_'](MockRuleSetInterface, true);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() and handle unintended response for enabling_rule_set = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'update_rule_set').and.returnValue(of({}));

        component['api_update_rule_set_'](MockRuleSetInterface, false);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() and handle unintended response for enabling_rule_set = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'update_rule_set').and.returnValue(of({}));

        component['api_update_rule_set_'](MockRuleSetInterface, true);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() and handle error response instanceof ErrorMessageClass for enabling_rule_set = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'update_rule_set').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_update_rule_set_'](MockRuleSetInterface, false);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() and handle error response instanceof ErrorMessageClass for enabling_rule_set = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'update_rule_set').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_update_rule_set_'](MockRuleSetInterface, true);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() and handle error for enabling_rule_set = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'update_rule_set').and.returnValue(throwError(mock_http_error_response));

        component['api_update_rule_set_'](MockRuleSetInterface, false);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.update_rule_set() and handle error for enabling_rule_set = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'update_rule_set').and.returnValue(throwError(mock_http_error_response));

        component['api_update_rule_set_'](MockRuleSetInterface, true);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_upload_rule_file_()', () => {
      it('should call api_upload_rule_file_()', () => {
        reset();

        component.rules_data_source.data = [MockRuleClass];
        component['api_upload_rule_file_'](form_data);

        expect(component['api_upload_rule_file_']).toHaveBeenCalled();
      });

      it('should call rules_service_.upload_rule_file() from api_upload_rule_file_()', () => {
        reset();

        component.rules_data_source.data = [MockRuleClass];
        component['api_upload_rule_file_'](form_data);

        expect(component['rules_service_'].upload_rule_file).toHaveBeenCalled();
      });

      it('should call rules_service_.upload_rule_file() and handle response instance RuleClass and call mat_snackbar_service_.displaySnackBar', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'upload_rule_file').and.returnValue(of(new RuleClass(MockRuleInterface)));

        component.rules_data_source.data = [MockRuleClass];
        component['api_upload_rule_file_'](form_data);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.upload_rule_file() and handle response instance RuleClass[] and call mat_snackbar_service_.displaySnackBar', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'upload_rule_file').and.returnValue(of([new RuleClass(MockRuleInterface)]));

        component.rules_data_source.data = [MockRuleClass];
        component['api_upload_rule_file_'](form_data);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.upload_rule_file() and handle unintended [] response and call mat_snackbar_service_.generate_return_fail_snackbar_message', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'upload_rule_file').and.returnValue(of([new RuleSetClass(MockRuleSetInterface)]));

        component.rules_data_source.data = [MockRuleClass];
        component['api_upload_rule_file_'](form_data);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.upload_rule_file() and handle unintended response and call mat_snackbar_service_.generate_return_fail_snackbar_message', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'upload_rule_file').and.returnValue(of(null));

        component.rules_data_source.data = [MockRuleClass];
        component['api_upload_rule_file_'](form_data);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.upload_rule_file() and handle error response instance ErrorMessageClass and call mat_snackbar_service_.displaySnackBar', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'upload_rule_file').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component.rules_data_source.data = [MockRuleClass];
        component['api_upload_rule_file_'](form_data);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.upload_rule_file() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'upload_rule_file').and.returnValue(throwError(mock_http_error_response));

        component.rules_data_source.data = [MockRuleClass];
        component['api_upload_rule_file_'](form_data);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_toggle_rule_()', () => {
      it('should call api_toggle_rule_()', () => {
        reset();

        component['api_toggle_rule_'](MockRuleForToggleClass, MockRuleSetClass);

        expect(component['api_toggle_rule_']).toHaveBeenCalled();
      });

      it('should call rules_service_.toggle_rule() from api_toggle_rule_()', () => {
        reset();

        component['api_toggle_rule_'](MockRuleForToggleClass, MockRuleSetClass);

        expect(component['rules_service_'].toggle_rule).toHaveBeenCalled();
      });

      it('should call get_rule_index_() from rules_service_.toggle_rule()', () => {
        reset();

        expect(component['get_rule_index_']).toHaveBeenCalledTimes(0);

        component['api_toggle_rule_'](MockRuleForToggleClass, MockRuleSetClass);

        expect(component['get_rule_index_']).toHaveBeenCalledTimes(1);
      });

      it('should call get_rule_set_index_() from rules_service_.toggle_rule()', () => {
        reset();

        expect(component['get_rule_set_index_']).toHaveBeenCalledTimes(0);

        component['api_toggle_rule_'](MockRuleForToggleClass, MockRuleSetClass);

        expect(component['get_rule_set_index_']).toHaveBeenCalledTimes(1);
      });

      it('should call mat_snackbar_service_.generate_return_success_snackbar_message() from rules_service_.toggle_rule()', () => {
        reset();

        component['api_toggle_rule_'](MockRuleForToggleClass, MockRuleSetClass);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.toggle_rule() and handle unintended response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'toggle_rule').and.returnValue(of(null));

        component['api_toggle_rule_'](MockRuleForToggleClass, MockRuleSetClass);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.toggle_rule() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'toggle_rule').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_toggle_rule_'](MockRuleForToggleClass, MockRuleSetClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.toggle_rule() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'toggle_rule').and.returnValue(throwError(mock_http_error_response));

        component['api_toggle_rule_'](MockRuleForToggleClass, MockRuleSetClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_delete_rule_()', () => {
      it('should call api_delete_rule_()', () => {
        reset();

        const rule_index: number = component['get_rule_index_'](MockRuleForDeleteClass);

        component.rules_data_source.data = [MockRuleForDeleteClass];
        component['api_delete_rule_'](MockRuleForDeleteClass, rule_index);

        expect(component['api_delete_rule_']).toHaveBeenCalled();
      });

      it('should call rules_service_.delete_rule() from api_delete_rule_()', () => {
        reset();

        const rule_index: number = component['get_rule_index_'](MockRuleForDeleteClass);

        component.rules_data_source.data = [MockRuleForDeleteClass];
        component['api_delete_rule_'](MockRuleForDeleteClass, rule_index);

        expect(component['rules_service_'].delete_rule).toHaveBeenCalled();
      });

      it('should call rules_service_.delete_rule() and handle response', () => {
        reset();

        const rule_index: number = component['get_rule_index_'](MockRuleForDeleteClass);

        component.rules_data_source.data = [MockRuleForDeleteClass];
        component['api_delete_rule_'](MockRuleForDeleteClass, rule_index);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.delete_rule() and handle unintended response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'delete_rule').and.returnValue(of(null));

        const rule_index: number = component['get_rule_index_'](MockRuleForDeleteClass);

        component.rules_data_source.data = [MockRuleForDeleteClass];
        component['api_delete_rule_'](MockRuleForDeleteClass, rule_index);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.delete_rule() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'delete_rule').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        const rule_index: number = component['get_rule_index_'](MockRuleForDeleteClass);

        component.rules_data_source.data = [MockRuleForDeleteClass];
        component['api_delete_rule_'](MockRuleForDeleteClass, rule_index);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.delete_rule() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'delete_rule').and.returnValue(throwError(mock_http_error_response));

        const rule_index: number = component['get_rule_index_'](MockRuleForDeleteClass);

        component.rules_data_source.data = [MockRuleForDeleteClass];
        component['api_delete_rule_'](MockRuleForDeleteClass, rule_index);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_delete_rule_set_()', () => {
      it('should call api_delete_rule_set_()', () => {
        reset();

        component['api_delete_rule_set_'](MockRuleSetForDeleteClass);

        expect(component['api_delete_rule_set_']).toHaveBeenCalled();
      });

      it('should call rules_service_.delete_rule_set() from api_delete_rule_set_()', () => {
        reset();

        component['api_delete_rule_set_'](MockRuleSetForDeleteClass);

        expect(component['rules_service_'].delete_rule_set).toHaveBeenCalled();
      });

      it('should call rules_service_.delete_rule_set() and handle response', () => {
        reset();

        component['api_delete_rule_set_'](MockRuleSetForDeleteClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.delete_rule_set() and handle unintended response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'delete_rule_set').and.returnValue(of(null));

        component['api_delete_rule_set_'](MockRuleSetForDeleteClass);

        expect(component['mat_snackbar_service_'].generate_return_fail_snackbar_message).toHaveBeenCalled();
      });

      it('should call rules_service_.delete_rule_set() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'delete_rule_set').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_delete_rule_set_'](MockRuleSetForDeleteClass);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call rules_service_.delete_rule_set() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['rules_service_'], 'delete_rule_set').and.returnValue(throwError(mock_http_error_response));

        component['api_delete_rule_set_'](MockRuleSetForDeleteClass);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_check_catalog_status_suricata_()', () => {
      it('should call api_check_catalog_status_suricata_()', () => {
        reset();

        component['api_check_catalog_status_suricata_']();

        expect(component['api_check_catalog_status_suricata_']).toHaveBeenCalled();
      });

      it('should call policy_management_service_.check_catalog_status() from api_check_catalog_status_suricata_()', () => {
        reset();

        component['api_check_catalog_status_suricata_']();

        expect(component['policy_management_service_'].check_catalog_status).toHaveBeenCalled();
      });

      it('should call policy_management_service_.check_catalog_status() and handle response and call api_check_catalog_status_zeek_()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['policy_management_service_'], 'check_catalog_status').and.returnValue(of([]));

        expect(component['api_check_catalog_status_zeek_']).toHaveBeenCalledTimes(0);

        component['api_check_catalog_status_suricata_']();

        expect(component['api_check_catalog_status_zeek_']).toHaveBeenCalledTimes(1);
      });

      it('should call policy_management_service_.check_catalog_status() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['policy_management_service_'], 'check_catalog_status').and.returnValue(throwError(mock_http_error_response));

        component['api_check_catalog_status_suricata_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_check_catalog_status_zeek_()', () => {
      it('should call api_check_catalog_status_zeek_()', () => {
        reset();

        component['api_check_catalog_status_zeek_']();

        expect(component['api_check_catalog_status_zeek_']).toHaveBeenCalled();
      });

      it('should call policy_management_service_.check_catalog_status() from api_check_catalog_status_zeek_()', () => {
        reset();

        component['api_check_catalog_status_zeek_']();

        expect(component['policy_management_service_'].check_catalog_status).toHaveBeenCalled();
      });

      it('should call policy_management_service_.check_catalog_status() and handle response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['policy_management_service_'], 'check_catalog_status').and.returnValue(of([]));

        component['api_check_catalog_status_zeek_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call policy_management_service_.check_catalog_status() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['policy_management_service_'], 'check_catalog_status').and.returnValue(throwError(mock_http_error_response));

        component['api_check_catalog_status_zeek_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_jobs_()', () => {
      it('should call api_get_jobs_()', () => {
        reset();

        component['api_get_jobs_']();

        expect(component['api_get_jobs_']).toHaveBeenCalled();
      });

      it('should call policy_management_service_.get_jobs() from api_get_jobs_()', () => {
        reset();

        component['api_get_jobs_']();

        expect(component['policy_management_service_'].get_jobs).toHaveBeenCalled();
      });

      it('should call policy_management_service_.get_jobs() and handle response and set component.job_status = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['policy_management_service_'], 'get_jobs').and.returnValue(of([MockJobStatusDoneClass]));

        component['api_get_jobs_']();

        expect(component.job_status).toBeTrue();
      });

      it('should call policy_management_service_.get_jobs() and handle response and set component.job_status = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['policy_management_service_'], 'get_jobs').and.returnValue(of([MockJobClass]));

        component['api_get_jobs_']();

        expect(component.job_status).toBeFalse();
      });

      it('should call policy_management_service_.get_jobs() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['policy_management_service_'], 'get_jobs').and.returnValue(throwError(mock_http_error_response));

        component['api_get_jobs_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

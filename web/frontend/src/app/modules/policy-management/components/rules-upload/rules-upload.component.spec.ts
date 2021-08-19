import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { MockRuleSetClass } from '../../../../../../static-data/class-objects-v3_6';
import { TestingModule } from '../../../testing-modules/testing.module';
import { InjectorModule } from '../../../utilily-modules/injector.module';
import { DialogDataInterface } from '../../interfaces';
import { PolicyManagementModule } from '../../policy-management.module';
import { RulesUploadComponent } from './rules-upload.component';

interface MockFile {
  name: string;
  body: string;
  mimeType: string;
}

const create_file_from_mock_file = (file: MockFile): File => {
  const blob = new Blob([file.body], { type: file.mimeType }) as any;
  blob['lastModifiedDate'] = new Date();
  blob['name'] = file.name;

  return blob as File;
};

const create_mock_file_list = (files: MockFile[]) => {
  const file_list: FileList = {
    length: files.length,
    item(index: number): File {
      return file_list[index];
    }
  };
  files.forEach((file, index) => file_list[index] = create_file_from_mock_file(file));

  return file_list;
};

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

class MatDialogMock {
  close() {
    return {
      afterClosed: () => of ()
    };
  }
}

const MOCK_DIALOG_DATA_RULE_SET_DEFINED: DialogDataInterface = {
  rule_set: MockRuleSetClass,
  rule: undefined,
  action: undefined
};

const MOCK_DIALOG_DATA_RULE_SET_UNDEFINED: DialogDataInterface = {
  rule_set: undefined,
  rule: undefined,
  action: undefined
};

describe('RulesUploadComponent', () => {
  let component: RulesUploadComponent;
  let fixture: ComponentFixture<RulesUploadComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyGetFileNamePlaceholder: jasmine.Spy<any>;
  let spyHandleFileInput: jasmine.Spy<any>;
  let spyUpload: jasmine.Spy<any>;
  let spyCancel: jasmine.Spy<any>;
  let spySetRulesFileToUpload: jasmine.Spy<any>;
  let spyInitializeForm: jasmine.Spy<any>;
  let spySetRuleSetGroup: jasmine.Spy<any>;
  let spySetFileNameControl: jasmine.Spy<any>;

  // Test Data
  const mock_file: MockFile = {
    name: 'fake.txt',
    body: 'fake body',
    mimeType: 'text/plain'
  };
  const file_list = create_mock_file_list([mock_file]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        InjectorModule,
        PolicyManagementModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogMock },
        { provide: MAT_DIALOG_DATA, useValue: MOCK_DIALOG_DATA_RULE_SET_DEFINED }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesUploadComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyGetFileNamePlaceholder = spyOn(component, 'get_file_name_place_holder').and.callThrough();
    spyHandleFileInput = spyOn(component, 'handle_file_input').and.callThrough();
    spyUpload = spyOn(component, 'upload').and.callThrough();
    spyCancel = spyOn(component, 'cancel').and.callThrough();
    spySetRulesFileToUpload = spyOn<any>(component, 'set_rules_file_to_upload_').and.callThrough();
    spyInitializeForm = spyOn<any>(component, 'initialize_form_').and.callThrough();
    spySetRuleSetGroup = spyOn<any>(component, 'set_rule_set_form_group_').and.callThrough();
    spySetFileNameControl = spyOn<any>(component, 'set_file_name_control_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyGetFileNamePlaceholder.calls.reset();
    spyHandleFileInput.calls.reset();
    spyUpload.calls.reset();
    spyCancel.calls.reset();
    spySetRulesFileToUpload.calls.reset();
    spyInitializeForm.calls.reset();
    spySetRuleSetGroup.calls.reset();
    spySetFileNameControl.calls.reset();
  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create RulesUploadComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('RulesUploadComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_form_() from ngOnInit()', () => {
        reset();

        expect(component['initialize_form_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['initialize_form_']).toHaveBeenCalledTimes(1);
      });

      it('should call set_file_name_control_() from ngOnInit()', () => {
        reset();

        expect(component['set_file_name_control_']).toHaveBeenCalledTimes(0);

        component.ngOnInit();

        expect(component['set_file_name_control_']).toHaveBeenCalledTimes(1);
      });

      it('should call cancel() from ngOnInit()', () => {
        reset();

        component.dialog_data = MOCK_DIALOG_DATA_RULE_SET_UNDEFINED;
        component.ngOnInit();

        expect(component.cancel).toHaveBeenCalledTimes(1);
      });
    });

    describe('ngOnInit()', () => {
      it('should call get_file_name_place_holder()', () => {
        reset();

        component.get_file_name_place_holder();

        expect(component.get_file_name_place_holder).toHaveBeenCalled();
      });

      it('should call get_file_name_place_holder() and return `File Name`', () => {
        reset();

        const return_value: string = component.get_file_name_place_holder();

        expect(return_value).toEqual(component.no_selection_file_name_placeholder);
      });

      it('should call get_file_name_place_holder() and return `File Name`', () => {
        reset();

        component['set_rules_file_to_upload_'](file_list.item(0));
        const return_value: string = component.get_file_name_place_holder();

        expect(return_value).toEqual(component.selection_file_name_placeholder);
      });
    });

    describe('handle_file_input()', () => {
      it('should call handle_file_input()', () => {
        reset();

        component.handle_file_input(file_list);

        expect(component.handle_file_input).toHaveBeenCalled();
      });

      it('should call set_rules_file_to_upload_() from handle_file_input()', () => {
        reset();

        expect(component['set_rules_file_to_upload_']).toHaveBeenCalledTimes(0);

        component.handle_file_input(file_list);

        expect(component['set_rules_file_to_upload_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('upload()', () => {
      it('should call upload()', () => {
        reset();

        component['initialize_form_'](MockRuleSetClass);

        component.upload();

        expect(component.upload).toHaveBeenCalled();
      });
    });

    describe('cancel()', () => {
      it('should call cancel()', () => {
        reset();

        component.cancel();

        expect(component.cancel).toHaveBeenCalled();
      });
    });

    describe('private set_rules_file_to_upload_()', () => {
      it('should call set_rules_file_to_upload_()', () => {
        reset();

        component['set_rules_file_to_upload_'](file_list.item(0));

        expect(component['set_rules_file_to_upload_']).toHaveBeenCalled();
      });

      it('should call set_rules_file_to_upload_() and set rules_file_to_upload to passed file', () => {
        reset();

        expect(component.rules_file_to_upload).toBeNull();

        component['set_rules_file_to_upload_'](file_list.item(0));

        expect(component.rules_file_to_upload).toEqual(file_list.item(0));
      });

      it('should call set_file_name_control_() from set_rules_file_to_upload_()', () => {
        reset();

        expect(component['set_file_name_control_']).toHaveBeenCalledTimes(0);

        component['set_rules_file_to_upload_'](file_list.item(0));

        expect(component['set_file_name_control_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('private initialize_form_()', () => {
      it('should call initialize_form_()', () => {
        reset();

        component['initialize_form_'](MockRuleSetClass);

        expect(component['initialize_form_']).toHaveBeenCalled();
      });

      it('should call set_rule_set_form_group_() from initialize_form_()', () => {
        reset();

        expect(component['set_rule_set_form_group_']).toHaveBeenCalledTimes(0);

        component['initialize_form_'](MockRuleSetClass);

        expect(component['set_rule_set_form_group_']).toHaveBeenCalledTimes(1);
      });
    });

    describe('private set_rule_set_form_group_()', () => {
      it('should call set_rule_set_form_group_()', () => {
        reset();

        component['initialize_form_'](MockRuleSetClass);
        component['set_rule_set_form_group_'](component.rule_set_form_group);

        expect(component['set_rule_set_form_group_']).toHaveBeenCalled();
      });

      it('should call set_rule_set_form_group_() and set rule_set_form_group to passed group', () => {
        reset();

        expect(component.rules_file_to_upload).toBeNull();

        component['initialize_form_'](MockRuleSetClass);
        component['set_rule_set_form_group_'](component.rule_set_form_group);

        expect(component.rules_file_to_upload).toBeDefined();
        expect(component.rule_set_form_group instanceof FormGroup).toBeTrue();
        expect(component.rule_set_form_group.valid).toBeTrue();
      });
    });

    describe('private set_file_name_control_()', () => {
      it('should call set_file_name_control_()', () => {
        reset();

        component['set_file_name_control_'](null);

        expect(component['set_file_name_control_']).toHaveBeenCalled();
      });

      it('should call set_file_name_control_() and set file_name_form_control', () => {
        reset();

        expect(component.file_name_form_control.value).toEqual('');

        component['set_file_name_control_'](file_list.item(0));

        expect(component.file_name_form_control.value).toEqual(file_list.item(0).name);
        expect(component.file_name_form_control instanceof FormControl).toBeTrue();
      });
    });
  });
});

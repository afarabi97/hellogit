import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { of } from 'rxjs';

import { TestingModule } from '../../../testing-modules/testing.module';
import { AgentBuilderChooserModule } from '../../agent-builder-chooser.module';
import { SMB_PORT, WINRM_PORT, WINRM_PORT_SSL } from '../../constants/agent-builder-chooser.constant';
import { AgentTargetDialogComponent } from './agent-target-dialog.component';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

class MatDialogRefMock {
  close() {
    return {
      afterClosed: () => of ()
    };
  }
}

describe('AgentTargetDialogComponent', () => {
  let component: AgentTargetDialogComponent;
  let fixture: ComponentFixture<AgentTargetDialogComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyProtocolChangeStep: jasmine.Spy<any>;
  let spyChangeNonDirtyPortValue: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyFormGroupsValid: jasmine.Spy<any>;
  let spyClose: jasmine.Spy<any>;
  let spySubmit: jasmine.Spy<any>;
  let spyInitializeIPTargetListFormGroup: jasmine.Spy<any>;
  let spyInitializeNTLMFormGroup: jasmine.Spy<any>;
  let spyInitializeSMBFormGroup: jasmine.Spy<any>;
  let spySetIPTargetListFormGroup: jasmine.Spy<any>;
  let spySetNTLMFormGroup: jasmine.Spy<any>;
  let spySetSMBFormGroup: jasmine.Spy<any>;

  // Test Data
  const mat_radio_change_ntlm: MatRadioChange = {
    source: {} as any,
    value: 'ntlm'
  };
  const mat_radio_change_smb: MatRadioChange = {
    source: {} as any,
    value: 'smb'
  };
  const mat_checkbox_change_true: MatCheckboxChange = {
    source: {} as any,
    checked: true
  };
  const mat_checkbox_change_false: MatCheckboxChange = {
    source: {} as any,
    checked: false
  };
  const mock_ip_target_list_form_group: FormGroup = new FormGroup({
    config_name: new FormControl(''),
    protocol: new FormControl(null)
  });
  const mock_ntlm_form_group: FormGroup = new FormGroup({
    port: new FormControl(''),
    domain_name: new FormControl(''),
    is_ssl: new FormControl(false)
  });
  const mock_smb_form_group: FormGroup = new FormGroup({
    port: new FormControl(''),
    domain_name: new FormControl('')
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AgentBuilderChooserModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentTargetDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyProtocolChangeStep = spyOn(component, 'protocol_change_step').and.callThrough();
    spyChangeNonDirtyPortValue = spyOn(component, 'change_non_dirty_port_value').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyFormGroupsValid = spyOn(component, 'form_groups_valid').and.callThrough();
    spyClose = spyOn(component, 'close').and.callThrough();
    spySubmit = spyOn(component, 'submit').and.callThrough();
    spyInitializeIPTargetListFormGroup = spyOn<any>(component, 'initialize_ip_target_list_form_group_').and.callThrough();
    spyInitializeNTLMFormGroup = spyOn<any>(component, 'initialize_ntlm_form_group_').and.callThrough();
    spyInitializeSMBFormGroup = spyOn<any>(component, 'initialize_smb_form_group_').and.callThrough();
    spySetIPTargetListFormGroup = spyOn<any>(component, 'set_ip_target_list_form_group_').and.callThrough();
    spySetNTLMFormGroup = spyOn<any>(component, 'set_ntlm_form_group_').and.callThrough();
    spySetSMBFormGroup = spyOn<any>(component, 'set_smb_form_group_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyProtocolChangeStep.calls.reset();
    spyChangeNonDirtyPortValue.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyFormGroupsValid.calls.reset();
    spyClose.calls.reset();
    spySubmit.calls.reset();
    spyInitializeIPTargetListFormGroup.calls.reset();
    spyInitializeNTLMFormGroup.calls.reset();
    spyInitializeSMBFormGroup.calls.reset();
    spySetIPTargetListFormGroup.calls.reset();
    spySetNTLMFormGroup.calls.reset();
    spySetSMBFormGroup.calls.reset();
  };

  afterAll(() => {
    cleanStylesFromDOM();
  });

  it('should create AgentTargetDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('AgentTargetDialogComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_ip_target_list_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_ip_target_list_form_group_']).toHaveBeenCalled();
      });

      it('should call initialize_ntlm_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_ntlm_form_group_']).toHaveBeenCalled();
      });

      it('should call initialize_smb_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_smb_form_group_']).toHaveBeenCalled();
      });
    });

    describe('protocol_change_step()', () => {
      it('should call protocol_change_step()', () => {
        reset();

        component.protocol_change_step(mat_radio_change_ntlm);

        expect(component.protocol_change_step).toHaveBeenCalled();
      });

      it('should call protocol_change_step() and set is_ntlm = true', () => {
        reset();

        component.protocol_change_step(mat_radio_change_ntlm);

        expect(component.is_ntlm).toBeTrue();
      });

      it('should call protocol_change_step() and set is_smb = false', () => {
        reset();

        component.protocol_change_step(mat_radio_change_ntlm);

        expect(component.is_smb).toBeFalse();
      });

      it('should call protocol_change_step() and set ntlm_form_group.port = WINRM_PORT', () => {
        reset();

        component.protocol_change_step(mat_radio_change_ntlm);

        expect(component.ntlm_form_group.get('port').value).toEqual(WINRM_PORT);
      });

      it('should call protocol_change_step() and set is_smb = true', () => {
        reset();

        component.protocol_change_step(mat_radio_change_smb);

        expect(component.is_smb).toBeTrue();
      });

      it('should call protocol_change_step() and set is_ntlm = false', () => {
        reset();

        component.protocol_change_step(mat_radio_change_smb);

        expect(component.is_ntlm).toBeFalse();
      });

      it('should call protocol_change_step() and set smb_form_group.port = SMB_PORT', () => {
        reset();

        component.protocol_change_step(mat_radio_change_smb);

        expect(component.smb_form_group.get('port').value).toEqual(SMB_PORT);
      });
    });

    describe('change_non_dirty_port_value()', () => {
      it('should call change_non_dirty_port_value()', () => {
        reset();

        component.change_non_dirty_port_value(mat_checkbox_change_true);

        expect(component.change_non_dirty_port_value).toHaveBeenCalled();
      });

      it('should call change_non_dirty_port_value() and set ntlm_form_group.port = WINRM_PORT_SSL', () => {
        reset();

        component.change_non_dirty_port_value(mat_checkbox_change_true);

        expect(component.ntlm_form_group.get('port').value).toEqual(WINRM_PORT_SSL);
      });

      it('should call protocol_change_step() and set ntlm_form_group.port = WINRM_PORT', () => {
        reset();

        component.change_non_dirty_port_value(mat_checkbox_change_false);

        expect(component.ntlm_form_group.get('port').value).toEqual(WINRM_PORT);
      });
    });

    describe('get_error_message()', () => {
      it('should call get_error_message()', () => {
        reset();

        component.get_error_message(component.ntlm_form_group, 'port');

        expect(component.get_error_message).toHaveBeenCalled();
      });

      it('should call get_error_message() and return empty string', () => {
        reset();

        component.ntlm_form_group.get('port').setValue(WINRM_PORT);
        const return_value: string = component.get_error_message(component.ntlm_form_group, 'port');

        expect(return_value).toEqual('');
      });

      it('should call get_error_message() and return error_message', () => {
        reset();

        component.ntlm_form_group.get('port').setValue(null);
        const return_value: string = component.get_error_message(component.ntlm_form_group, 'port');

        expect(return_value).toEqual(component.ntlm_form_group.get('port').errors.error_message);
      });
    });

    describe('form_groups_valid()', () => {
      it('should call form_groups_valid()', () => {
        reset();

        component.form_groups_valid();

        expect(component.form_groups_valid).toHaveBeenCalled();
      });

      it('should call form_groups_valid() and return true when ntlm_form_group.valid && ip_target_list_form_group.valid', () => {
        reset();

        component.is_ntlm = true;
        component.is_smb = false;
        component['initialize_ip_target_list_form_group_']();
        component['initialize_ntlm_form_group_']();
        component.ip_target_list_form_group.get('config_name').setValue('fake config');
        component.ip_target_list_form_group.get('protocol').setValue('ntlm');
        component.ntlm_form_group.get('port').setValue(WINRM_PORT);
        const return_value: boolean = component.form_groups_valid();

        expect(return_value).toBeTrue();
      });

      it('should call form_groups_valid() and return false when !ntlm_form_group.valid && ip_target_list_form_group.valid', () => {
        reset();

        component.is_ntlm = true;
        component.is_smb = false;
        component['initialize_ip_target_list_form_group_']();
        component['initialize_ntlm_form_group_']();
        const return_value: boolean = component.form_groups_valid();

        expect(return_value).toBeFalse();
      });

      it('should call form_groups_valid() and return false when ntlm_form_group.valid && !ip_target_list_form_group.valid', () => {
        reset();

        component.is_ntlm = true;
        component.is_smb = false;
        component['initialize_ip_target_list_form_group_']();
        component['initialize_ntlm_form_group_']();
        const return_value: boolean = component.form_groups_valid();

        expect(return_value).toBeFalse();
      });

      it('should call form_groups_valid() and return true when smb_form_group.valid && ip_target_list_form_group.valid', () => {
        reset();

        component.is_ntlm = false;
        component.is_smb = true;
        component['initialize_ip_target_list_form_group_']();
        component['initialize_smb_form_group_']();
        component.ip_target_list_form_group.get('config_name').setValue('fake config');
        component.ip_target_list_form_group.get('protocol').setValue('ntlm');
        component.smb_form_group.get('port').setValue(SMB_PORT);
        const return_value: boolean = component.form_groups_valid();

        expect(return_value).toBeTrue();
      });

      it('should call form_groups_valid() and return false when !smb_form_group.valid && ip_target_list_form_group.valid', () => {
        reset();

        component.is_ntlm = false;
        component.is_smb = true;
        component['initialize_ip_target_list_form_group_']();
        component['initialize_smb_form_group_']();
        const return_value: boolean = component.form_groups_valid();

        expect(return_value).toBeFalse();
      });

      it('should call form_groups_valid() and return false when smb_form_group.valid && !ip_target_list_form_group.valid', () => {
        reset();

        component.is_ntlm = false;
        component.is_smb = true;
        component['initialize_ip_target_list_form_group_']();
        component['initialize_smb_form_group_']();
        const return_value: boolean = component.form_groups_valid();

        expect(return_value).toBeFalse();
      });

      it('should call form_groups_valid() and return false', () => {
        reset();

        component.is_ntlm = false;
        component.is_smb = false;
        const return_value: boolean = component.form_groups_valid();

        expect(return_value).toBeFalse();
      });
    });

    describe('close()', () => {
      it('should call close()', () => {
        reset();

        component.close();

        expect(component.close).toHaveBeenCalled();
      });
    });

    describe('submit()', () => {
      it('should call submit()', () => {
        reset();

        component.submit();

        expect(component.submit).toHaveBeenCalled();
      });
    });

    describe('private initialize_ip_target_list_form_group_()', () => {
      it('should call initialize_ip_target_list_form_group_()', () => {
        reset();

        component['initialize_ip_target_list_form_group_']();

        expect(component['initialize_ip_target_list_form_group_']).toHaveBeenCalled();
      });

      it('should call set_ip_target_list_form_group_() from initialize_ip_target_list_form_group_()', () => {
        reset();

        component['initialize_ip_target_list_form_group_']();

        expect(component['set_ip_target_list_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_ntlm_form_group_()', () => {
      it('should call initialize_ntlm_form_group_()', () => {
        reset();

        component['initialize_ntlm_form_group_']();

        expect(component['initialize_ntlm_form_group_']).toHaveBeenCalled();
      });

      it('should call set_ntlm_form_group_() from initialize_ntlm_form_group_()', () => {
        reset();

        component['initialize_ntlm_form_group_']();

        expect(component['set_ntlm_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_smb_form_group_()', () => {
      it('should call initialize_smb_form_group_()', () => {
        reset();

        component['initialize_smb_form_group_']();

        expect(component['initialize_smb_form_group_']).toHaveBeenCalled();
      });

      it('should call set_smb_form_group_() from initialize_smb_form_group_()', () => {
        reset();

        component['initialize_smb_form_group_']();

        expect(component['set_smb_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private set_ip_target_list_form_group_()', () => {
      it('should call set_ip_target_list_form_group_()', () => {
        reset();

        component['set_ip_target_list_form_group_'](mock_ip_target_list_form_group);

        expect(component['set_ip_target_list_form_group_']).toHaveBeenCalled();
      });

      it('should call set_ip_target_list_form_group_() and set ip_target_list_form_group', () => {
        reset();

        component.ip_target_list_form_group = undefined;

        expect(component.ip_target_list_form_group).not.toBeDefined();

        component['set_ip_target_list_form_group_'](mock_ip_target_list_form_group);

        expect(component.ip_target_list_form_group).toBeDefined();
      });
    });

    describe('private set_ntlm_form_group_()', () => {
      it('should call set_ntlm_form_group_()', () => {
        reset();

        component['set_ntlm_form_group_'](mock_ntlm_form_group);

        expect(component['set_ntlm_form_group_']).toHaveBeenCalled();
      });

      it('should call set_ntlm_form_group_() and set ntlm_form_group', () => {
        reset();

        component.ntlm_form_group = undefined;

        expect(component.ntlm_form_group).not.toBeDefined();

        component['set_ntlm_form_group_'](mock_ntlm_form_group);

        expect(component.ntlm_form_group).toBeDefined();
      });
    });

    describe('private set_smb_form_group_()', () => {
      it('should call set_smb_form_group_()', () => {
        reset();

        component['set_smb_form_group_'](mock_smb_form_group);

        expect(component['set_smb_form_group_']).toHaveBeenCalled();
      });

      it('should call set_smb_form_group_() and set smb_form_group', () => {
        reset();

        component.smb_form_group = undefined;

        expect(component.smb_form_group).not.toBeDefined();

        component['set_smb_form_group_'](mock_smb_form_group);

        expect(component.smb_form_group).toBeDefined();
      });
    });
  });
});

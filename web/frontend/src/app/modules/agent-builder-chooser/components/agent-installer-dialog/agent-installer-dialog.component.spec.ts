import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { of, throwError } from 'rxjs';

import {
  MockAppConfigClass1,
  MockAppConfigClass2,
  MockAppConfigClassesArray,
  MockEndgameSensorProfileClasses
} from '../../../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../../../static-data/functions/clean-dom.function';
import {
  MockElementSpecInterface1,
  MockElementSpecInterface2,
  MockElementSpecInterface3,
  MockElementSpecInterface4,
  MockErrorMessageInterface
} from '../../../../../../static-data/interface-objects';
import { ErrorMessageClass } from '../../../../classes';
import { MatOptionInterface } from '../../../../interfaces';
import { TestingModule } from '../../../testing-modules/testing.module';
import { AgentBuilderChooserModule } from '../../agent-builder-chooser.module';
import { AppConfigClass, EndgameSensorProfileClass } from '../../classes';
import { AgentInstallerDialogDataInterface, AppNameAppConfigPairInterface, EndgameLoginInterface } from '../../interfaces';
import { AgentInstallerDialogComponent } from './agent-installer-dialog.component';

class MatDialogRefMock {
  close() {
    return {
      afterClosed: () => of ()
    };
  }
}

describe('AgentInstallerDialogComponent', () => {
  let component: AgentInstallerDialogComponent;
  let fixture: ComponentFixture<AgentInstallerDialogComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyToggleEndgameValidators: jasmine.Spy<any>;
  let spyInstallEndgame: jasmine.Spy<any>;
  let spyConnectEndgame: jasmine.Spy<any>;
  let spyGetErrorMessage: jasmine.Spy<any>;
  let spyAppConfigChange: jasmine.Spy<any>;
  let spyClose: jasmine.Spy<any>;
  let spySubmit: jasmine.Spy<any>;
  let spyInitializeAgentInstallerConfigurationFormGroup: jasmine.Spy<any>;
  let spyInitializeCustomPackagesFormGroup: jasmine.Spy<any>;
  let spyInitializeElementSpecFormGroup: jasmine.Spy<any>;
  let spySetAgentInstallerConfigurationFormGroup: jasmine.Spy<any>;
  let spySetCustomPackagesFormGroup: jasmine.Spy<any>;
  let spySetEndgameSensorProfiles: jasmine.Spy<any>;
  let spySetAppConfigFromOptions: jasmine.Spy<any>;
  let spyGetElementSpecFormControl: jasmine.Spy<any>;
  let spyCreateElementSpecTextinputFormControl: jasmine.Spy<any>;
  let spyCreateElementSpecCheckboxFormControl: jasmine.Spy<any>;
  let spyFormLevelValidations: jasmine.Spy<any>;
  let spyGetSensorProfileName: jasmine.Spy<any>;
  let spyApiEndgameSensorProfiles: jasmine.Spy<any>;

  let spyMatDialogRefClose: jasmine.Spy<any>;

  // Test Data
  const app_name_app_config_pair: AppNameAppConfigPairInterface = new Object() as AppNameAppConfigPairInterface;
  MockAppConfigClassesArray.forEach((ac: AppConfigClass) => app_name_app_config_pair[ac.name] = ac);
  const MOCK_DIALOG_DATA__AGENT_INSTALLER_DIALOG_DATA: AgentInstallerDialogDataInterface = {
    app_configs: MockAppConfigClassesArray,
    app_names: MockAppConfigClassesArray.map((ac: AppConfigClass) => ac.name),
    app_name_app_config_pair: app_name_app_config_pair
  };
  const mat_checkbox_change_true: MatCheckboxChange = {
    source: {} as any,
    checked: true
  };
  const mat_checkbox_change_false: MatCheckboxChange = {
    source: {} as any,
    checked: false
  };
  const mat_stepper: MatStepper = new Object({
    next(): void {}
  }) as MatStepper;
  const endgame_sensor_profile_options: MatOptionInterface[] = MockEndgameSensorProfileClasses.map((sp: EndgameSensorProfileClass) => {
    const mat_option: MatOptionInterface = {
      name: sp.name,
      value: sp.id
    };

    return mat_option;
  });
  const endgame_login: EndgameLoginInterface = {
    endgame_server_ip: '192.168.0.1',
    endgame_port: '443',
    endgame_user_name: 'admin',
    endgame_password: 'password'
  };
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });
  const validator_has_required = (abstract_control: AbstractControl) => {
    if (abstract_control.validator) {
      const validator: ValidationErrors = abstract_control.validator({} as AbstractControl);
      if (validator && validator.error_message) {
        return true;
      }
    }
    return false;
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AgentBuilderChooserModule,
        TestingModule
      ],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: MOCK_DIALOG_DATA__AGENT_INSTALLER_DIALOG_DATA }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentInstallerDialogComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyToggleEndgameValidators = spyOn(component, 'toggle_endgame_validators').and.callThrough();
    spyInstallEndgame = spyOn(component, 'install_endgame').and.callThrough();
    spyConnectEndgame = spyOn(component, 'connect_endgame').and.callThrough();
    spyGetErrorMessage = spyOn(component, 'get_error_message').and.callThrough();
    spyAppConfigChange = spyOn(component, 'app_config_change').and.callThrough();
    spyClose = spyOn(component, 'close').and.callThrough();
    spySubmit = spyOn(component, 'submit').and.callThrough();
    spyInitializeAgentInstallerConfigurationFormGroup = spyOn<any>(component, 'initialize_agent_installer_configuration_form_group_').and.callThrough();
    spyInitializeCustomPackagesFormGroup = spyOn<any>(component, 'initialize_custom_packages_form_group_').and.callThrough();
    spyInitializeElementSpecFormGroup = spyOn<any>(component, 'initialize_element_spec_form_group_').and.callThrough();
    spySetAgentInstallerConfigurationFormGroup = spyOn<any>(component, 'set_agent_installer_configuration_form_group_').and.callThrough();
    spySetCustomPackagesFormGroup = spyOn<any>(component, 'set_custom_packages_form_group_').and.callThrough();
    spySetEndgameSensorProfiles = spyOn<any>(component, 'set_endgame_sensor_profiles_').and.callThrough();
    spySetAppConfigFromOptions = spyOn<any>(component, 'set_app_configs_from_options_').and.callThrough();
    spyGetElementSpecFormControl = spyOn<any>(component, 'get_element_spec_form_control_').and.callThrough();
    spyCreateElementSpecTextinputFormControl = spyOn<any>(component, 'create_element_spec_textinput_form_control_').and.callThrough();
    spyCreateElementSpecCheckboxFormControl = spyOn<any>(component, 'create_element_spec_checkbox_form_control_').and.callThrough();
    spyFormLevelValidations = spyOn<any>(component, 'form_level_validations_').and.callThrough();
    spyGetSensorProfileName = spyOn<any>(component, 'get_sensor_profile_name_').and.callThrough();
    spyApiEndgameSensorProfiles = spyOn<any>(component, 'api_endgame_sensor_profiles_').and.callThrough();

    // spyOn mat_dialog_ref
    spyMatDialogRefClose = spyOn<any>(component['mat_dialog_ref_'], 'close').and.callThrough();
    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyToggleEndgameValidators.calls.reset();
    spyInstallEndgame.calls.reset();
    spyConnectEndgame.calls.reset();
    spyGetErrorMessage.calls.reset();
    spyAppConfigChange.calls.reset();
    spyClose.calls.reset();
    spySubmit.calls.reset();
    spyInitializeAgentInstallerConfigurationFormGroup.calls.reset();
    spyInitializeCustomPackagesFormGroup.calls.reset();
    spyInitializeElementSpecFormGroup.calls.reset();
    spySetAgentInstallerConfigurationFormGroup.calls.reset();
    spySetCustomPackagesFormGroup.calls.reset();
    spySetEndgameSensorProfiles.calls.reset();
    spySetAppConfigFromOptions.calls.reset();
    spyGetElementSpecFormControl.calls.reset();
    spyCreateElementSpecTextinputFormControl.calls.reset();
    spyCreateElementSpecCheckboxFormControl.calls.reset();
    spyFormLevelValidations.calls.reset();
    spyGetSensorProfileName.calls.reset();
    spyApiEndgameSensorProfiles.calls.reset();

    spyMatDialogRefClose.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create AgentInstallerDialogComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('AgentInstallerDialogComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call initialize_agent_installer_configuration_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_agent_installer_configuration_form_group_']).toHaveBeenCalled();
      });

      it('should call initialize_custom_packages_form_group_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['initialize_custom_packages_form_group_']).toHaveBeenCalled();
      });
    });

    describe('toggle_endgame_validators()', () => {
      it('should call toggle_endgame_validators()', () => {
        reset();

        component.toggle_endgame_validators(mat_checkbox_change_true);

        expect(component.toggle_endgame_validators).toHaveBeenCalled();
      });

      it('should call toggle_endgame_validators() and handle event.checked = true passed value', () => {
        reset();

        component.toggle_endgame_validators(mat_checkbox_change_true);

        expect(validator_has_required(component.agent_installer_configuration_form_group.get('endgame_sensor_id'))).toBeTrue();
      });

      it('should call toggle_endgame_validators() and handle event.checked = true passed value', () => {
        reset();

        component.toggle_endgame_validators(mat_checkbox_change_false);

        expect(validator_has_required(component.agent_installer_configuration_form_group.get('endgame_sensor_id'))).toBeFalse();
      });
    });

    describe('install_endgame()', () => {
      it('should call install_endgame()', () => {
        reset();

        component.install_endgame();

        expect(component.install_endgame).toHaveBeenCalled();
      });

      it('should call install_endgame() and return false', () => {
        reset();

        const return_value: boolean = component.install_endgame();

        expect(return_value).toBeFalse();
      });

      it('should call install_endgame() and return true', () => {
        reset();

        component.agent_installer_configuration_form_group.get('install_endgame').setValue(true);
        const return_value: boolean = component.install_endgame();

        expect(return_value).toBeTrue();
      });
    });

    describe('connect_endgame()', () => {
      it('should call connect_endgame()', () => {
        reset();

        component.connect_endgame(mat_stepper);

        expect(component.connect_endgame).toHaveBeenCalled();
      });

      it('should call api_endgame_sensor_profiles_() from connect_endgame()', () => {
        reset();

        component.agent_installer_configuration_form_group.get('endgame_options.endgame_server_ip').setValue('192.168.0.1');
        component.agent_installer_configuration_form_group.get('endgame_options.endgame_port').setValue('443');
        component.agent_installer_configuration_form_group.get('endgame_options.endgame_user_name').setValue('admin');
        component.agent_installer_configuration_form_group.get('endgame_options.endgame_password').setValue('password');
        component.connect_endgame(mat_stepper);

        expect(component['api_endgame_sensor_profiles_']).toHaveBeenCalled();
      });
    });

    describe('get_error_message()', () => {
      it('should call get_error_message()', () => {
        reset();

        component.get_error_message(component.agent_installer_configuration_form_group.get('config_name'));

        expect(component.get_error_message).toHaveBeenCalled();
      });

      it('should call get_error_message() and return error_message', () => {
        reset();

        const return_value: string = component.get_error_message(component.agent_installer_configuration_form_group.get('config_name'));

        expect(return_value).toEqual(component.agent_installer_configuration_form_group.get('config_name').errors.error_message);
      });

      it('should call get_error_message() and return empty string', () => {
        reset();

        component.agent_installer_configuration_form_group.get('config_name').setValue('fake name');
        const return_value: string = component.get_error_message(component.agent_installer_configuration_form_group.get('config_name'));

        expect(return_value).toEqual('');
      });
    });

    describe('app_config_change()', () => {
      it('should call app_config_change()', () => {
        reset();

        component.app_config_change(mat_checkbox_change_true, MockAppConfigClass1);

        expect(component.app_config_change).toHaveBeenCalled();
      });

      it('should call app_config_change() and set options_form_group', () => {
        reset();

        component.options_form_group = undefined;

        expect(component.options_form_group).not.toBeDefined();

        component.app_config_change(mat_checkbox_change_true, MockAppConfigClass1);

        expect(component.options_form_group).toBeDefined();
      });

      it('should call app_config_change() and set options_form_group within customPackages inside agent_installer_configuration_form_group', () => {
        reset();

        component.options_form_group = undefined;
        component.agent_installer_configuration_form_group.removeControl('customPackages');
        component.app_config_change(mat_checkbox_change_true, MockAppConfigClass1);

        expect(component.agent_installer_configuration_form_group.get('customPackages')).toBeDefined();
      });

      it('should call app_config_change() and add element spec tied to config name within the options_form_group', () => {
        reset();

        component.options_form_group = new FormGroup({});
        component.agent_installer_configuration_form_group.removeControl('customPackages');
        component.app_config_change(mat_checkbox_change_true, MockAppConfigClass1);

        expect(component.options_form_group.get(MockAppConfigClass1.name)).toBeDefined();
      });

      it('should call app_config_change() and remove control from options_form_group', () => {
        reset();

        const element_spec_form_group: FormGroup = component['initialize_element_spec_form_group_'](MockAppConfigClass1);
        component.options_form_group = new FormGroup({[MockAppConfigClass1.name]: element_spec_form_group});
        component.options_form_group.addControl('fake name', element_spec_form_group);
        component.agent_installer_configuration_form_group.removeControl('customPackages');
        component.app_config_change(mat_checkbox_change_false, MockAppConfigClass1);

        expect(component.options_form_group.get(MockAppConfigClass1.name)).toBeDefined();
      });

      it('should call app_config_change() and set options_form_group = null', () => {
        reset();

        const element_spec_form_group: FormGroup = component['initialize_element_spec_form_group_'](MockAppConfigClass1);
        component.options_form_group = new FormGroup({[MockAppConfigClass1.name]: element_spec_form_group});
        component.agent_installer_configuration_form_group.removeControl('customPackages');
        component.app_config_change(mat_checkbox_change_false, MockAppConfigClass1);

        expect(component.options_form_group).toBeNull();
      });

      it('should call app_config_change() and remove form control agent_installer_configuration_form_group.customPackages', () => {
        reset();

        const element_spec_form_group: FormGroup = component['initialize_element_spec_form_group_'](MockAppConfigClass1);
        component.options_form_group = new FormGroup({[MockAppConfigClass1.name]: element_spec_form_group});
        component.agent_installer_configuration_form_group.removeControl('customPackages');
        component.app_config_change(mat_checkbox_change_false, MockAppConfigClass1);

        expect(component.agent_installer_configuration_form_group.get('customPackages')).toBeNull();
      });

      it('should call set_app_configs_from_options_() from app_config_change()', () => {
        reset();

        component.app_config_change(mat_checkbox_change_false, MockAppConfigClass1);

        expect(component['set_app_configs_from_options_']).toHaveBeenCalled();
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

      it('should call get_sensor_profile_name_() from submit()', () => {
        reset();

        component.submit();

        expect(component['get_sensor_profile_name_']).toHaveBeenCalled();
      });

      it('should call submit() and set agent_installer_configuration_form_group.endgame_sensor_name = get_sensor_profile_name_() return value', () => {
        reset();

        const return_value: string = component['get_sensor_profile_name_']();

        component.submit();

        expect(component.agent_installer_configuration_form_group.get('endgame_sensor_name').value).toEqual(return_value);
      });

      it('should call mat_dialog_ref_.close() from submit()', () => {
        reset();

        component.submit();

        expect(component['mat_dialog_ref_'].close).toHaveBeenCalled();
      });
    });

    describe('private initialize_agent_installer_configuration_form_group_()', () => {
      it('should call initialize_agent_installer_configuration_form_group_()', () => {
        reset();

        component['initialize_agent_installer_configuration_form_group_']();

        expect(component['initialize_agent_installer_configuration_form_group_']).toHaveBeenCalled();
      });

      it('should call set_agent_installer_configuration_form_group_() from initialize_agent_installer_configuration_form_group_()', () => {
        reset();

        component['initialize_agent_installer_configuration_form_group_']();

        expect(component['set_agent_installer_configuration_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_custom_packages_form_group_()', () => {
      it('should call initialize_custom_packages_form_group_()', () => {
        reset();

        component['initialize_custom_packages_form_group_'](MOCK_DIALOG_DATA__AGENT_INSTALLER_DIALOG_DATA.app_names);

        expect(component['initialize_custom_packages_form_group_']).toHaveBeenCalled();
      });

      it('should call set_custom_packages_form_group_() from initialize_custom_packages_form_group_()', () => {
        reset();

        component['initialize_custom_packages_form_group_'](MOCK_DIALOG_DATA__AGENT_INSTALLER_DIALOG_DATA.app_names);

        expect(component['set_custom_packages_form_group_']).toHaveBeenCalled();
      });
    });

    describe('private initialize_element_spec_form_group_()', () => {
      it('should call initialize_element_spec_form_group_()', () => {
        reset();

        component['initialize_element_spec_form_group_'](MockAppConfigClass1);

        expect(component['initialize_element_spec_form_group_']).toHaveBeenCalled();
      });

      it('should call initialize_element_spec_form_group_() and return element_spec_form_group', () => {
        reset();

        const return_value: FormGroup = component['initialize_element_spec_form_group_'](MockAppConfigClass2);

        expect(return_value).toBeDefined();
      });
    });

    describe('private set_agent_installer_configuration_form_group_()', () => {
      it('should call set_agent_installer_configuration_form_group_()', () => {
        reset();

        component['initialize_agent_installer_configuration_form_group_']();

        const clone_agent_installer_configuration_form_group = {
          ...component.agent_installer_configuration_form_group
        } as FormGroup;
        component['set_agent_installer_configuration_form_group_'](clone_agent_installer_configuration_form_group);

        expect(component['set_agent_installer_configuration_form_group_']).toHaveBeenCalled();
      });

      it('should call set_agent_installer_configuration_form_group_() and set agent_installer_configuration_form_group', () => {
        reset();

        component['initialize_agent_installer_configuration_form_group_']();

        const clone_agent_installer_configuration_form_group = {
          ...component.agent_installer_configuration_form_group
        } as FormGroup;
        component.agent_installer_configuration_form_group = undefined;

        expect(component.agent_installer_configuration_form_group).toBeUndefined();

        component['set_agent_installer_configuration_form_group_'](clone_agent_installer_configuration_form_group);

        expect(component.agent_installer_configuration_form_group).toBeDefined();
      });
    });

    describe('private set_custom_packages_form_group_()', () => {
      it('should call set_custom_packages_form_group_()', () => {
        reset();

        component['initialize_custom_packages_form_group_'](MOCK_DIALOG_DATA__AGENT_INSTALLER_DIALOG_DATA.app_names);

        const clone_custom_packages_form_group = {
          ...component.custom_packages_form_group
        } as FormGroup;
        component['set_custom_packages_form_group_'](clone_custom_packages_form_group);

        expect(component['set_custom_packages_form_group_']).toHaveBeenCalled();
      });

      it('should call set_custom_packages_form_group_() and set custom_packages_form_group', () => {
        reset();

        component['initialize_custom_packages_form_group_'](MOCK_DIALOG_DATA__AGENT_INSTALLER_DIALOG_DATA.app_names);

        const custom_packages_form_group = {
          ...component.custom_packages_form_group
        } as FormGroup;
        component.custom_packages_form_group = undefined;

        expect(component.custom_packages_form_group).toBeUndefined();

        component['set_custom_packages_form_group_'](custom_packages_form_group);

        expect(component.custom_packages_form_group).toBeDefined();
      });
    });

    describe('private set_endgame_sensor_profiles_()', () => {
      it('should call set_endgame_sensor_profiles_()', () => {
        reset();

        const clone_endgame_sensor_profile_options: MatOptionInterface[] = [];
        component['set_endgame_sensor_profiles_'](clone_endgame_sensor_profile_options);

        expect(component['set_endgame_sensor_profiles_']).toHaveBeenCalled();
      });

      it('should call set_endgame_sensor_profiles_() and set endgame_sensor_profile_options', () => {
        reset();

        const clone_endgame_sensor_profile_options: MatOptionInterface[] = [];
        component.endgame_sensor_profile_options = undefined;

        expect(component.endgame_sensor_profile_options).toBeUndefined();

        component['set_endgame_sensor_profiles_'](clone_endgame_sensor_profile_options);

        expect(component.endgame_sensor_profile_options).toBeDefined();
      });
    });

    describe('private set_app_configs_from_options_()', () => {
      it('should call set_app_configs_from_options_()', () => {
        reset();

        component['set_app_configs_from_options_'](MockAppConfigClassesArray);

        expect(component['set_app_configs_from_options_']).toHaveBeenCalled();
      });

      it('should call set_app_configs_from_options_() and set app_configs_from_options', () => {
        reset();

        component.app_configs_from_options = undefined;

        expect(component.app_configs_from_options).toBeUndefined();

        component['set_app_configs_from_options_'](MockAppConfigClassesArray);

        expect(component.app_configs_from_options).toBeDefined();
      });
    });

    describe('private get_element_spec_form_control_()', () => {
      it('should call get_element_spec_form_control_()', () => {
        reset();

        component['get_element_spec_form_control_'](MockElementSpecInterface3);

        expect(component['get_element_spec_form_control_']).toHaveBeenCalled();
      });

      it('should call create_element_spec_textinput_form_control_() and get_element_spec_form_control_()', () => {
        reset();

        component['get_element_spec_form_control_'](MockElementSpecInterface3);

        expect(component['create_element_spec_textinput_form_control_']).toHaveBeenCalled();
      });

      it('should call create_element_spec_textinput_form_control_() and get_element_spec_form_control_() and return form control', () => {
        reset();

        const return_value: FormControl = component['get_element_spec_form_control_'](MockElementSpecInterface3);

        expect(return_value).toBeDefined();
      });

      it('should call create_element_spec_checkbox_form_control_() and get_element_spec_form_control_()', () => {
        reset();

        component['get_element_spec_form_control_'](MockElementSpecInterface4);

        expect(component['create_element_spec_checkbox_form_control_']).toHaveBeenCalled();
      });

      it('should call create_element_spec_checkbox_form_control_() and get_element_spec_form_control_() and return form control', () => {
        reset();

        const return_value: FormControl = component['get_element_spec_form_control_'](MockElementSpecInterface4);

        expect(return_value).toBeDefined();
      });

      it('should call create_element_spec_checkbox_form_control_() and get_element_spec_form_control_() and return null', () => {
        reset();

        const return_value: FormControl = component['get_element_spec_form_control_'](MockElementSpecInterface2);

        expect(return_value).toBeNull();
      });
    });

    describe('private create_element_spec_textinput_form_control_()', () => {
      it('should call create_element_spec_textinput_form_control_()', () => {
        reset();

        component['create_element_spec_textinput_form_control_'](MockElementSpecInterface1);

        expect(component['create_element_spec_textinput_form_control_']).toHaveBeenCalled();
      });

      it('should call create_element_spec_textinput_form_control_() and return FormControl', () => {
        reset();

        const return_value: FormControl = component['create_element_spec_textinput_form_control_'](MockElementSpecInterface3);

        expect(return_value).toBeDefined();
      });
    });

    describe('private create_element_spec_checkbox_form_control_()', () => {
      it('should call create_element_spec_checkbox_form_control_()', () => {
        reset();

        component['create_element_spec_checkbox_form_control_'](MockElementSpecInterface1);

        expect(component['create_element_spec_checkbox_form_control_']).toHaveBeenCalled();
      });

      it('should call create_element_spec_checkbox_form_control_() and return FormControl', () => {
        reset();

        const return_value: FormControl = component['create_element_spec_checkbox_form_control_'](MockElementSpecInterface4);

        expect(return_value).toBeDefined();
      });
    });

    describe('private form_level_validations_()', () => {
      it('should call form_level_validations_()', () => {
        reset();

        component.agent_installer_configuration_form_group.get('install_endgame').setValue(true);
        component['form_level_validations_'](component.agent_installer_configuration_form_group);

        expect(component['form_level_validations_']).toHaveBeenCalled();
      });

      it('should call form_level_validations_() and return null', () => {
        reset();

        const element_spec_form_group: FormGroup = component['initialize_element_spec_form_group_'](MockAppConfigClass1);
        component.agent_installer_configuration_form_group.addControl('customPackages', new FormControl([MockAppConfigClass1.name], element_spec_form_group));
        const return_value: ValidationErrors = component['form_level_validations_'](component.agent_installer_configuration_form_group);

        expect(return_value).toBeNull();
      });

      it('should call form_level_validations_() and return error_message object', () => {
        reset();

        const return_value: ValidationErrors = component['form_level_validations_'](component.agent_installer_configuration_form_group);

        expect(return_value.error_message).toBeDefined();
      });
    });

    describe('private get_sensor_profile_name_()', () => {
      it('should call get_sensor_profile_name_()', () => {
        reset();

        component['get_sensor_profile_name_']();

        expect(component['get_sensor_profile_name_']).toHaveBeenCalled();
      });

      it('should call get_sensor_profile_name_() and return null', () => {
        reset();

        const return_value: string = component['get_sensor_profile_name_']();

        expect(return_value).toBeNull();
      });

      it('should call get_sensor_profile_name_() and return sensor profile name', () => {
        reset();

        component.endgame_sensor_profile_options = endgame_sensor_profile_options;
        component.agent_installer_configuration_form_group.get('endgame_sensor_id').setValue('1');
        const return_value: string = component['get_sensor_profile_name_']();

        expect(return_value).toBeDefined();
      });
    });

    describe('private api_endgame_sensor_profiles_()', () => {
      it('should call api_endgame_sensor_profiles_()', () => {
        reset();

        component['api_endgame_sensor_profiles_'](mat_stepper, endgame_login);

        expect(component['api_endgame_sensor_profiles_']).toHaveBeenCalled();
      });

      it('should call endgame_service_.endgame_sensor_profiles() from api_endgame_sensor_profiles_()', () => {
        reset();

        component['api_endgame_sensor_profiles_'](mat_stepper, endgame_login);

        expect(component['endgame_service_'].endgame_sensor_profiles).toHaveBeenCalled();
      });

      it('should call endgame_service_.endgame_sensor_profiles() and handle response and call set_endgame_sensor_profiles_()', () => {
        reset();

        component['api_endgame_sensor_profiles_'](mat_stepper, endgame_login);

        expect(component['set_endgame_sensor_profiles_']).toHaveBeenCalled();
      });

      it('should call endgame_service_.endgame_sensor_profiles() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        component['api_endgame_sensor_profiles_'](mat_stepper, endgame_login);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call endgame_service_.endgame_sensor_profiles() and handle error response instanceof ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['endgame_service_'], 'endgame_sensor_profiles').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_endgame_sensor_profiles_'](mat_stepper, endgame_login);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call endgame_service_.endgame_sensor_profiles() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['endgame_service_'], 'endgame_sensor_profiles').and.returnValue(throwError(mock_http_error_response));

        component['api_endgame_sensor_profiles_'](mat_stepper, endgame_login);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { MockConfigMapClassLocalProvisionerConfig, MockKubernetesConfigClass } from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import {
  MockConfigMapInterfaceLocalProvisionerConfig,
  MockKubernetesConfigInterface
} from '../../../../static-data/interface-objects';
import { ConfigMapClass } from '../../classes';
import { TestingModule } from '../testing-modules/testing.module';
import { InjectorModule } from '../utilily-modules/injector.module';
import { ConfigmapsComponent } from './config-map.component';
import { ConfigMapModule } from './config-map.module';

describe('ConfigmapsComponent', () => {
  let component: ConfigmapsComponent;
  let fixture: ComponentFixture<ConfigmapsComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyConfigMapDataKeys: jasmine.Spy<any>;
  let spyIsConfigMapDataDefined: jasmine.Spy<any>;
  let spyToggleTableRowExpansion: jasmine.Spy<any>;
  let spyIsConfigMapExpansionRowVisible: jasmine.Spy<any>;
  let spyEditConfigMapData: jasmine.Spy<any>;
  let spyViewConfigMapData: jasmine.Spy<any>;
  let spyCreateConfigMapData: jasmine.Spy<any>;
  let spyDeleteConfigMapData: jasmine.Spy<any>;
  let spyOpenTextEditor: jasmine.Spy<any>;
  let spyGetConfigMapIndex: jasmine.Spy<any>;
  let spyApiGetConfigMaps: jasmine.Spy<any>;
  let spyApiEditConfigMap: jasmine.Spy<any>;
  let spyApiGetAssociatedPods: jasmine.Spy<any>;

  // Test Error
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  // Test Data
  const config_map_data_form_group: FormGroup = new FormGroup({});
  config_map_data_form_group.addControl('name', new FormControl('fake.crt'));
  config_map_data_form_group.markAllAsTouched();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        InjectorModule,
        ConfigMapModule,
        TestingModule
      ],
      providers: [
        Title,
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigmapsComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyConfigMapDataKeys = spyOn(component, 'config_map_data_keys').and.callThrough();
    spyIsConfigMapDataDefined = spyOn(component, 'is_config_map_data_defined').and.callThrough();
    spyToggleTableRowExpansion = spyOn(component, 'toggle_table_row_expansion').and.callThrough();
    spyIsConfigMapExpansionRowVisible = spyOn(component, 'is_config_map_expansion_row_visible').and.callThrough();
    spyEditConfigMapData = spyOn(component, 'edit_config_map_data').and.callThrough();
    spyViewConfigMapData = spyOn(component, 'view_config_map_data').and.callThrough();
    spyCreateConfigMapData = spyOn(component, 'create_config_map_data').and.callThrough();
    spyDeleteConfigMapData = spyOn(component, 'delete_config_map_data').and.callThrough();
    spyOpenTextEditor = spyOn<any>(component, 'open_text_editor_').and.callThrough();
    spyGetConfigMapIndex = spyOn<any>(component, 'get_config_map_index_').and.callThrough();
    spyApiGetConfigMaps = spyOn<any>(component, 'api_get_config_maps_').and.callThrough();
    spyApiEditConfigMap = spyOn<any>(component, 'api_edit_config_map_').and.callThrough();
    spyApiGetAssociatedPods = spyOn<any>(component, 'api_get_associated_pods_').and.callThrough();

    // Add service spies
    spyOn<any>(component['confirm_action_popup_'], 'confirmAction').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyConfigMapDataKeys.calls.reset();
    spyIsConfigMapDataDefined.calls.reset();
    spyToggleTableRowExpansion.calls.reset();
    spyIsConfigMapExpansionRowVisible.calls.reset();
    spyEditConfigMapData.calls.reset();
    spyViewConfigMapData.calls.reset();
    spyCreateConfigMapData.calls.reset();
    spyDeleteConfigMapData.calls.reset();
    spyOpenTextEditor.calls.reset();
    spyGetConfigMapIndex.calls.reset();
    spyApiGetConfigMaps.calls.reset();
    spyApiEditConfigMap.calls.reset();
    spyApiGetAssociatedPods.calls.reset();

    const config_map_data_used: string[] = Object.keys(MockKubernetesConfigInterface.items[0].data);
    MockKubernetesConfigClass.items[0].data = {};
    config_map_data_used.forEach((k: string) => {
      MockKubernetesConfigClass.items[0].data[k] = MockKubernetesConfigInterface.items[0].data[k];
    });
    MockConfigMapClassLocalProvisionerConfig.data = MockConfigMapInterfaceLocalProvisionerConfig.data;
  };

  afterAll(() => remove_styles_from_dom());

  it('should create ConfigmapsComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ConfigmapsComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_get_config_maps_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_config_maps_']).toHaveBeenCalled();
      });
    });

    describe('config_map_data_keys()', () => {
      it('should call config_map_data_keys()', () => {
        reset();

        component.config_map_data_keys(MockConfigMapClassLocalProvisionerConfig.data);

        expect(component.config_map_data_keys).toHaveBeenCalled();
      });

      it('should call config_map_data_keys() and return Object.keys for ConfigMap data', () => {
        reset();

        const return_value: string[] = component.config_map_data_keys(MockConfigMapClassLocalProvisionerConfig.data);
        const keys: string[] = Object.keys(MockConfigMapClassLocalProvisionerConfig.data);

        expect(return_value.length).toEqual(keys.length);
        keys.forEach((k: string, i: number) => {
          expect(k).toEqual(return_value[i]);
        });
      });
    });

    describe('is_config_map_data_defined()', () => {
      it('should call is_config_map_data_defined()', () => {
        reset();

        component.is_config_map_data_defined(MockConfigMapClassLocalProvisionerConfig);

        expect(component.is_config_map_data_defined).toHaveBeenCalled();
      });

      it('should call is_config_map_data_defined() and return true', () => {
        reset();

        const return_value: boolean = component.is_config_map_data_defined(MockConfigMapClassLocalProvisionerConfig);

        expect(return_value).toBeTrue();
      });

      it('should call is_config_map_data_defined() and return false', () => {
        reset();

        const config_map_edit: ConfigMapClass = [MockConfigMapClassLocalProvisionerConfig].map((c: ConfigMapClass) => c)[0];
        config_map_edit.data = null;
        const return_value: boolean = component.is_config_map_data_defined(config_map_edit);

        expect(return_value).toBeFalse();
      });
    });

    describe('toggle_table_row_expansion()', () => {
      it('should call toggle_table_row_expansion()', () => {
        reset();

        component.config_maps = MockKubernetesConfigClass.items;
        component.config_map_visible = [ false, false ];
        component.toggle_table_row_expansion(component.config_maps[0]);

        expect(component.toggle_table_row_expansion).toHaveBeenCalled();
      });

      it('should call get_config_map_index_() from toggle_table_row_expansion()', () => {
        reset();

        component.config_maps = MockKubernetesConfigClass.items;
        component.config_map_visible = [ false, false ];
        component.toggle_table_row_expansion(component.config_maps[0]);

        expect(component['get_config_map_index_']).toHaveBeenCalled();
      });

      it('should call run_elasticsearch_scale_() and set config_map_visible = to not value at config map index', () => {
        reset();

        component.config_maps = MockKubernetesConfigClass.items;
        component.config_map_visible = [ false, false ];
        component.toggle_table_row_expansion(component.config_maps[0]);

        expect(component.config_map_visible[0]).toBeTrue();
      });
    });

    describe('is_config_map_expansion_row_visible()', () => {
      it('should call is_config_map_expansion_row_visible()', () => {
        reset();

        component.config_maps = MockKubernetesConfigClass.items;
        component.config_map_visible = [ false, false ];
        component.is_config_map_expansion_row_visible(component.config_maps[0]);

        expect(component.is_config_map_expansion_row_visible).toHaveBeenCalled();
      });

      it('should call get_config_map_index_() from is_config_map_expansion_row_visible()', () => {
        reset();

        component.config_maps = MockKubernetesConfigClass.items;
        component.config_map_visible = [ false, false ];
        component.is_config_map_expansion_row_visible(component.config_maps[0]);

        expect(component['get_config_map_index_']).toHaveBeenCalled();
      });

      it('should call is_config_map_expansion_row_visible() and return true', () => {
        reset();

        component.config_maps = MockKubernetesConfigClass.items;
        component.config_map_visible = [ true, false ];
        const return_value: boolean = component.is_config_map_expansion_row_visible(component.config_maps[0]);

        expect(return_value).toBeTrue();
      });

      it('should call is_config_map_expansion_row_visible() and return false', () => {
        reset();

        component.config_maps = MockKubernetesConfigClass.items;
        component.config_map_visible = [ false, false ];
        const return_value: boolean = component.is_config_map_expansion_row_visible(component.config_maps[0]);

        expect(return_value).toBeFalse();
      });
    });

    describe('edit_config_map_data()', () => {
      it('should call edit_config_map_data()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component.edit_config_map_data(config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component.edit_config_map_data).toHaveBeenCalled();
      });

      it('should call api_get_associated_pods_() from edit_config_map_data()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component.edit_config_map_data(config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component['api_get_associated_pods_']).toHaveBeenCalled();
      });
    });

    describe('view_config_map_data()', () => {
      it('should call view_config_map_data()', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.view_config_map_data(config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component.view_config_map_data).toHaveBeenCalled();
      });

      it('should call open_text_editor_() from view_config_map_data()', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.view_config_map_data(config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component['open_text_editor_']).toHaveBeenCalled();
      });
    });

    describe('create_config_map_data()', () => {
      it('should call create_config_map_data()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.create_config_map_data(MockKubernetesConfigClass.items[0]);

        expect(component.create_config_map_data).toHaveBeenCalled();
      });

      it('should call api_get_associated_pods_() when mat_dialog_ref closed', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(config_map_data_form_group) } as MatDialogRef<typeof component>);

        component.create_config_map_data(MockKubernetesConfigClass.items[0]);

        expect(component['api_get_associated_pods_']).toHaveBeenCalled();
      });
    });

    describe('delete_config_map_data()', () => {
      it('should call delete_config_map_data()', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.delete_config_map_data(config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component.delete_config_map_data).toHaveBeenCalled();
      });

      it('should call api_get_associated_pods_() when mat_dialog_ref closed', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        // Add spy to trigger action function
        spyOn(component['confirm_action_popup_']['dialog'], 'open').and.returnValue({ afterClosed: () => of(component['api_get_associated_pods_'](undefined, config_map_data_keys[0], MockKubernetesConfigClass.items[0])) } as MatDialogRef<typeof component>);

        component.delete_config_map_data(config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component['api_get_associated_pods_']).toHaveBeenCalled();
      });
    });

    describe('private open_text_editor_()', () => {
      it('should call open_text_editor_()', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['open_text_editor_'](config_map_data_keys[0], MockKubernetesConfigClass.items[0], 'Fake Message', []);

        expect(component['open_text_editor_']).toHaveBeenCalled();
      });

      it('should call open_text_editor_() and used for code coverage ternary operator language yml', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['open_text_editor_']('test_file.yml', MockKubernetesConfigClass.items[0], 'Fake Message');

        expect(component['open_text_editor_']).toHaveBeenCalled();
      });

      it('should call open_text_editor_() and used for code coverage ternary operator language yaml', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['open_text_editor_']('test_file.yaml', MockKubernetesConfigClass.items[0], 'Fake Message');

        expect(component['open_text_editor_']).toHaveBeenCalled();
      });

      it('should call open_text_editor_() and used for code coverage ternary operator language other', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['open_text_editor_'](config_map_data_keys[0], MockKubernetesConfigClass.items[0], 'Fake Message');

        expect(component['open_text_editor_']).toHaveBeenCalled();
      });

      it('should call open_text_editor_() and used for setting a title based on component.controller_maintainer = true', () => {
        reset();

        component.controller_maintainer = true;

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['open_text_editor_'](config_map_data_keys[0], MockKubernetesConfigClass.items[0], 'Fake Message');

        expect(component.controller_maintainer).toBeTrue();
      });

      it('should call open_text_editor_() and used for setting a title based on component.controller_maintainer = false', () => {
        reset();

        component.controller_maintainer = false;

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['open_text_editor_'](config_map_data_keys[0], MockKubernetesConfigClass.items[0], 'Fake Message');

        expect(component.controller_maintainer).toBeFalse();
      });

      it('should call open_text_editor_() and set a text value = config_map.data[config_map_data_name]', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['open_text_editor_'](config_map_data_keys[0], MockKubernetesConfigClass.items[0], 'Fake Message');

        expect(component['open_text_editor_']).toHaveBeenCalled();
      });

      it('should call open_text_editor_() and set a text value = empty string', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['open_text_editor_']('test_file.yaml', MockKubernetesConfigClass.items[0], 'Fake Message');

        expect(component['open_text_editor_']).toHaveBeenCalled();
      });

      it('should call api_edit_config_map_() when mat_dialog_ref closed', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of('Fake data') } as MatDialogRef<typeof component>);

        component['open_text_editor_'](config_map_data_keys[0], MockKubernetesConfigClass.items[0], 'Fake Message');

        expect(component['api_edit_config_map_']).toHaveBeenCalled();
      });
    });

    describe('private get_config_map_index_()', () => {
      it('should call get_config_map_index_()', () => {
        reset();

        component.config_maps = MockKubernetesConfigClass.items;
        component.config_map_visible = [ false, false ];
        component['get_config_map_index_'](component.config_maps[0]);

        expect(component['get_config_map_index_']).toHaveBeenCalled();
      });

      it('should call get_config_map_index_() and return the index of a config_map', () => {
        reset();

        component.config_maps = MockKubernetesConfigClass.items;
        component.config_map_visible = [ false, false ];
        const return_value: number = component['get_config_map_index_'](component.config_maps[0]);

        expect(return_value).toEqual(0);
      });
    });

    describe('private api_get_config_maps_()', () => {
      it('should call api_get_config_maps_()', () => {
        reset();

        component['api_get_config_maps_']();

        expect(component['api_get_config_maps_']).toHaveBeenCalled();
      });

      it('should call config_map_service_.get_config_maps() and handle error', () => {
        reset();

        component['api_get_config_maps_']();

        expect(component['config_map_service_'].get_config_maps).toHaveBeenCalled();
      });

      it('should call api_get_config_maps_() and handle response and set config_maps', () => {
        reset();

        component['api_get_config_maps_']();

        expect(component.config_maps.length).toEqual(MockKubernetesConfigClass.items.length);

        component.config_maps.forEach((cm: ConfigMapClass, i: number) => {
          expect(cm).toEqual(MockKubernetesConfigClass.items[i]);
        });
      });

      it('should call api_get_config_maps_() and handle response and set config_maps_visible', () => {
        reset();

        component['api_get_config_maps_']();

        expect(component.config_map_visible.length).toEqual(MockKubernetesConfigClass.items.length);

        component.config_map_visible.forEach((cmv: boolean) => {
          expect(cmv).toBeFalse();
        });
      });

      it('should call api_get_config_maps_() and handle response and set loading = false', () => {
        reset();

        component.loading = true;

        expect(component.loading).toBeTrue();

        component['api_get_config_maps_']();

        expect(component.loading).toBeFalse();
      });

      it('should call config_map_service_.get_config_maps() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['config_map_service_'], 'get_config_maps').and.returnValue(throwError(mock_http_error_response));

        component['api_get_config_maps_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_edit_config_map_()', () => {
      it('should call api_edit_config_map_()', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_edit_config_map_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], config_map_data_keys[0], MockKubernetesConfigClass.items[0], []);

        expect(component['api_edit_config_map_']).toHaveBeenCalled();
      });

      it('should call api_edit_config_map_() and detect config_map edit', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_edit_config_map_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], config_map_data_keys[0], MockKubernetesConfigClass.items[0], []);

        expect(component['api_edit_config_map_']).toHaveBeenCalled();
      });

      it('should call api_edit_config_map_() and detect config_map create', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_edit_config_map_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], 'fake.crt', MockKubernetesConfigClass.items[0], []);

        expect(component['api_edit_config_map_']).toHaveBeenCalled();
      });

      it('should call api_edit_config_map_() and detect config_map first data create', () => {
        reset();

        const config_map_edit: ConfigMapClass = [MockKubernetesConfigClass.items[0]].map((c: ConfigMapClass) => c)[0];
        config_map_edit.data = null;

        component['api_edit_config_map_']('New config map data', 'fake.crt', config_map_edit, []);

        expect(component['api_edit_config_map_']).toHaveBeenCalled();
      });

      it('should call api_edit_config_map_() and delete config_map_data', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_edit_config_map_'](undefined, config_map_data_keys[0], MockKubernetesConfigClass.items[0], []);

        expect(component['api_edit_config_map_']).toHaveBeenCalled();
      });

      it('should call api_edit_config_map_() and set config_map data null', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);
        const config_map_edit: ConfigMapClass = [MockKubernetesConfigClass.items[0]].map((c: ConfigMapClass) => c)[0];
        delete config_map_edit.data[config_map_data_keys[1]];

        component['api_edit_config_map_'](undefined, config_map_data_keys[0], config_map_edit, []);

        expect(component['api_edit_config_map_']).toHaveBeenCalled();
      });

      it('should call config_map_service_.edit_config_map() and handle error', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_edit_config_map_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], config_map_data_keys[0], MockKubernetesConfigClass.items[0], []);

        expect(component['config_map_service_'].edit_config_map).toHaveBeenCalled();
      });

      it('should call config_map_service_.edit_config_map() and handle response and call get_config_map_index_()', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_edit_config_map_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], config_map_data_keys[0], MockKubernetesConfigClass.items[0], []);

        expect(component['get_config_map_index_']).toHaveBeenCalled();
      });

      it('should call config_map_service_.edit_config_map() and handle response and call get_config_map_index_()', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_edit_config_map_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], config_map_data_keys[0], MockKubernetesConfigClass.items[0], []);

        expect(component['get_config_map_index_']).toHaveBeenCalled();
      });

      it('should call config_map_service_.edit_config_map() and handle response and set config_map_visible = true for config_map', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_edit_config_map_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], config_map_data_keys[0], MockKubernetesConfigClass.items[0], []);

        expect(component.config_map_visible[0]).toBeTrue();
      });

      it('should call config_map_service_.edit_config_map() and handle response and call mat_snackbar_service_.generate_return_success_snackbar_message()', () => {
        reset();

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_edit_config_map_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], config_map_data_keys[0], MockKubernetesConfigClass.items[0], []);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call config_map_service_.edit_config_map() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['config_map_service_'], 'edit_config_map').and.returnValue(throwError(mock_http_error_response));

        component['api_edit_config_map_'](undefined, 'fake.crt', MockKubernetesConfigClass.items[0], []);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_associated_pods_()', () => {
      it('should call api_get_associated_pods_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_get_associated_pods_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component['api_get_associated_pods_']).toHaveBeenCalled();
      });

      it('should call config_map_service_.get_associated_pods() and handle error', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_get_associated_pods_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component['config_map_service_'].get_associated_pods).toHaveBeenCalled();
      });

      it('should call api_get_associated_pods_() and handle response and call open_text_editor_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_get_associated_pods_'](MockKubernetesConfigClass.items[0].data[config_map_data_keys[0]], config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component['open_text_editor_']).toHaveBeenCalled();
      });

      it('should call api_get_associated_pods_() and handle response and call api_edit_config_map_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_get_associated_pods_'](undefined, config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component['api_edit_config_map_']).toHaveBeenCalled();
      });

      it('should call config_map_service_.get_associated_pods() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['config_map_service_'], 'get_associated_pods').and.returnValue(throwError(mock_http_error_response));

        const config_map_data_keys: string[] = Object.keys(MockKubernetesConfigClass.items[0].data);

        component['api_get_associated_pods_'](undefined, config_map_data_keys[0], MockKubernetesConfigClass.items[0]);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

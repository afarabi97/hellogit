import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import {
  MockElasticsearchConfigurationClass,
  MockElasticsearchNodeClass,
  MockStatusNoneElasticsearchCheckClass,
  MockStatusPendingElasticsearchCheckClass,
  MockStatusUnknownElasticsearchCheckClass
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { MockElasticsearchNodeReturnInterface } from '../../../../static-data/interface-objects';
import { CONFIRM_DIALOG_OPTION } from '../../constants/cvah.constants';
import { WebsocketService } from '../../services/websocket.service';
import { TestingModule } from '../testing-modules/testing.module';
import { InjectorModule } from '../utilily-modules/injector.module';
import { ElasticsearchScaleComponent } from './elasticsearch-scale.component';
import { ElasticsearchScaleModule } from './elasticsearch-scale.module';

const MockWebsocketBoradcast = {
  status: 'COMPLETED'
};

class MockSocket {
  onBroadcast() {
    return of(MockWebsocketBoradcast);
  }
}

describe('ElasticsearchScaleComponent', () => {
  let component: ElasticsearchScaleComponent;
  let fixture: ComponentFixture<ElasticsearchScaleComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyOpenRunConfirmDialog: jasmine.Spy<any>;
  let spyEditElasticSearchConfiguration: jasmine.Spy<any>;
  let spySetupWebsocketOnbroadcast: jasmine.Spy<any>;
  let spyRunElasticsearchScale: jasmine.Spy<any>;
  let spyOpenTextEditor: jasmine.Spy<any>;
  let spyOpenCantRunDialog: jasmine.Spy<any>;
  let spyOpenElasticsearchScaleInProgressDialog: jasmine.Spy<any>;
  let spyApiGetElasticNodes: jasmine.Spy<any>;
  let spyApiPostElasticNodes: jasmine.Spy<any>;
  let spyApiGetElasticFullConfig: jasmine.Spy<any>;
  let spyApiPostElasticFullConfig: jasmine.Spy<any>;
  let spyApiDeployElastic: jasmine.Spy<any>;
  let spyApiCheckElastic: jasmine.Spy<any>;

  // Test Error
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        InjectorModule,
        ElasticsearchScaleModule,
        TestingModule
      ],
      providers: [
        Title,
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) },
        { provide: WebsocketService, useClass: MockSocket }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElasticsearchScaleComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyOpenRunConfirmDialog = spyOn(component, 'open_run_confirm_dialog').and.callThrough();
    spyEditElasticSearchConfiguration = spyOn(component, 'edit_elasticsearch_configuration').and.callThrough();
    spySetupWebsocketOnbroadcast = spyOn<any>(component, 'setup_websocket_onbroadcast_').and.callThrough();
    spyRunElasticsearchScale = spyOn<any>(component, 'run_elasticsearch_scale_').and.callThrough();
    spyOpenTextEditor = spyOn<any>(component, 'open_text_editor_').and.callThrough();
    spyOpenCantRunDialog = spyOn<any>(component, 'open_cant_run_dialog_').and.callThrough();
    spyOpenElasticsearchScaleInProgressDialog = spyOn<any>(component, 'open_elasticsearch_scale_in_progress_dialog_').and.callThrough();
    spyApiGetElasticNodes = spyOn<any>(component, 'api_get_elastic_nodes_').and.callThrough();
    spyApiPostElasticNodes = spyOn<any>(component, 'api_post_elastic_nodes_').and.callThrough();
    spyApiGetElasticFullConfig = spyOn<any>(component, 'api_get_elastic_full_config_').and.callThrough();
    spyApiPostElasticFullConfig = spyOn<any>(component, 'api_post_elastic_full_config_').and.callThrough();
    spyApiDeployElastic = spyOn<any>(component, 'api_deploy_elastic_').and.callThrough();
    spyApiCheckElastic = spyOn<any>(component, 'api_check_elastic_').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyOpenRunConfirmDialog.calls.reset();
    spyEditElasticSearchConfiguration.calls.reset();
    spySetupWebsocketOnbroadcast.calls.reset();
    spyRunElasticsearchScale.calls.reset();
    spyOpenTextEditor.calls.reset();
    spyOpenCantRunDialog.calls.reset();
    spyOpenElasticsearchScaleInProgressDialog.calls.reset();
    spyApiGetElasticNodes.calls.reset();
    spyApiPostElasticNodes.calls.reset();
    spyApiGetElasticFullConfig.calls.reset();
    spyApiPostElasticFullConfig.calls.reset();
    spyApiDeployElastic.calls.reset();
    spyApiCheckElastic.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create ElasticsearchScaleComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ElasticsearchScaleComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call api_check_elastic_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_check_elastic_']).toHaveBeenCalled();
      });

      it('should call setup_websocket_onbroadcast_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['setup_websocket_onbroadcast_']).toHaveBeenCalled();
      });

      it('should call api_get_elastic_nodes_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_elastic_nodes_']).toHaveBeenCalled();
      });
    });

    describe('open_run_confirm_dialog()', () => {
      it('should call open_run_confirm_dialog()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.open_run_confirm_dialog();

        expect(component.open_run_confirm_dialog).toHaveBeenCalled();
      });

      it('should call open_cant_run_dialog_() after mat dialog ref closed from within open_run_confirm_dialog(), note: component.status = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);
        component.status = true;

        component.open_run_confirm_dialog();

        expect(component['open_cant_run_dialog_']).toHaveBeenCalled();
      });

      it('should call run_elasticsearch_scale_() after mat dialog ref closed from within open_run_confirm_dialog(), note: component.status = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);
        component.status = false;

        component.open_run_confirm_dialog();

        expect(component['run_elasticsearch_scale_']).toHaveBeenCalled();
      });
    });

    describe('edit_elasticsearch_configuration()', () => {
      it('should call edit_elasticsearch_configuration()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.edit_elasticsearch_configuration();

        expect(component.edit_elasticsearch_configuration).toHaveBeenCalled();
      });

      it('should call api_get_elastic_full_config_() from edit_elasticsearch_configuration()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.edit_elasticsearch_configuration();

        expect(component['api_get_elastic_full_config_']).toHaveBeenCalled();
      });
    });

    describe('private setup_websocket_onbroadcast_()', () => {
      it('should call setup_websocket_onbroadcast_()', () => {
        reset();

        component['setup_websocket_onbroadcast_']();

        expect(component['setup_websocket_onbroadcast_']).toHaveBeenCalled();
      });
    });

    describe('private run_elasticsearch_scale_()', () => {
      it('should call run_elasticsearch_scale_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['run_elasticsearch_scale_']();

        expect(component['run_elasticsearch_scale_']).toHaveBeenCalled();
      });

      it('should call run_elasticsearch_scale_() and set component.loading = true', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.loading = false;

        expect(component.loading).toBeFalse();

        component['run_elasticsearch_scale_']();

        expect(component.loading).toBeTrue();
      });

      it('should call api_post_elastic_nodes_() from run_elasticsearch_scale_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['run_elasticsearch_scale_']();

        expect(component['api_post_elastic_nodes_']).toHaveBeenCalled();
      });
    });

    describe('private open_text_editor_()', () => {
      it('should call open_text_editor_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['open_text_editor_'](MockElasticsearchConfigurationClass);

        expect(component['open_text_editor_']).toHaveBeenCalled();
      });

      it('should call api_post_elastic_full_config_() after mat dialog ref closed from within open_text_editor_(), note: component.status = true', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(MockElasticsearchConfigurationClass.elastic) } as MatDialogRef<typeof component>);

        component['open_text_editor_'](MockElasticsearchConfigurationClass);

        expect(component['api_post_elastic_full_config_']).toHaveBeenCalled();
      });
    });

    describe('private open_cant_run_dialog_()', () => {
      it('should call open_cant_run_dialog_()', () => {
        reset();

        component['open_cant_run_dialog_']();

        expect(component['open_cant_run_dialog_']).toHaveBeenCalled();
      });
    });

    describe('private open_elasticsearch_scale_in_progress_dialog_()', () => {
      it('should call open_elasticsearch_scale_in_progress_dialog_()', () => {
        reset();

        component['open_elasticsearch_scale_in_progress_dialog_']();

        expect(component['open_elasticsearch_scale_in_progress_dialog_']).toHaveBeenCalled();
      });
    });

    describe('private api_get_elastic_nodes_()', () => {
      it('should call api_get_elastic_nodes_()', () => {
        reset();

        component['api_get_elastic_nodes_']();

        expect(component['api_get_elastic_nodes_']).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.get_elastic_nodes() from api_get_elastic_nodes_()', () => {
        reset();

        component['api_get_elastic_nodes_']();

        expect(component['elasticsearch_service_'].get_elastic_nodes).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.get_elastic_nodes() and handle response and set component.serve_node_count', () => {
        reset();

        component['api_get_elastic_nodes_']();

        expect(component.server_node_count).toEqual(MockElasticsearchNodeClass.elastic.server_node_count);
      });

      it('should call elasticsearch_service_.get_elastic_nodes() and handle response and set node_sliders', () => {
        reset();

        component.node_sliders = [];

        expect(component.node_sliders.length).toEqual(0);

        component['api_get_elastic_nodes_']();

        expect(component.node_sliders.length).toEqual(4);
      });

      it('should call elasticsearch_service_.get_elastic_nodes() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'get_elastic_nodes').and.returnValue(throwError(mock_http_error_response));

        component['api_get_elastic_nodes_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_post_elastic_nodes_()', () => {
      it('should call api_post_elastic_nodes_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['api_post_elastic_nodes_'](MockElasticsearchNodeReturnInterface);

        expect(component['api_post_elastic_nodes_']).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.post_elastic_nodes() from api_post_elastic_nodes_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['api_post_elastic_nodes_'](MockElasticsearchNodeReturnInterface);

        expect(component['elasticsearch_service_'].post_elastic_nodes).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.post_elastic_nodes() and handle response and call api_deploy_elastic_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['api_post_elastic_nodes_'](MockElasticsearchNodeReturnInterface);

        expect(component['api_deploy_elastic_']).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.post_elastic_nodes() and handle response and set node_sliders = []', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component['api_get_elastic_nodes_']();

        expect(component.node_sliders.length > 0).toBeTrue();

        component['api_post_elastic_nodes_'](MockElasticsearchNodeReturnInterface);

        expect(component.node_sliders.length === 0).toBeTrue();
      });

      it('should call elasticsearch_service_.post_elastic_nodes() and handle error', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'post_elastic_nodes').and.returnValue(throwError(mock_http_error_response));

        component['api_post_elastic_nodes_'](MockElasticsearchNodeReturnInterface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_elastic_full_config_()', () => {
      it('should call api_get_elastic_full_config_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['api_get_elastic_full_config_']();

        expect(component['api_get_elastic_full_config_']).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.get_elastic_full_config() from api_get_elastic_full_config_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['api_get_elastic_full_config_']();

        expect(component['elasticsearch_service_'].get_elastic_full_config).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.get_elastic_full_config() and handle response and call open_text_editor_()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component['api_get_elastic_full_config_']();

        expect(component['open_text_editor_']).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.get_elastic_full_config() and handle error', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'get_elastic_full_config').and.returnValue(throwError(mock_http_error_response));

        component['api_get_elastic_full_config_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_post_elastic_full_config_()', () => {
      it('should call api_post_elastic_full_config_()', () => {
        reset();

        component['api_post_elastic_full_config_'](MockElasticsearchConfigurationClass.elastic);

        expect(component['api_post_elastic_full_config_']).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.post_elastic_full_config() from api_post_elastic_full_config_()', () => {
        reset();

        component['api_post_elastic_full_config_'](MockElasticsearchConfigurationClass.elastic);

        expect(component['elasticsearch_service_'].post_elastic_full_config).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.post_elastic_full_config() and handle response and call api_deploy_elastic_()', () => {
        reset();

        component['api_post_elastic_full_config_'](MockElasticsearchConfigurationClass.elastic);

        expect(component['api_deploy_elastic_']).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.post_elastic_full_config() and handle response and set node_sliders = []', () => {
        reset();

        component['api_get_elastic_nodes_']();

        expect(component.node_sliders.length > 0).toBeTrue();

        component['api_post_elastic_full_config_'](MockElasticsearchConfigurationClass.elastic);

        expect(component.node_sliders.length === 0).toBeTrue();
      });

      it('should call elasticsearch_service_.post_elastic_full_config() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'post_elastic_full_config').and.returnValue(throwError(mock_http_error_response));

        component['api_post_elastic_full_config_'](MockElasticsearchConfigurationClass.elastic);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_deploy_elastic_()', () => {
      it('should call api_deploy_elastic_()', () => {
        reset();

        component['api_deploy_elastic_']();

        expect(component['api_deploy_elastic_']).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.deploy_elastic() from api_deploy_elastic_()', fakeAsync(() => {
        reset();

        component['api_deploy_elastic_']();

        // Need this since api rest call is wrapped inside a timeout
        tick(6000);

        expect(component['elasticsearch_service_'].deploy_elastic).toHaveBeenCalled();
      }));

      it('should call elasticsearch_service_.deploy_elastic() and handle response and set component.status = true', fakeAsync(() => {
        reset();

        component.status = false;

        expect(component.status).toBeFalse();

        component['api_deploy_elastic_']();

        // Need this since api rest call is wrapped inside a timeout
        tick(6000);

        expect(component.status).toBeTrue();
      }));

      it('should call elasticsearch_service_.deploy_elastic() and handle error', fakeAsync(() => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'deploy_elastic').and.returnValue(throwError(mock_http_error_response));

        component['api_deploy_elastic_']();

        // Need this since api rest call is wrapped inside a timeout
        tick(6000);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      }));
    });

    describe('private api_check_elastic_()', () => {
      it('should call api_check_elastic_()', () => {
        reset();

        component['api_check_elastic_']();

        expect(component['api_check_elastic_']).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.check_elastic() from api_check_elastic_()', () => {
        reset();

        component['api_check_elastic_']();

        expect(component['elasticsearch_service_'].check_elastic).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.check_elastic() and handle response.status = Pending and call open_elasticsearch_scale_in_progress_dialog_()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'check_elastic').and.returnValue(of(MockStatusPendingElasticsearchCheckClass));

        component['api_check_elastic_']();

        expect(component['open_elasticsearch_scale_in_progress_dialog_']).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.check_elastic() and handle response.status = Pending and set component.status = true', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'check_elastic').and.returnValue(of(MockStatusPendingElasticsearchCheckClass));

        component.status = false;

        expect(component.status).toBeFalse();

        component['api_check_elastic_']();

        expect(component.status).toBeTrue();
      });

      it('should call elasticsearch_service_.check_elastic() and handle response.status = None and call mat_snackbar_service_.generate_return_error_snackbar_message()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'check_elastic').and.returnValue(of(MockStatusNoneElasticsearchCheckClass));

        component['api_check_elastic_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.check_elastic() and handle response.status = None and set component.loading = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'check_elastic').and.returnValue(of(MockStatusNoneElasticsearchCheckClass));

        component.loading = true;

        expect(component.loading).toBeTrue();

        component['api_check_elastic_']();

        expect(component.loading).toBeFalse();
      });

      it('should call elasticsearch_service_.check_elastic() and handle response.status = Unknown and call mat_snackbar_service_.generate_return_error_snackbar_message()', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'check_elastic').and.returnValue(of(MockStatusUnknownElasticsearchCheckClass));

        component['api_check_elastic_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });

      it('should call elasticsearch_service_.check_elastic() and handle response.status = Unknown and set component.loading = false', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'check_elastic').and.returnValue(of(MockStatusUnknownElasticsearchCheckClass));

        component.loading = true;

        expect(component.loading).toBeTrue();

        component['api_check_elastic_']();

        expect(component.loading).toBeFalse();
      });

      it('should call elasticsearch_service_.check_elastic() and handle response.status = Ready and set component.loading = false', () => {
        reset();

        component.loading = true;

        expect(component.loading).toBeTrue();

        component['api_check_elastic_']();

        expect(component.loading).toBeFalse();
      });

      it('should call elasticsearch_service_.check_elastic() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['elasticsearch_service_'], 'check_elastic').and.returnValue(throwError(mock_http_error_response));

        component['api_check_elastic_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

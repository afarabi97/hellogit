import { HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { of, throwError } from 'rxjs';

import {
  MockAgentInstallerConfigurationClass1,
  MockAgentInstallerConfigurationClass2,
  MockAgentInstallerConfigurationClass4,
  MockAgentInstallerConfigurationClassesArray,
  MockAppConfigClassesArray,
  MockHostClass1,
  MockHostClassesArray1,
  MockIPTargetListClass1,
  MockIPTargetListClass2,
  MockIPTargetListClass3,
  MockIPTargetListClassesArray,
  MockStatusClassLogstashDeployedError,
  MockWindowsCredentialsClass
} from '../../../../static-data/class-objects';
import { remove_styles_from_dom } from '../../../../static-data/functions/clean-dom.function';
import { MockErrorMessageInterface } from '../../../../static-data/interface-objects';
import { ErrorMessageClass } from '../../classes';
import { CANCEL_DIALOG_OPTION, CONFIRM_DIALOG_OPTION } from '../../constants/cvah.constants';
import { ApiService } from '../../services/abstract/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { TestingModule } from '../testing-modules/testing.module';
import { InjectorModule } from '../utilily-modules/injector.module';
import { AgentBuilderChooserComponent } from './agent-builder-chooser.component';
import { AgentBuilderChooserModule } from './agent-builder-chooser.module';
import { AppConfigClass, HostClass, IPTargetListClass } from './classes';
import { INSTALL, REINSTALL, UNINSTALL, UNINSTALLS } from './constants/agent-builder-chooser.constant';
import { AgentInterface, AgentTargetInterface, MatTableRowIPTargetListInterface } from './interfaces';

@Component({
  template: `
    <table mat-table [dataSource]="data" aria-describedby="IP Target List">
      <ng-container matColumnDef="select">
        <th scope="col" mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let config; let z = index;">{{ config.name }}</td>
      </ng-container>
      <!-- Table Rows -->
      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns; let j = index;"></tr>
    </table>
    <mat-paginator #tablePaginator [pageSize]="5" [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
  `,
})
class WrapperComponent {
  @ViewChild('tablePaginator') table_paginator: MatPaginator;
  columns: string[] = [ 'name' ];
  data: MatTableDataSource<IPTargetListClass> = new MatTableDataSource<IPTargetListClass>(MockIPTargetListClassesArray);
}
interface MockFile {
  name: string;
  body: string;
  mimeType: string;
}

class MockSocket {
  getSocket() {
    return {'on': () => {}};
  }
}

describe('AgentBuilderChooserComponent', () => {
  let component: AgentBuilderChooserComponent;
  let fixture: ComponentFixture<AgentBuilderChooserComponent>;
  let wrapper_component: WrapperComponent;
  let wrapper_fixture: ComponentFixture<WrapperComponent>;

  // Setup spy references
  let spyNGOnInit: jasmine.Spy<any>;
  let spyCheckCustomPackages: jasmine.Spy<any>;
  let spyUpdateSelectedAgentInstallerConfig: jasmine.Spy<any>;
  let spyUpdateSelectedIPTarget: jasmine.Spy<any>;
  let spyToggleHostListExpansion: jasmine.Spy<any>;
  let spyIsHostListExpanded: jasmine.Spy<any>;
  let spySetHostListPaginator: jasmine.Spy<any>;
  let spyShowAgentInstallerConfiguration: jasmine.Spy<any>;
  let spyDownloadAgentInstaller: jasmine.Spy<any>;
  let spyAgentsInstall: jasmine.Spy<any>;
  let spyAgentsUninstall: jasmine.Spy<any>;
  let spyAgentUninstall: jasmine.Spy<any>;
  let spyAgentReinstall: jasmine.Spy<any>;
  let spyDeleteAgentInstallerConfigurationConfirmDialog: jasmine.Spy<any>;
  let spyDeleteIPTargetListConfirmDialog: jasmine.Spy<any>;
  let spyNewAgentInstallerConfiguration: jasmine.Spy<any>;
  let spyNewIPTargetList: jasmine.Spy<any>;
  let spyGetIPTargetListPort: jasmine.Spy<any>;
  let spyGetIPTargetListDomainName: jasmine.Spy<any>;
  let spyAddHostsToIPTargetList: jasmine.Spy<any>;
  let spyRemoveHostsFromIPTargetList: jasmine.Spy<any>;
  let spyGetAppConfigsWithCustomPackages: jasmine.Spy<any>;
  let spyDialogMessage: jasmine.Spy<any>;
  let spyIsHostIndexZero: jasmine.Spy<any>;
  let spySetAgentInstallerConfigurationMatTableData: jasmine.Spy<any>;
  let spySetIPTargetMatTableData: jasmine.Spy<any>;
  let spyGetCredentials: jasmine.Spy<any>;
  let spyPerformAgentAction: jasmine.Spy<any>;
  let spyUpdateIPTargetsListTargets: jasmine.Spy<any>;
  let spyWebsocketGetSocketOnRefresh: jasmine.Spy<any>;
  let spyApiGetChartStatus: jasmine.Spy<any>;
  let spyApiAgentGenerate: jasmine.Spy<any>;
  let spyApiAgentSaveConfig: jasmine.Spy<any>;
  let spyApiAgentDeleteConfig: jasmine.Spy<any>;
  let spyApiAgentGetConfigs: jasmine.Spy<any>;
  let spyApiAgentGetIPTargetList: jasmine.Spy<any>;
  let spyApiAgentSaveIPTargetList: jasmine.Spy<any>;
  let spyApiAgentAddHostToIPTargetList: jasmine.Spy<any>;
  let spyApiAgentRemoveHostFromIPTargetList: jasmine.Spy<any>;
  let spyApiDeleteIPTargetList: jasmine.Spy<any>;
  let spyApiAgentsInstall: jasmine.Spy<any>;
  let spyApiAgentsUninstall: jasmine.Spy<any>;
  let spyApiAgentUninstall: jasmine.Spy<any>;
  let spyApiAgentReinstall: jasmine.Spy<any>;
  let spyApiGetAppConfigs: jasmine.Spy<any>;

  // Test Data
  const create_file_from_mock_file = (file: MockFile): File => {
    const blob = new Blob([file.body], { type: file.mimeType }) as any;
    blob['lastModifiedDate'] = new Date();
    blob['name'] = file.name;

    return blob as File;
  };
  const mock_http_error_response: HttpErrorResponse = new HttpErrorResponse({
    error: 'Fake Error',
    status: 500,
    statusText: 'Internal Server Error',
    url: 'http://fake-url'
  });
  const host_list: MatTableDataSource<HostClass> = new MatTableDataSource<HostClass>(MockHostClassesArray1);
  let host_list_paginator: MatPaginator;
  const mat_table_row_ip_target_list: MatTableRowIPTargetListInterface = {
    config: MockIPTargetListClass1,
    state: {
      host_list: host_list,
      expanded: false
    }
  };
  const mock_agent_interface: AgentInterface = {
    installer_config: MockAgentInstallerConfigurationClass1,
    target_config: MockIPTargetListClass1,
    windows_domain_creds: MockWindowsCredentialsClass
  };
  const mock_agent_target: AgentTargetInterface = {
    ...mock_agent_interface,
    target: MockHostClass1
  };
  const mock_host_form_group: FormGroup = new FormGroup({
    hostnames: new FormControl('fake name')
  });
  const mock_windows_credentials_form_group: FormGroup = new FormGroup({
    user_name: new FormControl('fakeuser1'),
    password: new FormControl('password')
  });
  const agent_interface: AgentInterface = {
    installer_config: MockAgentInstallerConfigurationClass1,
    target_config: MockIPTargetListClass1,
    windows_domain_creds: undefined
  };
  const agent_target_interface: AgentTargetInterface = {
    installer_config: MockAgentInstallerConfigurationClass1,
    target_config: MockIPTargetListClass1,
    windows_domain_creds: undefined,
    target: MockHostClass1
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        InjectorModule,
        AgentBuilderChooserModule,
        TestingModule,
        MatPaginatorModule
      ],
      declarations: [
        WrapperComponent
      ],
      providers: [
        ApiService,
        { provide: MatDialog, useFactory: () => jasmine.createSpyObj('MatDialog', ['open', 'closeAll']) },
        { provide: WebsocketService, useClass: MockSocket }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentBuilderChooserComponent);
    component = fixture.componentInstance;
    wrapper_fixture = TestBed.createComponent(WrapperComponent);
    wrapper_component = wrapper_fixture.componentInstance;

    // Add method spies
    spyNGOnInit = spyOn(component, 'ngOnInit').and.callThrough();
    spyCheckCustomPackages = spyOn(component, 'check_custom_packages').and.callThrough();
    spyUpdateSelectedAgentInstallerConfig = spyOn(component, 'update_selected_agent_installer_config').and.callThrough();
    spyUpdateSelectedIPTarget = spyOn(component, 'update_selected_ip_target').and.callThrough();
    spyToggleHostListExpansion = spyOn(component, 'toggle_host_list_expansion').and.callThrough();
    spyIsHostListExpanded = spyOn(component, 'is_host_list_expanded').and.callThrough();
    spySetHostListPaginator = spyOn(component, 'set_host_list_paginator').and.callThrough();
    spyShowAgentInstallerConfiguration = spyOn(component, 'show_agent_installer_configuration').and.callThrough();
    spyDownloadAgentInstaller = spyOn(component, 'download_agent_installer').and.callThrough();
    spyAgentsInstall = spyOn(component, 'agents_install').and.callThrough();
    spyAgentsUninstall = spyOn(component, 'agents_uninstall').and.callThrough();
    spyAgentUninstall = spyOn(component, 'agent_uninstall').and.callThrough();
    spyAgentReinstall = spyOn(component, 'agent_reinstall').and.callThrough();
    spyDeleteAgentInstallerConfigurationConfirmDialog = spyOn(component, 'delete_agent_installer_configuration_confirm_dialog').and.callThrough();
    spyDeleteIPTargetListConfirmDialog = spyOn(component, 'delete_ip_target_list_confirm_dialog').and.callThrough();
    spyNewAgentInstallerConfiguration = spyOn(component, 'new_agent_installer_configuration').and.callThrough();
    spyNewIPTargetList = spyOn(component, 'new_ip_target_list').and.callThrough();
    spyGetIPTargetListPort = spyOn(component, 'get_ip_target_list_port').and.callThrough();
    spyGetIPTargetListDomainName = spyOn(component, 'get_ip_target_list_domain_name').and.callThrough();
    spyAddHostsToIPTargetList = spyOn(component, 'add_hosts_to_ip_target_list').and.callThrough();
    spyRemoveHostsFromIPTargetList = spyOn(component, 'remove_hosts_from_ip_target_list').and.callThrough();
    spyGetAppConfigsWithCustomPackages = spyOn<any>(component, 'get_app_configs_with_custom_packages_').and.callThrough();
    spyDialogMessage = spyOn<any>(component, 'dialog_message_').and.callThrough();
    spyIsHostIndexZero = spyOn<any>(component, 'is_host_index_zero_').and.callThrough();
    spySetAgentInstallerConfigurationMatTableData = spyOn<any>(component, 'set_agent_installer_configuration_mat_table_data_').and.callThrough();
    spySetIPTargetMatTableData = spyOn<any>(component, 'set_ip_target_config_mat_table_data_').and.callThrough();
    spyGetCredentials = spyOn<any>(component, 'get_credentials_').and.callThrough();
    spyPerformAgentAction = spyOn<any>(component, 'perform_agent_action_').and.callThrough();
    spyUpdateIPTargetsListTargets = spyOn<any>(component, 'update_ip_targets_list_targets_').and.callThrough();
    spyWebsocketGetSocketOnRefresh = spyOn<any>(component, 'websocket_get_socket_on_refresh').and.callThrough();
    spyApiGetChartStatus = spyOn<any>(component, 'api_get_chart_status_').and.callThrough();
    spyApiAgentGenerate = spyOn<any>(component, 'api_agent_generate_').and.callThrough();
    spyApiAgentSaveConfig = spyOn<any>(component, 'api_agent_save_config_').and.callThrough();
    spyApiAgentDeleteConfig = spyOn<any>(component, 'api_agent_delete_config_').and.callThrough();
    spyApiAgentGetConfigs = spyOn<any>(component, 'api_agent_get_configs_').and.callThrough();
    spyApiAgentGetIPTargetList = spyOn<any>(component, 'api_agent_get_ip_target_list_').and.callThrough();
    spyApiAgentSaveIPTargetList = spyOn<any>(component, 'api_agent_save_ip_target_list_').and.callThrough();
    spyApiAgentAddHostToIPTargetList = spyOn<any>(component, 'api_agent_add_host_to_ip_target_list_').and.callThrough();
    spyApiAgentRemoveHostFromIPTargetList = spyOn<any>(component, 'api_agent_remove_host_from_ip_target_list').and.callThrough();
    spyApiDeleteIPTargetList = spyOn<any>(component, 'api_delete_ip_target_list_').and.callThrough();
    spyApiAgentsInstall = spyOn<any>(component, 'api_agents_install_').and.callThrough();
    spyApiAgentsUninstall = spyOn<any>(component, 'api_agents_uninstall_').and.callThrough();
    spyApiAgentUninstall = spyOn<any>(component, 'api_agent_uninstall_').and.callThrough();
    spyApiAgentReinstall = spyOn<any>(component, 'api_agent_reinstall_').and.callThrough();
    spyApiGetAppConfigs = spyOn<any>(component, 'api_get_app_configs_').and.callThrough();

    // Set Data
    host_list_paginator = wrapper_component.table_paginator;

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGOnInit.calls.reset();
    spyCheckCustomPackages.calls.reset();
    spyUpdateSelectedAgentInstallerConfig.calls.reset();
    spyUpdateSelectedIPTarget.calls.reset();
    spyToggleHostListExpansion.calls.reset();
    spyIsHostListExpanded.calls.reset();
    spySetHostListPaginator.calls.reset();
    spyShowAgentInstallerConfiguration.calls.reset();
    spyDownloadAgentInstaller.calls.reset();
    spyAgentsInstall.calls.reset();
    spyAgentsUninstall.calls.reset();
    spyAgentUninstall.calls.reset();
    spyAgentReinstall.calls.reset();
    spyDeleteAgentInstallerConfigurationConfirmDialog.calls.reset();
    spyDeleteIPTargetListConfirmDialog.calls.reset();
    spyNewAgentInstallerConfiguration.calls.reset();
    spyNewIPTargetList.calls.reset();
    spyGetIPTargetListPort.calls.reset();
    spyGetIPTargetListDomainName.calls.reset();
    spyAddHostsToIPTargetList.calls.reset();
    spyRemoveHostsFromIPTargetList.calls.reset();
    spyGetAppConfigsWithCustomPackages.calls.reset();
    spyDialogMessage.calls.reset();
    spyIsHostIndexZero.calls.reset();
    spySetAgentInstallerConfigurationMatTableData.calls.reset();
    spySetIPTargetMatTableData.calls.reset();
    spyGetCredentials.calls.reset();
    spyPerformAgentAction.calls.reset();
    spyUpdateIPTargetsListTargets.calls.reset();
    spyWebsocketGetSocketOnRefresh.calls.reset();
    spyApiGetChartStatus.calls.reset();
    spyApiAgentGenerate.calls.reset();
    spyApiAgentSaveConfig.calls.reset();
    spyApiAgentDeleteConfig.calls.reset();
    spyApiAgentGetConfigs.calls.reset();
    spyApiAgentGetIPTargetList.calls.reset();
    spyApiAgentSaveIPTargetList.calls.reset();
    spyApiAgentAddHostToIPTargetList.calls.reset();
    spyApiAgentRemoveHostFromIPTargetList.calls.reset();
    spyApiDeleteIPTargetList.calls.reset();
    spyApiAgentsInstall.calls.reset();
    spyApiAgentsUninstall.calls.reset();
    spyApiAgentUninstall.calls.reset();
    spyApiAgentReinstall.calls.reset();
    spyApiGetAppConfigs.calls.reset();
  };

  afterAll(() => remove_styles_from_dom());

  it('should create AgentBuilderChooserComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('AgentBuilderChooserComponent methods', () => {
    describe('ngOnInit()', () => {
      it('should call ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component.ngOnInit).toHaveBeenCalled();
      });

      it('should call websocket_get_socket_on_refresh() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['websocket_get_socket_on_refresh']).toHaveBeenCalled();
      });

      it('should call api_get_chart_status_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_chart_status_']).toHaveBeenCalled();
      });

      it('should call api_agent_get_configs_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_agent_get_configs_']).toHaveBeenCalled();
      });

      it('should call api_agent_get_ip_target_list_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_agent_get_ip_target_list_']).toHaveBeenCalled();
      });

      it('should call api_get_app_configs_() from ngOnInit()', () => {
        reset();

        component.ngOnInit();

        expect(component['api_get_app_configs_']).toHaveBeenCalled();
      });
    });

    describe('check_custom_packages()', () => {
      it('should call check_custom_packages()', () => {
        reset();

        component.app_configs = MockAppConfigClassesArray;
        component.check_custom_packages(MockAgentInstallerConfigurationClass1);

        expect(component.check_custom_packages).toHaveBeenCalled();
      });

      it('should call check_custom_packages() and return true', () => {
        reset();

        component.app_configs = MockAppConfigClassesArray;
        const return_value: boolean = component.check_custom_packages(MockAgentInstallerConfigurationClass1);

        expect(return_value).toBeTrue();
      });

      it('should call check_custom_packages() and return false', () => {
        reset();

        component.app_configs = MockAppConfigClassesArray;
        const return_value: boolean = component.check_custom_packages(MockAgentInstallerConfigurationClass4);

        expect(return_value).toBeFalse();
      });
    });

    describe('update_selected_agent_installer_config()', () => {
      it('should call update_selected_agent_installer_config()', () => {
        reset();

        component.update_selected_agent_installer_config(MockAgentInstallerConfigurationClass1);

        expect(component.update_selected_agent_installer_config).toHaveBeenCalled();
      });

      it('should call update_selected_agent_installer_config() and set agent_installer_configuration_selection', () => {
        reset();

        component.agent_installer_configuration_selection = undefined;

        expect(component.agent_installer_configuration_selection).toBeUndefined();

        component.update_selected_agent_installer_config(MockAgentInstallerConfigurationClass1);

        expect(component.agent_installer_configuration_selection).toBeDefined();
      });
    });

    describe('update_selected_ip_target()', () => {
      it('should call update_selected_ip_target()', () => {
        reset();

        component.update_selected_ip_target(mat_table_row_ip_target_list);

        expect(component.update_selected_ip_target).toHaveBeenCalled();
      });

      it('should call update_selected_ip_target() and set ip_target_selection', () => {
        reset();

        component.ip_target_selection = null;

        expect(component.agent_installer_configuration_selection).toBeNull();

        component.update_selected_ip_target(mat_table_row_ip_target_list);

        expect(component.ip_target_selection).toBeDefined();
      });
    });

    describe('toggle_host_list_expansion()', () => {
      it('should call toggle_host_list_expansion()', () => {
        reset();

        component.toggle_host_list_expansion(mat_table_row_ip_target_list);

        expect(component.toggle_host_list_expansion).toHaveBeenCalled();
      });

      it('should call toggle_host_list_expansion() and set mat table row.state.expanded = !row.state.expanded', () => {
        reset();

        mat_table_row_ip_target_list.state.expanded = false;

        expect(mat_table_row_ip_target_list.state.expanded).toBeFalse();

        component.toggle_host_list_expansion(mat_table_row_ip_target_list);

        expect(mat_table_row_ip_target_list.state.expanded).toBeTrue();
      });
    });

    describe('is_host_list_expanded()', () => {
      it('should call is_host_list_expanded()', () => {
        reset();

        component.is_host_list_expanded(mat_table_row_ip_target_list);

        expect(component.is_host_list_expanded).toHaveBeenCalled();
      });

      it('should call is_host_list_expanded() and return true', () => {
        reset();

        mat_table_row_ip_target_list.state.expanded = true;

        const return_value: boolean = component.is_host_list_expanded(mat_table_row_ip_target_list);

        expect(return_value).toBeTrue();
      });

      it('should call is_host_list_expanded() and return false', () => {
        reset();

        mat_table_row_ip_target_list.state.expanded = false;

        const return_value: boolean = component.is_host_list_expanded(mat_table_row_ip_target_list);

        expect(return_value).toBeFalse();
      });
    });

    describe('set_host_list_paginator()', () => {
      it('should call set_host_list_paginator()', () => {
        reset();

        component.set_host_list_paginator(host_list, host_list_paginator);

        expect(component.set_host_list_paginator).toHaveBeenCalled();
      });

      it('should call set_host_list_paginator() and return host list mat table data source', () => {
        reset();

        mat_table_row_ip_target_list.state.expanded = true;

        const return_value: MatTableDataSource<HostClass> = component.set_host_list_paginator(host_list, host_list_paginator);

        expect(return_value).toBeDefined();
      });
    });

    describe('show_agent_installer_configuration()', () => {
      it('should call show_agent_installer_configuration()', () => {
        reset();

        component.show_agent_installer_configuration(MockAgentInstallerConfigurationClass1);

        expect(component.show_agent_installer_configuration).toHaveBeenCalled();
      });
    });

    describe('download_agent_installer()', () => {
      it('should call download_agent_installer()', () => {
        reset();

        component.download_agent_installer(MockAgentInstallerConfigurationClass1);

        expect(component.download_agent_installer).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from download_agent_installer()', () => {
        reset();

        component.download_agent_installer(MockAgentInstallerConfigurationClass1);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call api_agent_generate_() from download_agent_installer()', () => {
        reset();

        component.download_agent_installer(MockAgentInstallerConfigurationClass1);

        expect(component['api_agent_generate_']).toHaveBeenCalled();
      });
    });

    describe('agents_install()', () => {
      it('should call agents_install()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.agents_install(MockAgentInstallerConfigurationClass1, MockIPTargetListClass1);

        expect(component.agents_install).toHaveBeenCalled();
      });

      it('should call get_credentials_() from agents_install()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.agents_install(MockAgentInstallerConfigurationClass1, MockIPTargetListClass1);

        expect(component['get_credentials_']).toHaveBeenCalled();
      });
    });

    describe('agents_uninstall()', () => {
      it('should call agents_uninstall()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.agents_uninstall(MockAgentInstallerConfigurationClass1, MockIPTargetListClass1);

        expect(component.agents_uninstall).toHaveBeenCalled();
      });

      it('should call get_credentials_() from agents_uninstall()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.agents_uninstall(MockAgentInstallerConfigurationClass1, MockIPTargetListClass1);

        expect(component['get_credentials_']).toHaveBeenCalled();
      });
    });

    describe('agent_uninstall()', () => {
      it('should call agent_uninstall()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.agent_uninstall(MockAgentInstallerConfigurationClass1, MockIPTargetListClass1, MockHostClass1);

        expect(component.agent_uninstall).toHaveBeenCalled();
      });

      it('should call get_credentials_() from agent_uninstall()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.agent_uninstall(MockAgentInstallerConfigurationClass1, MockIPTargetListClass1, MockHostClass1);

        expect(component['get_credentials_']).toHaveBeenCalled();
      });
    });

    describe('agent_reinstall()', () => {
      it('should call agent_reinstall()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.agent_reinstall(MockAgentInstallerConfigurationClass1, MockIPTargetListClass1, MockHostClass1);

        expect(component.agent_reinstall).toHaveBeenCalled();
      });

      it('should call get_credentials_() from agent_reinstall()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.agent_reinstall(MockAgentInstallerConfigurationClass1, MockIPTargetListClass1, MockHostClass1);

        expect(component['get_credentials_']).toHaveBeenCalled();
      });
    });

    describe('delete_agent_installer_configuration_confirm_dialog()', () => {
      it('should call delete_agent_installer_configuration_confirm_dialog()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.delete_agent_installer_configuration_confirm_dialog(MockAgentInstallerConfigurationClass1);

        expect(component.delete_agent_installer_configuration_confirm_dialog).toHaveBeenCalled();
      });

      it('should call api_agent_delete_config_() after mat dialog ref closed from within delete_agent_installer_configuration_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.delete_agent_installer_configuration_confirm_dialog(MockAgentInstallerConfigurationClass1);

        expect(component['api_agent_delete_config_']).toHaveBeenCalled();
      });

      it('should not call api_agent_delete_config_() after mat dialog ref closed from within delete_agent_installer_configuration_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.delete_agent_installer_configuration_confirm_dialog(MockAgentInstallerConfigurationClass1);

        expect(component['api_agent_delete_config_']).not.toHaveBeenCalled();
      });
    });

    describe('delete_ip_target_list_confirm_dialog()', () => {
      it('should call delete_ip_target_list_confirm_dialog()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.delete_ip_target_list_confirm_dialog(MockIPTargetListClass1);

        expect(component.delete_ip_target_list_confirm_dialog).toHaveBeenCalled();
      });

      it('should call api_delete_ip_target_list_() after mat dialog ref closed from within delete_ip_target_list_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.delete_ip_target_list_confirm_dialog(MockIPTargetListClass1);

        expect(component['api_delete_ip_target_list_']).toHaveBeenCalled();
      });

      it('should not call api_delete_ip_target_list_() after mat dialog ref closed from within delete_ip_target_list_confirm_dialog()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.delete_ip_target_list_confirm_dialog(MockIPTargetListClass1);

        expect(component['api_delete_ip_target_list_']).not.toHaveBeenCalled();
      });
    });

    describe('new_agent_installer_configuration()', () => {
      it('should call new_agent_installer_configuration()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.app_configs = MockAppConfigClassesArray;
        component.new_agent_installer_configuration();

        expect(component.new_agent_installer_configuration).toHaveBeenCalled();
      });

      it('should call api_agent_save_config_() after mat dialog ref closed from within new_agent_installer_configuration()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(MockAgentInstallerConfigurationClass1) } as MatDialogRef<typeof component>);

        component.app_configs = MockAppConfigClassesArray;
        component.new_agent_installer_configuration();

        expect(component['api_agent_save_config_']).toHaveBeenCalled();
      });

      it('should not call api_agent_save_config_() after mat dialog ref closed from within new_agent_installer_configuration()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.app_configs = MockAppConfigClassesArray;
        component.new_agent_installer_configuration();

        expect(component['api_agent_save_config_']).not.toHaveBeenCalled();
      });
    });

    describe('new_ip_target_list()', () => {
      it('should call new_ip_target_list()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.new_ip_target_list();

        expect(component.new_ip_target_list).toHaveBeenCalled();
      });

      it('should call api_agent_save_ip_target_list_() after mat dialog ref closed from within new_ip_target_list()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(MockIPTargetListClass1) } as MatDialogRef<typeof component>);

        component.new_ip_target_list();

        expect(component['api_agent_save_ip_target_list_']).toHaveBeenCalled();
      });

      it('should not call api_agent_save_ip_target_list_() after mat dialog ref closed from within new_ip_target_list()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.new_ip_target_list();

        expect(component['api_agent_save_ip_target_list_']).not.toHaveBeenCalled();
      });
    });

    describe('get_ip_target_list_port()', () => {
      it('should call get_ip_target_list_port()', () => {
        reset();

        component.get_ip_target_list_port(MockIPTargetListClass1);

        expect(component.get_ip_target_list_port).toHaveBeenCalled();
      });

      it('should call get_ip_target_list_port() and return ip_target_list.smb.port', () => {
        reset();

        const return_value: string = component.get_ip_target_list_port(MockIPTargetListClass1);

        expect(return_value).toEqual(MockIPTargetListClass1.smb.port);
      });

      it('should call get_ip_target_list_port() and return ip_target_list.ntlm.port', () => {
        reset();

        const return_value: string = component.get_ip_target_list_port(MockIPTargetListClass2);

        expect(return_value).toEqual(MockIPTargetListClass2.ntlm.port);
      });
    });

    describe('get_ip_target_list_domain_name()', () => {
      it('should call get_ip_target_list_domain_name()', () => {
        reset();

        component.get_ip_target_list_domain_name(MockIPTargetListClass1);

        expect(component.get_ip_target_list_domain_name).toHaveBeenCalled();
      });

      it('should call get_ip_target_list_domain_name() and return ip_target_list.smb.domain_name', () => {
        reset();

        const return_value: string = component.get_ip_target_list_domain_name(MockIPTargetListClass1);

        expect(return_value).toEqual(MockIPTargetListClass1.smb.domain_name);
      });

      it('should call get_ip_target_list_domain_name() and return ip_target_list.ntlm.domain_name', () => {
        reset();

        const return_value: string = component.get_ip_target_list_domain_name(MockIPTargetListClass2);

        expect(return_value).toEqual(MockIPTargetListClass2.ntlm.domain_name);
      });
    });

    describe('add_hosts_to_ip_target_list()', () => {
      it('should call add_hosts_to_ip_target_list()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.add_hosts_to_ip_target_list(MockIPTargetListClass1, host_list);

        expect(component.add_hosts_to_ip_target_list).toHaveBeenCalled();
      });

      it('should call api_agent_add_host_to_ip_target_list_() after mat dialog ref closed from within add_hosts_to_ip_target_list()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(mock_host_form_group) } as MatDialogRef<typeof component>);

        component.add_hosts_to_ip_target_list(MockIPTargetListClass1, host_list);

        expect(component['api_agent_add_host_to_ip_target_list_']).toHaveBeenCalled();
      });

      it('should not call api_agent_add_host_to_ip_target_list_() after mat dialog ref closed from within add_hosts_to_ip_target_list()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(null) } as MatDialogRef<typeof component>);

        component.add_hosts_to_ip_target_list(MockIPTargetListClass1, host_list);

        expect(component['api_agent_add_host_to_ip_target_list_']).not.toHaveBeenCalled();
      });
    });

    describe('remove_hosts_from_ip_target_list()', () => {
      it('should call remove_hosts_from_ip_target_list()', () => {
        reset();

        // Need to add this because called method or something is trying to open a dialog. the dialog will be tested seperate
        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of({}) } as MatDialogRef<typeof component>);

        component.remove_hosts_from_ip_target_list(MockIPTargetListClass1, host_list, MockHostClass1, 1);

        expect(component.remove_hosts_from_ip_target_list).toHaveBeenCalled();
      });

      it('should call api_agent_remove_host_from_ip_target_list() after mat dialog ref closed from within remove_hosts_from_ip_target_list()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CONFIRM_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.remove_hosts_from_ip_target_list(MockIPTargetListClass1, host_list, MockHostClass1, 1);

        expect(component['api_agent_remove_host_from_ip_target_list']).toHaveBeenCalled();
      });

      it('should not call api_agent_remove_host_from_ip_target_list() after mat dialog ref closed from within remove_hosts_from_ip_target_list()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(CANCEL_DIALOG_OPTION) } as MatDialogRef<typeof component>);

        component.remove_hosts_from_ip_target_list(MockIPTargetListClass1, host_list, MockHostClass1, 1);

        expect(component['api_agent_remove_host_from_ip_target_list']).not.toHaveBeenCalled();
      });
    });

    describe('private get_app_configs_with_custom_packages_()', () => {
      it('should call get_app_configs_with_custom_packages_()', () => {
        reset();

        component.app_configs = MockAppConfigClassesArray;
        component['get_app_configs_with_custom_packages_'](MockAgentInstallerConfigurationClass1);

        expect(component['get_app_configs_with_custom_packages_']).toHaveBeenCalled();
      });

      it('should call get_app_configs_with_custom_packages_() and return app_configs[] > 0', () => {
        reset();

        component.app_configs = MockAppConfigClassesArray;
        const return_value: AppConfigClass[] = component['get_app_configs_with_custom_packages_'](MockAgentInstallerConfigurationClass1);

        expect(return_value.length > 0).toBeTrue();
      });

      it('should call get_app_configs_with_custom_packages_() and return app_configs[] = 0', () => {
        reset();

        component.app_configs = MockAppConfigClassesArray;
        const return_value: AppConfigClass[] = component['get_app_configs_with_custom_packages_'](MockAgentInstallerConfigurationClass2);

        expect(return_value.length === 0).toBeTrue();
      });
    });

    describe('private dialog_message_()', () => {
      it('should call dialog_message_()', () => {
        reset();

        component['dialog_message_']('install');

        expect(component['dialog_message_']).toHaveBeenCalled();
      });

      it('should call dialog_message_() and return app_configs[] > 0', () => {
        reset();

        const return_value: string = component['dialog_message_']('install', MockHostClass1.hostname);

        expect(return_value).toBeDefined();
      });
    });

    describe('private is_host_index_zero_()', () => {
      it('should call is_host_index_zero_()', () => {
        reset();

        component['is_host_index_zero_'](MockHostClass1, 0, MockHostClassesArray1);

        expect(component['is_host_index_zero_']).toHaveBeenCalled();
      });

      it('should call is_host_index_zero_() and return true if', () => {
        reset();

        const return_value: boolean = component['is_host_index_zero_'](MockHostClass1, 0, MockHostClassesArray1);

        expect(return_value).toBeTrue();
      });

      it('should call is_host_index_zero_() and return false', () => {
        reset();

        const return_value: boolean = component['is_host_index_zero_'](MockHostClass1, 1, MockHostClassesArray1);

        expect(return_value).toBeFalse();
      });

      it('should call is_host_index_zero_() and return false if host undefined', () => {
        reset();

        const return_value: boolean = component['is_host_index_zero_'](undefined, 1, MockHostClassesArray1);

        expect(return_value).toBeFalse();
      });
    });

    describe('private set_agent_installer_configuration_mat_table_data_()', () => {
      it('should call set_agent_installer_configuration_mat_table_data_()', () => {
        reset();

        component['set_agent_installer_configuration_mat_table_data_'](MockAgentInstallerConfigurationClassesArray);

        expect(component['set_agent_installer_configuration_mat_table_data_']).toHaveBeenCalled();
      });

      it('should call set_agent_installer_configuration_mat_table_data_() and set agent_installer_configs_mat_table_data', () => {
        reset();

        component.agent_installer_configs_mat_table_data = undefined;

        expect(component.agent_installer_configs_mat_table_data).toBeUndefined();

        component['set_agent_installer_configuration_mat_table_data_'](MockAgentInstallerConfigurationClassesArray);

        expect(component.agent_installer_configs_mat_table_data).toBeDefined();
      });

      it('should call set_agent_installer_configuration_mat_table_data_() and set agent_installer_configuration_selection = null', () => {
        reset();

        component.agent_installer_configuration_selection = MockAgentInstallerConfigurationClass1;

        expect(component.agent_installer_configuration_selection).toBeDefined();

        component['set_agent_installer_configuration_mat_table_data_'](MockAgentInstallerConfigurationClassesArray);

        expect(component.agent_installer_configuration_selection).toBeNull();
      });
    });

    describe('private set_ip_target_config_mat_table_data_()', () => {
      it('should call set_ip_target_config_mat_table_data_()', () => {
        reset();

        component['set_ip_target_config_mat_table_data_'](MockIPTargetListClassesArray);

        expect(component['set_ip_target_config_mat_table_data_']).toHaveBeenCalled();
      });

      it('should call set_ip_target_config_mat_table_data_() and set ip_target_configs_mat_table_data', () => {
        reset();

        component.ip_target_configs_mat_table_data = undefined;

        expect(component.ip_target_configs_mat_table_data).toBeUndefined();

        component['set_ip_target_config_mat_table_data_'](MockIPTargetListClassesArray);

        expect(component.ip_target_configs_mat_table_data).toBeDefined();
      });

      it('should call set_ip_target_config_mat_table_data_() and set ip_target_selection = null', () => {
        reset();

        component.ip_target_selection = MockIPTargetListClass1;

        expect(component.ip_target_selection).toBeDefined();

        component['set_ip_target_config_mat_table_data_'](MockIPTargetListClassesArray);

        expect(component.ip_target_selection).toBeNull();
      });
    });

    describe('private get_credentials_()', () => {
      it('should call get_credentials_()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(mock_windows_credentials_form_group) } as MatDialogRef<typeof component>);

        component['get_credentials_']('title', 'instructions', INSTALL, agent_interface);

        expect(component['get_credentials_']).toHaveBeenCalled();
      });

      it('should call perform_agent_action_() after mat dialog ref closed from within get_credentials_()', () => {
        reset();

        spyOn(component['mat_dialog_'], 'open').and.returnValue({ afterClosed: () => of(mock_windows_credentials_form_group) } as MatDialogRef<typeof component>);

        component['get_credentials_']('title', 'instructions', INSTALL, agent_interface);

        expect(component['perform_agent_action_']).toHaveBeenCalled();
      });
    });

    describe('private perform_agent_action_()', () => {
      it('should call perform_agent_action_()', () => {
        reset();

        component['perform_agent_action_'](INSTALL, agent_interface);

        expect(component['perform_agent_action_']).toHaveBeenCalled();
      });

      it('should call api_agents_install_() from perform_agent_action_()', () => {
        reset();

        component['perform_agent_action_'](INSTALL, agent_interface);

        expect(component['api_agents_install_']).toHaveBeenCalled();
      });

      it('should call api_agent_reinstall_() from perform_agent_action_()', () => {
        reset();

        component['perform_agent_action_'](REINSTALL, agent_target_interface);

        expect(component['api_agent_reinstall_']).toHaveBeenCalled();
      });

      it('should call api_agent_uninstall_() from perform_agent_action_()', () => {
        reset();

        component['perform_agent_action_'](UNINSTALL, agent_target_interface);

        expect(component['api_agent_uninstall_']).toHaveBeenCalled();
      });

      it('should call api_agents_uninstall_() from perform_agent_action_()', () => {
        reset();

        component['perform_agent_action_'](UNINSTALLS, agent_interface);

        expect(component['api_agents_uninstall_']).toHaveBeenCalled();
      });
    });

    describe('private update_ip_targets_list_targets_()', () => {
      it('should call update_ip_targets_list_targets_()', () => {
        reset();

        component['update_ip_targets_list_targets_'](MockIPTargetListClass1, MockIPTargetListClass1);

        expect(component['update_ip_targets_list_targets_']).toHaveBeenCalled();
      });
    });

    // TODO - Update when websocket has been flushed out
    describe('private websocket_get_socket_on_refresh()', () => {
      it('should call websocket_get_socket_on_refresh()', () => {
        reset();

        component['websocket_get_socket_on_refresh']();

        expect(component['websocket_get_socket_on_refresh']).toHaveBeenCalled();
      });
    });

    describe('private api_get_chart_status_()', () => {
      it('should call api_get_chart_status_()', () => {
        reset();

        component['api_get_chart_status_']();

        expect(component['api_get_chart_status_']).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_chart_statuses() from api_get_chart_status_()', () => {
        reset();

        component['api_get_chart_status_']();

        expect(component['catalog_service_'].get_chart_statuses).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_chart_statuses() and handle response no logstash deployed object', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_chart_statuses').and.returnValue(of([MockStatusClassLogstashDeployedError]));

        component['api_get_chart_status_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_chart_statuses() and handle response empty []', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_chart_statuses').and.returnValue(of([]));

        component['api_get_chart_status_']();

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call catalog_service_.get_chart_statuses() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['catalog_service_'], 'get_chart_statuses').and.returnValue(throwError(mock_http_error_response));

        component['api_get_chart_status_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agent_generate_()', () => {
      it('should call api_agent_generate_()', () => {
        reset();

        component['api_agent_generate_'](mock_agent_interface);

        expect(component['api_agent_generate_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_generate() from api_agent_generate_()', () => {
        reset();

        component['api_agent_generate_'](mock_agent_interface);

        expect(component['agent_builder_service_'].agent_generate).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_generate() and handle response', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_generate').and.returnValue(of(create_file_from_mock_file));

        component['api_agent_generate_'](mock_agent_interface);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_generate() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_generate').and.returnValue(throwError(mock_http_error_response));

        component['api_agent_generate_'](mock_agent_interface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agent_save_config_()', () => {
      it('should call api_agent_save_config_()', () => {
        reset();

        component['api_agent_save_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['api_agent_save_config_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_save_config() from api_agent_save_config_()', () => {
        reset();

        component['api_agent_save_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['agent_builder_service_'].agent_save_config).toHaveBeenCalled();
      });

      it('should call set_agent_installer_configuration_mat_table_data_() from agent_builder_service_.agent_save_config()', () => {
        reset();

        component['api_agent_save_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['set_agent_installer_configuration_mat_table_data_']).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.generate_return_success_snackbar_message() from agent_builder_service_.agent_save_config()', () => {
        reset();

        component['api_agent_save_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_save_config() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_save_config').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_agent_save_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_save_config() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_save_config').and.returnValue(throwError(mock_http_error_response));

        component['api_agent_save_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agent_delete_config_()', () => {
      it('should call api_agent_delete_config_()', () => {
        reset();

        component['api_agent_delete_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['api_agent_delete_config_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_delete_config() from api_agent_delete_config_()', () => {
        reset();

        component['api_agent_delete_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['agent_builder_service_'].agent_delete_config).toHaveBeenCalled();
      });

      it('should call set_agent_installer_configuration_mat_table_data_() from agent_builder_service_.agent_delete_config()', () => {
        reset();

        component['api_agent_delete_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['set_agent_installer_configuration_mat_table_data_']).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.generate_return_success_snackbar_message() from agent_builder_service_.agent_delete_config()', () => {
        reset();

        component['api_agent_delete_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_delete_config() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_delete_config').and.returnValue(throwError(mock_http_error_response));

        component['api_agent_delete_config_'](MockAgentInstallerConfigurationClass1);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agent_get_configs_()', () => {
      it('should call api_agent_get_configs_()', () => {
        reset();

        component['api_agent_get_configs_']();

        expect(component['api_agent_get_configs_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_get_configs() from api_agent_get_configs_()', () => {
        reset();

        component['api_agent_get_configs_']();

        expect(component['agent_builder_service_'].agent_get_configs).toHaveBeenCalled();
      });

      it('should call set_agent_installer_configuration_mat_table_data_() from agent_builder_service_.agent_get_configs()', () => {
        reset();

        component['api_agent_get_configs_']();

        expect(component['set_agent_installer_configuration_mat_table_data_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_get_configs() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_get_configs').and.returnValue(throwError(mock_http_error_response));

        component['api_agent_get_configs_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agent_get_ip_target_list_()', () => {
      it('should call api_agent_get_ip_target_list_()', () => {
        reset();

        component['api_agent_get_ip_target_list_']();

        expect(component['api_agent_get_ip_target_list_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_get_ip_target_list() from api_agent_get_ip_target_list_()', () => {
        reset();

        component['api_agent_get_ip_target_list_']();

        expect(component['agent_builder_service_'].agent_get_ip_target_list).toHaveBeenCalled();
      });

      it('should call update_ip_targets_list_targets_() from agent_builder_service_.agent_get_ip_target_list()', () => {
        reset();

        component['set_ip_target_config_mat_table_data_'](MockIPTargetListClassesArray);
        component['api_agent_get_ip_target_list_'](true);

        expect(component['update_ip_targets_list_targets_']).toHaveBeenCalled();
      });

      it('should call set_ip_target_config_mat_table_data_() from agent_builder_service_.agent_get_ip_target_list()', () => {
        reset();

        component['api_agent_get_ip_target_list_']();

        expect(component['set_ip_target_config_mat_table_data_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_get_ip_target_list() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_get_ip_target_list').and.returnValue(throwError(mock_http_error_response));

        component['api_agent_get_ip_target_list_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agent_save_ip_target_list_()', () => {
      it('should call api_agent_save_ip_target_list_()', () => {
        reset();

        component['api_agent_save_ip_target_list_'](MockIPTargetListClass1);

        expect(component['api_agent_save_ip_target_list_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_save_ip_target_list() from api_agent_save_ip_target_list_()', () => {
        reset();

        component['api_agent_save_ip_target_list_'](MockIPTargetListClass1);

        expect(component['agent_builder_service_'].agent_save_ip_target_list).toHaveBeenCalled();
      });

      it('should call set_ip_target_config_mat_table_data_() from agent_builder_service_.agent_save_ip_target_list()', () => {
        reset();

        component['api_agent_save_ip_target_list_'](MockIPTargetListClass1);

        expect(component['set_ip_target_config_mat_table_data_']).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.generate_return_success_snackbar_message() from agent_builder_service_.agent_save_ip_target_list()', () => {
        reset();

        component['api_agent_save_ip_target_list_'](MockIPTargetListClass1);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_save_ip_target_list() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_save_ip_target_list').and.returnValue(throwError(mock_http_error_response));

        component['api_agent_save_ip_target_list_'](MockIPTargetListClass1);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agent_add_host_to_ip_target_list_()', () => {
      it('should call api_agent_add_host_to_ip_target_list_()', () => {
        reset();

        component['api_agent_add_host_to_ip_target_list_'](MockIPTargetListClass1, MockHostClass1, host_list);

        expect(component['api_agent_add_host_to_ip_target_list_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_add_host_to_ip_target_list() from api_agent_add_host_to_ip_target_list_()', () => {
        reset();

        component['api_agent_add_host_to_ip_target_list_'](MockIPTargetListClass3, MockHostClass1, host_list);

        expect(component['agent_builder_service_'].agent_add_host_to_ip_target_list).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.generate_return_success_snackbar_message() from agent_builder_service_.agent_uninstall()', () => {
        reset();

        component['api_agent_add_host_to_ip_target_list_'](MockIPTargetListClass1, MockHostClass1, host_list);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_add_host_to_ip_target_list() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_add_host_to_ip_target_list').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_agent_add_host_to_ip_target_list_'](MockIPTargetListClass1, MockHostClass1, host_list);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_add_host_to_ip_target_list() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_add_host_to_ip_target_list').and.returnValue(throwError(mock_http_error_response));

        component['api_agent_add_host_to_ip_target_list_'](MockIPTargetListClass1, MockHostClass1, host_list);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agent_remove_host_from_ip_target_list()', () => {
      it('should call api_agent_remove_host_from_ip_target_list()', () => {
        reset();

        component['api_agent_remove_host_from_ip_target_list'](MockIPTargetListClass1, MockHostClass1, host_list, 2);

        expect(component['api_agent_remove_host_from_ip_target_list']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_remove_host_from_ip_target_list() from api_agent_remove_host_from_ip_target_list()', () => {
        reset();

        component['api_agent_remove_host_from_ip_target_list'](MockIPTargetListClass1, MockHostClass1, host_list, 2);

        expect(component['agent_builder_service_'].agent_remove_host_from_ip_target_list).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from agent_builder_service_.agent_uninstall()', () => {
        reset();

        component['api_agent_remove_host_from_ip_target_list'](MockIPTargetListClass1, MockHostClass1, host_list, 2);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_remove_host_from_ip_target_list() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_remove_host_from_ip_target_list').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_agent_remove_host_from_ip_target_list'](MockIPTargetListClass1, MockHostClass1, host_list, 2);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_remove_host_from_ip_target_list() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_remove_host_from_ip_target_list').and.returnValue(throwError(mock_http_error_response));

        component['api_agent_remove_host_from_ip_target_list'](MockIPTargetListClass1, MockHostClass1, host_list, 2);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_delete_ip_target_list_()', () => {
      it('should call api_delete_ip_target_list_()', () => {
        reset();

        component['api_delete_ip_target_list_'](MockIPTargetListClass1);

        expect(component['api_delete_ip_target_list_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_delete_ip_target_list() from api_delete_ip_target_list_()', () => {
        reset();

        component['api_delete_ip_target_list_'](MockIPTargetListClass1);

        expect(component['agent_builder_service_'].agent_delete_ip_target_list).toHaveBeenCalled();
      });

      it('should call set_ip_target_config_mat_table_data_() from agent_builder_service_.agent_delete_ip_target_list()', () => {
        reset();

        component['api_delete_ip_target_list_'](MockIPTargetListClass1);

        expect(component['set_ip_target_config_mat_table_data_']).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.generate_return_success_snackbar_message() from agent_builder_service_.agent_delete_ip_target_list()', () => {
        reset();

        component['api_delete_ip_target_list_'](MockIPTargetListClass1);

        expect(component['mat_snackbar_service_'].generate_return_success_snackbar_message).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_delete_ip_target_list() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_delete_ip_target_list').and.returnValue(throwError(mock_http_error_response));

        component['api_delete_ip_target_list_'](MockIPTargetListClass1);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agents_install_()', () => {
      it('should call api_agents_install_()', () => {
        reset();

        component['api_agents_install_'](mock_agent_interface);

        expect(component['api_agents_install_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agents_install() from api_agents_install_()', () => {
        reset();

        component['api_agents_install_'](mock_agent_interface);

        expect(component['agent_builder_service_'].agents_install).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from agent_builder_service_.agent_uninstall()', () => {
        reset();

        component['api_agents_install_'](mock_agent_interface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agents_install() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agents_install').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_agents_install_'](mock_agent_interface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agents_install() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agents_install').and.returnValue(throwError(mock_http_error_response));

        component['api_agents_install_'](mock_agent_interface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agents_uninstall_()', () => {
      it('should call api_agents_uninstall_()', () => {
        reset();

        component['api_agents_uninstall_'](mock_agent_interface);

        expect(component['api_agents_uninstall_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agents_uninstall() from api_agents_uninstall_()', () => {
        reset();

        component['api_agents_uninstall_'](mock_agent_interface);

        expect(component['agent_builder_service_'].agents_uninstall).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from agent_builder_service_.agent_uninstall()', () => {
        reset();

        component['api_agents_uninstall_'](mock_agent_interface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agents_uninstall() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agents_uninstall').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_agents_uninstall_'](mock_agent_interface);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agents_uninstall() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agents_uninstall').and.returnValue(throwError(mock_http_error_response));

        component['api_agents_uninstall_'](mock_agent_interface);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agent_uninstall_()', () => {
      it('should call api_agent_uninstall_()', () => {
        reset();

        component['api_agent_uninstall_'](mock_agent_target);

        expect(component['api_agent_uninstall_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_uninstall() from api_agent_uninstall_()', () => {
        reset();

        component['api_agent_uninstall_'](mock_agent_target);

        expect(component['agent_builder_service_'].agent_uninstall).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from agent_builder_service_.agent_uninstall()', () => {
        reset();

        component['api_agent_uninstall_'](mock_agent_target);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_uninstall() and handle error response instance ErrorMessageClass', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_uninstall').and.returnValue(throwError(new ErrorMessageClass(MockErrorMessageInterface)));

        component['api_agent_uninstall_'](mock_agent_target);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_uninstall() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_uninstall').and.returnValue(throwError(mock_http_error_response));

        component['api_agent_uninstall_'](mock_agent_target);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_agent_reinstall_()', () => {
      it('should call api_agent_reinstall_()', () => {
        reset();

        component['api_agent_reinstall_'](mock_agent_target);

        expect(component['api_agent_reinstall_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_reinstall() from api_agent_reinstall_()', () => {
        reset();

        component['api_agent_reinstall_'](mock_agent_target);

        expect(component['agent_builder_service_'].agent_reinstall).toHaveBeenCalled();
      });

      it('should call mat_snackbar_service_.displaySnackBar() from agent_builder_service_.agent_reinstall()', () => {
        reset();

        component['api_agent_reinstall_'](mock_agent_target);

        expect(component['mat_snackbar_service_'].displaySnackBar).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.agent_reinstall() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'agent_reinstall').and.returnValue(throwError(mock_http_error_response));

        component['api_agent_reinstall_'](mock_agent_target);

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });

    describe('private api_get_app_configs_()', () => {
      it('should call api_get_app_configs_()', () => {
        reset();

        component['api_get_app_configs_']();

        expect(component['api_get_app_configs_']).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.get_app_configs() from api_get_app_configs_()', () => {
        reset();

        component['api_get_app_configs_']();

        expect(component['agent_builder_service_'].get_app_configs).toHaveBeenCalled();
      });

      it('should call agent_builder_service_.get_app_configs() and set app_configs', () => {
        reset();

        component.app_configs = undefined;

        expect(component.app_configs).toBeUndefined();

        component['api_get_app_configs_']();

        expect(component.app_configs).toBeDefined();
      });

      it('should call agent_builder_service_.get_app_configs() and handle error', () => {
        reset();

        // Allows respy to change default spy created in spy service
        jasmine.getEnv().allowRespy(true);
        spyOn<any>(component['agent_builder_service_'], 'get_app_configs').and.returnValue(throwError(mock_http_error_response));

        component['api_get_app_configs_']();

        expect(component['mat_snackbar_service_'].generate_return_error_snackbar_message).toHaveBeenCalled();
      });
    });
  });
});

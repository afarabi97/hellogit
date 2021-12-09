import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChartsModule } from 'ng2-charts';

import { AppLoadService } from './services/app-load.service';
import { CookieService } from './services/cookies.service';
import { UserService } from './services/user.service';
import { UnauthorizedInterceptor } from './interceptors';
import { ControllerAdminRequiredGuard, ControllerMaintainerRequiredGuard, OperatorRequiredGuard } from './guards';

import { AppComponent } from './app.component';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';

// Common components
import { PasswordMessageComponent } from './components/password-message/password-message.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ModalDialogMatComponent } from './modal-dialog-mat/modal-dialog-mat.component';
import { ModalDialogDisplayMatComponent } from './modal-dialog-display-mat/modal-dialog-display-mat.component';
import { PodLogModalDialogComponent } from './pod-log-dialog/pod-log-dialog.component';

// System Setup
import { SystemSettingsComponent } from './system-setupv2/system-settings/system-settings.component';
import { NodeManagementComponent } from './system-setupv2/node-mng/node-mng.component';
import { NodeStateProgressBarComponent } from './system-setupv2/node-state-progress-bar/node-state-progress-bar.component';
import { VMWareSettingsComponent } from './system-setupv2/system-settings/vmware-settings/vmware-settings.component';
import { GeneralSettingsPaneComponent } from './system-setupv2/system-settings/general-settings/general-settings-pane.component';
import { KitSettingsPaneComponent } from './system-setupv2/system-settings/kit-settings/kit-settings-pane.component';
import { MIPSettingsPaneComponent } from './system-setupv2/system-settings/mip-settings/mip-settings-pane.component';
import { SNMPSettingsPaneComponent } from './system-setupv2/system-settings/snmp-settings/snmp-settings-pane.component';
import { KitTokenSettingsPaneComponent } from './system-setupv2/system-settings/kit-token-settings/kit-token-settings-pane.component';
import { AddNodeDialogComponent } from './system-setupv2/add-node-dialog/add-node-dialog.component';
import { NodeInfoDialogComponent } from './system-setupv2/node-info-dialog/node-info-dialog.component';
import { AddKitTokenComponent } from './system-setupv2/add-kit-token-dialog/add-kit-token.component';
import { AddMipDialogComponent } from './system-setupv2/add-mip-dialog/add-mip-dialog.component';
import { MipManagementComponent } from './system-setupv2/mip-mng/mip-mng.component';
import { UnusedIpAddressAutoCompleteComponent } from './system-setupv2/components/unused-ipaddress-autocomplete-ctrl.component';
import { CopyTokenModalDialogComponent } from './system-setupv2/copy-token-dialog/copy-token-dialog.component';
import { VirtualNodeFormComponent } from './system-setupv2/virtual-node-form/virtual-node-form.component';

// Kit Page

import { ServerStdoutComponent } from './server-stdout/server-stdout.component';

// Tools page
import { ToolsFormComponent } from './tools-form/tools.component';
import { ChangePasswordFormComponent } from './tools-form/change-password-form/change-password.component';
import { UpdateDocsFormComponent } from './tools-form/update-documentation-form/update-docs.component';
import { NodeMaintenanceFormComponent } from './tools-form/node-maintenance-form/node-maintenance.component';
import { RepositorySettingsComponent } from './tools-form/repository-settings/repository-settings.component';
import { UpdateEsLicenseComponent } from './tools-form/update-es-license-form/update-es-license-form.component';

// classes
import { SnackbarWrapper } from './classes/snackbar-wrapper';
import { ConfirmActionPopup } from './classes/ConfirmActionPopup';
import { UserClass } from './classes';

// Health Dashboard
import { HealthDashboardComponent } from './health-dashboard/dashboard/health-dashboard.component';
import { HealthDashboardNodeTableComponent } from './health-dashboard/node-table/node-table.component';
import { HealthDashboardPodTableComponent } from './health-dashboard/pod-table/pod-table.component';
import { HealthDashboardSNMPComponent } from './health-dashboard/snmp/snmp-stats.component';
import { HealthDashboardDatastoresComponent } from './health-dashboard/datastores/datastores.component';
import { HealthDashboardModalDialogComponent } from './health-dashboard-dialog/health-dashboard-dialog.component';

// modules
import { AgentBuilderChooserModule } from './modules/agent-builder-chooser/agent-builder-chooser.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ConfigMapModule } from './modules/config-map/config-map.module';
import { AppRoutingModule } from './modules/cvah-modules/app-routing.module';
import { DateTimeModule } from './modules/date-time/date-time.module';
import { DockerRegistryModule } from './modules/docker-registry/docker-registry.module';
import { ElasticsearchColdLogIngestModule } from './modules/elasticsearch-cold-log-ingest/elasticsearch-cold-log-ingest.module';
import { ElasticsearchIndexManagementModule } from './modules/elasticsearch-index-management/elasticsearch-index-management.module';
import { ElasticsearchScaleModule } from './modules/elasticsearch-scale/elasticsearch-scale.module';
import { GenericDialogModule } from './modules/generic-dialog/generic-dialog.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PCAPFormModule } from './modules/pcap-form/pcap-form.module';
import { PmoSupportModule } from './modules/pmo-support/pmo-support.module';
import { PolicyManagementModule } from './modules/policy-management/policy-management.module';
import { PortalModule } from './modules/portal/portal.module';
import { SecurityAlertsModule } from './modules/security-alerts/security-alerts.module';
import { InjectorModule } from './modules/utilily-modules/injector.module';
import { MaterialModule } from './modules/utilily-modules/material.module';
import { PipesModule } from './modules/utilily-modules/pipes.module';

export function initializeApp(appLoadService: AppLoadService): () => Promise<UserClass> {
  return (): Promise<UserClass> => appLoadService.getCurrentUser();
}

@NgModule({
  declarations: [
    AppComponent,
    TopNavbarComponent,
    UnusedIpAddressAutoCompleteComponent,
    VirtualNodeFormComponent,
    SystemSettingsComponent,
    NodeManagementComponent,
    NodeStateProgressBarComponent,
    ServerStdoutComponent,
    ToolsFormComponent,
    ChangePasswordFormComponent,
    UpdateDocsFormComponent,
    UpdateEsLicenseComponent,
    NodeMaintenanceFormComponent,
    ModalDialogMatComponent,
    ModalDialogDisplayMatComponent,
    HealthDashboardModalDialogComponent,
    CopyTokenModalDialogComponent,
    ConfirmDialogComponent,
    AddNodeDialogComponent,
    NodeInfoDialogComponent,
    PasswordMessageComponent,
    PodLogModalDialogComponent,
    RepositorySettingsComponent,
    VMWareSettingsComponent,
    GeneralSettingsPaneComponent,
    KitSettingsPaneComponent,
    MIPSettingsPaneComponent,
    SNMPSettingsPaneComponent,
    KitTokenSettingsPaneComponent,
    AddKitTokenComponent,
    AddMipDialogComponent,
    MipManagementComponent,
    HealthDashboardComponent,
    HealthDashboardNodeTableComponent,
    HealthDashboardPodTableComponent,
    HealthDashboardSNMPComponent,
    HealthDashboardDatastoresComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    AppRoutingModule,
    AgentBuilderChooserModule,
    CatalogModule,
    ConfigMapModule,
    DateTimeModule,
    DockerRegistryModule,
    ElasticsearchColdLogIngestModule,
    ElasticsearchIndexManagementModule,
    ElasticsearchScaleModule,
    GenericDialogModule,
    NotificationsModule,
    PCAPFormModule,
    PmoSupportModule,
    PolicyManagementModule,
    PortalModule,
    SecurityAlertsModule,
    InjectorModule,
    ChartsModule,
    PipesModule
  ],
  providers: [
    SnackbarWrapper,
    ConfirmActionPopup,
    CookieService,
    AppLoadService,
    UserService,
    { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppLoadService], multi: true},
    { provide: HTTP_INTERCEPTORS, useClass: UnauthorizedInterceptor, multi: true },
    ControllerAdminRequiredGuard,
    ControllerMaintainerRequiredGuard,
    OperatorRequiredGuard,
    NodeManagementComponent,
    MipManagementComponent
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    ConfirmDialogComponent,
    ModalDialogMatComponent,
    ModalDialogDisplayMatComponent,
    HealthDashboardModalDialogComponent,
    CopyTokenModalDialogComponent,
    AddNodeDialogComponent,
    AddMipDialogComponent,
    NodeInfoDialogComponent,
    PodLogModalDialogComponent
  ]
})
export class AppModule { }

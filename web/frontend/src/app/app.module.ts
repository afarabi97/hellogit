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

import { AppLoadService } from './services/app-load.service';
import { UserService } from './services/user.service';
import { UnauthorizedInterceptor } from './interceptors';
import { ControllerAdminRequiredGuard, ControllerMaintainerRequiredGuard, OperatorRequiredGuard } from './guards';

import { AppComponent } from './app.component';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';

//Common components
import { PasswordMessageComponent } from './common/components/password-message.component';

// Security Alerts
import { SecurityAlertsComponent } from './security-alerts/security-alerts.component';
import { AlertDrillDownDialog } from './security-alerts/alert-drilldown-dialog/alert-drilldown-dialog.component';

//Setup pages

import { SystemSettingsComponent } from './system-setupv2/system-settings/system-settings.component';
import { NodeManagementComponent } from './system-setupv2/node-mng/node-mng.component';
import { NodeStateProgressBarComponent } from './system-setupv2/node-state-progress-bar/node-state-progress-bar.component';
import { VMWareSettingsComponent } from './system-setupv2/system-settings/vmware-settings/vmware-settings.component';
import { GeneralSettingsPaneComponent } from './system-setupv2/system-settings/general-settings/general-settings-pane.component';
import { KitSettingsPaneComponent } from './system-setupv2/system-settings/kit-settings/kit-settings-pane.component';
import { MIPSettingsPaneComponent } from './system-setupv2/system-settings/mip-settings/mip-settings-pane.component';
import { AddNodeDialog } from './system-setupv2/add-node-dialog/add-node-dialog.component';
import { NodeInfoDialog } from './system-setupv2/node-info-dialog/node-info-dialog.component';

//Kit Page

import { ServerStdoutComponent } from './server-stdout/server-stdout.component';
import { LogIngestComponent } from './log-ingest/log-ingest.component';

//Tools page
import { ToolsFormComponent } from './tools-form/tools.component';
import { ChangePasswordFormComponent } from './tools-form/change-password-form/change-password.component';
import { UpdateDocsFormComponent } from './tools-form/update-documentation-form/update-docs.component';
import { NodeMaintenanceFormComponent } from './tools-form/node-maintenance-form/node-maintenance.component';
import { RepositorySettingsComponent } from './tools-form/repository-settings/repository-settings.component';
import { UpdateEsLicenseComponent } from './tools-form/update-es-license-form/update-es-license-form.component';

import { SystemHealthComponent } from './system-health/system-health.component';
import { ModalTableComponent } from './system-health/table-dialog/modal-table.component';

import { ConfigmapsComponent } from './configmaps/configmaps.component';
import { ConfigmapEditorComponent } from './configmap-editor/configmap-editor.component';
import { MaterialModule } from './modules/utilily-modules/material.module';

//PCAP Test Page
import { PcapFormComponent } from './pcap-form/pcap-form.component';
import { ReplayPcapDialog } from './pcap-form/replay-pcap-dialog/replay-pcap-dialog.component';

//Windows Agent Deployer
import { AgentBuilderChooserComponent } from './agent-builder-chooser/agent-builder-chooser.component';
import { AgentInstallerDialogComponent } from './agent-builder-chooser/agent-installer-dialog/agent-installer-dialog.component';
import { AgentDetailsDialogComponent } from './agent-builder-chooser/agent-details-dialog/agent-details-dialog.component';
import { AgentTargetDialogComponent } from './agent-builder-chooser/agent-target-dialog/agent-target-dialog.component';

// Catalog
import { CatalogComponent } from './catalog/component/catalog.component';
import { CardComponent } from './catalog/card/card.component';
import { ChartListComponent } from './catalog/chart-list/chart-list.component';
import { NodeBackgroundComponent } from './catalog/node-background/node-background.component';
import { CatalogPageComponent } from './catalog/page/catalog-page.component';

// notifcations
import { NotificationsComponent } from './notifications/component/notifications.component';
import { NotificationsModuleComponent } from './notifications/notification-module/notifications-module.component';

// ConfirmDialog
import { DoubleConfirmDialogComponent } from './double-confirm-dialog/double-confirm-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

import { ModalDialogMatComponent } from './modal-dialog-mat/modal-dialog-mat.component';

// classes
import { SnackbarWrapper } from './classes/snackbar-wrapper';
import { ConfirmActionPopup } from './classes/ConfirmActionPopup';

// modules
import { CookieService } from './services/cookies.service';

// Kickstart Form
import { UnusedIpAddressAutoCompleteComponent } from './system-setupv2/components/unused-ipaddress-autocomplete-ctrl.component';

//Pipes
import { CapitalizeFirstPipe } from './pipes/capitalize-first.pipe';
import { ModalDialogDisplayMatComponent } from './modal-dialog-display-mat/modal-dialog-display-mat.component';
import { PodLogModalDialogComponent } from './pod-log-dialog/pod-log-dialog.component';

// Index Management
import { IndexManagementComponent } from './index-management/component/index-management.component';
import { AddMipDialog } from './system-setupv2/add-mip-dialog/add-mip-dialog.component';
import { MipManagementComponent } from './system-setupv2/mip-mng/mip-mng.component';

import { UserClass } from './classes';

import { AppRoutingModule } from './modules/cvah-modules/app-routing.module';
import { DateTimeModule } from './modules/date-time/date-time.module';
import { DockerRegistryModule } from './modules/docker-registry/docker-registry.module';
import { ElasticsearchScaleModule } from './modules/elasticsearch-scale/elasticsearch-scale.module';
import { PmoSupportModule } from './modules/pmo-support/pmo-support.module';
import { PolicyManagementModule } from './modules/policy-management/policy-management.module';
import { PortalModule } from './modules/portal/portal.module';
import { InjectorModule } from './modules/utilily-modules/injector.module';

export function initializeApp(appLoadService: AppLoadService): () => Promise<UserClass> {
  return (): Promise<UserClass> => appLoadService.getCurrentUser();
}

@NgModule({
  declarations: [
    AppComponent,
    TopNavbarComponent,
    UnusedIpAddressAutoCompleteComponent,
    SecurityAlertsComponent,
    SystemSettingsComponent,
    NodeManagementComponent,
    NodeStateProgressBarComponent,
    ServerStdoutComponent,
    ToolsFormComponent,
    ChangePasswordFormComponent,
    UpdateDocsFormComponent,
    UpdateEsLicenseComponent,
    NodeMaintenanceFormComponent,
    SystemHealthComponent,
    ConfigmapsComponent,
    ConfigmapEditorComponent,
    PcapFormComponent,
    AgentBuilderChooserComponent,
    AgentInstallerDialogComponent,
    AgentDetailsDialogComponent,
    AgentTargetDialogComponent,
    ModalDialogMatComponent,
    ModalDialogDisplayMatComponent,
    CapitalizeFirstPipe,
    CatalogComponent,
    CardComponent,
    ChartListComponent,
    NotificationsComponent,
    NotificationsModuleComponent,
    DoubleConfirmDialogComponent,
    ConfirmDialogComponent,
    NodeBackgroundComponent,
    CatalogPageComponent,
    ReplayPcapDialog,
    AlertDrillDownDialog,
    AddNodeDialog,
    NodeInfoDialog,
    ModalTableComponent,
    PasswordMessageComponent,
    PodLogModalDialogComponent,
    RepositorySettingsComponent,
    IndexManagementComponent,
    LogIngestComponent,
    VMWareSettingsComponent,
    GeneralSettingsPaneComponent,
    KitSettingsPaneComponent,
    MIPSettingsPaneComponent,
    AddMipDialog,
    MipManagementComponent
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
    DateTimeModule,
    DockerRegistryModule,
    ElasticsearchScaleModule,
    PmoSupportModule,
    PolicyManagementModule,
    PortalModule,
    InjectorModule
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
    NodeManagementComponent
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    NotificationsModuleComponent,
    DoubleConfirmDialogComponent,
    ConfirmDialogComponent,
    AgentInstallerDialogComponent,
    AgentDetailsDialogComponent,
    AgentTargetDialogComponent,
    ModalDialogMatComponent,
    ModalDialogDisplayMatComponent,
    ReplayPcapDialog,
    AlertDrillDownDialog,
    AddNodeDialog,
    AddMipDialog,
    NodeInfoDialog,
    ModalTableComponent,
    PodLogModalDialogComponent
  ]
})
export class AppModule { }

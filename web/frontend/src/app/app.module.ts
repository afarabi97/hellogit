import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppLoadService } from './services/app-load.service';
import { UserService } from './services/user.service';
import { UnauthorizedInterceptor } from './interceptors';
import { ControllerAdminRequiredGuard, ControllerMaintainerRequiredGuard, OperatorRequiredGuard } from './guards';
import {FlexLayoutModule} from "@angular/flex-layout";

import { AppComponent } from './app.component';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';
import { KickstartComponent } from './system-setup/kickstart/kickstart.component';
import { AppRoutingModule } from './modules/cvah-modules/app-routing.module';

//Common components
import { PasswordMessageComponent } from './common/components/password-message.component';

// Security Alerts
import { SecurityAlertsComponent } from './security-alerts/security-alerts.component';
import { AlertDrillDownDialog } from './security-alerts/alert-drilldown-dialog/alert-drilldown-dialog.component';

//Kit Page
import { KitComponent } from './system-setup/kit/kit.component';
import { TotalServerResourcesCardComponent } from './system-setup/components/total-server-resources-card/total-server-resources-card.component';
import { TotalSensorResourcesCardComponent } from './system-setup/components/total-sensor-resources-card/total-sensor-resources-card.component';
import { TotalSystemResourceCardComponent } from './system-setup/components/total-system-resource-card/total-system-resource-card.component';
import { KickstartNodeFormComponent } from './system-setup/components/kickstart-node-form/kickstart-node-form.component';
import { KitNodeFormComponent } from './system-setup/components/kit-node-form/kit-node-form.component';

import { ServerStdoutComponent } from './server-stdout/server-stdout.component';
import { SupportComponent } from './support/support.component';
import { AddNodeComponent } from './system-setup/add-node/add-node.component';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
import { ConfirmDailogComponent } from './confirm-dailog/confirm-dailog.component';

import { ModalDialogMatComponent } from './modal-dialog-mat/modal-dialog-mat.component';

// classes
import { SnackbarWrapper } from './classes/snackbar-wrapper';
import { ConfirmActionPopup } from './classes/ConfirmActionPopup';

// modules
import { InjectorModule } from './modules/utilily-modules/injector.module';
import { CookieService } from './services/cookies.service';

// Kickstart Form
import { UnusedIpAddressAutoCompleteComponent } from './system-setup/components/unused-ipaddress-autocomplete-ctrl.component';

// Date-Time
import { DateTimeModule } from './modules/date-time/date-time.module';

//Pipes
import { CapitalizeFirstPipe } from './pipes/capitalize-first.pipe';
import { ModalDialogDisplayMatComponent } from './modal-dialog-display-mat/modal-dialog-display-mat.component';
import { PodLogModalDialogComponent } from './pod-log-dialog/pod-log-dialog.component';


// ES Scale
import { ESScaleComponent } from './es-scale/es-scale.component';

// MIP Configuration
import { MIPConfigComponent } from './mip-config/mip-config.component';
import { MIPConfigNodeComponent } from './mip-config-node/mip-config-node.component';
import { MIPConfigPasswordComponent } from './mip-config-password/mip-config-password.component';
import { MIPConfigValidationComponent } from './mip-config-validation/mip-config-validation.component';

// Index Management
import { IndexManagementComponent } from './index-management/component/index-management.component';

import { SystemNameClass, UserClass } from './classes';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { DockerRegistryModule } from './modules/docker-registry/docker-registry.module';
import { NGXMonacoTextEditorModule } from './modules/ngx-monaco-text-editor/ngx-monaco-text-editor.module';
import { PolicyManagementModule } from './modules/policy-management/policy-management.module';
import { PortalModule } from './modules/portal/portal.module';

export function initializeApp(appLoadService: AppLoadService): () => Promise<UserClass> {
  return (): Promise<UserClass> => appLoadService.getCurrentUser();
}

export function initializeSystemName(appLoadService: AppLoadService): () => Promise<SystemNameClass> {
  return (): Promise<SystemNameClass> => appLoadService.getSystemName();
}

@NgModule({
  declarations: [
    MIPConfigNodeComponent,
    MIPConfigComponent,
    MIPConfigPasswordComponent,
    MIPConfigValidationComponent,
    AppComponent,
    TopNavbarComponent,
    KickstartComponent,
    UnusedIpAddressAutoCompleteComponent,
    KitComponent,
    SecurityAlertsComponent,
    TotalServerResourcesCardComponent,
    TotalSensorResourcesCardComponent,
    TotalSystemResourceCardComponent,
    ServerStdoutComponent,
    SupportComponent,
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
    ConfirmDailogComponent,
    NodeBackgroundComponent,
    CatalogPageComponent,
    ReplayPcapDialog,
    AlertDrillDownDialog,
    ModalTableComponent,
    AddNodeComponent,
    KickstartNodeFormComponent,
    PasswordMessageComponent,
    KitNodeFormComponent,
    ESScaleComponent,
    PodLogModalDialogComponent,
    RepositorySettingsComponent,
    IndexManagementComponent,
    LogIngestComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    InjectorModule,
    DateTimeModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    DockerRegistryModule,
    NGXMonacoTextEditorModule,
    PolicyManagementModule,
    PortalModule
  ],
  providers: [
    SnackbarWrapper,
    ConfirmActionPopup,
    CookieService,
    AppLoadService,
    UserService,
    { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppLoadService], multi: true},
    { provide: APP_INITIALIZER, useFactory: initializeSystemName, deps: [AppLoadService], multi: true},
    { provide: HTTP_INTERCEPTORS, useClass: UnauthorizedInterceptor, multi: true },
    ControllerAdminRequiredGuard,
    ControllerMaintainerRequiredGuard,
    OperatorRequiredGuard
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    NotificationsModuleComponent,
    ConfirmDailogComponent,
    AgentInstallerDialogComponent,
    AgentDetailsDialogComponent,
    AgentTargetDialogComponent,
    ModalDialogMatComponent,
    ModalDialogDisplayMatComponent,
    ReplayPcapDialog,
    AlertDrillDownDialog,
    ModalTableComponent,
    PodLogModalDialogComponent
  ]
})
export class AppModule { }

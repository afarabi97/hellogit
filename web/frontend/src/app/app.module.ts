import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { HttpModule } from '@angular/http';
import {FlexLayoutModule} from "@angular/flex-layout";

import { AppComponent } from './app.component';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';
import { KickstartComponent } from './system-setup/kickstart/kickstart.component';
import { AppRoutingModule } from './/app-routing.module';

//Kit Page
import { KitComponent } from './system-setup/kit/kit.component';
import { TotalServerResourcesCardComponent } from './system-setup/components/total-server-resources-card/total-server-resources-card.component';
import { TotalSensorResourcesCardComponent } from './system-setup/components/total-sensor-resources-card/total-sensor-resources-card.component';
import { TotalSystemResourceCardComponent } from './system-setup/components/total-system-resource-card/total-system-resource-card.component';
import { KickstartNodeFormComponent } from './system-setup/components/kickstart-node-form/kickstart-node-form.component';
import { KitNodeFormComponent } from './system-setup/components/kit-node-form/kit-node-form.component';

import { ServerStdoutComponent } from './server-stdout/server-stdout.component';
import { PortalComponent } from './portal/portal.component';
import { AddNodeComponent } from './system-setup/add-node/add-node.component';

//Tools page
import { ToolsFormComponent } from './tools-form/tools.component';
import { ChangePasswordFormComponent } from './tools-form/change-password-form/change-password.component';
import { UpdateDocsFormComponent } from './tools-form/update-documentation-form/update-docs.component';
import { KitClockFormComponent } from './tools-form/change-kit-clock-form/change-kitclock.component';
import { NodeMaintenanceFormComponent } from './tools-form/node-maintenance-form/node-maintenance.component';
import { SnapShotCreatorComponent } from './tools-form/snapshot-creator/snapshot-creator.component';
import { SnapShotSetupComponent } from './tools-form/snapshot-creator/setup-wizard/snap-setup-wizard.component';

import { SystemHealthComponent } from './system-health/system-health.component';
import { ModalTableComponent } from './system-health/table-dialog/modal-table.component';

import { ConfigmapsComponent } from './configmaps/configmaps.component';
import { ConfigmapEditorComponent } from './configmap-editor/configmap-editor.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegistryComponent } from './registry/registry.component';
import { MaterialModule } from './utilily-modules/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//PCAP Test Page
import { PcapFormComponent } from './pcap-form/pcap-form.component';
import { ReplayPcapDialog } from './pcap-form/replay-pcap-dialog/replay-pcap-dialog.component';

//Policy Management
import { PolicyManagementComponent } from './policy-management/component/policy-management.component';
import { PolicyManagementDialog } from './policy-management/dialog/policy-management-dialog.component';
import { PolicyManagementTable } from './policy-management/table/policy-management-table.component';
import { PolicyManagementAddDialog } from './policy-management/add-dialog/policy-management-add-dialog.component';

//Windows Agent Deployer
import { AgentBuilderChooserComponent } from './agent-builder-chooser/agent-builder-chooser.component';
import { AgentInstallerDialogComponent } from './agent-builder-chooser/agent-installer-dialog/agent-installer-dialog.component';
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

// Upgrade
import { UpgradeComponent } from './system-setup/upgrade/upgrade.component';

// classes
import { SnackbarWrapper } from './classes/snackbar-wrapper';
import { ConfirmActionPopup } from './classes/ConfirmActionPopup';

// modules
import { InjectorModule } from './utilily-modules/injector.module';
import { CookieService } from './services/cookies.service';

// Kickstart Form
import { UnusedIpAddressAutoCompleteComponent } from './system-setup/components/unused-ipaddress-autocomplete-ctrl.component';

// Archives
import { ArchiveRestoreDialogComponent } from './archive-restore-dialog/archive-restore-dialog.component';
import { ArchiveSaveDialogComponent } from './archive-save-dialog/archive-save-dialog.component';

// Date-Time
import { DateTimeModule } from './date-time-picker/date-time.module';

//Pipes
import { CapitalizeFirstPipe } from './custom-pipes/capitalize.pipe';
import { ModalDialogDisplayMatComponent } from './modal-dialog-display-mat/modal-dialog-display-mat.component';


@NgModule({
  declarations: [
    AppComponent,
    TopNavbarComponent,
    KickstartComponent,
    UnusedIpAddressAutoCompleteComponent,
    ArchiveRestoreDialogComponent,
    ArchiveSaveDialogComponent,
    KitComponent,
    TotalServerResourcesCardComponent,
    TotalSensorResourcesCardComponent,
    TotalSystemResourceCardComponent,
    ServerStdoutComponent,
    PortalComponent,
    ToolsFormComponent,
    KitClockFormComponent,
    ChangePasswordFormComponent,
    SnapShotCreatorComponent,
    UpdateDocsFormComponent,
    NodeMaintenanceFormComponent,
    SystemHealthComponent,
    ConfigmapsComponent,
    ConfigmapEditorComponent,
    RegistryComponent,
    PcapFormComponent,
    PolicyManagementComponent,
    PolicyManagementDialog,
    PolicyManagementTable,
    PolicyManagementAddDialog,
    AgentBuilderChooserComponent,
    AgentInstallerDialogComponent,
    AgentTargetDialogComponent,
    SnapShotSetupComponent,
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
    UpgradeComponent,
    ReplayPcapDialog,
    ModalTableComponent,
    AddNodeComponent,
    KickstartNodeFormComponent,
    KitNodeFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    MaterialModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    InjectorModule,
    DateTimeModule
    // HttpModule
  ],
  providers: [
    SnackbarWrapper,
    ConfirmActionPopup,
    CookieService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    PolicyManagementDialog,
    PolicyManagementComponent,
    PolicyManagementTable,
    PolicyManagementAddDialog,
    NotificationsModuleComponent,
    ConfirmDailogComponent,
    ArchiveRestoreDialogComponent,
    ArchiveSaveDialogComponent,
    AgentInstallerDialogComponent,
    AgentTargetDialogComponent,
    SnapShotSetupComponent,
    ModalDialogMatComponent,
    ModalDialogDisplayMatComponent,
    ReplayPcapDialog,
    ModalTableComponent
  ]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// import { HttpModule } from '@angular/http';
import {FlexLayoutModule} from "@angular/flex-layout";

import { AppComponent } from './app.component';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';
import { KickstartFormComponent } from './kickstart-form/kickstart-form.component';
import { AppRoutingModule } from './/app-routing.module';
import { HelpComponent } from './help/help.component';
import { TextInputComponent } from './text-input/text-input.component';
import { TextAreaInputComponent } from './textarea-input/textarea-input.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { KitFormComponent } from './kit-form/kit-form.component';
import { BasicNodeResourceCardComponent } from './basic-node-resource-card/basic-node-resource-card.component';
import { TotalServerResourcesCardComponent } from './total-server-resources-card/total-server-resources-card.component';
import { TotalSensorResourcesCardComponent } from './total-sensor-resources-card/total-sensor-resources-card.component';
import { CardSelectorComponent } from './card-selector/card-selector.component';
import { TotalSystemResourceCardComponent } from './total-system-resource-card/total-system-resource-card.component';
import { ServerStdoutComponent } from './server-stdout/server-stdout.component';
import { ModalArchiveDialogComponent } from './modal-archive-dialog/modal-archive-dialog.component';
import { PortalComponent } from './portal/portal.component';
import { SystemHealthComponent } from './system-health/system-health.component';
import { SafePipe } from './globals';
import { ConfigmapsComponent } from './configmaps/configmaps.component';
import { ConfigmapEditorComponent } from './configmap-editor/configmap-editor.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { ModalIpSelectDialogComponent } from './modal-ip-select-dialog/modal-ip-select-dialog.component';
import { RegistryComponent } from './registry/registry.component';
import { MaterialModule } from './utilily-modules/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PcapFormComponent } from './pcap-form/pcap-form.component';
import { ModalLoadingComponent } from './modal-loading/modal-loading.component';

//Poilicy Management
import { PolicyManagementComponent } from './policy-management/component/policy-management.component';
import { PolicyManagementDialog } from './policy-management/dialog/policy-management-dialog.component';
import { PolicyManagementTable } from './policy-management/table/policy-management-table.component';
import { PolicyManagementAddDialog } from './policy-management/add-dialog/policy-management-add-dialog.component';
import { UploadDialogComponent } from './policy-management/upload-dialog/upload-dialog.component';
import { AgentInstallerComponent } from './agent-installer/agent-installer.component';
import { AgentBuilderChooserComponent } from './agent-builder-chooser/agent-builder-chooser.component';
import { AgentInstallerAddDialogComponent } from './agent-builder-chooser/agent-installer-add-dialog/agent-installer-add-dialog.component';
import { IpTargetListDialogComponent } from './agent-builder-chooser/ip-target-list-dialog/ip-target-list-dialog.component';

// Catalog
import { CatalogComponent } from './catalog/component/catalog.component';
import { CardComponent } from './catalog/card/card.component';
import { ChartListComponent } from './catalog/chart-list/chart-list.component';
import { StepperComponent } from './catalog/stepper/stepper.component';
import { NodeBackgroundComponent } from './catalog/node-background/node-background.component';

// notifcations
import { NotificationsComponent } from './notifications/component/notifications.component';
import { NotificationsModuleComponent } from './notifications/notification-module/notifications-module.component';

// ConfirmDialog
import { ConfirmDailogComponent } from './confirm-dailog/confirm-dailog.component';

// classes
import { SnackbarWrapper } from './classes/snackbar-wrapper';

// modules
import { InjectorModule } from './utilily-modules/injector.module';
import { CookieService } from './services/cookies.service';

// Kickstart Form
import { KickstartFormAutoCompleteComponent } from './kickstart-form/components/kickstart-form-autocomplete.component';

// Archives
import { ArchiveRestoreDialogComponent } from './archive-restore-dialog/archive-restore-dialog.component';
import { ArchiveSaveDialogComponent } from './archive-save-dialog/archive-save-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    TopNavbarComponent,
    KickstartFormComponent,
    KickstartFormAutoCompleteComponent,
    ArchiveRestoreDialogComponent,
    ArchiveSaveDialogComponent,
    HelpComponent,
    TextInputComponent,
    TextAreaInputComponent,
    DropdownComponent,
    CheckboxComponent,
    KitFormComponent,
    ModalArchiveDialogComponent,
    BasicNodeResourceCardComponent,
    TotalServerResourcesCardComponent,
    TotalSensorResourcesCardComponent,
    CardSelectorComponent,
    TotalSystemResourceCardComponent,
    ServerStdoutComponent,
    PortalComponent,
    SystemHealthComponent,
    SafePipe,
    ConfigmapsComponent,
    ConfigmapEditorComponent,
    DatePickerComponent,
    ModalIpSelectDialogComponent,
    RegistryComponent,
    ModalLoadingComponent,
    PcapFormComponent,
    ModalDialogComponent,
    PolicyManagementComponent,
    PolicyManagementDialog,
    PolicyManagementTable,
    PolicyManagementAddDialog,
    UploadDialogComponent,
    AgentInstallerComponent,
    AgentBuilderChooserComponent,
    AgentInstallerAddDialogComponent,
    IpTargetListDialogComponent,
    CatalogComponent,
    CardComponent,
    ChartListComponent,
    StepperComponent,
    NotificationsComponent,
    NotificationsModuleComponent,
    ConfirmDailogComponent,
    NodeBackgroundComponent
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
    InjectorModule
    // HttpModule
  ],
  providers: [
    SnackbarWrapper,
    CookieService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    PolicyManagementDialog,
    PolicyManagementComponent,
    PolicyManagementTable,
    PolicyManagementAddDialog,
    UploadDialogComponent,
    AgentInstallerAddDialogComponent,
    StepperComponent,
    NotificationsModuleComponent,
    ConfirmDailogComponent,
    ArchiveRestoreDialogComponent,
    ArchiveSaveDialogComponent
  ]
})
export class AppModule { }

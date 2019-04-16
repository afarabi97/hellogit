import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
import { ConfluenceComponent } from './confluence/confluence.component';
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
import { AgentBuilderComponent } from './agent-builder/agent-builder.component';
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


@NgModule({
  declarations: [
    AppComponent,
    TopNavbarComponent,
    KickstartFormComponent,
    HelpComponent,
    TextInputComponent,
    TextAreaInputComponent,
    DropdownComponent,
    CheckboxComponent,
    KitFormComponent,
    BasicNodeResourceCardComponent,
    TotalServerResourcesCardComponent,
    TotalSensorResourcesCardComponent,
    CardSelectorComponent,
    TotalSystemResourceCardComponent,
    ServerStdoutComponent,
    ConfluenceComponent,
    ModalArchiveDialogComponent,
    PortalComponent,
    SystemHealthComponent,
    SafePipe,
    ConfigmapsComponent,
    ConfigmapEditorComponent,
    DatePickerComponent,
    ModalIpSelectDialogComponent,
    RegistryComponent,
    AgentBuilderComponent,
    ModalLoadingComponent,
    PcapFormComponent,
    ModalDialogComponent,
    PolicyManagementComponent,
    PolicyManagementDialog,
    PolicyManagementTable,    
    PolicyManagementAddDialog,
    UploadDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

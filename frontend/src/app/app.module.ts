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
import { ModalSelectDialogComponent } from './modal-select-dialog/modal-select-dialog.component';
import { PortalComponent } from './portal/portal.component';
import { SystemHealthComponent } from './system-health/system-health.component';
import { SafePipe } from './globals';
import { TerminalComponent } from './terminal/terminal.component';
import { ConfigmapsComponent } from './configmaps/configmaps.component';
import { ConfigmapEditorComponent } from './configmap-editor/configmap-editor.component'; 
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { ModalIpSelectDialogComponent } from './modal-ip-select-dialog/modal-ip-select-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    TopNavbarComponent,
    KickstartFormComponent,
    HelpComponent,
    TextInputComponent,
    DropdownComponent,
    CheckboxComponent,
    ModalDialogComponent,
    KitFormComponent,
    BasicNodeResourceCardComponent,
    TotalServerResourcesCardComponent,
    TotalSensorResourcesCardComponent,
    CardSelectorComponent,
    TotalSystemResourceCardComponent,
    ServerStdoutComponent,
    ConfluenceComponent,
    ModalSelectDialogComponent,
    PortalComponent,
    SystemHealthComponent,
    SafePipe,
    TerminalComponent,
    ConfigmapsComponent,
    ConfigmapEditorComponent,
    TimePickerComponent,
    DatePickerComponent,
    ModalIpSelectDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

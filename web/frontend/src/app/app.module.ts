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

// classes
import { SnackbarWrapper } from './classes/snackbar-wrapper';
import { ConfirmActionPopup } from './classes/ConfirmActionPopup';
import { UserClass } from './classes';

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
import { HealthDashboardModule } from './modules/health-dashboard/health-dashboard.module';
import { MipMngModule } from './modules/mip-mng/mip-mng.module';
import { NodeMngModule } from './modules/node-mng/node-mng.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PCAPFormModule } from './modules/pcap-form/pcap-form.module';
import { PmoSupportModule } from './modules/pmo-support/pmo-support.module';
import { PolicyManagementModule } from './modules/policy-management/policy-management.module';
import { PortalModule } from './modules/portal/portal.module';
import { SecurityAlertsModule } from './modules/security-alerts/security-alerts.module';
import { ServerStdoutModule } from './modules/server-stdout/server-stdout.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { ToolsModule } from './modules/tools/tools.module';
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
    ModalDialogMatComponent,
    ModalDialogDisplayMatComponent,
    ConfirmDialogComponent,
    PasswordMessageComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
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
    HealthDashboardModule,
    MipMngModule,
    NodeMngModule,
    NotificationsModule,
    PCAPFormModule,
    PmoSupportModule,
    PolicyManagementModule,
    PortalModule,
    SecurityAlertsModule,
    ServerStdoutModule,
    SystemSettingsModule,
    ToolsModule,
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
    OperatorRequiredGuard
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    ConfirmDialogComponent,
    ModalDialogMatComponent,
    ModalDialogDisplayMatComponent
  ]
})
export class AppModule { }

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';

import { CatalogService } from '../../services/catalog.service';
import { CatalogServiceSpy } from '../../services/catalog.service.spec';
import { CookieService } from '../../services/cookies.service';
import { CookieServiceSpy } from '../../services/cookies.service.spec';
import { GlobalHiveSettingsService } from '../../services/global-hive-settings.service';
import { GlobalHiveSettingsServiceSpy } from '../../services/global-hive-settings.service.spec';
import { GlobalJobService } from '../../services/global-job.service';
import { GlobalJobServiceSpy } from '../../services/global-job.service.spec';
import { GlobalPCAPService } from '../../services/global-pcap.service';
import { GlobalPCAPServiceSpy } from '../../services/global-pcap.service.spec';
import { GlobalToolsService } from '../../services/global-tools.service';
import { GlobalToolsServiceSpy } from '../../services/global-tools.service.spec';
import { KitSettingsService } from '../../services/kit-settings.service';
import { KitSettingsServiceSpy } from '../../services/kit-settings.service.spec';
import { MatSnackBarService } from '../../services/mat-snackbar.service';
import { MatSnackbarServiceSpy } from '../../services/mat-snackbar.service.spec';
import { PortalService } from '../../services/portal.service';
import { PortalServiceSpy } from '../../services/portal.service.spec';
import { RulesService } from '../../services/rules.service';
import { RulesServiceSpy } from '../../services/rules.service.spec';
import { SensorHostInfoService } from '../../services/sensor-host-info.service';
import { SensorHostInfoServiceSpy } from '../../services/sensor-host-info.service.spec';
import { UserService } from '../../services/user.service';
import { UserServiceSpy } from '../../services/user.service.spec';
import { WindowsRedirectHandlerService } from '../../services/windows_redirect_handler.service';
import { WindowsRedirectHandlerServiceSpy } from '../../services/windows_redirect_handler.service.spec';
import { NavBarService } from '../../top-navbar/services/navbar.service';
import { NavbarServiceSpy } from '../../top-navbar/services/navbar.service.spec';
import { AgentBuilderService } from '../agent-builder-chooser/services/agent-builder.service';
import { AgentBuilderServiceSpy } from '../agent-builder-chooser/services/agent-builder.service.spec';
import { EndgameService } from '../agent-builder-chooser/services/endgame.service';
import { EndgameServiceSpy } from '../agent-builder-chooser/services/endgame.service.spec';
import { ConfigMapService } from '../config-map/services/config-map.service';
import { ConfigMapServiceSpy } from '../config-map/services/config-map.service.spec';
import { DockerRegistryService } from '../docker-registry/services/docker-registry.service';
import { DockerRegistryServiceSpy } from '../docker-registry/services/docker-registry.service.spec';
import { ColdLogIngestService } from '../elasticsearch-cold-log-ingest/services/cold-log-ingest.service';
import { ColdLogIngestServiceSpy } from '../elasticsearch-cold-log-ingest/services/cold-log-ingest.service.spec';
import { IndexManagementService } from '../elasticsearch-index-management/services/index-management.service';
import { IndexManagementServiceSpy } from '../elasticsearch-index-management/services/index-management.service.spec';
import { ElasticsearchService } from '../elasticsearch-scale/services/elasticsearch.service';
import { ElasticsearchServiceSpy } from '../elasticsearch-scale/services/elasticsearch.service.spec';
import { HealthDashboardStatusService } from '../health-dashboard/services/health-dashboard-status.service';
import { HealthDashboardStatusServiceSpy } from '../health-dashboard/services/health-dashboard-status.service.spec';
import { HealthService } from '../health-dashboard/services/health.service';
import { HealthServiceSpy } from '../health-dashboard/services/health.service.spec';
import { NotificationService } from '../notifications/services/notification.service';
import { NotificationServiceSpy } from '../notifications/services/notification.service.spec';
import { PCAPService } from '../pcap-form/services/pcap.service';
import { PCAPServiceSpy } from '../pcap-form/services/pcap.service.spec';
import { DiagnosticsService } from '../pmo-support/services/diagnostics.service';
import { DiagnosticsServiceSpy } from '../pmo-support/services/diagnostics.service.spec';
import { SystemVersionService } from '../pmo-support/services/system-version.service';
import { SystemVersionServiceSpy } from '../pmo-support/services/system-version.service.spec';
import { PolicyManagementService } from '../policy-management/services/policy-management.service';
import { PolicyManagementServiceSpy } from '../policy-management/services/policy-management.service.spec';
import { AlertService } from '../security-alerts/services/alerts.service';
import { AlertServiceSpy } from '../security-alerts/services/alerts.service.spec';
import { JobService } from '../server-stdout/services/job.service';
import { JobServiceSpy } from '../server-stdout/services/job.service.spec';
import { HiveSettingsService } from '../system-settings/services/hive-settings.service';
import { HiveSettingsServiceSpy } from '../system-settings/services/hive-settings.service.spec';
import { KitTokenSettingsService } from '../system-settings/services/kit-token-settings.service';
import { KitTokenSettingsServiceSpy } from '../system-settings/services/kit-token-settings.service.spec';
import { ToolsService } from '../tools/services/tools.service';
import { ToolsServiceSpy } from '../tools/services/tools.service.spec';

@NgModule({
  imports: [
    HttpClientTestingModule,
  ],
  providers: [
    { provide: CatalogService, useClass: CatalogServiceSpy },
    { provide: CookieService, useClass: CookieServiceSpy },
    { provide: GlobalHiveSettingsService, useClass: GlobalHiveSettingsServiceSpy },
    { provide: GlobalJobService, useClass: GlobalJobServiceSpy },
    { provide: GlobalPCAPService, useClass: GlobalPCAPServiceSpy },
    { provide: GlobalToolsService, useClass: GlobalToolsServiceSpy },
    { provide: KitSettingsService, useClass: KitSettingsServiceSpy },
    { provide: MatSnackBarService, useClass: MatSnackbarServiceSpy },
    { provide: PortalService, useClass: PortalServiceSpy },
    { provide: RulesService, useClass: RulesServiceSpy },
    { provide: SensorHostInfoService, useClass: SensorHostInfoServiceSpy },
    { provide: UserService, useClass: UserServiceSpy },
    { provide: WindowsRedirectHandlerService, useClass: WindowsRedirectHandlerServiceSpy },
    { provide: NavBarService, useClass: NavbarServiceSpy },
    { provide: AgentBuilderService, useClass: AgentBuilderServiceSpy },
    { provide: EndgameService, useClass: EndgameServiceSpy },
    { provide: ConfigMapService, useClass: ConfigMapServiceSpy },
    { provide: DockerRegistryService, useClass: DockerRegistryServiceSpy },
    { provide: ColdLogIngestService, useClass: ColdLogIngestServiceSpy },
    { provide: IndexManagementService, useClass: IndexManagementServiceSpy },
    { provide: ElasticsearchService, useClass: ElasticsearchServiceSpy },
    { provide: HealthDashboardStatusService, useClass: HealthDashboardStatusServiceSpy },
    { provide: HealthService, useClass: HealthServiceSpy },
    { provide: NotificationService, useClass: NotificationServiceSpy },
    { provide: PCAPService, useClass: PCAPServiceSpy },
    { provide: DiagnosticsService, useClass: DiagnosticsServiceSpy },
    { provide: SystemVersionService, useClass: SystemVersionServiceSpy },
    { provide: PolicyManagementService, useClass: PolicyManagementServiceSpy },
    { provide: AlertService, useClass: AlertServiceSpy },
    { provide: JobService, useClass: JobServiceSpy },
    { provide: HiveSettingsService, useClass: HiveSettingsServiceSpy },
    { provide: KitTokenSettingsService, useClass: KitTokenSettingsServiceSpy },
    { provide: ToolsService, useClass: ToolsServiceSpy }
    // { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open', 'closeAll', 'getDialogById']) },
    // { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close', 'afterOpen', 'afterClosed', 'beforeClose', 'backdropClick', 'keydownEvents', 'updatePosition']) }
  ]
})
export class TestingModule { }

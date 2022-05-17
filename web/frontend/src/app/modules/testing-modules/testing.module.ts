import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';

import { HealthService } from '../../health-dashboard/services/health.service';
import { HealthServiceSpy } from '../../health-dashboard/services/health.service.spec';
import { CatalogService } from '../../services/catalog.service';
import { CatalogServiceSpy } from '../../services/catalog.service.spec';
import { CookieService } from '../../services/cookies.service';
import { CookieServiceSpy } from '../../services/cookies.service.spec';
import { GlobalPCAPService } from '../../services/global-pcap.service';
import { GlobalPCAPServiceSpy } from '../../services/global-pcap.service.spec';
import { GlobalToolsService } from '../../services/global-tools.service';
import { GlobalToolsServiceSpy } from '../../services/global-tools.service.spec';
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
import { HealthDashboardStatusService } from '../../system-setupv2/services/health-dashboard-status.service';
import { HealthDashboardStatusServiceSpy } from '../../system-setupv2/services/health-dashboard-status.service.spec';
import { KitTokenSettingsService } from '../../system-setupv2/services/kit-token-settings.service';
import { KitTokenSettingsServiceSpy } from '../../system-setupv2/services/kit-token-settings.service.spec';
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
import { ToolsService } from '../tools/services/tools.service';
import { ToolsServiceSpy } from '../tools/services/tools.service.spec';

@NgModule({
  imports: [
    HttpClientTestingModule,
  ],
  providers: [
    { provide: HealthService, useClass: HealthServiceSpy },
    { provide: CatalogService, useClass: CatalogServiceSpy },
    { provide: CookieService, useClass: CookieServiceSpy },
    { provide: MatSnackBarService, useClass: MatSnackbarServiceSpy },
    { provide: GlobalPCAPService, useClass: GlobalPCAPServiceSpy },
    { provide: GlobalToolsService, useClass: GlobalToolsServiceSpy },
    { provide: PortalService, useClass: PortalServiceSpy },
    { provide: RulesService, useClass: RulesServiceSpy },
    { provide: SensorHostInfoService, useClass: SensorHostInfoServiceSpy },
    { provide: UserService, useClass: UserServiceSpy },
    { provide: HealthDashboardStatusService, useClass: HealthDashboardStatusServiceSpy },
    { provide: KitTokenSettingsService, useClass: KitTokenSettingsServiceSpy },
    { provide: PolicyManagementService, useClass: PolicyManagementServiceSpy },
    { provide: NavBarService, useClass: NavbarServiceSpy },
    { provide: AgentBuilderService, useClass: AgentBuilderServiceSpy },
    { provide: EndgameService, useClass: EndgameServiceSpy },
    { provide: ConfigMapService, useClass: ConfigMapServiceSpy },
    { provide: DockerRegistryService, useClass: DockerRegistryServiceSpy },
    { provide: ColdLogIngestService, useClass: ColdLogIngestServiceSpy },
    { provide: IndexManagementService, useClass: IndexManagementServiceSpy },
    { provide: ElasticsearchService, useClass: ElasticsearchServiceSpy },
    { provide: NotificationService, useClass: NotificationServiceSpy },
    { provide: PCAPService, useClass: PCAPServiceSpy },
    { provide: DiagnosticsService, useClass: DiagnosticsServiceSpy },
    { provide: SystemVersionService, useClass: SystemVersionServiceSpy },
    { provide: ToolsService, useClass: ToolsServiceSpy }
    // { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open', 'closeAll', 'getDialogById']) },
    // { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close', 'afterOpen', 'afterClosed', 'beforeClose', 'backdropClick', 'keydownEvents', 'updatePosition']) }
  ]
})
export class TestingModule { }

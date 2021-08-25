import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';

import { CookieService } from '../../services/cookies.service';
import { CookieServiceSpy } from '../../services/cookies.service.spec';
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
import { NavBarService } from '../../top-navbar/services/navbar.service';
import { NavbarServiceSpy } from '../../top-navbar/services/navbar.service.spec';
import { ConfigMapService } from '../config-map/services/config-map.service';
import { ConfigMapServiceSpy } from '../config-map/services/config-map.service.spec';
import { DockerRegistryService } from '../docker-registry/services/docker-registry.service';
import { DockerRegistryServiceSpy } from '../docker-registry/services/docker-registry.service.spec';
import { IndexManagementService } from '../elasticsearch-index-management/services/index-management.service';
import { IndexManagementServiceSpy } from '../elasticsearch-index-management/services/index-management.service.spec';
import { ElasticsearchService } from '../elasticsearch-scale/services/elasticsearch.service';
import { ElasticsearchServiceSpy } from '../elasticsearch-scale/services/elasticsearch.service.spec';
import { SystemVersionService } from '../pmo-support/services/system-version.service';
import { SystemVersionServiceSpy } from '../pmo-support/services/system-version.service.spec';
import { PolicyManagementService } from '../policy-management/services/policy-management.service';
import { PolicyManagementServiceSpy } from '../policy-management/services/policy-management.service.spec';
import { KitTokenSettingsService } from '../../system-setupv2/services/kit-token-settings.service';
import { KitTokenSettingsServiceSpy  } from '../../system-setupv2/services/kit-token-settings.service.spec';
import { HealthDashboardStatusService } from '../../system-setupv2/services/health-dashboard-status.service';
import { HealthDashboardStatusServiceSpy } from '../../system-setupv2/services/health-dashboard-status.service.spec';
import { HealthService } from '../../health-dashboard/services/health.service';
import { HealthServiceSpy } from '../../health-dashboard/services/health.service.spec';

@NgModule({
  imports: [
    HttpClientTestingModule,
  ],
  providers: [
    { provide: CookieService, useClass: CookieServiceSpy },
    { provide: MatSnackBarService, useClass: MatSnackbarServiceSpy },
    { provide: PortalService, useClass: PortalServiceSpy },
    { provide: RulesService, useClass: RulesServiceSpy },
    { provide: SensorHostInfoService, useClass: SensorHostInfoServiceSpy },
    { provide: UserService, useClass: UserServiceSpy },
    { provide: PolicyManagementService, useClass: PolicyManagementServiceSpy },
    { provide: NavBarService, useClass: NavbarServiceSpy },
    { provide: ConfigMapService, useClass: ConfigMapServiceSpy },
    { provide: DockerRegistryService, useClass: DockerRegistryServiceSpy },
    { provide: IndexManagementService, useClass: IndexManagementServiceSpy },
    { provide: ElasticsearchService, useClass: ElasticsearchServiceSpy },
    { provide: SystemVersionService, useClass: SystemVersionServiceSpy },
    { provide: KitTokenSettingsService, useClass: KitTokenSettingsServiceSpy },
    { provide: HealthService, useClass: HealthServiceSpy },
    { provide: HealthDashboardStatusService, useClass: HealthDashboardStatusServiceSpy }
    // { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open', 'closeAll', 'getDialogById']) },
    // { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close', 'afterOpen', 'afterClosed', 'beforeClose', 'backdropClick', 'keydownEvents', 'updatePosition']) }
  ]
})
export class TestingModule { }

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';

import { PolicyManagementService } from '../policy-management/services/policy-management.service';
import { PolicyManagementServiceSpy } from '../policy-management/services/policy-management.service.spec';
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
import { WeaponSystemNameService } from '../../services/weapon-system-name.service';
import { WeaponSystemNameServiceSpy } from '../../services/weapon-system-name.service.spec';
import { NavBarService } from '../../top-navbar/services/navbar.service';
import { NavbarServiceSpy } from '../../top-navbar/services/navbar.service.spec';
import { SystemHealthService } from '../../system-health/services/system-health.service';
import { SystemHealthServiceSpy } from '../../system-health/services/system-health.service.spec';
import { DockerRegistryService } from '../docker-registry/services/docker-registry.service';
import { DockerRegistryServiceSpy } from '../docker-registry/services/docker-registry.service.spec';

@NgModule({
  imports: [
    HttpClientTestingModule,
  ],
  providers: [
    { provide: DockerRegistryService, useClass: DockerRegistryServiceSpy },
    { provide: CookieService, useClass: CookieServiceSpy },
    { provide: MatSnackBarService, useClass: MatSnackbarServiceSpy },
    { provide: PortalService, useClass: PortalServiceSpy },
    { provide: RulesService, useClass: RulesServiceSpy },
    { provide: SensorHostInfoService, useClass: SensorHostInfoServiceSpy },
    { provide: UserService, useClass: UserServiceSpy },
    { provide: WeaponSystemNameService, useClass: WeaponSystemNameServiceSpy },
    { provide: PolicyManagementService, useClass: PolicyManagementServiceSpy },
    { provide: NavBarService, useClass: NavbarServiceSpy },
    { provide: SystemHealthService, useClass: SystemHealthServiceSpy }
    // { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open', 'closeAll', 'getDialogById']) },
    // { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close', 'afterOpen', 'afterClosed', 'beforeClose', 'backdropClick', 'keydownEvents', 'updatePosition']) }
  ]
})
export class TestingModule { }

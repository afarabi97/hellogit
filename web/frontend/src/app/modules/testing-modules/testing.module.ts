import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';

import { CookieService } from '../../services/cookies.service';
import { CookieServiceSpy } from '../../services/cookies.service.spec';
import { UserService } from '../../services/user.service';
import { UserServiceSpy } from '../../services/user.service.spec';
import { WeaponSystemNameService } from '../../services/weapon-system-name.service';
import { WeaponSystemNameServiceSpy } from '../../services/weapon-system-name.service.spec';
import { NavBarService } from '../../top-navbar/services/navbar.service';
import { NavbarServiceSpy } from '../../top-navbar/services/navbar.service.spec';

@NgModule({
  imports: [
    HttpClientTestingModule,
  ],
  providers: [
    { provide: CookieService, useClass: CookieServiceSpy },
    { provide: UserService, useClass: UserServiceSpy },
    { provide: WeaponSystemNameService, useClass: WeaponSystemNameServiceSpy },
    { provide: NavBarService, useClass: NavbarServiceSpy },
    // { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open', 'closeAll', 'getDialogById']) },
    // { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close', 'afterOpen', 'afterClosed', 'beforeClose', 'backdropClick', 'keydownEvents', 'updatePosition']) }
  ]
})
export class TestingModule { }

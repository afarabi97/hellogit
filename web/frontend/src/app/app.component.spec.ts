import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { MockSystemNameMIPClass } from '../../static-data/class-objects-v3_4';
import { AppComponent } from './app.component';
import { SnackbarWrapper } from './classes/snackbar-wrapper';
import { TestingModule } from './modules/testing-modules/testing.module';
import { InjectorModule } from './modules/utilily-modules/injector.module';
import { MaterialModule } from './modules/utilily-modules/material.module';
import { NotificationsComponent } from './notifications/component/notifications.component';
import { ApiService } from './services/abstract/api.service';
import { CookieService } from './services/cookies.service';
import { ToolsService } from './tools-form/services/tools.service';
import { NavBarService } from './top-navbar/services/navbar.service';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';

function cleanStylesFromDOM(): void {
  const head: HTMLHeadElement = document.getElementsByTagName('head')[0];
  const styles: HTMLCollectionOf<HTMLStyleElement> | [] = head.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    head.removeChild(styles[i]);
  }
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  // Setup spy references
  let spyNGAfterContentInit: jasmine.Spy<any>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        TestingModule,
        RouterModule,
        InjectorModule,
        BrowserAnimationsModule,
        RouterModule.forRoot([])
      ],
      declarations: [
        AppComponent,
        TopNavbarComponent,
        NotificationsComponent
      ],
      providers: [
        CookieService,
        NavBarService,
        ApiService,
        SnackbarWrapper,
        FormBuilder,
        ToolsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // Add method spies
    spyNGAfterContentInit = spyOn(component, 'ngAfterContentInit').and.callThrough();

    // Detect changes
    fixture.detectChanges();
  });

  const reset = () => {
    spyNGAfterContentInit.calls.reset();
  };

  afterAll(() => cleanStylesFromDOM());

  it('should create AppComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('AppComponent methods', () => {
    describe('ngAfterContentInit()', () => {
      it('should call ngAfterContentInit()', () => {
        reset();

        component.ngAfterContentInit();

        expect(component.ngAfterContentInit).toHaveBeenCalled();
      });

      it('should call ngAfterContentInit() twice', () => {
        reset();

        component.ngAfterContentInit();
        component['weaponSystemNameService_'].setSystemName(MockSystemNameMIPClass);
        component.ngAfterContentInit();

        expect(component.ngAfterContentInit).toHaveBeenCalledTimes(2);
      });
    });
  });
});
